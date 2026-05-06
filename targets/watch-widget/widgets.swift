import WidgetKit
import SwiftUI

// MARK: - Shared storage

private extension UserDefaults {
    static let appGroup = UserDefaults(suiteName: "group.com.dmq.mylifemobile")
}

// MARK: - Data models

struct WatchTimelineData: Codable {
    let events: [WatchTimelineEvent]
}

struct WatchTimelineEvent: Codable {
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

private func todayEvents() -> [WatchTimelineEvent] {
    guard let str = UserDefaults.appGroup?.string(forKey: "timeline_data"),
          let data = try? JSONDecoder().decode(WatchTimelineData.self, from: Data(str.utf8))
    else { return [] }
    let today = todayString()
    return data.events
        .filter { $0.date == today }
        .sorted { $0.beginTime < $1.beginTime }
}

// MARK: - Entry

struct EventItem {
    let event: WatchTimelineEvent
    let isNow: Bool
    let progress: Double
    let minutesLeft: Int
    let minutesUntil: Int
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let items: [EventItem]

    var activeEvent: EventItem? { items.first(where: { $0.isNow }) }
    var nextEvent: EventItem? { items.first(where: { !$0.isNow }) }
    var isNow: Bool { activeEvent != nil }
}

// MARK: - Provider

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        let today = todayString()
        return SimpleEntry(date: Date(), items: [
            EventItem(event: WatchTimelineEvent(id: "1", title: "Morning run", date: today, beginTime: "07:30", endTime: "08:30"), isNow: true, progress: 0.6, minutesLeft: 24, minutesUntil: 0),
            EventItem(event: WatchTimelineEvent(id: "2", title: "Standup", date: today, beginTime: "09:00", endTime: "09:30"), isNow: false, progress: 0, minutesLeft: 0, minutesUntil: 90),
        ])
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> Void) {
        completion(makeEntry(for: Date()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<SimpleEntry>) -> Void) {
        let now = Date()
        var refresh = now.addingTimeInterval(5 * 60)
        let day = Calendar.current.startOfDay(for: now)
        for event in todayEvents() {
            if let begin = parseTime(event.beginTime, on: day), begin > now, begin < refresh {
                refresh = begin
            }
            if let end = parseTime(event.endTime, on: day), end > now, end < refresh {
                refresh = end
            }
        }
        completion(Timeline(entries: [makeEntry(for: now)], policy: .after(refresh)))
    }

    private func makeEntry(for date: Date) -> SimpleEntry {
        let day = Calendar.current.startOfDay(for: date)
        var result: [EventItem] = []
        for event in todayEvents() {
            guard let begin = parseTime(event.beginTime, on: day),
                  let end = parseTime(event.endTime, on: day) else { continue }
            if begin <= date && date < end {
                let total = end.timeIntervalSince(begin)
                let elapsed = date.timeIntervalSince(begin)
                let progress = total > 0 ? min(1.0, elapsed / total) : 0
                let minutesLeft = max(0, Int(end.timeIntervalSince(date) / 60))
                result.append(EventItem(event: event, isNow: true, progress: progress, minutesLeft: minutesLeft, minutesUntil: 0))
            } else if begin >= date {
                let minutesUntil = max(0, Int(begin.timeIntervalSince(date) / 60))
                result.append(EventItem(event: event, isNow: false, progress: 0, minutesLeft: 0, minutesUntil: minutesUntil))
            }
            if result.count >= 3 { break }
        }
        return SimpleEntry(date: date, items: result)
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
        if let active = entry.activeEvent {
            HStack(spacing: 4) {
                Image(systemName: "circle.fill")
                Text("\(active.event.title) · \(active.minutesLeft)m left").lineLimit(1)
            }
        } else if let next = entry.nextEvent {
            HStack(spacing: 4) {
                Image(systemName: "clock")
                Text("\(next.event.title) · in \(next.minutesUntil)m").lineLimit(1)
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
        if entry.items.isEmpty {
            HStack(spacing: 6) {
                Image(systemName: "calendar.badge.checkmark").widgetAccentable()
                Text("Nothing upcoming").font(.caption2)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        } else {
            timelineList
        }
    }

    private var timelineList: some View {
        let visible = Array(entry.items.prefix(3))
        return VStack(alignment: .leading, spacing: 0) {
            ForEach(Array(visible.enumerated()), id: \.offset) { idx, item in
                HStack(alignment: .top, spacing: 5) {
                    VStack(spacing: 0) {
                        timelineDot(isNow: item.isNow)
                        if idx < visible.count - 1 {
                            Rectangle()
                                .fill(.secondary.opacity(0.2))
                                .frame(width: 1)
                                .frame(maxHeight: .infinity)
                        }
                    }
                    .frame(width: 12)
                    eventBlock(item, isLast: idx == visible.count - 1)
                }
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .padding(.horizontal, 4)
        .padding(.vertical, 3)
    }

    private func timelineDot(isNow: Bool) -> some View {
        ZStack {
            if isNow {
                Circle()
                    .fill(AnyShapeStyle(.primary.opacity(0.2)))
                    .frame(width: 11, height: 11)
            }
            Circle()
                .fill(isNow ? AnyShapeStyle(.primary) : AnyShapeStyle(.secondary.opacity(0.45)))
                .frame(width: isNow ? 7 : 5, height: isNow ? 7 : 5)
        }
        .frame(width: 12, height: 14, alignment: .center)
    }

    private func eventBlock(_ item: EventItem, isLast: Bool) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            HStack(alignment: .firstTextBaseline) {
                Text(item.event.title)
                    .font(.system(size: 11, weight: item.isNow ? .semibold : .regular))
                    .lineLimit(1)
                Spacer(minLength: 2)
                if item.isNow {
                    Text("\(item.minutesLeft)m")
                        .font(.system(size: 9))
                        .foregroundStyle(.secondary)
                } else {
                    Text(shortTime(item.event.beginTime))
                        .font(.system(size: 9))
                        .foregroundStyle(.secondary)
                }
            }
            if item.isNow {
                GeometryReader { geo in
                    ZStack(alignment: .leading) {
                        Capsule().fill(.secondary.opacity(0.15))
                        Capsule()
                            .fill(AnyShapeStyle(.primary.opacity(0.65)))
                            .frame(width: max(4, geo.size.width * item.progress))
                    }
                }
                .frame(height: 3)
                .padding(.trailing, 2)
            }
        }
        .padding(.bottom, isLast ? 0 : 5)
    }

    @ViewBuilder
    private var circularView: some View {
        if let active = entry.activeEvent {
            Gauge(value: active.progress) {
                EmptyView()
            } currentValueLabel: {
                VStack(spacing: 0) {
                    Image(systemName: "play.fill")
                        .font(.system(size: 7, weight: .medium))
                    Text("\(active.minutesLeft)m")
                        .font(.system(size: 11, weight: .bold))
                }
            }
            .gaugeStyle(.accessoryCircular)
            .widgetAccentable()
        } else if let next = entry.nextEvent {
            Gauge(value: 0) {
                EmptyView()
            } currentValueLabel: {
                VStack(spacing: 0) {
                    Image(systemName: "clock")
                        .font(.system(size: 7))
                        .widgetAccentable()
                    Text(next.minutesUntil < 60 ? "\(next.minutesUntil)m" : "\(next.minutesUntil / 60)h")
                        .font(.system(size: 11, weight: .bold))
                }
            }
            .gaugeStyle(.accessoryCircular)
        } else {
            ZStack {
                AccessoryWidgetBackground()
                VStack(spacing: 1) {
                    Image(systemName: "checkmark.circle").font(.title3).widgetAccentable()
                    Text("Free").font(.caption2)
                }
            }
        }
    }
}

// MARK: - Preview

#if DEBUG
private let previewNow: Date = {
    let cal = Calendar.current
    var comps = cal.dateComponents([.year, .month, .day], from: Date())
    comps.hour = 10; comps.minute = 15
    return cal.date(from: comps)!
}()

private func previewItems() -> [EventItem] {
    let today = todayString()
    return [
        EventItem(event: WatchTimelineEvent(id: "1", title: "Morning standup", date: today, beginTime: "09:00", endTime: "11:00"), isNow: true, progress: 0.62, minutesLeft: 44, minutesUntil: 0),
        EventItem(event: WatchTimelineEvent(id: "2", title: "Design review", date: today, beginTime: "11:30", endTime: "12:30"), isNow: false, progress: 0, minutesLeft: 0, minutesUntil: 75),
        EventItem(event: WatchTimelineEvent(id: "3", title: "Lunch", date: today, beginTime: "13:00", endTime: "14:00"), isNow: false, progress: 0, minutesLeft: 0, minutesUntil: 165),
    ]
}

#Preview("Rectangular · Active") {
    watchWidgetEntryView(entry: SimpleEntry(date: previewNow, items: previewItems()))
        .environment(\.widgetFamily, .accessoryRectangular)
}

#Preview("Rectangular · Empty") {
    watchWidgetEntryView(entry: SimpleEntry(date: previewNow, items: []))
        .environment(\.widgetFamily, .accessoryRectangular)
}

#Preview("Circular · Active") {
    watchWidgetEntryView(entry: SimpleEntry(date: previewNow, items: previewItems()))
        .environment(\.widgetFamily, .accessoryCircular)
}

#Preview("Circular · Free") {
    watchWidgetEntryView(entry: SimpleEntry(date: previewNow, items: []))
        .environment(\.widgetFamily, .accessoryCircular)
}

#Preview("Inline · Active") {
    watchWidgetEntryView(entry: SimpleEntry(date: previewNow, items: previewItems()))
        .environment(\.widgetFamily, .accessoryInline)
}
#endif

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
