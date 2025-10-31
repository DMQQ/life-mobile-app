import WidgetKit
import AppIntents

struct ConfigurationAppIntent: WidgetConfigurationIntent {
    static var title: LocalizedStringResource { "Configuration" }
    static var description: IntentDescription { "This is an example widget." }

    // An example configurable parameter.
    @Parameter(title: "Favorite Emoji", default: "😃")
    var favoriteEmoji: String
}

struct CompleteActivityIntent: AppIntent {
    static var title: LocalizedStringResource { "Complete Activity" }
    static var description: IntentDescription { "Mark the activity as completed" }
    
    @Parameter(title: "Event ID")
    var eventId: String
    
    init() {
        self.eventId = ""
    }
    
    init(eventId: String) {
        self.eventId = eventId
    }
    
    func perform() async throws -> some IntentResult {
        // This will be handled by the React Native app when the user taps the button
        // The deep link will open the app with the completion action
        return .result()
    }
}
