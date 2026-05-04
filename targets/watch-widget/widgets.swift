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
        let events = upcomingEvents(limit: 2)
        if events.isEmpty {
            HStack(spacing: 6) {
                Image(systemName: "calendar.badge.checkmark").widgetAccentable()
                Text("Nothing upcoming").font(.caption)
            }
        } else {
            VStack(alignment: .leading, spacing: 3) {
                ForEach(events, id: \.event.id) { item in
                    HStack(spacing: 5) {
                        Image(systemName: item.isNow ? "circle.fill" : "circle")
                            .font(.system(size: 8))
                            .widgetAccentable()
                        Text(item.event.title)
                            .font(.system(size: 12, weight: item.isNow ? .semibold : .regular))
                            .lineLimit(1)
                        Spacer()
                        Text(item.isNow
                             ? "\(shortTime(item.event.beginTime))–\(shortTime(item.event.endTime))"
                             : shortTime(item.event.beginTime))
                            .font(.system(size: 10, design: .rounded))
                            .foregroundStyle(.secondary)
                    }
                }
            }
        }
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
