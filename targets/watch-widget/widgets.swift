import WidgetKit
import SwiftUI

// MARK: - Shared storage

private extension UserDefaults {
    static let appGroup = UserDefaults(suiteName: "group.com.dmq.mylifemobile")
}

// MARK: - Data models

private struct WatchTimelineData: Codable {
    let events: [WatchTimelineEvent]
}

private struct WatchTimelineEvent: Codable {
    let id: String
    let title: String
    let date: String
    let beginTime: String
    let endTime: String
}

// MARK: - Helpers

private func parseTime(_ t: String, on day: Date) -> Date? {
    let parts = t.split(separator: ":")
    guard parts.count >= 2, let h = Int(parts[0]), let m = Int(parts[1]) else { return nil }
    return Calendar.current.date(bySettingHour: h, minute: m, second: 0, of: day)
}

private func todayString() -> String {
    let f = DateFormatter(); f.dateFormat = "yyyy-MM-dd"; return f.string(from: Date())
}

private func shortTime(_ t: String) -> String {
    let parts = t.split(separator: ":")
    guard parts.count >= 2 else { return t }
    return "\(parts[0]):\(parts[1])"
}

private let pillH: CGFloat = 16
private let laneH: CGFloat = 20
private let bottomH: CGFloat = 14

private struct TimelineLayout {
    let rangeStart: Date
    let rangeEnd: Date
    let laneEvents: [LaneEventItem]
    let nowFraction: CGFloat?
    let totalLanes: Int
}

private struct LaneEventItem: Identifiable {
    var id: String { "\(event.id)-\(lane)" }
    let event: WatchTimelineEvent
    let isNow: Bool
    let lane: Int
    let startFraction: CGFloat
    let endFraction: CGFloat
}

private func buildTimeline(for date: Date) -> TimelineLayout {
    let events = todayEvents()
    let day = Calendar.current.startOfDay(for: date)

    struct Parsed {
        let event: WatchTimelineEvent
        let begin: Date
        let end: Date
    }

    var parsed: [Parsed] = []
    for e in events {
        guard let b = parseTime(e.beginTime, on: day),
              let endT = parseTime(e.endTime, on: day) else { continue }
        parsed.append(Parsed(event: e, begin: b, end: endT))
    }

    guard !parsed.isEmpty else {
        return TimelineLayout(rangeStart: date, rangeEnd: date.addingTimeInterval(7200), laneEvents: [], nowFraction: nil, totalLanes: 0)
    }

    let rangeStart = date.addingTimeInterval(-1.5 * 3600)
    let rangeEnd = date.addingTimeInterval(2.5 * 3600)
    let duration = rangeEnd.timeIntervalSince(rangeStart)
    let visible = parsed.filter { $0.end > rangeStart && $0.begin < rangeEnd }

    var lanes: [Date] = []
    var items: [LaneEventItem] = []

    for p in visible.sorted(by: { $0.begin < $1.begin }) {
        var laneIdx = -1
        for (i, laneEnd) in lanes.enumerated() {
            if p.begin >= laneEnd {
                laneIdx = i
                lanes[i] = p.end
                break
            }
        }
        if laneIdx == -1 {
            laneIdx = lanes.count
            lanes.append(p.end)
        }

        let startF = CGFloat(p.begin.timeIntervalSince(rangeStart) / duration)
        let endF = CGFloat(p.end.timeIntervalSince(rangeStart) / duration)
        let isNow = p.begin <= date && date < p.end

        items.append(LaneEventItem(
            event: p.event,
            isNow: isNow,
            lane: laneIdx,
            startFraction: startF,
            endFraction: endF
        ))
    }

    let nowF: CGFloat? = (date >= rangeStart && date <= rangeEnd)
        ? CGFloat(date.timeIntervalSince(rangeStart) / duration)
        : nil

    return TimelineLayout(
        rangeStart: rangeStart,
        rangeEnd: rangeEnd,
        laneEvents: items,
        nowFraction: nowF,
        totalLanes: lanes.count
    )
}

private func todayEvents() -> [WatchTimelineEvent] {
    guard let str = UserDefaults.appGroup?.string(forKey: "timeline_data"),
          let data = try? JSONDecoder().decode(WatchTimelineData.self, from: Data(str.utf8))
    else { return [] }
    let today = todayString()
    return data.events
        .filter { $0.date == today }
        .sorted { $0.beginTime < $1.beginTime }
}

private func nearbyEvent(at now: Date) -> (event: WatchTimelineEvent, isNow: Bool)? {
    let day = Calendar.current.startOfDay(for: now)
    let twoHoursLater = now.addingTimeInterval(2 * 3600)
    for event in todayEvents() {
        guard let begin = parseTime(event.beginTime, on: day),
              let end   = parseTime(event.endTime, on: day) else { continue }
        if begin <= now && now < end { return (event, true) }
        if begin > now && begin <= twoHoursLater { return (event, false) }
    }
    return nil
}

