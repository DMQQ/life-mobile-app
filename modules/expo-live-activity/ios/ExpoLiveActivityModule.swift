import ExpoModulesCore
import ActivityKit
import OSLog

// MUST exactly match the WidgetAttributes struct in WidgetLiveActivity.
struct WidgetAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var title: String
        var description: String
        var startTime: Date
        var endTime: Date
        var isCompleted: Bool
        var progress: Double
    }
    
    var eventId: String
    var deepLinkURL: String
}

public class ExpoLiveActivityModule: Module {
    private let logger = Logger(subsystem: "com.dmq.mylifemobile", category: "LiveActivity")
    
    // Each module class must implement the definition function. The definition consists of components
    // that describes the module's functionality and behavior.
    // See https://docs.expo.dev/modules/module-api for more details about available components.
    public func definition() -> ModuleDefinition {
        // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
        // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
        // The module will be accessible from `requireNativeModule('ExpoLiveActivity')` in JavaScript.
        Name("ExpoLiveActivity")
        
        Events("onLiveActivityCancel")
        
        Function("areActivitiesEnabled") { () -> Bool in
            if #available(iOS 16.2, *) {
                let enabled = ActivityAuthorizationInfo().areActivitiesEnabled
                self.logger.info("Activities enabled check: \(enabled)")
                return enabled
            } else {
                self.logger.warning("iOS version below 16.2, activities not supported")
                return false
            }
        }
        
        Function("isActivityInProgress") { () -> Bool in
            if #available(iOS 16.2, *) {
                return !Activity<WidgetAttributes>.activities.isEmpty
            } else {
                return false
            }
        }
        
        AsyncFunction("startCountdownActivity") { (eventId: String, deepLinkURL: String, title: String, description: String, endTime: String) -> String? in
            if #available(iOS 16.2, *) {
                self.logger.info("Starting Live Activity for eventId: \(eventId)")
                self.logger.info("EndTime string: \(endTime)")
                self.logger.info("DeepLink URL: \(deepLinkURL)")
                self.logger.info("Title: \(title)")
                self.logger.info("Description: \(description)")
                
                let dateFormatter = ISO8601DateFormatter()
                dateFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
                guard let endDate = dateFormatter.date(from: endTime) else {
                    self.logger.error("Failed to parse end date: \(endTime)")
                    return nil
                }
                
                self.logger.info("Parsed end date: \(endDate)")
                
                let startDate = Date()
                let totalDuration = endDate.timeIntervalSince(startDate)
                let progress = totalDuration > 0 ? 1.0 : 0.0
                
                self.logger.info("Start date: \(startDate)")
                self.logger.info("Total duration: \(totalDuration) seconds")
                self.logger.info("Initial progress: \(progress)")
                
                let attributes = WidgetAttributes(eventId: eventId, deepLinkURL: deepLinkURL)
                self.logger.info("Created attributes with eventId: \(eventId)")
                
                let contentState = WidgetAttributes.ContentState(
                    title: title,
                    description: description,
                    startTime: startDate,
                    endTime: endDate,
                    isCompleted: false,
                    progress: progress
                )
                
                self.logger.info("Created content state successfully")
                
                // Set stale date after end time - iOS will clean up stale activities
                let staleDate = endDate.addingTimeInterval(10.0) // 5 minutes after end
                let activityContent = ActivityContent(state: contentState, staleDate: staleDate)
                self.logger.info("Created activity content with stale date: \(staleDate)")
                
                do {
                    self.logger.info("About to request activity with attributes")
                    
                    // Check authorization status
                    let authInfo = ActivityAuthorizationInfo()
                    self.logger.info("Activity authorization status: \(authInfo.areActivitiesEnabled)")
                    
                    let activity = try Activity.request(attributes: attributes, content: activityContent)
                    self.logger.info("Activity created successfully with ID: \(activity.id)")
                    self.logger.info("Activity state: \(String(describing: activity.activityState))")
                    
                    // Activity will automatically become stale and be cleaned up by iOS
                    
                    NotificationCenter.default.addObserver(self, selector: #selector(self.onLiveActivityCancel), name: Notification.Name("onLiveActivityCancel"), object: nil)
                    return activity.id
                } catch {
                    self.logger.error("Failed to create activity with error: \(error.localizedDescription)")
                    self.logger.error("Error details: \(String(describing: error))")
                    self.logger.error("Error type: \(type(of: error))")
                    
                    return nil
                }
            } else {
                self.logger.error("iOS version is below 16.2, Live Activities not supported")
                return nil
            }
        }
        
        Function("updateActivity") { (progress: Double, isCompleted: Bool) -> Void in
            if #available(iOS 16.2, *) {
                Task {
                    for activity in Activity<WidgetAttributes>.activities {
                        let currentState = activity.content.state
                        let newContentState = WidgetAttributes.ContentState(
                            title: currentState.title,
                            description: currentState.description,
                            startTime: currentState.startTime,
                            endTime: currentState.endTime,
                            isCompleted: isCompleted,
                            progress: progress
                        )
                        await activity.update(using: newContentState)
                    }
                }
            }
        }
        
        Function("endActivity") { () -> Void in
            if #available(iOS 16.2, *) {
                Task {
                    for activity in Activity<WidgetAttributes>.activities {
                        await activity.end(nil, dismissalPolicy: .default)
                    }
                }
                
                NotificationCenter.default.removeObserver(self, name: Notification.Name("onLiveActivityCancel"), object: nil)
            }
        }
        
        Function("getActivityToken") { () -> String? in
            if #available(iOS 16.2, *) {
                return Activity<WidgetAttributes>.activities.first?.id
            } else {
                return nil
            }
        }
        
        Function("cancelActivityById") { (activityId: String) -> Void in
            if #available(iOS 16.2, *) {
                Task {
                    for activity in Activity<WidgetAttributes>.activities {
                        if activity.id == activityId {
                            await activity.end(nil, dismissalPolicy: .immediate)
                            break
                        }
                    }
                }
            }
        }
    }
    
    @objc
    func onLiveActivityCancel() {
        sendEvent("onLiveActivityCancel", [:])
    }
    
}