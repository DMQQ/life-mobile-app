import ExpoModulesCore
import WatchConnectivity

public class ExpoAppleWatchModule: Module {
  private var sessionManager: WatchSessionManager?

  public func definition() -> ModuleDefinition {
    Name("ExpoAppleWatch")

    // Lifecycle events
    OnCreate {
      // Initialize WatchConnectivity session when module is created
      self.sessionManager = WatchSessionManager.shared
      self.sessionManager?.startSession()
    }

    // Defines event names that the module can send to JavaScript.
    Events("onWatchStateChanged", "onWatchMessageReceived")

    // Send authentication token to Apple Watch
    AsyncFunction("sendAuthToken") { (token: String, promise: Promise) in
      guard let session = self.sessionManager?.session else {
        promise.reject("SESSION_ERROR", "WatchConnectivity session not available")
        return
      }

      guard session.isReachable else {
        // If watch is not reachable, update application context (will sync when available)
        do {
          try session.updateApplicationContext(["auth_token": token])
          promise.resolve(true)
        } catch {
          promise.reject("UPDATE_ERROR", "Failed to update application context: \(error.localizedDescription)")
        }
        return
      }

      // Send message with reply handler
      session.sendMessage(["auth_token": token], replyHandler: { reply in
        promise.resolve(true)
      }, errorHandler: { error in
        promise.reject("SEND_ERROR", "Failed to send auth token: \(error.localizedDescription)")
      })
    }

    // Check if Apple Watch is paired and WatchConnectivity is supported
    Function("isWatchAvailable") {
      return WCSession.isSupported() && WCSession.default.isPaired && WCSession.default.isWatchAppInstalled
    }

    // Check if watch is currently reachable
    Function("isWatchReachable") {
      guard WCSession.isSupported() else { return false }
      return WCSession.default.isReachable
    }

    // Send any data to Apple Watch
    AsyncFunction("sendDataToWatch") { (data: [String: Any], promise: Promise) in
      guard let session = self.sessionManager?.session else {
        promise.reject("SESSION_ERROR", "WatchConnectivity session not available")
        return
      }

      guard session.isReachable else {
        // Update application context for offline sync
        do {
          try session.updateApplicationContext(data)
          promise.resolve(["success": true, "method": "context"])
        } catch {
          promise.reject("UPDATE_ERROR", "Failed to update application context: \(error.localizedDescription)")
        }
        return
      }

      session.sendMessage(data, replyHandler: { reply in
        promise.resolve(["success": true, "method": "message", "reply": reply])
      }, errorHandler: { error in
        promise.reject("SEND_ERROR", "Failed to send data: \(error.localizedDescription)")
      })
    }
  }
}

// MARK: - WatchConnectivity Session Manager
class WatchSessionManager: NSObject, WCSessionDelegate {
  static let shared = WatchSessionManager()
  var session: WCSession?

  private override init() {
    super.init()
  }

  func startSession() {
    guard WCSession.isSupported() else {
      print("WatchConnectivity is not supported on this device")
      return
    }

    session = WCSession.default
    session?.delegate = self
    session?.activate()
  }

  // MARK: - WCSessionDelegate Methods

  func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
    if let error = error {
      print("WCSession activation failed with error: \(error.localizedDescription)")
      return
    }

    print("WCSession activated with state: \(activationState.rawValue)")
  }

  func sessionDidBecomeInactive(_ session: WCSession) {
    print("WCSession did become inactive")
  }

  func sessionDidDeactivate(_ session: WCSession) {
    print("WCSession did deactivate")
    // Reactivate the session for iOS
    session.activate()
  }

  func session(_ session: WCSession, didReceiveMessage message: [String : Any]) {
    print("Received message from watch: \(message)")
    // Handle messages from watch if needed
  }

  func session(_ session: WCSession, didReceiveMessage message: [String : Any], replyHandler: @escaping ([String : Any]) -> Void) {
    print("Received message from watch with reply handler: \(message)")
    // Send acknowledgment
    replyHandler(["status": "received"])
  }
}
