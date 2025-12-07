import Foundation
import WatchConnectivity

// MARK: - WatchConnectivity Session Manager for watchOS
class WatchSessionManager: NSObject, ObservableObject {
    static let shared = WatchSessionManager()

    @Published var authToken: String = ""
    @Published var isConnected: Bool = false

    private var session: WCSession?
    private let sharedDefaults = UserDefaults(suiteName: "group.com.dmq.mylifemobile")

    private override init() {
        super.init()

        // Load auth token from shared storage on init
        if let token = sharedDefaults?.string(forKey: "auth_token") {
            authToken = token
        }
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

    func sendMessage(data: [String: Any], replyHandler: (([String: Any]) -> Void)? = nil, errorHandler: ((Error) -> Void)? = nil) {
        guard let session = session, session.isReachable else {
            errorHandler?(NSError(domain: "WatchSession", code: 1, userInfo: [NSLocalizedDescriptionKey: "Session not reachable"]))
            return
        }

        session.sendMessage(data, replyHandler: replyHandler, errorHandler: errorHandler)
    }
}

// MARK: - WCSessionDelegate
extension WatchSessionManager: WCSessionDelegate {
    func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
        DispatchQueue.main.async {
            self.isConnected = activationState == .activated
        }

        if let error = error {
            print("WCSession activation failed with error: \(error.localizedDescription)")
            return
        }

        print("WCSession activated with state: \(activationState.rawValue)")
    }

    // Receive messages from iPhone
    func session(_ session: WCSession, didReceiveMessage message: [String : Any]) {
        handleReceivedData(message)
    }

    func session(_ session: WCSession, didReceiveMessage message: [String : Any], replyHandler: @escaping ([String : Any]) -> Void) {
        handleReceivedData(message)
        replyHandler(["status": "received"])
    }

    // Receive application context updates from iPhone (for offline sync)
    func session(_ session: WCSession, didReceiveApplicationContext applicationContext: [String : Any]) {
        handleReceivedData(applicationContext)
    }

    // Handle received data from iPhone
    private func handleReceivedData(_ data: [String: Any]) {
        print("Received data from iPhone: \(data)")

        // Handle auth token
        if let token = data["auth_token"] as? String {
            DispatchQueue.main.async {
                self.authToken = token
            }

            // Persist to shared storage
            sharedDefaults?.set(token, forKey: "auth_token")
            print("Auth token updated: \(token.isEmpty ? "cleared" : "set")")
        }

        // Handle expenses data if sent
        if let expensesDataString = data["expenses_data"] as? String {
            sharedDefaults?.set(expensesDataString, forKey: "expenses_data")
            print("Expenses data updated")
        }
    }
}