// MARK: - Entry

struct SimpleEntry: TimelineEntry {
    let date: Date
    let eventTitle: String?
    let eventTime: String?
    let isNow: Bool
}

// MARK: - Provider

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), eventTitle: "Morning run", eventTime: "07:30", isNow: true)
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> Void) {
        completion(makeEntry(for: Date()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<SimpleEntry>) -> Void) {
        let now = Date()
        var entries: [SimpleEntry] = [makeEntry(for: now)]
        var refresh = now.addingTimeInterval(15 * 60)
        let day = Calendar.current.startOfDay(for: now)
        for event in todayEvents() {
            if let begin = parseTime(event.beginTime, on: day), begin > now {
                entries.append(makeEntry(for: begin))
                if begin < refresh { refresh = begin }
            }
            if let end = parseTime(event.endTime, on: day), end > now {
                entries.append(makeEntry(for: end))
            }
        }
        completion(Timeline(entries: entries.sorted { $0.date < $1.date }, policy: .after(refresh)))
    }

    private func makeEntry(for date: Date) -> SimpleEntry {
        if let nearby = nearbyEvent(at: date) {
            let time = nearby.isNow
                ? "\(shortTime(nearby.event.beginTime))–\(shortTime(nearby.event.endTime))"
                : shortTime(nearby.event.beginTime)
            return SimpleEntry(date: date, eventTitle: nearby.event.title, eventTime: time, isNow: nearby.isNow)
        }
        return SimpleEntry(date: date, eventTitle: nil, eventTime: nil, isNow: false)
    }
}

// MARK: - View

struct watchWidgetEntryView: View {
    @Environment(\.widgetFamily) var widgetFamily
    var entry: Provider.Entry

    var body: some View {
        switch widgetFamily {
        case .accessoryCircular:
            circularView
        case .accessoryRectangular:
            rectangularView
        case .accessoryInline:
            inlineView
        default:
            Text(entry.date, style: .time)
        }
    }

    @ViewBuilder
    private var inlineView: some View {
        if let title = entry.eventTitle, let time = entry.eventTime {
            HStack(spacing: 4) {
                Image(systemName: entry.isNow ? "circle.fill" : "clock")
                Text("\(title) · \(time)").lineLimit(1)
            }
        } else {
            HStack(spacing: 4) {
                Image(systemName: "checkmark")
                Text("Nothing upcoming")
            }
        }
    }

    @ViewBuilder
    private var rectangularView: some View {
        let events = todayEvents()
        if events.isEmpty {
            HStack(spacing: 6) {
                Image(systemName: "calendar.badge.checkmark").widgetAccentable()
                Text("Nothing upcoming").font(.caption2)
            }
        } else {
            GeometryReader { geo in
                let layout = buildTimeline(for: entry.date)
                let ticks = generateTicks(rangeStart: layout.rangeStart, rangeEnd: layout.rangeEnd)
                let activeEvent = layout.laneEvents.first(where: \.isNow)
                let headerH: CGFloat = activeEvent != nil ? 12 : 0
                let chartH = geo.size.height - headerH - bottomH

                VStack(spacing: 0) {
                    if let active = activeEvent,
                       let remaining = remainingTime(for: entry.date, event: active.event)
                    {
                        HStack(spacing: 3) {
                            Circle().fill(.red).frame(width: 4, height: 4)
                            Text(active.event.title)
                                .font(.system(size: 10, weight: .medium))
                                .lineLimit(1)
                            Text("·\(remaining)")
                                .font(.system(size: 9))
                                .foregroundStyle(.secondary)
                        }
                        .frame(height: headerH)
                    }

                    ZStack(alignment: .topLeading) {
                        ForEach(ticks.filter(\.isHour)) { tick in
                            Rectangle()
                                .fill(Color.primary.opacity(0.3))
                                .frame(width: 1, height: chartH)
                                .offset(x: tick.xFraction * geo.size.width - 0.5)
                        }
                        ForEach(layout.laneEvents) { item in
                            eventPill(item, width: geo.size.width)
                        }
                        if let nowF = layout.nowFraction {
                            Rectangle()
                                .fill(.red)
                                .frame(width: 1, height: chartH)
                                .offset(x: nowF * geo.size.width - 0.5)
                        }
                    }
                    .frame(height: chartH)

                    ZStack(alignment: .topLeading) {
                        ForEach(ticks.filter(\.isHour)) { tick in
                            Text(tick.label)
                                .font(.system(size: 8, design: .rounded))
                                .foregroundStyle(.secondary)
                                .offset(x: tick.xFraction * geo.size.width + 3)
                        }
                    }
                    .frame(height: bottomH)
                }
            }
        }
    }

