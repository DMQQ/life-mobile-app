import ExpoModulesCore
import ActivityKit
import OSLog
import UserNotifications

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
    private var activityPushTokens: [String: String] = [:] // activityId -> pushToken
    private var pushToStartToken: String? = nil
    
    // Each module class must implement the definition function. The definition consists of components
    // that describes the module's functionality and behavior.
    // See https://docs.expo.dev/modules/module-api for more details about available components.
    public func definition() -> ModuleDefinition {
        // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
        // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
        // The module will be accessible from `requireNativeModule('ExpoLiveActivity')` in JavaScript.
        Name("ExpoLiveActivity")
        
        Events("onLiveActivityCancel", "onActivityPushToken", "onPushNotificationReceived", "onPushToStartToken")
        
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
                
                // Set stale date to end time - iOS will clean up when timer expires
                let activityContent = ActivityContent(state: contentState, staleDate: endDate)
                self.logger.info("Created activity content with stale date: \(endDate)")
                
                do {
                    self.logger.info("About to request activity with attributes")
                    
                    // Check authorization status
                    let authInfo = ActivityAuthorizationInfo()
                    self.logger.info("Activity authorization status: \(authInfo.areActivitiesEnabled)")
                    
                    let activity = try Activity.request(attributes: attributes, content: activityContent)
                    self.logger.info("Activity created successfully with ID: \(activity.id)")
                    self.logger.info("Activity state: \(String(describing: activity.activityState))")
                    
                    // Schedule automatic dismissal when timer ends
                    self.scheduleActivityDismissal(activity: activity, endDate: endDate)
                    
                    // Monitor for push tokens
                    self.monitorActivityPushToken(activity: activity)
                    
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
        
        Function("getActivityPushToken") { (activityId: String) -> String? in
            if #available(iOS 16.2, *) {
                return self.activityPushTokens[activityId]
            } else {
                return nil
            }
        }
        
        AsyncFunction("startActivityFromPushNotification") { (userInfo: [String: Any]) -> String? in
            if #available(iOS 16.2, *) {
                return await self.handlePushNotificationActivity(userInfo: userInfo)
            } else {
                return nil
            }
        }
        
        Function("setupPushNotificationHandling") { () -> Void in
            self.setupPushNotificationObserver()
        }
        
        Function("enablePushToStart") { () -> Void in
            if #available(iOS 17.2, *) {
                // Only start monitoring if not already monitoring
                if self.pushToStartToken == nil {
                    self.monitorPushToStartToken()
                    self.logger.info("Push-to-start token monitoring enabled")
                } else {
                    self.logger.info("Push-to-start already enabled with token: \(String(describing: self.pushToStartToken))")
                }
            } else {
                self.logger.warning("Push-to-start requires iOS 17.2 or later")
            }
        }
        
        Function("getPushToStartToken") { () -> String? in
            return self.pushToStartToken
        }
        
        AsyncFunction("handleAppLaunchFromPushToStart") { () -> String? in
            if #available(iOS 16.2, *) {
                // Check if there are any new activities that were started by push-to-start
                let activities = Activity<WidgetAttributes>.activities
                if let latestActivity = activities.last {
                    self.logger.info("App launched with Live Activity: \(latestActivity.id)")
                    
                    // Start monitoring this activity for push tokens
                    self.monitorActivityPushToken(activity: latestActivity)
                    
                    // Schedule dismissal
                    self.scheduleActivityDismissal(activity: latestActivity, endDate: latestActivity.content.state.endTime)
                    
                    return latestActivity.id
                }
            }
            return nil
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
    
    @available(iOS 16.2, *)
    private func scheduleActivityDismissal(activity: Activity<WidgetAttributes>, endDate: Date) {
        let timeInterval = endDate.timeIntervalSinceNow
        
        // Only schedule if the end time is in the future
        guard timeInterval > 0 else {
            logger.warning("End date is in the past, dismissing immediately")
            Task {
                await activity.end(nil, dismissalPolicy: .immediate)
            }
            return
        }
        
        logger.info("Scheduling activity dismissal in \(timeInterval) seconds")
        
        // Schedule timer to dismiss activity when countdown ends
        DispatchQueue.main.asyncAfter(deadline: .now() + timeInterval) {
            Task {
                // Mark as completed first
                let currentState = activity.content.state
                let completedState = WidgetAttributes.ContentState(
                    title: currentState.title,
                    description: currentState.description,
                    startTime: currentState.startTime,
                    endTime: currentState.endTime,
                    isCompleted: true,
                    progress: 0.0
                )
                
                // Update to completed state briefly
                await activity.update(using: completedState)
                
                // Then dismiss after a short delay
                DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
                    Task {
                        await activity.end(nil, dismissalPolicy: .default)
                        self.logger.info("Activity dismissed after countdown completion")
                    }
                }
            }
        }
    }
    
    @available(iOS 16.2, *)
    private func monitorActivityPushToken(activity: Activity<WidgetAttributes>) {
        Task {
            for await tokenData in activity.pushTokenUpdates {
                let token = tokenData.map { String(format: "%02.2hhx", $0) }.joined()
                self.logger.info("Activity push token received: \(token)")
                
                // Store the push token
                self.activityPushTokens[activity.id] = token
                
                // Send token to JavaScript
                self.sendEvent("onActivityPushToken", [
                    "activityId": activity.id,
                    "pushToken": token,
                    "eventId": activity.attributes.eventId
                ])
            }
        }
    }
    
    @available(iOS 17.2, *)
    private func monitorPushToStartToken() {
        Task {
            for await tokenData in Activity<WidgetAttributes>.pushToStartTokenUpdates {
                let token = tokenData.map { String(format: "%02.2hhx", $0) }.joined()
                self.logger.info("Push-to-start token received: \(token)")
                
                // Store the push-to-start token
                self.pushToStartToken = token
                
                // Send token to JavaScript
                self.sendEvent("onPushToStartToken", [
                    "pushToStartToken": token
                ])
            }
        }
    }
    
    private func setupPushNotificationObserver() {
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleRemoteNotification(_:)),
            name: Notification.Name("ExpoLiveActivityPushNotification"),
            object: nil
        )
        logger.info("Push notification observer setup complete")
    }
    
    @objc
    private func handleRemoteNotification(_ notification: Notification) {
        guard let userInfo = notification.userInfo else {
            logger.warning("Push notification received without userInfo")
            return
        }
        
        logger.info("Push notification received: \(userInfo)")
        
        if #available(iOS 16.2, *) {
            Task {
                // Convert [AnyHashable: Any] to [String: Any]
                let stringUserInfo = userInfo.compactMapValues { $0 }.reduce(into: [String: Any]()) { result, element in
                    if let key = element.key as? String {
                        result[key] = element.value
                    }
                }
                
                let activityId = await self.handlePushNotificationActivity(userInfo: stringUserInfo)
                self.sendEvent("onPushNotificationReceived", [
                    "userInfo": stringUserInfo,
                    "activityId": activityId ?? ""
                ])
            }
        }
    }
    
    @available(iOS 16.2, *)
    private func handlePushNotificationActivity(userInfo: [String: Any]) async -> String? {
        logger.info("Processing push notification for Live Activity")
        
        // Extract activity data from push notification
        guard let activityData = userInfo["activityData"] as? [String: Any],
              let eventId = activityData["eventId"] as? String,
              let title = activityData["title"] as? String,
              let description = activityData["description"] as? String,
              let endTimeString = activityData["endTime"] as? String,
              let deepLinkURL = activityData["deepLinkURL"] as? String else {
            
            logger.error("Invalid push notification payload for Live Activity")
            return nil
        }
        
        // Parse end time
        let dateFormatter = ISO8601DateFormatter()
        dateFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        guard let endDate = dateFormatter.date(from: endTimeString) else {
            logger.error("Failed to parse end date from push: \(endTimeString)")
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
            let activity = try Activity.request(attributes: attributes, content: activityContent)
            logger.info("Activity created from push notification with ID: \(activity.id)")
            
            // Schedule dismissal and monitor tokens
            scheduleActivityDismissal(activity: activity, endDate: endDate)
            monitorActivityPushToken(activity: activity)
            
            return activity.id
        } catch {
            logger.error("Failed to create activity from push: \(error.localizedDescription)")
            return nil
        }
    }
    
}