import AppIntents
import CoreLocation
import Foundation
import SwiftUI

@main
struct EntryExtension: AppIntentsExtension {
}

// ─── Location helper ──────────────────────────────────────────────────────────
// Bridges CLLocationManager's delegate callbacks into async/await.
// The extension inherits location authorization from the host app.

@MainActor
private final class LocationFetcher: NSObject, @preconcurrency CLLocationManagerDelegate {
    private let manager = CLLocationManager()
    private var continuation: CheckedContinuation<CLLocationCoordinate2D?, Never>?

    func fetch() async -> CLLocationCoordinate2D? {
        let status = manager.authorizationStatus
        guard status != .denied && status != .restricted && status != .notDetermined else {
            return nil
        }
        return await withCheckedContinuation { cont in
            self.continuation = cont
            manager.delegate = self
            manager.desiredAccuracy = kCLLocationAccuracyHundredMeters
            manager.requestLocation()
        }
    }

    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        continuation?.resume(returning: locations.first?.coordinate)
        continuation = nil
    }

    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        continuation?.resume(returning: nil)
        continuation = nil
    }
}

/// Races a location fetch against a timeout. Returns nil gracefully on failure.
private func fetchCoordinate(timeoutSeconds: Double = 4) async -> CLLocationCoordinate2D? {
    return await withTaskGroup(of: CLLocationCoordinate2D?.self) { group in
        group.addTask { await LocationFetcher().fetch() }
        group.addTask {
            try? await Task.sleep(nanoseconds: UInt64(timeoutSeconds * 1_000_000_000))
            return nil
        }
        let result = await group.next()
        group.cancelAll()
        return result ?? nil
    }
}

// ─── Intent ───────────────────────────────────────────────────────────────────

struct LogExpense: AppIntent {

    static var title: LocalizedStringResource = "Log Expense"
    static var description = IntentDescription("Saves an expense to your app. Can be used in automations.")

    @Parameter(title: "Amount")
    var amount: Double

    @Parameter(title: "Name / Merchant")
    var name: String

    @Parameter(title: "Category", default: "Other")
    var category: String

    // ─── GraphQL types ────────────────────────────────────────────────────────

    struct GraphQLRequest<T: Codable>: Codable {
        let query: String
        let variables: T
    }

    struct GraphQLVariables: Codable {
        let amount: Double
        let description: String
        let latitude: Double?
        let longitude: Double?
    }

    struct GraphQLErrorDetail: Codable {
        let message: String
    }

    struct GraphQLLocationResponse: Codable {
        let id: String
        let name: String
        let latitude: Double?
        let longitude: Double?
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
        let location: GraphQLLocationResponse?
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

    // ─── Confirmation view ────────────────────────────────────────────────────

    struct ExpenseConfirmationView: View {
        var expense: GraphQLExpenseResponse

        private func formatDate(_ isoDate: String) -> String {
            let isoFormatter = ISO8601DateFormatter()
            isoFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
            if let date = isoFormatter.date(from: isoDate) {
                let f = DateFormatter()
                f.dateStyle = .medium
                f.timeStyle = .none
                return f.string(from: date)
            }
            isoFormatter.formatOptions = [.withInternetDateTime]
            if let date = isoFormatter.date(from: isoDate) {
                let f = DateFormatter()
                f.dateStyle = .medium
                f.timeStyle = .none
                return f.string(from: date)
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

                    if let loc = expense.location,
                       let lat = loc.latitude,
                       let lon = loc.longitude {
                        lightDivider
                        InfoRow(
                            iconName: "mappin.circle.fill",
                            label: "Location",
                            value: String(format: "%.4f, %.4f", lat, lon),
                            iconColor: .green
                        )
                    }
                }
                .padding(.horizontal, 8)
            }
            .padding(20)
        }
    }

    // ─── Perform ──────────────────────────────────────────────────────────────

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

        // Fetch GPS coordinates concurrently while we build the request.
        // If location is unavailable (permission denied, timeout, indoors) we
        // proceed without it — the expense is still saved normally.
        let coordinate = await fetchCoordinate()

        let mutation = """
        mutation CreateExpense(
            $amount: Float!,
            $description: String!,
            $latitude: Float,
            $longitude: Float,
        ) {
            createShortcutExpense(
                amount: $amount,
                description: $description,
                latitude: $latitude,
                longitude: $longitude,
            ) {
                id
                amount
                description
                date
                type
                category
                balanceBeforeInteraction
                schedule
                location {
                    id
                    name
                    latitude
                    longitude
                }
            }
        }
        """

        let variables = GraphQLVariables(
            amount: self.amount,
            description: self.name,
            latitude: coordinate?.latitude,
            longitude: coordinate?.longitude
        )

        let graphQLRequest = GraphQLRequest(query: mutation, variables: variables)
        let jsonData = try JSONEncoder().encode(graphQLRequest)

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(token, forHTTPHeaderField: "authentication")
        request.httpBody = jsonData

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            let body = String(data: data, encoding: .utf8) ?? "No response body"
            let code = (response as? HTTPURLResponse)?.statusCode ?? 500
            throw ExpenseError.apiError("Server returned \(code). Body: \(body)")
        }

        let rootResponse = try JSONDecoder().decode(GraphQLRootResponse.self, from: data)

        if let errors = rootResponse.errors, !errors.isEmpty {
            throw ExpenseError.apiError(errors.map { $0.message }.joined(separator: ", "))
        }

        guard let expense = rootResponse.data?.createShortcutExpense else {
            throw ExpenseError.apiError("No expense data returned.")
        }

        return .result(dialog: IntentDialog("Created new transaction")) {
            ExpenseConfirmationView(expense: expense)
        }
    }
}
