import SwiftUI

@main
struct watchEntry: App {
    @StateObject private var sessionManager = WatchSessionManager.shared

    init() {
        // Initialize WatchConnectivity session
        WatchSessionManager.shared.startSession()
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(sessionManager)
        }
    }
}
