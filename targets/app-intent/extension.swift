import AppIntents
import Foundation

@main
struct EntryExtension: AppIntentsExtension {
}


struct LogExpense: AppIntent {

    static var title: LocalizedStringResource = "Log Expense"

    static var description = IntentDescription("Saves an expense to your app. Can be used in automations.")

    @Parameter(title: "Amount")
    var amount: Double

    @Parameter(title: "Name / Merchant")
    var name: String

    @Parameter(title: "Category", default: "Other")
    var category: String

    
    struct GraphQLRequest<T: Codable>: Codable {
        let query: String
        let variables: T
    }

    struct GraphQLVariables: Codable {
        let amount: Double
        let description: String
        let type: String
        let category: String
        let date: String
        let schedule: Bool
        let isSubscription: Bool
        let spontaneousRate: Float 
    }
    
    enum ExpenseError: Error {
        case apiError(String)
        case missingAuthToken
        case invalidURL
    }

    func perform() async throws -> some IntentResult {
        guard let url = URL(string: "https://life.dmqq.dev/graphql") else {

            throw ExpenseError.invalidURL
        }
        
        guard let sharedDefaults = UserDefaults(suiteName: "group.com.dmq.mylifemobile") else {
            throw ExpenseError.missingAuthToken
        }
        
        guard let token = sharedDefaults.string(forKey: "auth_token") else {
            throw ExpenseError.missingAuthToken
        }
        
        
        let isoFormatter = ISO8601DateFormatter()
        let dateString = isoFormatter.string(from: Date())

        let mutation = """
        mutation CreateExpense(
            $amount: Float!,
            $description: String!,
            $type: String!,
            $category: String!,
            $date: String!,
            $schedule: Boolean!,
            $isSubscription: Boolean!,
            $spontaneousRate: Float!
        ) {
            createExpense(
                amount: $amount,
                description: $description,
                type: $type,
                category: $category,
                date: $date,
                schedule: $schedule,
                isSubscription: $isSubscription,
                spontaneousRate: $spontaneousRate
            ) {
                id # Request some field back, e.g., id, to confirm success
            }
        }
        """
        
        let variables = GraphQLVariables(
            amount: self.amount,
            description: self.name, 
            type: "expense",
            category: self.category,
            date: dateString,
            schedule: false,
            isSubscription: false,
            spontaneousRate: 0
        )
        

        let graphQLRequest = GraphQLRequest(query: mutation, variables: variables)
        let jsonData = try JSONEncoder().encode(graphQLRequest)
        

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(token, forHTTPHeaderField: "authentication")
        request.httpBody = jsonData
        

        do {
            let (data, response) = try await URLSession.shared.data(for: request)
            
            if let httpResponse = response as? HTTPURLResponse, !(200...299).contains(httpResponse.statusCode) {

                let responseBody = String(data: data, encoding: .utf8) ?? "No response body" 

                throw ExpenseError.apiError("Server returned status \(httpResponse.statusCode)")
            }


            let responseBody = String(data: data, encoding: .utf8) ?? "" 

            return .result()
            
        } catch {
            throw error 
        }
    }
}

