#if canImport(UIKit)
import UIKit
#endif
import ActivityKit
import WidgetKit
import SwiftUI

private let appAccent = Color(red: 0.204, green: 0.639, blue: 0.980)
private let appBg = Color(red: 0.051, green: 0.059, blue: 0.078)

#if canImport(UIKit)
func loadAppIconFromSharedStorage() -> UIImage? {
    guard let containerURL = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: "group.com.dmq.mylifemobile") else {
        return nil
    }
    let iconURL = containerURL.appendingPathComponent("AppIcon.png")
    guard let imageData = try? Data(contentsOf: iconURL),
          let image = UIImage(data: imageData) else { return nil }
    return image
}
#endif

struct WidgetTodo: Codable, Hashable {
    var id: String
    var title: String
    var isCompleted: Bool
}

struct WidgetAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var title: String
        var description: String
        var startTime: Date
        var endTime: Date
        var isCompleted: Bool
        var progress: Double
        var todos: [WidgetTodo]

        enum CodingKeys: String, CodingKey {
            case title, description, startTime, endTime, isCompleted, progress, todos
        }

        init(title: String = "Default Title",
             description: String = "Default Description",
             startTime: Date = Date(),
             endTime: Date = Date().addingTimeInterval(3600),
             isCompleted: Bool = false,
             progress: Double = 1.0,
             todos: [WidgetTodo] = []) {
            self.title = title
            self.description = description
            self.startTime = startTime
            self.endTime = endTime
            self.isCompleted = isCompleted
            self.progress = progress
            self.todos = todos
        }

        init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            title = try container.decode(String.self, forKey: .title)
            description = try container.decode(String.self, forKey: .description)
            isCompleted = try container.decode(Bool.self, forKey: .isCompleted)
            progress = try container.decode(Double.self, forKey: .progress)
            todos = try container.decodeIfPresent([WidgetTodo].self, forKey: .todos) ?? []

            if let s = try? container.decode(String.self, forKey: .startTime) {
                startTime = Self.parseTime(s)
            } else {
                startTime = try container.decode(Date.self, forKey: .startTime)
            }

            if let s = try? container.decode(String.self, forKey: .endTime) {
                endTime = Self.parseTime(s)
            } else {
                endTime = try container.decode(Date.self, forKey: .endTime)
            }
        }

        func encode(to encoder: Encoder) throws {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try container.encode(title, forKey: .title)
            try container.encode(description, forKey: .description)
            try container.encode(startTime, forKey: .startTime)
            try container.encode(endTime, forKey: .endTime)
            try container.encode(isCompleted, forKey: .isCompleted)
            try container.encode(progress, forKey: .progress)
            try container.encode(todos, forKey: .todos)
        }

        private static func parseTime(_ timeString: String) -> Date {
            let formatter = DateFormatter()
            formatter.dateFormat = "HH:mm:ss"
            formatter.timeZone = TimeZone.current
            let calendar = Calendar.current
            let now = Date()
            if let time = formatter.date(from: timeString) {
                let c = calendar.dateComponents([.hour, .minute, .second], from: time)
                if let result = calendar.date(bySettingHour: c.hour ?? 0, minute: c.minute ?? 0, second: c.second ?? 0, of: now) {
                    return result
                }
            }
            return now
        }
    }

    var eventId: String
    var deepLinkURL: String

    init(eventId: String = "default-event-id", deepLinkURL: String = "mylife://default") {
        self.eventId = eventId
        self.deepLinkURL = deepLinkURL
    }
}

