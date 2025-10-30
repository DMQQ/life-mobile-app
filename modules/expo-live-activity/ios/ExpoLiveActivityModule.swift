import ExpoModulesCore
import ActivityKit
import OSLog

private let logger = os.Logger(subsystem: "com.dmq.mylifemobile", category: "ExpoLiveActivity")

// --- DATA MODEL ---
// This MUST be identical to the struct in WidgetLiveActivity.swift
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


public class ExpoLiveActivityModule: Module {
    public func definition() -> ModuleDefinition {
        Name("ExpoLiveActivity")
        
        Events("onLiveActivityCancel")
        
        Function("areActivitiesEnabled") { () -> Bool in
            if #available(iOS 16.2, *) {
                return ActivityAuthorizationInfo().areActivitiesEnabled
            } else {
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
        
        Function("startActivity") { (name: String, jsonString: String, deepLinkUrl: String) -> Bool in
            guard #available(iOS 16.2, *) else {
                logger.error("❌ Live Activity not supported on this iOS version")
                return false
            }

            do {
                guard let data = jsonString.data(using: .utf8) else {
                    logger.error("❌ Invalid UTF-8 JSON string for start")
                    return false
                }
                
                let decoder = JSONDecoder()
                // Assumes you send timestamps in SECONDS from JavaScript (e.g., Date.now() / 1000)
                decoder.dateDecodingStrategy = .secondsSince1970 

                let state = try decoder.decode(WidgetAttributes.ContentState.self, from: data)
                let attributes = WidgetAttributes(name: name, deepLinkUrl: deepLinkUrl)
                let content = ActivityContent(state: state, staleDate: nil)

                let activity = try Activity.request(attributes: attributes, content: content)
                logger.log("✅ Live Activity started: \(activity.id, privacy: .public)")

                NotificationCenter.default.addObserver(self, selector: #selector(self.onLiveActivityCancel), name: Notification.Name("onLiveActivityCancel"), object: nil)
                return true
            } catch {
                logger.error("❌ Failed to start Live Activity: \(error.localizedDescription, privacy: .public)")
                return false
            }
        }
        
        Function("updateActivity") { (jsonString: String) -> Void in
            guard #available(iOS 16.2, *) else { return }
            
            do {
                guard let data = jsonString.data(using: .utf8) else {
                    logger.error("❌ Invalid UTF-8 JSON string for update")
                    return
                }

                let decoder = JSONDecoder()
                decoder.dateDecodingStrategy = .secondsSince1970 

                let contentState = try decoder.decode(WidgetAttributes.ContentState.self, from: data)
                
                Task {
                    for activity in Activity<WidgetAttributes>.activities {
                        await activity.update(using: contentState)
                        logger.log("✅ Live Activity updated")
                    }
                }
            } catch {
                logger.error("❌ Failed to update Live Activity: \(error.localizedDescription, privacy: .public)")
            }
        }
        
        Function("endActivity") { (finalStateJSON: String, dismissalTime: Double) -> Void in
            guard #available(iOS 16.2, *) else { return }
            
            // dismissalTime is expected to be in SECONDS since epoch
            let dismissalDate = Date(timeIntervalSince1970: dismissalTime)

            guard let data = finalStateJSON.data(using: .utf8) else {
                logger.error("❌ Invalid final state JSON for endActivity")
                return
            }

            do {
                let decoder = JSONDecoder()
                decoder.dateDecodingStrategy = .secondsSince1970
                let finalContentState = try decoder.decode(WidgetAttributes.ContentState.self, from: data)
                let finalContent = ActivityContent(state: finalContentState, staleDate: nil)

                Task {
                    for activity in Activity<WidgetAttributes>.activities {
                        // End the activity with the final content and schedule its removal
                        await activity.end(finalContent, dismissalPolicy: .after(dismissalDate))
                        logger.log("✅ Activity scheduled to end and dismiss at \(dismissalDate.description, privacy: .public)")
                    }
                }
                NotificationCenter.default.removeObserver(self, name: Notification.Name("onLiveActivityCancel"), object: nil)

            } catch {
                logger.error("❌ Failed to decode final state for endActivity: \(error.localizedDescription, privacy: .public)")
            }
        }
    } // End of definition()

    @objc
    func onLiveActivityCancel() {
        sendEvent("onLiveActivityCancel", [:])
    }
    
} // End of class
