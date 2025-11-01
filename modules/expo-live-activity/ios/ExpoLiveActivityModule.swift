import ExpoModulesCore
import ActivityKit
import OSLog
import UserNotifications

class NotificationHandler: NSObject, UNUserNotificationCenterDelegate {
    static let shared = NotificationHandler()
    private let logger = Logger(subsystem: "com.dmq.mylifemobile", category: "PushNotifications")
    
    func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        logger.info("🔥 PUSH NOTIFICATION RECEIVED: \(notification.request.content.userInfo)")
        completionHandler([.alert, .sound, .badge])
    }
    
    func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse, withCompletionHandler completionHandler: @escaping () -> Void) {
        logger.info("🔥 PUSH NOTIFICATION TAPPED: \(response.notification.request.content.userInfo)")
        completionHandler()
    }
}

// MUST exactly match the WidgetAttributes struct in WidgetLiveActivity.
struct WidgetAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var title: String
        var description: String
        var startTime: Date
        var endTime: Date
        var isCompleted: Bool
        var progress: Double
        
        // Custom initializer for push-to-start with defaults
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
    }
    
    var eventId: String
    var deepLinkURL: String
    
    // Custom initializer for push-to-start with defaults
    init(eventId: String = "default-event-id", deepLinkURL: String = "mylife://default") {
        self.eventId = eventId
        self.deepLinkURL = deepLinkURL
    }
}

public class ExpoLiveActivityModule: Module {
    private let logger = Logger(subsystem: "com.dmq.mylifemobile", category: "LiveActivity")
    
    private var pushNotificationsEnabled: Bool = true
    
    public func definition() -> ModuleDefinition {
        Name("ExpoLiveActivity")
        
        Events("onStateChange", "onActivityPushToken", "onPushToStartToken")
        
        OnCreate {
            if pushNotificationsEnabled {
                observePushToStartToken()
            }
            observeLiveActivityUpdates()
            
            // Debug: Log when any push notification is received
            UNUserNotificationCenter.current().delegate = NotificationHandler.shared
        }
        
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
        
        Function("getActivityTokens") { () -> [String: Any] in
            if #available(iOS 16.2, *) {
                var result: [String: Any] = [:]
                let activities = Activity<WidgetAttributes>.activities
                
                for activity in activities {
                    self.logger.info("🔍 Activity \(activity.id) - eventId: \(activity.attributes.eventId)")
                    // Note: pushToken is only available after the activity requests it
                    result[activity.id] = [
                        "eventId": activity.attributes.eventId,
                        "state": String(describing: activity.activityState)
                    ]
                }
                return result
            }
            return [:]
        }
        