struct WidgetLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: WidgetAttributes.self) { context in
            LockScreenActivityView(context: context)
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    HStack(spacing: 6) {
                        Image(systemName: "sparkles")
                            .foregroundStyle(appAccent)
                            .font(.system(size: 14, weight: .semibold))
                        Text("Life")
                            .font(.caption)
                            .fontWeight(.semibold)
                            .foregroundStyle(.white.opacity(0.6))
                    }
                    .padding(.horizontal, 12)
                }

                DynamicIslandExpandedRegion(.bottom) {
                    HStack(spacing: 12) {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(context.state.title)
                                .font(.subheadline)
                                .fontWeight(.bold)
                                .foregroundStyle(.white)
                                .lineLimit(1)
                            Text(context.state.description)
                                .font(.caption)
                                .foregroundStyle(.white.opacity(0.55))
                                .lineLimit(2)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(.leading, 6)

                        CircularProgressView(
                            isCompleted: context.state.isCompleted,
                            size: 46,
                            endTime: context.state.endTime,
                            startTime: context.state.startTime,
                            showTimer: true
                        )
                    }
                    .padding(.horizontal, 8)
                    .padding(.vertical, 10)
                }
            } compactLeading: {
                Image(systemName: "sparkles")
                    .foregroundStyle(appAccent)
                    .font(.system(size: 13, weight: .semibold))
            } compactTrailing: {
                CircularProgressView(
                    isCompleted: context.state.isCompleted,
                    size: 22,
                    endTime: context.state.endTime,
                    startTime: context.state.startTime,
                    showTimer: false
                )
            } minimal: {
                CircularProgressView(
                    isCompleted: context.state.isCompleted,
                    size: 22,
                    endTime: context.state.endTime,
                    startTime: context.state.startTime,
                    showTimer: false
                )
            }
            .widgetURL(URL(string: context.attributes.deepLinkURL))
            .keylineTint(appAccent)
        }
    }
}

struct LockScreenActivityView: View {
    let context: ActivityViewContext<WidgetAttributes>

    var body: some View {
        VStack(spacing: 12) {
            HStack(alignment: .center) {
                HStack(spacing: 6) {
                    Image(systemName: "sparkles")
                        .foregroundStyle(appAccent)
                        .font(.system(size: 13, weight: .semibold))
                    Text("Life")
                        .font(.caption)
                        .fontWeight(.semibold)
                        .foregroundStyle(.white.opacity(0.5))
                }
                Spacer()
                statusBadge
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(context.state.title)
                    .font(.system(size: 16, weight: .bold))
                    .foregroundStyle(.white)
                    .lineLimit(1)

                if !context.state.description.isEmpty {
                    Text(context.state.description)
                        .font(.caption)
                        .foregroundStyle(.white.opacity(0.55))
                        .lineLimit(2)
                }

                if !context.state.todos.isEmpty {
                    TodosRowView(todos: context.state.todos)
                        .padding(.top, 4)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)

            progressBar
        }
        .padding(16)
        .background(appBg)
        .widgetURL(URL(string: context.attributes.deepLinkURL))
    }

    @ViewBuilder
    private var statusBadge: some View {
        if context.state.isCompleted {
            Label("Done", systemImage: "checkmark.circle.fill")
                .font(.caption2)
                .fontWeight(.semibold)
                .foregroundStyle(.green)
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(Color.green.opacity(0.12))
                .clipShape(Capsule())
        } else {
            Label("Active", systemImage: "timer")
                .font(.caption2)
                .fontWeight(.semibold)
                .foregroundStyle(appAccent)
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(appAccent.opacity(0.12))
                .clipShape(Capsule())
        }
    }

    @ViewBuilder
    private var progressBar: some View {
        HStack(spacing: 10) {
            if context.state.isCompleted {
                ProgressView(value: 1.0)
                    .progressViewStyle(.linear)
                    .tint(.green)
                    .frame(height: 4)
                    .clipShape(Capsule())
                    .layoutPriority(1)
                Text("00:00")
                    .font(.system(size: 12, weight: .semibold, design: .rounded))
                    .monospacedDigit()
                    .foregroundStyle(Color.green)
            } else {
                ProgressView(
                    timerInterval: context.state.startTime...context.state.endTime,
                    countsDown: true,
                    label: { EmptyView() },
                    currentValueLabel: { EmptyView() }
                )
                .progressViewStyle(.linear)
                .tint(appAccent)
                .frame(height: 4)
                .clipShape(Capsule())
                .layoutPriority(1)

                Text(timerInterval: Date.now...context.state.endTime, countsDown: true)
                    .font(.system(size: 12, weight: .semibold, design: .rounded))
                    .monospacedDigit()
                    .foregroundStyle(.white.opacity(0.6))
                    .frame(minWidth: 52, alignment: .trailing)
            }
        }
    }
}

struct CircularProgressView: View {
    let isCompleted: Bool
    let size: CGFloat
    let endTime: Date
    let startTime: Date
    let showTimer: Bool

