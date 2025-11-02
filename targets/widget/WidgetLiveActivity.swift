import ActivityKit
import WidgetKit
import SwiftUI

func loadAppIconFromSharedStorage() -> UIImage? {
    guard let containerURL = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: "group.com.dmq.mylifemobile") else {
        print("❌ Widget: Failed to get shared container")
        return nil
    }
    
    let iconURL = containerURL.appendingPathComponent("AppIcon.png")
    guard let imageData = try? Data(contentsOf: iconURL) else {
        print("❌ Widget: Failed to load image data from \(iconURL)")
        return nil
    }
    
    guard let image = UIImage(data: imageData) else {
        print("❌ Widget: Failed to create UIImage from data")
        return nil
    }
    
    print("✅ Widget: Loaded image with alpha info: \(image.cgImage?.alphaInfo.rawValue ?? 0)")
    return image
}

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
            
            if let startTimeString = try? container.decode(String.self, forKey: .startTime) {
                startTime = Self.parseTime(startTimeString)
            } else {
                startTime = try container.decode(Date.self, forKey: .startTime)
            }
            
            if let endTimeString = try? container.decode(String.self, forKey: .endTime) {
                endTime = Self.parseTime(endTimeString)
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
                let timeComponents = calendar.dateComponents([.hour, .minute, .second], from: time)
                if let dateWithTime = calendar.date(bySettingHour: timeComponents.hour ?? 0,
                                                     minute: timeComponents.minute ?? 0,
                                                     second: timeComponents.second ?? 0,
                                                     of: now) {
                    if dateWithTime < now {
                        return calendar.date(byAdding: .day, value: 1, to: dateWithTime) ?? dateWithTime
                    }
                    return dateWithTime
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
                    HStack(spacing: 8) {
                        Image(systemName: "leaf.fill")
                            .foregroundColor(.blue)
                            .font(.system(size: 16))
                        
                        Text("MyLife")
                            .font(.caption)
                            .fontWeight(.medium)
                            .foregroundColor(.secondary)
                    }.padding(.horizontal, 12)
                }
                
                DynamicIslandExpandedRegion(.bottom) {
                    HStack(spacing: 12) {
                        VStack(alignment: .leading, spacing: 3) {
                            Text(context.state.title)
                                .font(.subheadline)
                                .fontWeight(.bold)
                                .foregroundColor(.primary)
                                .lineLimit(1)
                            Text(context.state.description)
                                .font(.caption)
                                .foregroundColor(.secondary)
                                .lineLimit(3)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(.horizontal, 6)


                        CircularProgressView(
                            isCompleted: context.state.isCompleted,
                            size: 45,
                            endTime: context.state.endTime,
                            startTime: context.state.startTime,
                            showTimer: true
                        )
                    }
                    .padding(.horizontal, 8)
                    .padding(.vertical, 8)
                }
            } compactLeading: {
                Image(systemName: "leaf.fill")
                    .foregroundColor(.blue)
                    .font(.system(size: 16))
            } compactTrailing: {
                CircularProgressView(
                    isCompleted: context.state.isCompleted,
                    size: 24,
                    endTime: context.state.endTime,
                    startTime: context.state.startTime,
                    showTimer: false
                )
            } minimal: {
                CircularProgressView(
                    isCompleted: context.state.isCompleted,
                    size: 24,
                    endTime: context.state.endTime,
                    startTime: context.state.startTime,
                    showTimer: false
                )
            }
            .widgetURL(URL(string: context.attributes.deepLinkURL))
            .keylineTint(Color.blue)
        }
    }
}


struct LockScreenActivityView: View {
    let context: ActivityViewContext<WidgetAttributes>
    
