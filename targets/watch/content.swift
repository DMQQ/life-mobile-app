import SwiftUI
import Charts

// MARK: - Models
struct ExpenseCategory: Identifiable, Codable {
    let category: String
    let total: Double
    let count: String
    let percentage: Double

    var id: String { category }

    var swiftUIColor: Color {
        CategoryColorMap.getColor(for: category)
    }
}

struct WalletData: Codable {
    let balance: Double
    let income: Double
    let monthlyPercentageTarget: Double
    let monthlySpent: Double
}

struct WalletStatistics: Codable {
    let total: Double
    let expense: Double
    let income: Double
}


// Category color mapping based on mobile app Icons
struct CategoryColorMap {
    static func getColor(for category: String) -> Color {
        let categoryLower = category.lowercased()

        if categoryLower.starts(with: "housing") { return Color(hex: "#05ad21") }
        if categoryLower.starts(with: "transportation") { return Color(hex: "#ab0505") }
        if categoryLower.starts(with: "food") { return Color(hex: "#5733FF") }
        if categoryLower.starts(with: "drinks") { return Color(hex: "#ff774f") }
        if categoryLower.starts(with: "shopping") { return Color(hex: "#ff5733") }
        if categoryLower.starts(with: "addictions") { return Color(hex: "#ff5733") }
        if categoryLower.starts(with: "work") { return Color(hex: "#5733FF") }
        if categoryLower.starts(with: "clothes") { return Color(hex: "#ff5733") }
        if categoryLower.starts(with: "health") { return Color(hex: "#07bab4") }
        if categoryLower.starts(with: "entertainment") { return Color(hex: "#990583") }
        if categoryLower.starts(with: "utilities") { return Color(hex: "#5733FF") }
        if categoryLower.starts(with: "debt") { return Color(hex: "#FF5733") }
        if categoryLower.starts(with: "education") { return Color(hex: "#cc9a1b") }
        if categoryLower.starts(with: "savings") { return Color(hex: "#cf0a80") }
        if categoryLower.starts(with: "travel") { return Color(hex: "#33FF57") }
        if categoryLower.starts(with: "animals") { return Color(hex: "#ff5733") }
        if categoryLower.starts(with: "gifts") { return Color(hex: "#33FF57") }
        if categoryLower.starts(with: "sports") { return Color(hex: "#4CAF50") }
        if categoryLower.starts(with: "tech") { return Color(hex: "#0288D1") }
        if categoryLower.starts(with: "goingout") { return Color(hex: "#9C27B0") }
        if categoryLower.starts(with: "income") { return .green }

        // Default colors for unknown categories
        let defaultColors = ["#00C896", "#F6B161", "#8685EF", "#FF6F61"]
        let index = abs(category.hashValue) % defaultColors.count
        return Color(hex: defaultColors[index])
    }
}

// Color extension for hex support
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3:
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6:
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8:
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// MARK: - Data Models for Shared Storage
struct ExpensesData: Codable {
    let statisticsLegend: [ExpenseCategory]
    let lastUpdated: String
}

// MARK: - API Service
class FinanceService: ObservableObject {
    @Published var categories: [ExpenseCategory] = []
    @Published var walletData: WalletData?
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var isAuthenticated = false

    var totalSpent: Double {
        categories.reduce(0) { $0 + $1.total }
    }

    var monthlyLimit: Double {
        guard let wallet = walletData else { return 2000 }
        return (wallet.income * wallet.monthlyPercentageTarget) / 100
    }

    var remainingBudget: Double {
        monthlyLimit - (walletData?.monthlySpent ?? 0)
    }

    func checkAuthentication() {
        guard let sharedDefaults = UserDefaults(suiteName: "group.com.dmq.mylifemobile"),
              let authToken = sharedDefaults.string(forKey: "auth_token"),
              !authToken.isEmpty else {
            isAuthenticated = false
            return
        }
        isAuthenticated = true
    }

    func fetchData() async {
        await MainActor.run {
            isLoading = true
            errorMessage = nil
        }

        guard let sharedDefaults = UserDefaults(suiteName: "group.com.dmq.mylifemobile") else {
            await MainActor.run {
                errorMessage = "Cannot access shared data"
                isLoading = false
            }
            return
        }

        // Check authentication
        guard let authToken = sharedDefaults.string(forKey: "auth_token"), !authToken.isEmpty else {
            await MainActor.run {
                errorMessage = "Not authenticated.\nPlease sync from iPhone Settings."
                isLoading = false
                isAuthenticated = false
            }
            return
        }

        await MainActor.run {
            isAuthenticated = true
        }

        // Fetch data from API sequentially to see which fails
        do {
            // Fetch expenses first
            let expenses = try await fetchExpensesFromAPI(authToken: authToken)

            // Then fetch wallet
            let walletInfo = try await fetchWalletDataFromAPI(authToken: authToken)

            await MainActor.run {
                self.categories = expenses.statisticsLegend
                self.walletData = walletInfo
                isLoading = false
            }
        } catch {
            // Show detailed error
            let errorDesc: String
            if let nsError = error as NSError? {
                errorDesc = "[\(nsError.domain):\(nsError.code)] \(error.localizedDescription)"
            } else {
                errorDesc = error.localizedDescription
            }

            await MainActor.run {
                errorMessage = errorDesc
                isLoading = false
            }
        }
    }