    var body: some View {
        ZStack {
            if isCompleted {
                Circle()
                    .stroke(Color.green.opacity(0.25), lineWidth: size * 0.1)
                Circle()
                    .stroke(Color.green, lineWidth: size * 0.1)
                Image(systemName: "checkmark")
                    .font(.system(size: size * 0.38, weight: .bold))
                    .foregroundStyle(Color.green)
            } else {
                ProgressView(
                    timerInterval: startTime...endTime,
                    countsDown: true,
                    label: { EmptyView() },
                    currentValueLabel: { EmptyView() }
                )
                .progressViewStyle(.circular)
                .tint(appAccent)
                .scaleEffect(size / 30)

                if showTimer {
                    Text(timerInterval: Date.now...endTime, countsDown: true)
                        .font(.system(size: size * 0.24, weight: .bold, design: .rounded))
                        .monospacedDigit()
                        .multilineTextAlignment(.center)
                        .foregroundStyle(.white)
                }
            }
        }
        .frame(width: size, height: size)
    }
}

struct TodosRowView: View {
    let todos: [WidgetTodo]

    var body: some View {
        HStack(spacing: 4) {
            ForEach(visibleTodos, id: \.id) { todo in
                TodoTile(todo: todo)
            }
            if remainingCount > 0 {
                Text("+\(remainingCount)")
                    .font(.caption2)
                    .fontWeight(.medium)
                    .padding(.horizontal, 7)
                    .padding(.vertical, 4)
                    .background(.white.opacity(0.08))
                    .foregroundStyle(.white.opacity(0.5))
                    .clipShape(RoundedRectangle(cornerRadius: 6))
            }
        }
    }

    private var visibleTodos: [WidgetTodo] { Array(todos.prefix(3)) }
    private var remainingCount: Int { max(0, todos.count - visibleTodos.count) }
}

struct TodoTile: View {
    let todo: WidgetTodo

    var body: some View {
        HStack(spacing: 3) {
            Image(systemName: todo.isCompleted ? "checkmark.circle.fill" : "circle")
                .font(.system(size: 9, weight: .medium))
                .foregroundStyle(todo.isCompleted ? Color.green : .white.opacity(0.35))

            Text(todo.title)
                .font(.system(size: 10, weight: .medium))
                .strikethrough(todo.isCompleted)
                .foregroundStyle(todo.isCompleted ? .white.opacity(0.4) : .white.opacity(0.8))
                .lineLimit(1)
        }
        .padding(.horizontal, 7)
        .padding(.vertical, 4)
        .background(todo.isCompleted ? Color.green.opacity(0.08) : appAccent.opacity(0.08))
        .clipShape(RoundedRectangle(cornerRadius: 6))
    }
}

extension WidgetAttributes {
    fileprivate static var preview: WidgetAttributes {
        WidgetAttributes(eventId: "preview-event", deepLinkURL: "mylife://timeline/")
    }
}

extension WidgetAttributes.ContentState {
    fileprivate static var running: WidgetAttributes.ContentState {
        WidgetAttributes.ContentState(
            title: "Morning Workout",
            description: "Complete your 30-minute exercise routine",
            startTime: Date(),
            endTime: Date().addingTimeInterval(1800),
            isCompleted: false,
            progress: 0.3,
            todos: [
                WidgetTodo(id: "1", title: "Warm up", isCompleted: true),
                WidgetTodo(id: "2", title: "30 push-ups", isCompleted: false),
                WidgetTodo(id: "3", title: "Cool down", isCompleted: false)
            ]
        )
    }

    fileprivate static var completed: WidgetAttributes.ContentState {
        WidgetAttributes.ContentState(
            title: "Study Session",
            description: "Review chapter 5 for upcoming exam",
            startTime: Date().addingTimeInterval(-3600),
            endTime: Date(),
            isCompleted: true,
            progress: 1.0,
            todos: [
                WidgetTodo(id: "1", title: "Read chapter 5", isCompleted: true),
                WidgetTodo(id: "2", title: "Take notes", isCompleted: true),
                WidgetTodo(id: "3", title: "Flashcards", isCompleted: true)
            ]
        )
    }
}

#Preview("Notification", as: .content, using: WidgetAttributes.preview) {
   WidgetLiveActivity()
} contentStates: {
    WidgetAttributes.ContentState.running
    WidgetAttributes.ContentState.completed
}
