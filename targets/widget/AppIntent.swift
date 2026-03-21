import WidgetKit
import AppIntents

// MARK: - GraphQL helper

@discardableResult
private func graphQL(_ query: String, variables: [String: Any] = [:]) async -> Bool {
    guard
        let urlString = UserDefaults.shared?.string(forKey: "api_url"),
        let url = URL(string: urlString),
        let token = UserDefaults.shared?.string(forKey: "auth_token")
    else { return false }

    var body: [String: Any] = ["query": query]
    if !variables.isEmpty { body["variables"] = variables }
    guard let bodyData = try? JSONSerialization.data(withJSONObject: body) else { return false }

    var request = URLRequest(url: url, timeoutInterval: 5)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.setValue(token, forHTTPHeaderField: "authentication")
    request.httpBody = bodyData

    do {
        let (_, response) = try await URLSession.shared.data(for: request)
        return (response as? HTTPURLResponse)?.statusCode == 200
    } catch {
        return false
    }
}

struct ConfigurationAppIntent: WidgetConfigurationIntent {
    static var title: LocalizedStringResource { "Configuration" }
    static var description: IntentDescription { "This is an example widget." }

    @Parameter(title: "Favorite Emoji", default: "😃")
    var favoriteEmoji: String
}

struct SwitchAnalyticsViewIntent: AppIntent {
    static var title: LocalizedStringResource { "Switch Analytics View" }
    static var isDiscoverable: Bool { false }

    func perform() async throws -> some IntentResult {
        let current = UserDefaults.shared?.integer(forKey: "analytics_view_index") ?? 0
        UserDefaults.shared?.set((current + 1) % 3, forKey: "analytics_view_index")
        WidgetCenter.shared.reloadTimelines(ofKind: "AnalyticsWidget")
        return .result()
    }
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

struct ToggleRoutineTodoIntent: AppIntent {
    static var title: LocalizedStringResource { "Toggle Routine Todo" }
    static var isDiscoverable: Bool { false }

    @Parameter(title: "Todo ID")
    var todoId: String

    @Parameter(title: "Event ID")
    var eventId: String

    @Parameter(title: "Date")
    var date: String

    @Parameter(title: "New completed state")
    var newIsCompleted: Bool

    init() { self.todoId = ""; self.eventId = ""; self.date = ""; self.newIsCompleted = false }
    init(todoId: String, eventId: String, date: String, newIsCompleted: Bool) {
        self.todoId = todoId; self.eventId = eventId; self.date = date; self.newIsCompleted = newIsCompleted
    }

