import ActivityKit
import WidgetKit
import SwiftUI

// --- DATA MODEL ---
// This MUST be identical to the struct in ExpoLiveActivityModule.swift
struct WidgetAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        // Dynamic properties that change
        var title: String
        var description: String
        var startTime: Date
        var endTime: Date
    }

    // Fixed properties that don't change
    var name: String
    var deepLinkUrl: String // For deep linking
}
// --- END DATA MODEL ---


struct WidgetLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: WidgetAttributes.self) { context in
            // --- LOCK SCREEN VIEW ---
            VStack(alignment: .leading, spacing: 8) {
                Text(context.state.title)
                    .font(.headline)
                    .lineLimit(1)
                Text(context.state.description)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .lineLimit(2)

                // Live-updating Progress Bar
                ProgressView(timerInterval: context.state.startTime...context.state.endTime, countsDown: false)
                    .tint(.blue)
                    .progressViewStyle(.linear)

                // Bottom row with times
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Start: \(context.state.startTime.formatted(.dateTime.hour().minute()))")
                        Text("End:   \(context.state.endTime.formatted(.dateTime.hour().minute()))")
                    }
                    
                    Spacer()
                    
                    // --- TIMER FIX IS HERE ---
                    // Live-updating Countdown Timer
                    // This initializer correctly counts down to the end time.
                    Text(context.state.endTime, style: .timer)
                        .multilineTextAlignment(.trailing)
                        .frame(width: 80) // Fixed width to prevent layout jump
                        .monospacedDigit() // Numbers don't shift
                }
                .font(.caption)
                .foregroundColor(.gray)
            }
            .padding(20)
            .activityBackgroundTint(Color(.systemBackground))
            .activitySystemActionForegroundColor(.primary)
            .widgetURL(URL(string: context.attributes.deepLinkUrl)) // Deep link for lock screen

        } dynamicIsland: { context in
            // --- DYNAMIC ISLAND VIEW ---
            DynamicIsland {
                // Expanded Region
                DynamicIslandExpandedRegion(.center) {
                    VStack(alignment: .leading, spacing: 6) {
                        Text(context.state.title)
                            .font(.headline)
                            .lineLimit(1)
                        
                        // Live-updating Progress Bar
                        ProgressView(timerInterval: context.state.startTime...context.state.endTime, countsDown: false)
                            .tint(.blue)

                        // --- TIMER FIX IS HERE ---
                        // Live-updating Countdown Timer
                        Text(context.state.endTime, style: .timer)
                            .font(.caption2)
                            .foregroundColor(.secondary)
                            .monospacedDigit()
                    }
                    .padding(.horizontal)
                }
            } compactLeading: {
                // Compact Leading (App Icon)
                Image("AppIcon")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 24, height: 24)
                    .clipShape(RoundedRectangle(cornerRadius: 6))
            } compactTrailing: {
                // Compact Trailing (Circular Progress)
                ProgressView(timerInterval: context.state.startTime...context.state.endTime, countsDown: false)
                    .progressViewStyle(.circular)
                    .tint(.blue)
            } minimal: {
                // Minimal (Circular Progress)
                ProgressView(timerInterval: context.state.startTime...context.state.endTime, countsDown: false)
                    .progressViewStyle(.circular)
                    .tint(.blue)
            }
            .keylineTint(Color.blue)
            .widgetURL(URL(string: context.attributes.deepLinkUrl)) // Deep link for Dynamic Island
        }
    }
}


// --- PREVIEW CODE ---
#Preview("Live Activity Preview", as: .content, using: WidgetAttributes(name: "Preview", deepLinkUrl: "mylifeapp://preview")) {
    WidgetLiveActivity()
} contentStates: {
    WidgetAttributes.ContentState(
        title: "Workout Session",
        description: "Leg day at the gym",
        startTime: .now.addingTimeInterval(-600), // 10 minutes ago
        endTime: .now.addingTimeInterval(1800) // 30 minutes from now
    )
}

