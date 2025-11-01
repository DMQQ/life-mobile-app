import ActivityKit
import WidgetKit
import SwiftUI

// No changes needed here. This defines the static and dynamic data for the activity.
struct WidgetAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var title: String
        var description: String
        var startTime: Date
        var endTime: Date
        var isCompleted: Bool
        var progress: Double
        
        enum CodingKeys: String, CodingKey {
            case title, description, startTime, endTime, isCompleted, progress
        }
        
        init(title: String = "Default Title", 
             description: String = "Default Description",
             startTime: Date = Date(),
             endTime: Date = Date().addingTimeInterval(3600),
             isCompleted: Bool = false,
             progress: Double = 1.0) {
            self.title = title
            self.description = description
            self.startTime = startTime
            self.endTime = endTime
            self.isCompleted = isCompleted
            self.progress = progress
        }
        
        init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            title = try container.decode(String.self, forKey: .title)
            description = try container.decode(String.self, forKey: .description)
            isCompleted = try container.decode(Bool.self, forKey: .isCompleted)
            progress = try container.decode(Double.self, forKey: .progress)
            
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

// The main widget configuration.
struct WidgetLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: WidgetAttributes.self) { context in
            // This view appears on the Lock Screen.
            LockScreenActivityView(context: context)
        } dynamicIsland: { context in
            DynamicIsland {
                // Only use bottom region to avoid doubled content
                DynamicIslandExpandedRegion(.bottom) {
                    HStack(spacing: 12) {
                        // Circle timer on the left
                        CircularProgressView(
                            isCompleted: context.state.isCompleted,
                            size: 40,
                            endTime: context.state.endTime,
                            startTime: context.state.startTime
                        )
                        
                        // Title and description in the center
                        VStack(alignment: .leading, spacing: 3) {
                            Text(context.state.title)
                                .font(.subheadline)
                                .fontWeight(.semibold)
                                .foregroundColor(.primary)
                                .lineLimit(1)
                            Text(context.state.description)
                                .font(.caption)
                                .foregroundColor(.secondary)
                                .lineLimit(2)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(.horizontal, 6)
                        
                        // Button on the right
                        if !context.state.isCompleted {
                            Button(intent: CompleteActivityIntent(eventId: context.attributes.eventId)) {
                                ZStack {
                                    Circle()
                                        .fill(Color.blue)
                                        .frame(width: 40, height: 40)
                                    
                                    Image(systemName: "checkmark")
                                        .font(.system(size: 20, weight: .bold))
                                        .foregroundColor(.white)
                                }
                            }
                            .buttonStyle(.plain)
                            .background(Color.clear)
                        }
                    }
                    .padding(.horizontal, 8)
                    .padding(.vertical, 8)
                }
            } compactLeading: {
                Image(systemName: "app.fill")
                    .foregroundColor(.blue)
                    .font(.system(size: 16))
            } compactTrailing: {
                // The compact trailing view in the Dynamic Island.
                CircularProgressView(
                    isCompleted: context.state.isCompleted,
                    size: 24,
                    endTime: context.state.endTime,
                    startTime: context.state.startTime
                )
            } minimal: {
                // The minimal view when multiple activities are present.
                CircularProgressView(
                    isCompleted: context.state.isCompleted,
                    size: 20,
                    endTime: context.state.endTime,
                    startTime: context.state.startTime
                )
            }
            .widgetURL(URL(string: context.attributes.deepLinkURL))
            .keylineTint(Color.blue)
        }
    }
}

// The view for the Lock Screen presentation.
struct LockScreenActivityView: View {
    let context: ActivityViewContext<WidgetAttributes>
    