    func perform() async throws -> some IntentResult {
        // Queue for RN to process
        let item = "{\"todoId\":\"\(todoId)\",\"eventId\":\"\(eventId)\",\"date\":\"\(date)\",\"isCompleted\":\(newIsCompleted ? "true" : "false")}"
        var pending = UserDefaults.shared?.stringArray(forKey: "routine_pending_todo_completions") ?? []
        pending.append(item)
        UserDefaults.shared?.set(pending, forKey: "routine_pending_todo_completions")

        // Optimistic update: toggle the specific todo in timeline_data
        if let str = UserDefaults.shared?.string(forKey: "timeline_data"),
           let raw = str.data(using: .utf8),
           let decoded = try? JSONDecoder().decode(TimelineData.self, from: raw) {

            let nowISO = ISO8601DateFormatter().string(from: Date())
            let updated = decoded.events.map { event -> TimelineEvent in
                guard event.id == eventId else { return event }
                let updatedTodos = event.todos.map { todo -> TimelineTodo in
                    guard todo.id == todoId else { return todo }
                    return TimelineTodo(id: todo.id, title: todo.title, isCompleted: newIsCompleted,
                                       modifiedAt: newIsCompleted ? nowISO : nil)
                }
                let allTodosDone = updatedTodos.allSatisfy { $0.isCompleted }
                return TimelineEvent(
                    id: event.id, title: event.title, description: event.description,
                    date: event.date, beginTime: event.beginTime, endTime: event.endTime,
                    isCompleted: allTodosDone, isRepeat: event.isRepeat, todos: updatedTodos
                )
            }
            let completedCount = updated.filter { $0.isCompleted }.count
            let newData = TimelineData(events: updated, selectedDate: decoded.selectedDate,
                                       totalEvents: decoded.totalEvents, completedEvents: completedCount,
                                       lastUpdated: decoded.lastUpdated)
            if let encoded = try? JSONEncoder().encode(newData),
               let newStr = String(data: encoded, encoding: .utf8) {
                UserDefaults.shared?.set(newStr, forKey: "timeline_data")
            }
        }

        WidgetCenter.shared.reloadTimelines(ofKind: "DailyRoutineWidget")

        // Fire direct GraphQL mutation; fallback queue above handles retry on app foreground
        let mutation = """
        mutation CompleteTimelineTodo($id: String!, $isCompleted: Boolean!, $occurrenceDate: String) {
            completeTimelineTodo(id: $id, isCompleted: $isCompleted, occurrenceDate: $occurrenceDate) {
                id
                isCompleted
            }
        }
        """
        let vars: [String: Any] = [
            "id": todoId,
            "isCompleted": newIsCompleted,
            "occurrenceDate": date
        ]
        let succeeded = await graphQL(mutation, variables: vars)
        if succeeded {
            // Remove from pending queue since it was handled directly
            var current = UserDefaults.shared?.stringArray(forKey: "routine_pending_todo_completions") ?? []
            current.removeAll { $0 == item }
            UserDefaults.shared?.set(current, forKey: "routine_pending_todo_completions")
        }

        return .result()
    }
}

struct ToggleRoutineEventIntent: AppIntent {
    static var title: LocalizedStringResource { "Toggle Routine Event" }
    static var isDiscoverable: Bool { false }

    @Parameter(title: "Event ID")
    var eventId: String

    init() { self.eventId = "" }
    init(eventId: String) { self.eventId = eventId }

    func perform() async throws -> some IntentResult {
        // Queue for the React Native app to process the actual GraphQL mutation
        var pending = UserDefaults.shared?.stringArray(forKey: "routine_pending_completions") ?? []
        pending.append(eventId)
        UserDefaults.shared?.set(pending, forKey: "routine_pending_completions")

        // Optimistic update in timeline_data so the checkbox flips immediately
        if let str = UserDefaults.shared?.string(forKey: "timeline_data"),
           let raw = str.data(using: .utf8),
           let decoded = try? JSONDecoder().decode(TimelineData.self, from: raw) {

            let updated = decoded.events.map { event -> TimelineEvent in
                guard event.id == eventId else { return event }
                return TimelineEvent(
                    id: event.id,
                    title: event.title,
                    description: event.description,
                    date: event.date,
                    beginTime: event.beginTime,
                    endTime: event.endTime,
                    isCompleted: !event.isCompleted,
                    isRepeat: event.isRepeat,
                    todos: event.todos
                )
            }
            let completedCount = updated.filter { $0.isCompleted }.count
            let newData = TimelineData(
                events: updated,
                selectedDate: decoded.selectedDate,
                totalEvents: decoded.totalEvents,
                completedEvents: completedCount,
                lastUpdated: decoded.lastUpdated
            )
            if let encoded = try? JSONEncoder().encode(newData),
               let newStr = String(data: encoded, encoding: .utf8) {
                UserDefaults.shared?.set(newStr, forKey: "timeline_data")
            }
        }

        WidgetCenter.shared.reloadTimelines(ofKind: "DailyRoutineWidget")

        // Fire direct GraphQL mutation; fallback queue above handles retry on app foreground
        let mutation = """
        mutation ToggleTimelineCompletion($id: String!) {
            toggleTimelineCompletion(id: $id) {
                id
                isCompleted
            }
        }
        """
        let succeeded = await graphQL(mutation, variables: ["id": eventId])
        if succeeded {
            var current = UserDefaults.shared?.stringArray(forKey: "routine_pending_completions") ?? []
            current.removeAll { $0 == eventId }
            UserDefaults.shared?.set(current, forKey: "routine_pending_completions")
        }

        return .result()
    }
}
