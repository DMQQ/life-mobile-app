import AppIntents
import Foundation
import SwiftUI

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
    }
    
    struct GraphQLErrorDetail: Codable {
        let message: String
    }
    
    struct GraphQLExpenseResponse: Codable {
        let id: String
        let amount: Double
        let description: String
        let date: String
        let type: String
        let category: String
        let balanceBeforeInteraction: Double?
        let schedule: Bool
    }
    
    struct GraphQLDataResponse: Codable {
        let createShortcutExpense: GraphQLExpenseResponse
    }
    
    struct GraphQLRootResponse: Codable {
        let data: GraphQLDataResponse?
        let errors: [GraphQLErrorDetail]?
    }
    
    enum ExpenseError: Error {
        case apiError(String)
        case missingAuthToken
        case invalidURL
    }
    
    struct ExpenseConfirmationView: View {
        var expense: GraphQLExpenseResponse
        
        private func formatDate(_ isoDate: String) -> String {
            let isoFormatter = ISO8601DateFormatter()
            isoFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
            if let date = isoFormatter.date(from: isoDate) {
                let displayFormatter = DateFormatter()
                displayFormatter.dateStyle = .medium
                displayFormatter.timeStyle = .none
                return displayFormatter.string(from: date)
            }
            
            isoFormatter.formatOptions = [.withInternetDateTime]
            if let date = isoFormatter.date(from: isoDate) {
                let displayFormatter = DateFormatter()
                displayFormatter.dateStyle = .medium
                displayFormatter.timeStyle = .none
                return displayFormatter.string(from: date)
            }
            
            return "Just now"
        }
        
        struct InfoRow: View {
            let iconName: String
            let label: String
            let value: String
            let iconColor: Color
            
            var body: some View {
                HStack(spacing: 12) {
                    ZStack {
                        RoundedRectangle(cornerRadius: 6)
                            .fill(iconColor)
                            .frame(width: 42, height: 42)
                        Image(systemName: iconName)
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .frame(width: 22, height: 22)
                            .foregroundStyle(.white)
                    }
                    
                    Text(label)
                        .font(.subheadline)
                        .fontWeight(.bold)
                        .foregroundStyle(.white)
                    Spacer()
                    Text(value)
                        .font(.subheadline)
                        .fontWeight(.semibold)
                        .foregroundStyle(Color.blue)
                }
                .frame(maxWidth: .infinity)
            }
        }
        
        var lightDivider: some View {
            Rectangle()
                .frame(height: 1)
                .foregroundStyle(Color.white.opacity(0.15))
        }
        
        var body: some View {
            VStack(spacing: 12) {
                Text(String(format: "-%.2f zł", expense.amount))
                    .font(.system(size: 60, weight: .bold))
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity, alignment: .center)
                
                lightDivider
                
                VStack(spacing: 14) {
                    
                    InfoRow(
                        iconName: "storefront",
                        label: "Name",
                        value: expense.description,
                        iconColor: .blue
                    )
                    
                    lightDivider
                    
                    InfoRow(
                        iconName: "calendar",
                        label: "Date",
                        value: formatDate(expense.date),
                        iconColor: .orange
                    )
                    
                    lightDivider
                    
                    InfoRow(
                        iconName: "tag",
                        label: "Category",
                        value: expense.category,
                        iconColor: .purple
                    )
                }
                .padding(.horizontal, 8)
            }
            .padding(20)
        }
    }


    func perform() async throws -> some IntentResult & ProvidesDialog & ShowsSnippetView {
        
        guard let url = URL(string: "https://life.dmqq.dev/graphql") else {
            throw ExpenseError.invalidURL
        }
        
        guard let sharedDefaults = UserDefaults(suiteName: "group.com.dmq.mylifemobile") else {
            throw ExpenseError.missingAuthToken
        }
        
        guard let token = sharedDefaults.string(forKey: "auth_token") else {
            throw ExpenseError.missingAuthToken
        }


        let mutation = """
        mutation CreateExpense(
            $amount: Float!,
            $description: String!,
        ) {
            createShortcutExpense(
                amount: $amount,
                description: $description,
            ) {
                id
                amount
                description
                date
                type
                category
                balanceBeforeInteraction
                schedule
            }
        }
        """
        
        let variables = GraphQLVariables(
            amount: self.amount,
            description: self.name
        )
        
        let graphQLRequest = GraphQLRequest(query: mutation, variables: variables)
        let jsonData = try JSONEncoder().encode(graphQLRequest)
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(token, forHTTPHeaderField: "authentication")
        request.httpBody = jsonData
        
        do {
            let (data, response) = try await URLSession.shared.data(for: request) // ✅ FIX: Was URLStream
            
            guard let httpResponse = response as? HTTPURLResponse, (200...299).contains(httpResponse.statusCode) else {
                let responseBody = String(data: data, encoding: .utf8) ?? "No response body"
                let statusCode = (response as? HTTPURLResponse)?.statusCode ?? 500
                throw ExpenseError.apiError("Server returned status \(statusCode). Body: \(responseBody)")
            }
            
            let decoder = JSONDecoder()
            let rootResponse = try decoder.decode(GraphQLRootResponse.self, from: data)

            if let graphQLErrors = rootResponse.errors, !graphQLErrors.isEmpty {
                let errorMessage = graphQLErrors.map { $0.message }.joined(separator: ", ")
                throw ExpenseError.apiError(errorMessage)
            }
            
            guard let expense = rootResponse.data?.createShortcutExpense else {
                throw ExpenseError.apiError("Successfully called API but no expense data was returned.")
            }

            let dialog = IntentDialog(
                "Created new transaction"
            )
            
            return .result(dialog: dialog) {
                ExpenseConfirmationView(expense: expense)
            }
            
        } catch {
            throw error
        }
    }
}