    private func fetchExpensesFromAPI(authToken: String) async throws -> ExpensesData {
        // Calculate current month dates
        let calendar = Calendar.current
        let now = Date()
        guard let startOfMonth = calendar.date(from: calendar.dateComponents([.year, .month], from: now)),
              let endOfMonth = calendar.date(byAdding: DateComponents(month: 1, day: -1), to: startOfMonth) else {
            throw NSError(domain: "DateError", code: 1, userInfo: [NSLocalizedDescriptionKey: "Failed to calculate dates"])
        }

        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd"
        let startDate = dateFormatter.string(from: startOfMonth)
        let endDate = dateFormatter.string(from: endOfMonth)

        // Build REST URL with query parameters
        var components = URLComponents(string: "https://life.dmqq.dev/statistics/legend")!
        components.queryItems = [
            URLQueryItem(name: "startDate", value: startDate),
            URLQueryItem(name: "endDate", value: endDate),
            URLQueryItem(name: "displayMode", value: "general")
        ]

        guard let url = components.url else {
            throw NSError(domain: "URLError", code: 1, userInfo: [NSLocalizedDescriptionKey: "Invalid URL"])
        }

        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue(authToken, forHTTPHeaderField: "authentication")

        // Make request
        let (data, response) = try await URLSession.shared.data(for: request)

        // Better error handling with status code
        guard let httpResponse = response as? HTTPURLResponse else {
            throw NSError(domain: "APIError", code: 1, userInfo: [NSLocalizedDescriptionKey: "Invalid response"])
        }

        guard httpResponse.statusCode == 200 else {
            let responseBody = String(data: data, encoding: .utf8) ?? "No response body"
            throw NSError(domain: "APIError", code: httpResponse.statusCode, userInfo: [
                NSLocalizedDescriptionKey: "HTTP \(httpResponse.statusCode): \(responseBody)"
            ])
        }

        // Parse response - direct array, no GraphQL wrapper
        let decoder = JSONDecoder()
        let statisticsLegend: [ExpenseCategory]
        do {
            statisticsLegend = try decoder.decode([ExpenseCategory].self, from: data)
        } catch {
            let responseString = String(data: data, encoding: .utf8) ?? "Unable to decode"
            throw NSError(domain: "DecodingError", code: 1, userInfo: [
                NSLocalizedDescriptionKey: "Expenses decode error: \(error.localizedDescription). Response: \(responseString.prefix(300))"
            ])
        }

        return ExpensesData(
            statisticsLegend: statisticsLegend,
            lastUpdated: ISO8601DateFormatter().string(from: Date())
        )
    }