    private func eventPill(_ item: LaneEventItem, width: CGFloat) -> some View {
        let pillW = max((item.endFraction - item.startFraction) * width, 28)
        return HStack(spacing: 2) {
            Circle()
                .frame(width: 4, height: 4)
                .widgetAccentable()
                .opacity(item.isNow ? 1 : 0.45)
            Text(item.event.title)
                .font(.system(size: 8, weight: item.isNow ? .semibold : .regular))
                .lineLimit(1)
        }
        .padding(.horizontal, 4)
        .frame(width: pillW, height: pillH, alignment: .leading)
        .background(
            RoundedRectangle(cornerRadius: pillH / 2)
                .fill(Color.primary.opacity(item.isNow ? 0.18 : 0.08))
        )
        .offset(x: item.startFraction * width, y: CGFloat(item.lane) * laneH)
    }

    private struct TickMark: Identifiable {
        let id = UUID()
        let xFraction: CGFloat
        let isHour: Bool
        let label: String
    }

    private func generateTicks(rangeStart: Date, rangeEnd: Date) -> [TickMark] {
        let cal = Calendar.current
        var comps = cal.dateComponents([.year, .month, .day, .hour, .minute], from: rangeStart)
        comps.minute = (comps.minute! / 15) * 15
        var tick = cal.date(from: comps)!

        let duration = rangeEnd.timeIntervalSince(rangeStart)
        var ticks: [TickMark] = []

        while tick <= rangeEnd {
            let xFrac = CGFloat(tick.timeIntervalSince(rangeStart) / duration)
            let m = cal.component(.minute, from: tick)
            let isHour = m == 0
            let label = isHour ? "\(cal.component(.hour, from: tick))" : ""
            ticks.append(TickMark(xFraction: xFrac, isHour: isHour, label: label))
            tick = cal.date(byAdding: .minute, value: 15, to: tick)!
        }

        return ticks
    }

    private func remainingTime(for date: Date, event: WatchTimelineEvent) -> String? {
        let day = Calendar.current.startOfDay(for: date)
        guard let end = parseTime(event.endTime, on: day) else { return nil }
        let remaining = end.timeIntervalSince(date)
        guard remaining > 0 else { return nil }
        let mins = Int(remaining / 60)
        if mins == 0 { return "0m" }
        if mins < 60 { return "\(mins)m" }
        let h = mins / 60
        let m = mins % 60
        if m == 0 { return "\(h)h" }
        return "\(h)h\(m)m"
    }

    @ViewBuilder
    private var circularView: some View {
        ZStack {
            AccessoryWidgetBackground()
            if let title = entry.eventTitle {
                VStack(spacing: 1) {
                    Image(systemName: entry.isNow ? "play.circle" : "clock")
                        .font(.system(size: 14, weight: .medium))
                        .widgetAccentable()
                    Text(title)
                        .font(.system(size: 7, weight: .semibold))
                        .multilineTextAlignment(.center)
                        .lineLimit(2)
                }
                .padding(4)
            } else {
                VStack(spacing: 1) {
                    Image(systemName: "checkmark.circle").font(.title3).widgetAccentable()
                    Text("Free").font(.caption2)
                }
            }
        }
    }

    private func upcomingEvents(limit: Int) -> [(event: WatchTimelineEvent, isNow: Bool)] {
        let now = entry.date
        let day = Calendar.current.startOfDay(for: now)
        let twoHoursLater = now.addingTimeInterval(2 * 3600)
        var result: [(event: WatchTimelineEvent, isNow: Bool)] = []
        for event in todayEvents() {
            guard let begin = parseTime(event.beginTime, on: day),
                  let end   = parseTime(event.endTime, on: day) else { continue }
            if begin <= now && now < end { result.append((event, true)) }
            else if begin > now && begin <= twoHoursLater { result.append((event, false)) }
            if result.count >= limit { break }
        }
        return result
    }

}

// MARK: - Widget

struct watchWidget: Widget {
    let kind: String = "watchWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            if #available(watchOS 10.0, *) {
                watchWidgetEntryView(entry: entry)
                    .containerBackground(.fill.tertiary, for: .widget)
            } else {
                watchWidgetEntryView(entry: entry)
            }
        }
        .configurationDisplayName("Timeline")
        .description("Current and upcoming events from your timeline.")
        .supportedFamilies([
            .accessoryCircular,
            .accessoryRectangular,
            .accessoryInline,
        ])
    }
}