    var body: some View {
        HStack(spacing: 12) {
            CircularProgressView(
                isCompleted: context.state.isCompleted,
                size: 35,
                endTime: context.state.endTime,
                startTime: context.state.startTime
            )
            .frame(width: 35, height: 35)
            
            VStack(alignment: .leading, spacing: 6) {
                Text(context.state.title)
                    .font(.headline)
                    .fontWeight(.semibold)
                    .foregroundColor(.primary)
                    .lineLimit(2)
                
                Text(context.state.description)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .lineLimit(4)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            
            if !context.state.isCompleted {
                Button(intent: CompleteActivityIntent(eventId: context.attributes.eventId)) {
                    ZStack {
                        Circle()
                            .fill(Color.blue)
                            .frame(width: 40, height: 40)
                        
                        Image(systemName: "checkmark")
                            .font(.system(size: 18, weight: .bold))
                            .foregroundColor(.white)
                    }
                }
                .buttonStyle(.plain)
                .background(Color.clear)
                .frame(width: 40, height: 40)
            }
        }
        .padding(16)
        .activityBackgroundTint(Color.black.opacity(0.5))
        .activitySystemActionForegroundColor(Color.blue)
    }
}

// ✅ CircularProgressView using ProgressView for countdown
struct CircularProgressView: View {
    let isCompleted: Bool
    let size: CGFloat
    let endTime: Date
    let startTime: Date
    
    private func circularTimer(endDate: Date) -> some View {
        let currentTime = Date()
        let timeRemaining = endDate.timeIntervalSince(currentTime)
        
        return ZStack {
            if timeRemaining > 0 {
                ProgressView(
                    timerInterval: currentTime...endDate,
                    countsDown: true,
                    label: { EmptyView() },
                    currentValueLabel: { EmptyView() }
                )
                .progressViewStyle(.circular)
                .scaleEffect(size / 30) // Scale based on size
                .tint(.blue)
                
                // Timer text overlay
                Text(endDate, style: .timer)
                    .font(.system(size: size * 0.26, weight: .semibold, design: .rounded))
                    .monospacedDigit()
                    .multilineTextAlignment(.center)
                    .foregroundColor(.primary)
            } else {
                // Show completed state when time is up
                Circle()
                    .stroke(Color.gray.opacity(0.3), lineWidth: size * 0.08)
                    .frame(width: size, height: size)
                
                Text("00:00")
                    .font(.system(size: size * 0.26, weight: .semibold, design: .rounded))
                    .monospacedDigit()
                    .foregroundColor(.secondary)
            }
        }
    }
    
    var body: some View {
        ZStack {
            if isCompleted {
                // Show completed state
                Circle()
                    .stroke(Color.green, lineWidth: size * 0.12)
                    .frame(width: size, height: size)
                
                Image(systemName: "checkmark")
                    .font(.system(size: size * 0.4, weight: .bold))
                    .foregroundColor(.green)
            } else {
                // Use ProgressView for automatic countdown with timer text
                circularTimer(endDate: endTime)
                    .frame(width: size, height: size)
            }
        }
    }
}


// --- PREVIEW PROVIDERS ---

extension WidgetAttributes {
    fileprivate static var preview: WidgetAttributes {
        WidgetAttributes(eventId: "preview-event", deepLinkURL: "lifeapp://timeline/preview-event")
    }
}

extension WidgetAttributes.ContentState {
    fileprivate static var running: WidgetAttributes.ContentState {
        WidgetAttributes.ContentState(
            title: "Morning Workout",
            description: "Complete your 30-minute exercise routine",
            startTime: Date(),
            endTime: Date().addingTimeInterval(1800), // 30 minutes from now
            isCompleted: false,
            progress: 0.3
        )
     }
     
     fileprivate static var completed: WidgetAttributes.ContentState {
         WidgetAttributes.ContentState(
            title: "Study Session",
            description: "Review chapter 5 for upcoming exam",
            startTime: Date().addingTimeInterval(-3600), // Started an hour ago
            endTime: Date(), // Ended now
            isCompleted: true,
            progress: 1.0
         )
     }
}

// The preview block for Xcode.
#Preview("Notification", as: .content, using: WidgetAttributes.preview) {
   WidgetLiveActivity()
} contentStates: {
    WidgetAttributes.ContentState.running
}