        Function("createTestActivity") { () -> String? in
            if #available(iOS 16.2, *) {
                self.logger.info("🚀 Creating test activity for push-to-start debugging")
                
                guard ActivityAuthorizationInfo().areActivitiesEnabled else {
                    self.logger.error("❌ Activities not enabled!")
                    return nil
                }
                
                let attributes = WidgetAttributes(eventId: "test-push-to-start", deepLinkURL: "mylife://test")
                let contentState = WidgetAttributes.ContentState(
                    title: "Test Activity",
                    description: "Created locally for push-to-start test",
                    startTime: Date(),
                    endTime: Date().addingTimeInterval(3600),
                    isCompleted: false,
                    progress: 1.0
                )
                
                self.logger.info("🔍 Attributes: eventId=\(attributes.eventId), deepLink=\(attributes.deepLinkURL)")
                self.logger.info("🔍 ContentState: title=\(contentState.title), completed=\(contentState.isCompleted)")
                
                do {
                    let activity = try Activity.request(
                        attributes: attributes,
                        content: ActivityContent(state: contentState, staleDate: nil),
                        pushType: pushNotificationsEnabled ? .token : nil
                    )
                    self.logger.info("✅ Test activity created: \(activity.id)")
                    
                    // Monitor this activity
                    if pushNotificationsEnabled {
                        monitorActivityPushToken(activity: activity)
                    }
                    
                    return activity.id
                } catch {
                    self.logger.error("❌ Failed to create test activity: \(error.localizedDescription)")
                    self.logger.error("❌ Error details: \(String(describing: error))")
                    return nil
                }
            } else {
                self.logger.error("❌ iOS version below 16.2")
                return nil
            }
        }
        
        Function("isActivityInProgress") { () -> Bool in
            if #available(iOS 16.2, *) {
                let activities = Activity<WidgetAttributes>.activities
                self.logger.info("🔍 Current activities count: \(activities.count)")
                for activity in activities {
                    self.logger.info("🔍 Activity ID: \(activity.id), State: \(String(describing: activity.activityState))")
                }
                return !activities.isEmpty
            } else {
                return false
            }
        }
        
        AsyncFunction("startCountdownActivity") { (eventId: String, deepLinkURL: String, title: String, description: String, endTime: String) -> String? in
            if #available(iOS 16.2, *) {
                self.logger.info("Starting Live Activity for eventId: \(eventId)")
                
                let dateFormatter = ISO8601DateFormatter()
                dateFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
                guard let endDate = dateFormatter.date(from: endTime) else {
                    self.logger.error("Failed to parse end date: \(endTime)")
                    return nil
                }
                
                let startDate = Date()
                let totalDuration = endDate.timeIntervalSince(startDate)
                let progress = totalDuration > 0 ? 1.0 : 0.0
                
                let attributes = WidgetAttributes(eventId: eventId, deepLinkURL: deepLinkURL)
                let contentState = WidgetAttributes.ContentState(
                    title: title,
                    description: description,
                    startTime: startDate,
                    endTime: endDate,
                    isCompleted: false,
                    progress: progress
                )
                
                let activityContent = ActivityContent(state: contentState, staleDate: endDate)
                
                do {
                    let activity = try Activity.request(
                        attributes: attributes, 
                        content: activityContent, 
                        pushType: pushNotificationsEnabled ? .token : nil
                    )
                    self.logger.info("Activity created successfully with ID: \(activity.id)")
                    
                    // Monitor for push tokens if enabled
                    if pushNotificationsEnabled {
                        self.monitorActivityPushToken(activity: activity)
                    }
                    
                    return activity.id
                } catch {
                    self.logger.error("Failed to create activity: \(error.localizedDescription)")
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
            }
        }
        
       AsyncFunction("getPushToStartToken") { () async -> String? in
            if #available(iOS 17.2, *) {
                do {
                    for await tokenData in Activity<WidgetAttributes>.pushToStartTokenUpdates {
                        let token = tokenData.map { String(format: "%02.2hhx", $0) }.joined()
                        self.logger.info("Push-to-start token received in getPushToStartToken: \(token)")
                        return token
                    }
                    return nil
                } catch {
                    self.logger.error("Error getting push-to-start token: \(error.localizedDescription)")
                    return nil
                }
            } else {
                self.logger.warning("iOS version below 17.2, push-to-start not supported")
                return nil
            }
        }

        Function("requestPushToStartPermissions") { () -> Void in
            if #available(iOS 17.2, *) {
                UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
                    if granted {
                        DispatchQueue.main.async {
                            UIApplication.shared.registerForRemoteNotifications()
                        }
                        self.logger.info("Push notifications authorized for push-to-start")
                    } else {
                        self.logger.error("Push notifications not authorized: \(error?.localizedDescription ?? "Unknown error")")
                    }
                }
            } else {
                self.logger.warning("iOS version below 17.2, push-to-start not supported")
            }
        }
    }
    
    private func observePushToStartToken() {
        guard #available(iOS 17.2, *), ActivityAuthorizationInfo().areActivitiesEnabled else { 
            self.logger.warning("Push-to-start monitoring skipped - iOS < 17.2 or activities not enabled")
            return 
        }

        self.logger.info("🚀 Starting push-to-start token monitoring...")
        self.logger.info("Activities enabled: \(ActivityAuthorizationInfo().areActivitiesEnabled)")
        
        Task {
            do {
                for await data in Activity<WidgetAttributes>.pushToStartTokenUpdates {
                    let token = data.reduce("") { $0 + String(format: "%02x", $1) }
                    self.logger.info("📱 Push-to-start token received: \(token)")
                    sendEvent("onPushToStartToken", [
                        "activityPushToStartToken": token
                    ])
                }
            } catch {
                self.logger.error("❌ Error in push-to-start monitoring: \(error)")
            }
        }
    }

    private func observeLiveActivityUpdates() {
        guard #available(iOS 16.2, *) else { return }

        self.logger.info("🔄 Starting Live Activity updates monitoring...")
        
        // Debug: Log all current activities at startup
        let currentActivities = Activity<WidgetAttributes>.activities
        self.logger.info("🔍 Activities at startup: \(currentActivities.count)")
        for activity in currentActivities {
            self.logger.info("🔍 Existing activity: \(activity.id), state: \(String(describing: activity.activityState))")
        }
        
        Task {
            for await activityUpdate in Activity<WidgetAttributes>.activityUpdates {
                let activityId = activityUpdate.id
                let activityState = activityUpdate.activityState

                self.logger.info("🟣 Received activity update: \(activityId), \(String(describing: activityState))")
                
                // Debug: Log all activities again when we get an update
                let allActivities = Activity<WidgetAttributes>.activities
                self.logger.info("🔍 All activities after update: \(allActivities.count)")
                for activity in allActivities {
                    self.logger.info("🔍 Activity: \(activity.id), state: \(String(describing: activity.activityState))")
                }

                guard let activity = Activity<WidgetAttributes>.activities.first(where: { $0.id == activityId })
                else { 
                    self.logger.warning("❓ Didn't find activity with ID \(activityId) in our activities list")
                    return 
                }

                if case .active = activityState {
                    self.logger.info("✅ Activity is active: \(activity.id)")
                    Task {
                        for await state in activity.activityStateUpdates {
                            self.logger.info("🔵 Activity state change: \(activity.id) -> \(String(describing: state))")
                            sendEvent("onStateChange", [
                                "activityID": activity.id,
                                "activityState": String(describing: state),
                                "eventId": activity.attributes.eventId
                            ])
                        }
                    }

                    if pushNotificationsEnabled {
                        self.logger.info("🔗 Adding push token observer for activity \(activity.id)")
                        Task {
                            for await pushToken in activity.pushTokenUpdates {
                                let pushTokenString = pushToken.reduce("") { $0 + String(format: "%02x", $1) }
                                self.logger.info("🟡 Activity push token: \(pushTokenString)")
                                
                                sendEvent("onActivityPushToken", [
                                    "activityID": activity.id,
                                    "activityPushToken": pushTokenString,
                                    "eventId": activity.attributes.eventId
                                ])
                            }
                        }
                        
                        // Also monitor content updates from push notifications
                        Task {
                            for await content in activity.contentUpdates {
                                self.logger.info("📝 Activity content updated via push: \(activity.id)")
                                self.logger.info("📝 New title: \(content.state.title)")
                                self.logger.info("📝 New progress: \(content.state.progress)")
                            }
                        }
                    }
                }
            }
        }
    }
    
    // Monitor activity push tokens according to Apple documentation
    @available(iOS 16.2, *)
    private func monitorActivityPushToken(activity: Activity<WidgetAttributes>) {
        Task {
            for await pushToken in activity.pushTokenUpdates {
                let pushTokenString = pushToken.reduce("") { $0 + String(format: "%02x", $1) }
                self.logger.info("Activity push token received: \(pushTokenString)")
                
                // Send token to JavaScript
                self.sendEvent("onActivityPushToken", [
                    "activityID": activity.id,
                    "activityPushToken": pushTokenString,
                    "eventId": activity.attributes.eventId
                ])
            }
        }
    }

    @available(iOS 17.2, *)
    private func listenForTokenToStartActivityViaPush() {
        Task {
            for await tokenData in Activity<WidgetAttributes>.pushToStartTokenUpdates {
                let token = tokenData.map { String(format: "%02.2hhx", $0) }.joined()
                self.logger.info("🔴 Push-to-Start Token Received: \(token)")
            }
        }
    }

    @available(iOS 16.2, *)
    private func listenForTokenToUpdateActivityViaPush() {
        Task {
            for await activityData in Activity<WidgetAttributes>.activityUpdates {
                self.logger.info("🟣 Activity Update Detected - ID: \(activityData.id)")
                
                for await tokenData in activityData.pushTokenUpdates {
                    let token = tokenData.map { String(format: "%02.2hhx", $0) }.joined()
                    self.logger.info("🔵 Activity Push Token Update Received: \(token)")
                }

                for await stateUpdate in activityData.contentStateUpdates {
                    self.logger.info("🟢 Activity State Update - Title: \(stateUpdate.title), Progress: \(stateUpdate.progress)")
                }

                for await newContent in activityData.contentUpdates {
                    self.logger.info("🟡 Activity Content Update - Title: \(newContent.state.title)")
                }
            }
        }
    }
}