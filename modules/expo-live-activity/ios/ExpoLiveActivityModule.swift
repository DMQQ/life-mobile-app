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

public class ExpoLiveActivityModule: Module {
    private let logger = Logger(subsystem: "com.dmq.mylifemobile", category: "LiveActivity")
    
    private var pushNotificationsEnabled: Bool = true
    
    public func definition() -> ModuleDefinition {
        Name("ExpoLiveActivity")
        
        Events("onStateChange", "onActivityPushToken", "onPushToStartToken", "onTokenReceived", "onActivityStartedRemotely")
        
        OnCreate {
            if pushNotificationsEnabled {
                observePushToStartToken()
            }
            observeLiveActivityUpdates()
            
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
        
        AsyncFunction("getActivityTokens") { () async -> [String: Any] in
            if #available(iOS 16.2, *) {
                var result: [String: Any] = [:]
                let activities = Activity<WidgetAttributes>.activities
                
                for activity in activities {
                    self.logger.info("🔍 Activity \(activity.id) - eventId: \(activity.attributes.eventId)")

                    var activityInfo: [String: Any] = [
                        "eventId": activity.attributes.eventId,
                        "state": String(describing: activity.activityState),
                        "other": activity
                    ]
                    
                    if let pushToken = activity.pushToken {
                        let pushTokenString = pushToken.reduce("") { $0 + String(format: "%02x", $1) }
                        activityInfo["pushToken"] = pushTokenString

                    } 
                    
                    result[activity.id] = activityInfo
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
        
        AsyncFunction("startCountdownActivity") { (eventId: String, deepLinkURL: String, title: String, description: String, endTime: String, startTime: String, todos: [[String: Any]], isCompleted: Bool) -> String? in
            if #available(iOS 16.2, *) {                
                let dateFormatter = DateFormatter()
                dateFormatter.dateFormat = "HH:mm:ss"
                dateFormatter.timeZone = TimeZone.current
                
                let calendar = Calendar.current
                let now = Date()
                
                guard let time = dateFormatter.date(from: endTime) else {
                    self.logger.error("Failed to parse end time: \(endTime)")
                    return nil
                }
                
                let timeComponents = calendar.dateComponents([.hour, .minute, .second], from: time)
                guard let dateWithTime = calendar.date(bySettingHour: timeComponents.hour ?? 0,
                                                    minute: timeComponents.minute ?? 0,
                                                    second: timeComponents.second ?? 0,
                                                    of: now) else {
                    self.logger.error("Failed to create date with time")
                    return nil
                }
                
                guard let startTimeDate = dateFormatter.date(from: startTime) else {
                    self.logger.error("Failed to parse start time: \(startTime)")
                    return nil
                }
                
                let startTimeComponents = calendar.dateComponents([.hour, .minute, .second], from: startTimeDate)
                guard let dateWithStartTime = calendar.date(bySettingHour: startTimeComponents.hour ?? 0,
                                                           minute: startTimeComponents.minute ?? 0,
                                                           second: startTimeComponents.second ?? 0,
                                                           of: now) else {
                    self.logger.error("Failed to create date with start time")
                    return nil
                }
                
                let baseDate: Date
                if dateWithTime < now {
                    baseDate = calendar.date(byAdding: .day, value: 1, to: now)!
                } else {
                    baseDate = now
                }
                

                guard let startDate = calendar.date(bySettingHour: startTimeComponents.hour ?? 0,
                                                   minute: startTimeComponents.minute ?? 0,
                                                   second: startTimeComponents.second ?? 0,
                                                   of: baseDate) else {
                    self.logger.error("Failed to create start date")
                    return nil
                }
                
                guard let endDate = calendar.date(bySettingHour: timeComponents.hour ?? 0,
                                                 minute: timeComponents.minute ?? 0,
                                                 second: timeComponents.second ?? 0,
                                                 of: baseDate) else {
                    self.logger.error("Failed to create end date")
                    return nil
                }
                let totalDuration = endDate.timeIntervalSince(startDate)
                let progress = totalDuration > 0 ? 1.0 : 0.0
                
                let attributes = WidgetAttributes(eventId: eventId, deepLinkURL: deepLinkURL)
                let todoObjects = todos.compactMap { todoDict -> WidgetTodo? in
                    guard let id = todoDict["id"] as? String,
                          let title = todoDict["title"] as? String,
                          let isCompleted = todoDict["isCompleted"] as? Bool else {
                        return nil
                    }
                    return WidgetTodo(id: id, title: title, isCompleted: isCompleted)
                }
                
                let contentState = WidgetAttributes.ContentState(
                    title: title,
                    description: description,
                    startTime: startDate,
                    endTime: endDate,
                    isCompleted: isCompleted,
                    progress: progress,
                    todos: todoObjects
                )
                
                let activityContent = ActivityContent(state: contentState, staleDate: endDate)
                
                do {
                    let activity = try Activity.request(
                        attributes: attributes, 
                        content: activityContent, 
                        pushType: pushNotificationsEnabled ? .token : nil
                    )
                    self.logger.info("Activity created successfully with ID: \(activity.id)")
                    
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
        
        Function("saveAppIconToSharedStorage") { () -> Bool in
            return self.saveAppIconToSharedStorage()
        }
        
        Function("saveImageToSharedStorage") { (imageUri: String) -> Bool in
            return self.saveImageToSharedStorage(imageUri: imageUri)
        }
        
        AsyncFunction("resolveAndSaveImage") { (imageString: String) -> String? in
            return await self.resolveAndSaveImage(from: imageString)
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
                    self.logger.info("✅ Activity is active: \(activity.id) (eventId: \(activity.attributes.eventId))")
                    
                    // Log if this might be a remote activity (useful for debugging)
                    let currentAppActivities = Activity<WidgetAttributes>.activities.count
                    self.logger.info("📊 Current active activities count: \(currentAppActivities)")
                    
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
                                
                                // Send both events for compatibility
                                sendEvent("onActivityPushToken", [
                                    "activityID": activity.id,
                                    "activityPushToken": pushTokenString,
                                    "eventId": activity.attributes.eventId
                                ])
                                
                                // 🎯 NEW: Send onTokenReceived event (this will trigger server call)
                                sendEvent("onTokenReceived", [
                                    "activityID": activity.id,
                                    "activityName": activity.attributes.eventId,
                                    "activityPushToken": pushTokenString
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
                
                // Send token to JavaScript (legacy event)
                self.sendEvent("onActivityPushToken", [
                    "activityID": activity.id,
                    "activityPushToken": pushTokenString,
                    "eventId": activity.attributes.eventId
                ])
                
                // 🎯 NEW: Send onTokenReceived event (this will trigger server call)
                self.sendEvent("onTokenReceived", [
                    "activityID": activity.id,
                    "activityName": activity.attributes.eventId,
                    "activityPushToken": pushTokenString
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
    
    private func saveAppIconToSharedStorage() -> Bool {
        guard let containerURL = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: "group.com.dmq.mylifemobile") else {
            self.logger.error("Failed to get shared container URL")
            return false
        }
        
        // Get the app icon from the bundle
        guard let appIcon = getAppIconFromBundle() else {
            self.logger.error("Failed to get app icon from bundle")
            return false
        }
        
        // Save to shared container as PNG to preserve transparency
        let iconURL = containerURL.appendingPathComponent("AppIcon.png")
        
        // Force create a new image with transparency preserved
        let size = appIcon.size
        let rect = CGRect(origin: .zero, size: size)
        
        // Create a graphics context with explicit alpha channel
        guard let colorSpace = CGColorSpace(name: CGColorSpace.sRGB) else {
            self.logger.error("Failed to create color space")
            return false
        }
        
        guard let context = CGContext(
            data: nil,
            width: Int(size.width),
            height: Int(size.height),
            bitsPerComponent: 8,
            bytesPerRow: 0,
            space: colorSpace,
            bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
        ) else {
            self.logger.error("Failed to create graphics context")
            return false
        }
        
        // Clear the context (transparent background)
        context.clear(rect)
        
        // Draw the original image
        if let cgImage = appIcon.cgImage {
            context.draw(cgImage, in: rect)
        }
        
        // Create new image from context
        guard let newCGImage = context.makeImage() else {
            self.logger.error("Failed to create CGImage from context")
            return false
        }
        
        let transparentImage = UIImage(cgImage: newCGImage)
        self.logger.info("Created transparent app icon with alpha info: \(transparentImage.cgImage?.alphaInfo.rawValue ?? 0)")
        
        guard let pngData = transparentImage.pngData() else {
            self.logger.error("Failed to convert transparent app icon to PNG data")
            return false
        }
        
        do {
            try pngData.write(to: iconURL)
            self.logger.info("Successfully saved app icon to shared storage")
            return true
        } catch {
            self.logger.error("Failed to write app icon to shared storage: \(error.localizedDescription)")
            return false
        }
    }
    
    private func getAppIconFromBundle() -> UIImage? {
        // First try to get from the main bundle
        if let appIcon = UIImage(named: "AppIcon") {
            return appIcon
        }
        
        // Fallback: try to get from info.plist
        guard let iconsDictionary = Bundle.main.infoDictionary?["CFBundleIcons"] as? [String: Any],
              let primaryIconsDictionary = iconsDictionary["CFBundlePrimaryIcon"] as? [String: Any],
              let iconFiles = primaryIconsDictionary["CFBundleIconFiles"] as? [String] else {
            return nil
        }
        
        // Try each icon file until we find one that works
        for iconName in iconFiles.reversed() { // Start with the largest icon
            if let icon = UIImage(named: iconName) {
                return icon
            }
        }
        
        return nil
    }
    
    private func saveImageToSharedStorage(imageUri: String) -> Bool {
        guard let containerURL = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: "group.com.dmq.mylifemobile") else {
            self.logger.error("Failed to get shared container URL")
            return false
        }
        
        // Handle different URI formats (file://, http://, data:, or local path)
        var image: UIImage?
        
        if imageUri.hasPrefix("data:image") {
            // Handle base64 data URI
            if let dataString = imageUri.components(separatedBy: ",").last,
               let imageData = Data(base64Encoded: dataString) {
                image = UIImage(data: imageData)
            }
        } else if imageUri.hasPrefix("file://") {
            // Handle file:// URI
            let filePath = String(imageUri.dropFirst(7)) // Remove "file://"
            let fileURL = URL(fileURLWithPath: filePath)
            if let imageData = try? Data(contentsOf: fileURL) {
                image = UIImage(data: imageData)
            }
        } else if imageUri.hasPrefix("http://") || imageUri.hasPrefix("https://") {
            // Handle remote URL (synchronous for simplicity, could be async)
            if let url = URL(string: imageUri),
               let imageData = try? Data(contentsOf: url) {
                image = UIImage(data: imageData)
            }
        } else {
            // Handle local file path or asset name
            if FileManager.default.fileExists(atPath: imageUri) {
                if let imageData = try? Data(contentsOf: URL(fileURLWithPath: imageUri)) {
                    image = UIImage(data: imageData)
                }
            } else {
                // Try as asset name
                image = UIImage(named: imageUri)
            }
        }
        
        guard let finalImage = image else {
            self.logger.error("Failed to load image from URI: \(imageUri)")
            return false
        }
        
        // Save to shared container as PNG to preserve transparency
        let iconURL = containerURL.appendingPathComponent("AppIcon.png")
        
        // Force create a new image with transparency preserved
        let size = finalImage.size
        let rect = CGRect(origin: .zero, size: size)
        
        // Create a graphics context with explicit alpha channel
        guard let colorSpace = CGColorSpace(name: CGColorSpace.sRGB) else {
            self.logger.error("Failed to create color space")
            return false
        }
        
        guard let context = CGContext(
            data: nil,
            width: Int(size.width),
            height: Int(size.height),
            bitsPerComponent: 8,
            bytesPerRow: 0,
            space: colorSpace,
            bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
        ) else {
            self.logger.error("Failed to create graphics context")
            return false
        }
        
        // Clear the context (transparent background)
        context.clear(rect)
        
        // Draw the original image
        if let cgImage = finalImage.cgImage {
            context.draw(cgImage, in: rect)
        }
        
        // Create new image from context
        guard let newCGImage = context.makeImage() else {
            self.logger.error("Failed to create CGImage from context")
            return false
        }
        
        let transparentImage = UIImage(cgImage: newCGImage)
        self.logger.info("Created transparent image with alpha info: \(transparentImage.cgImage?.alphaInfo.rawValue ?? 0)")
        
        guard let pngData = transparentImage.pngData() else {
            self.logger.error("Failed to convert transparent image to PNG data")
            return false
        }
        
        do {
            try pngData.write(to: iconURL)
            self.logger.info("Successfully saved image to shared storage from URI: \(imageUri)")
            return true
        } catch {
            self.logger.error("Failed to write image to shared storage: \(error.localizedDescription)")
            return false
        }
    }
    
    private func resolveAndSaveImage(from imageString: String) async -> String? {
        guard let containerURL = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: "group.com.dmq.mylifemobile") else {
            self.logger.error("Failed to get shared container URL")
            return nil
        }
        
        var imageData: Data?
        
        // Handle remote URLs
        if let url = URL(string: imageString), url.scheme?.hasPrefix("http") == true {
            do {
                self.logger.info("Downloading image from URL: \(imageString)")
                let (data, _) = try await URLSession.shared.data(from: url)
                imageData = data
                self.logger.info("Successfully downloaded image data, size: \(data.count) bytes")
            } catch {
                self.logger.error("Failed to download image from URL: \(error.localizedDescription)")
                return nil
            }
        }
        // Handle data URIs
        else if imageString.hasPrefix("data:image") {
            if let dataString = imageString.components(separatedBy: ",").last,
               let data = Data(base64Encoded: dataString) {
                imageData = data
                self.logger.info("Decoded base64 image data, size: \(data.count) bytes")
            }
        }
        // Handle file paths
        else if imageString.hasPrefix("file://") {
            let filePath = String(imageString.dropFirst(7))
            let fileURL = URL(fileURLWithPath: filePath)
            imageData = try? Data(contentsOf: fileURL)
        }
        // Handle local paths
        else if FileManager.default.fileExists(atPath: imageString) {
            imageData = try? Data(contentsOf: URL(fileURLWithPath: imageString))
        }
        
        guard let data = imageData else {
            self.logger.error("Failed to get image data from: \(imageString)")
            return nil
        }
        
        guard let originalImage = UIImage(data: data) else {
            self.logger.error("Failed to create UIImage from data")
            return nil
        }
        
        // Force create a new image with transparency preserved
        let size = originalImage.size
        let rect = CGRect(origin: .zero, size: size)
        
        // Create a graphics context with explicit alpha channel
        guard let colorSpace = CGColorSpace(name: CGColorSpace.sRGB) else {
            self.logger.error("Failed to create color space")
            return nil
        }
        
        guard let context = CGContext(
            data: nil,
            width: Int(size.width),
            height: Int(size.height),
            bitsPerComponent: 8,
            bytesPerRow: 0,
            space: colorSpace,
            bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
        ) else {
            self.logger.error("Failed to create graphics context")
            return nil
        }
        
        // Clear the context (transparent background)
        context.clear(rect)
        
        // Draw the original image
        if let cgImage = originalImage.cgImage {
            context.draw(cgImage, in: rect)
        }
        
        // Create new image from context
        guard let newCGImage = context.makeImage() else {
            self.logger.error("Failed to create CGImage from context")
            return nil
        }
        
        let transparentImage = UIImage(cgImage: newCGImage)
        self.logger.info("Created transparent image with alpha info: \(transparentImage.cgImage?.alphaInfo.rawValue ?? 0)")
        
        // Save with unique filename
        let filename = "AppIcon.png"
        let fileURL = containerURL.appendingPathComponent(filename)
        
        guard let pngData = transparentImage.pngData() else {
            self.logger.error("Failed to convert transparent image to PNG data")
            return nil
        }
        
        do {
            try pngData.write(to: fileURL)
            self.logger.info("Successfully saved image to shared storage: \(filename)")
            return filename
        } catch {
            self.logger.error("Failed to write image to shared storage: \(error.localizedDescription)")
            return nil
        }
    }
}