    var body: some View {
        return VStack(spacing: 0) {
            HStack {
                HStack(spacing: 8) {
                    Image(systemName: "leaf.fill")
                        .foregroundColor(.blue)
                        .font(.system(size: 16))
                    
                    Text("MyLife")
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(.secondary)
                }
                
                Spacer()

                Text(context.state.isCompleted ? "Completed" : "In Progress")
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundColor(context.state.isCompleted ? .green : .blue)
            }
            .padding(.bottom, 12)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(context.state.title)
                    .font(.headline)
                    .fontWeight(.bold)
                    .foregroundColor(.primary)
                    .lineLimit(1)
                
                Text(context.state.description)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .lineLimit(2)
                
                if !context.state.todos.isEmpty {
                    TodosRowView(todos: context.state.todos)
                        .padding(.top, 6)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.bottom, 8)
            
            HStack(spacing: 8) {
                if context.state.isCompleted {
                    ProgressView(value: 1.0)
                        .progressViewStyle(LinearProgressViewStyle(tint: .green))
                        .frame(height: 8)
                        .layoutPriority(1)

                } else {
                    ProgressView(
                        timerInterval: Date.now...context.state.endTime,
                        countsDown: true,
                        label: { EmptyView() },
                        currentValueLabel: { EmptyView() }
                    )
                    .progressViewStyle(LinearProgressViewStyle(tint: .blue))
                    .frame(height: 8)
                    .layoutPriority(1)
                }

                if context.state.isCompleted {
                    Text("00:00:00")
                        .font(.system(size: 14, weight: .medium, design: .rounded))
                        .monospacedDigit()
                        .foregroundColor(.green)
                } else {
                    Text(timerInterval: Date.now...context.state.endTime, countsDown: true)
                        .font(.system(size: 14, weight: .medium, design: .rounded))
                        .monospacedDigit()
                        .multilineTextAlignment(.trailing)
                        .foregroundColor(.secondary)
                        .frame(minWidth: 60)
                }
            }
        }
        .padding(16)
        .widgetURL(URL(string: context.attributes.deepLinkURL))
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
                    .stroke(Color.green, lineWidth: size * 0.12)
                    .frame(width: size, height: size)

                Image(systemName: "checkmark")
                    .font(.system(size: size * 0.4, weight: .bold))
                    .foregroundColor(.green)
            } else {
                ZStack {
                    ProgressView(
                        timerInterval: Date.now...endTime,
                        countsDown: true,
                        label: { EmptyView() },
                        currentValueLabel: { EmptyView() }
                    )
                    .progressViewStyle(.circular)
                    .scaleEffect(size / 30)
                    .tint(.blue)

                    // doesnt fit too well
                    if showTimer {
                        Text(timerInterval: Date.now...endTime, countsDown: true)
                            .font(.system(size: size * 0.26, weight: .semibold, design: .rounded))
                            .monospacedDigit()
                            .multilineTextAlignment(.center)
                            .foregroundColor(.primary)
                    }
                }
                .frame(width: size, height: size)
            }
        }
    }
}

struct TodosRowView: View {
    let todos: [WidgetTodo]
    
    var body: some View {
        GeometryReader { geometry in
            HStack(spacing: 4) {
                ForEach(visibleTodos, id: \.id) { todo in
                    TodoTile(todo: todo)
                }
                
                if remainingCount > 0 {
                    Text("+\(remainingCount) more")
                        .font(.caption2)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 6)
                        .background(Color.gray.opacity(0.2))
                        .cornerRadius(6)
                        .foregroundColor(.secondary)
                }
            }
        }
        .frame(height: 20)
    }
    
    private var visibleTodos: [WidgetTodo] {
        let maxItems = 3
        return Array(todos.prefix(maxItems))
    }
    
    private var remainingCount: Int {
        max(0, todos.count - visibleTodos.count)
    }
}

struct TodoTile: View {
    let todo: WidgetTodo
    
    var body: some View {
        HStack(spacing: 2) {
            Image(systemName: todo.isCompleted ? "checkmark.circle.fill" : "circle")
                .font(.caption2)
                .foregroundColor(todo.isCompleted ? .green : .gray)
            
            Text(todo.title)
                .font(.caption2)
                .strikethrough(todo.isCompleted)
                .foregroundColor(todo.isCompleted ? .secondary : .primary)
                .lineLimit(1)
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 6)
        .background(Color.primary.opacity(0.1))
        .cornerRadius(6)
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
                WidgetTodo(id: "1", title: "Warm up for 5 minutes", isCompleted: true),
                WidgetTodo(id: "2", title: "30 push-ups", isCompleted: false),
                WidgetTodo(id: "3", title: "Cool down stretches", isCompleted: false)
            ]
        )
     }
     
     fileprivate static var completed: WidgetAttributes.ContentState {
         WidgetAttributes.ContentState(
            title: "Study Session",
            description: "Review chapter 5 for upcoming exam",
            startTime: Date().addingTimeInterval(-3600), 
            endTime: Date(), // Ended now
            isCompleted: true,
            progress: 1.0,
            todos: [
                WidgetTodo(id: "1", title: "Read chapter 5", isCompleted: true),
                WidgetTodo(id: "2", title: "Take notes", isCompleted: true),
                WidgetTodo(id: "3", title: "Review flashcards", isCompleted: true)
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