    private func fetchWalletDataFromAPI(authToken: String) async throws -> WalletData {
        // Calculate current month dates
        let calendar = Calendar.current
        let now = Date()
        guard let startOfMonth = calendar.date(from: calendar.dateComponents([.year, .month], from: now)),
              let endOfMonth = calendar.date(byAdding: DateComponents(month: 1, day: -1), to: startOfMonth) else {
            throw NSError(domain: "DateError", code: 1, userInfo: [NSLocalizedDescriptionKey: "Failed to calculate dates"])
        }

        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd"
        let startDate = dateFormatter.string(from: startOfMonth)
        let endDate = dateFormatter.string(from: endOfMonth)

        // Build REST URL with query parameters
        var components = URLComponents(string: "https://life.dmqq.dev/statistics/wallet-summary")!
        components.queryItems = [
            URLQueryItem(name: "startDate", value: startDate),
            URLQueryItem(name: "endDate", value: endDate)
        ]

        guard let url = components.url else {
            throw NSError(domain: "URLError", code: 1, userInfo: [NSLocalizedDescriptionKey: "Invalid URL"])
        }

        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue(authToken, forHTTPHeaderField: "authentication")

        // Make request
        let (data, response) = try await URLSession.shared.data(for: request)

        // Better error handling with status code
        guard let httpResponse = response as? HTTPURLResponse else {
            throw NSError(domain: "APIError", code: 1, userInfo: [NSLocalizedDescriptionKey: "Invalid response"])
        }

        guard httpResponse.statusCode == 200 else {
            let responseBody = String(data: data, encoding: .utf8) ?? "No response body"
            throw NSError(domain: "APIError", code: httpResponse.statusCode, userInfo: [
                NSLocalizedDescriptionKey: "HTTP \(httpResponse.statusCode): \(responseBody)"
            ])
        }

        // Parse response - direct object, no GraphQL wrapper
        struct WalletResponse: Codable {
            let balance: Double
            let income: Double
            let monthlyPercentageTarget: Double
        }

        struct RestResponse: Codable {
            let wallet: WalletResponse
            let monthlySpendings: WalletStatistics
        }

        let decoder = JSONDecoder()
        let restResponse: RestResponse
        do {
            restResponse = try decoder.decode(RestResponse.self, from: data)
        } catch {
            let responseString = String(data: data, encoding: .utf8) ?? "Unable to decode"
            throw NSError(domain: "DecodingError", code: 1, userInfo: [
                NSLocalizedDescriptionKey: "Wallet decode error: \(error.localizedDescription). Response: \(responseString.prefix(300))"
            ])
        }

        return WalletData(
            balance: restResponse.wallet.balance,
            income: restResponse.wallet.income,
            monthlyPercentageTarget: restResponse.wallet.monthlyPercentageTarget,
            monthlySpent: restResponse.monthlySpendings.expense
        )
    }
}

// MARK: - Main View
struct ContentView: View {
    @StateObject private var service = FinanceService()
    @EnvironmentObject var sessionManager: WatchSessionManager
    @State private var crownValue = 0.0

    var body: some View {
        NavigationStack {
            Group {
                if service.isLoading {
                    ProgressView("Loading...")
                } else if let errorMessage = service.errorMessage {
                    ErrorView(errorMessage: errorMessage, sessionManager: sessionManager, service: service)
                } else if let wallet = service.walletData {
                    FinanceScrollView(service: service, wallet: wallet, crownValue: $crownValue)
                } else {
                    EmptyStateView()
                }
            }
            .navigationTitle("Finance")
            .navigationBarTitleDisplayMode(.inline)
        }
        .task {
            await service.fetchData()
        }
        .onChange(of: sessionManager.authToken) { oldValue, newValue in
            if !newValue.isEmpty && newValue != oldValue {
                Task {
                    await service.fetchData()
                }
            }
        }
    }
}

// MARK: - Error View (Scrollable with Digital Crown)
struct ErrorView: View {
    let errorMessage: String
    let sessionManager: WatchSessionManager
    let service: FinanceService
    @State private var crownValue = 0.0

    var body: some View {
        ScrollView {
            VStack(spacing: 8) {
                Image(systemName: "exclamationmark.triangle")
                    .font(.title)
                    .foregroundColor(.orange)

                Text("Error Details")
                    .font(.caption)
                    .fontWeight(.bold)

                Text(errorMessage)
                    .font(.system(size: 10))
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(8)
                    .background(Color.red.opacity(0.2))
                    .cornerRadius(6)

                Button("Retry") {
                    Task {
                        await service.fetchData()
                    }
                }
                .buttonStyle(.bordered)
                .padding(.top, 4)

                if !sessionManager.isConnected {
                    Text("Watch not connected to iPhone")
                        .font(.caption2)
                        .foregroundColor(.gray)
                        .padding(.top, 4)
                }
            }
            .padding()
        }
        .focusable()
        .digitalCrownRotation($crownValue)
    }
}

// MARK: - Empty State View
struct EmptyStateView: View {
    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: "chart.pie")
                .font(.largeTitle)
                .foregroundColor(.blue)
            Text("No data")
                .font(.caption)
        }
    }
}

// MARK: - Finance Scroll View with Digital Crown
struct FinanceScrollView: View {
    let service: FinanceService
    let wallet: WalletData
    @Binding var crownValue: Double

    var body: some View {
        ScrollView {
            VStack(spacing: 12) {
                // Balance Card
                BalanceCard(balance: wallet.balance)

                // Monthly Budget Ring
                BudgetRingView(
                    spent: wallet.monthlySpent,
                    limit: service.monthlyLimit,
                    remaining: service.remainingBudget
                )

                // Quick Stats
                StatsRow(label: "Income", value: wallet.income, color: .green)
                StatsRow(label: "Spent", value: wallet.monthlySpent, color: .red)
                StatsRow(label: "Remaining", value: service.remainingBudget, color: .blue)

                // Expenses Breakdown
                if !service.categories.isEmpty {
                    Divider().padding(.vertical, 4)
                    ExpenseCategoriesList(categories: service.categories)
                }
            }
            .padding(.vertical, 8)
        }
        .focusable()
        .digitalCrownRotation($crownValue)
    }
}

// MARK: - Balance Card
struct BalanceCard: View {
    let balance: Double

    var body: some View {
        VStack(spacing: 2) {
            Text("Balance")
                .font(.caption2)
                .foregroundColor(.gray)
            Text(String(format: "%.2f zł", balance))
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(balance >= 0 ? .green : .red)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 8)
        .background(Color.gray.opacity(0.1))
        .cornerRadius(8)
        .padding(.horizontal, 4)
    }
}

// MARK: - Budget Ring View
struct BudgetRingView: View {
    let spent: Double
    let limit: Double
    let remaining: Double

    var progress: Double {
        guard limit > 0 else { return 0 }
        return min(spent / limit, 1.0)
    }

    var color: Color {
        if progress < 0.7 { return .green }
        if progress < 0.9 { return .orange }
        return .red
    }

    var body: some View {
        VStack(spacing: 4) {
            ZStack {
                Circle()
                    .stroke(Color.gray.opacity(0.2), lineWidth: 12)

                Circle()
                    .trim(from: 0, to: progress)
                    .stroke(color, style: StrokeStyle(lineWidth: 12, lineCap: .round))
                    .rotationEffect(.degrees(-90))
                    .animation(.easeInOut, value: progress)

                VStack(spacing: 2) {
                    Text(String(format: "%.0f%%", progress * 100))
                        .font(.title3)
                        .fontWeight(.bold)
                    Text("of budget")
                        .font(.caption2)
                        .foregroundColor(.gray)
                }
            }
            .frame(width: 100, height: 100)

            Text(String(format: "%.0f / %.0f zł", spent, limit))
                .font(.caption)
                .foregroundColor(.gray)
        }
        .padding(.vertical, 4)
    }
}

// MARK: - Stats Row
struct StatsRow: View {
    let label: String
    let value: Double
    let color: Color

    var body: some View {
        HStack {
            Text(label)
                .font(.caption)
                .foregroundColor(.gray)
            Spacer()
            Text(String(format: "%.2f zł", value))
                .font(.caption)
                .fontWeight(.semibold)
                .foregroundColor(color)
        }
        .padding(.horizontal, 8)
    }
}

// MARK: - Expense Categories List
struct ExpenseCategoriesList: View {
    let categories: [ExpenseCategory]

    var body: some View {
        VStack(spacing: 6) {
            Text("Expenses")
                .font(.caption)
                .fontWeight(.semibold)
                .foregroundColor(.white)
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal, 8)

            ForEach(categories.prefix(5)) { category in
                HStack(spacing: 6) {
                    Circle()
                        .fill(category.swiftUIColor)
                        .frame(width: 8, height: 8)

                    Text(category.category.capitalized)
                        .font(.caption2)
                        .lineLimit(1)

                    Spacer()

                    Text(String(format: "%.0f zł", category.total))
                        .font(.caption2)
                        .fontWeight(.medium)
                }
                .padding(.horizontal, 8)
            }
        }
    }
}

// MARK: - Expense Overview View
struct ExpenseOverviewView: View {
    let categories: [ExpenseCategory]
    let totalSpent: Double

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                // Total spending in the center
                VStack(spacing: 4) {
                    Text("Total Spent")
                        .font(.caption2)
                        .foregroundColor(.gray)
                    Text(String(format: "%.2f zł", totalSpent))
                        .font(.title3)
                        .fontWeight(.bold)
                }
                .padding(.top, 8)

                // Circular chart
                if !categories.isEmpty {
                    Chart(categories) { category in
                        SectorMark(
                            angle: .value("Amount", category.total),
                            innerRadius: .ratio(0.6),
                            angularInset: 1.5
                        )
                        .foregroundStyle(category.swiftUIColor)
                    }
                    .frame(height: 120)
                    .padding(.horizontal, 8)

                    // Category legend
                    VStack(spacing: 6) {
                        ForEach(categories) { category in
                            HStack(spacing: 6) {
                                Circle()
                                    .fill(category.swiftUIColor)
                                    .frame(width: 8, height: 8)

                                Text(category.category.capitalized)
                                    .font(.caption2)
                                    .lineLimit(1)

                                Spacer()

                                Text(String(format: "%.0f zł", category.total))
                                    .font(.caption2)
                                    .fontWeight(.medium)
                            }
                        }
                    }
                    .padding(.horizontal, 12)
                }
            }
            .padding(.bottom, 8)
        }
    }
}

#Preview {
    ContentView()
}

