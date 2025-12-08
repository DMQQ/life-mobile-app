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

    // Default token for development/testing
    private let defaultToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50SWQiOiI0ZWVlZjY5Ny1kMjJlLTQyM2MtYThlNS1mZDhkYzRjYzc0OTQiLCJpYXQiOjE3NjUyMTE1NzksImV4cCI6MTc2ODgxMTU3OX0.ush-Y1U5p2xQn9_0_u_zCwXZzRi1i9UzpOXp81MmkF8"

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
        let sharedDefaults = UserDefaults(suiteName: "group.com.dmq.mylifemobile")
        let authToken = sharedDefaults?.string(forKey: "auth_token") ?? defaultToken
        isAuthenticated = !authToken.isEmpty
    }

    func fetchData() async {
        await MainActor.run {
            isLoading = true
            errorMessage = nil
        }

        // Get auth token from shared defaults or use default
        let sharedDefaults = UserDefaults(suiteName: "group.com.dmq.mylifemobile")
        let authToken = sharedDefaults?.string(forKey: "auth_token") ?? defaultToken

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

    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                colors: [
                    Color.gray.opacity(0.15),
                    Color.black
                ],
                startPoint: .top,
                endPoint: .bottom
            )
            .edgesIgnoringSafeArea(.all)

            Group {
                if service.isLoading {
                    ProgressView("Loading...")
                } else if let errorMessage = service.errorMessage {
                    ErrorView(errorMessage: errorMessage, sessionManager: sessionManager, service: service)
                } else if let wallet = service.walletData {
                    FinanceScrollView(service: service, wallet: wallet)
                } else {
                    EmptyStateView()
                }
            }

            // Glass UI + Button overlay
            GeometryReader { geometry in
                VStack(spacing: 0) {
                    HStack(spacing: 0) {
                        AddExpenseButton()
                            .padding(.leading, 4)
                        Spacer(minLength: 0)
                    }
                    .padding(.top, 20)
                    .padding(.leading, 4)
                    Spacer(minLength: 0)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
            }
            .edgesIgnoringSafeArea(.top)
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

// MARK: - Glass UI Add Button
struct AddExpenseButton: View {
    var body: some View {
        Button(action: {
            // TODO: Add expense action
        }) {
            Image(systemName: "plus")
                .font(.system(size: 12, weight: .semibold))
                .foregroundColor(.white)
                .frame(width: 28, height: 28)
                .background(
                    ZStack {
                        // Glass morphism effect
                        Circle()
                            .fill(.ultraThinMaterial)
                        Circle()
                            .fill(Color.white.opacity(0.1))
                        Circle()
                            .stroke(Color.white.opacity(0.2), lineWidth: 0.5)
                    }
                )
                .shadow(color: .black.opacity(0.15), radius: 4, x: 0, y: 2)
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Error View
struct ErrorView: View {
    let errorMessage: String
    let sessionManager: WatchSessionManager
    let service: FinanceService
    @State private var scrollOffset: CGFloat = 0

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

    var body: some View {
        TabView {
            // Page 1 - Rings
            VStack(spacing: 12) {
                Spacer()
                FitnessRingsView(
                    spent: wallet.monthlySpent,
                    limit: service.monthlyLimit,
                    income: wallet.income,
                    balance: wallet.balance
                )
                .padding(.top, 16)
                Spacer()
            }

            // Page 2 - Balance
            VStack(spacing: 12) {
                Spacer()
                ModernBalanceCard(balance: wallet.balance)
                Spacer()
            }

            // Page 3 - Stats Cards
            VStack(spacing: 12) {
                Spacer()
                HStack(spacing: 8) {
                    StatCard(
                        title: "Income",
                        value: wallet.income,
                        icon: "arrow.down.circle.fill",
                        color: .green
                    )
                    StatCard(
                        title: "Spent",
                        value: wallet.monthlySpent,
                        icon: "arrow.up.circle.fill",
                        color: .red
                    )
                }
                .padding(.horizontal, 4)
                Spacer()
            }

            // Page 4 - Bar Chart
            if !service.categories.isEmpty {
                ScrollView {
                    CategoryBarChart(categories: service.categories)
                        .padding(.top, 8)
                }
            }
        }
        .tabViewStyle(.verticalPage)
    }
}

// MARK: - Fitness Style Nested Rings
struct FitnessRingsView: View {
    let spent: Double
    let limit: Double
    let income: Double
    let balance: Double

    // Outer ring - Monthly Budget Progress (spent vs limit)
    var budgetProgress: Double {
        guard limit > 0 else { return 0 }
        return min(spent / limit, 1.0)
    }

    // Middle ring - Income Usage (spent vs income)
    var incomeUsageProgress: Double {
        guard income > 0 else { return 0 }
        return min(spent / income, 1.0)
    }

    // Inner ring - Savings Rate (money saved vs income)
    var savingsProgress: Double {
        guard income > 0 else { return 0 }
        let saved = income - spent
        return max(0, min(saved / income, 1.0))
    }

    var body: some View {
        VStack(spacing: 16) {
            ZStack {
                // Outer ring - Monthly Budget (160 diameter, 16 stroke)
                // Background ring
                Circle()
                    .stroke(Color.blue.opacity(0.1), lineWidth: 16)
                    .frame(width: 160, height: 160)

                Circle()
                    .trim(from: 0, to: budgetProgress)
                    .stroke(
                        LinearGradient(
                            colors: budgetProgress < 0.7 ? [.green, .mint] :
                                   budgetProgress < 0.9 ? [.orange, .yellow] : [.red, .pink],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        style: StrokeStyle(lineWidth: 16, lineCap: .round)
                    )
                    .frame(width: 160, height: 160)
                    .rotationEffect(.degrees(-90))
                    .animation(.spring(response: 0.6, dampingFraction: 0.8), value: budgetProgress)

                // Middle ring - Income Usage (120 diameter, 14 stroke, 4px gap)
                // Background ring
                Circle()
                    .stroke(Color.cyan.opacity(0.05), lineWidth: 14)
                    .frame(width: 120, height: 120)

                Circle()
                    .trim(from: 0, to: incomeUsageProgress)
                    .stroke(
                        LinearGradient(
                            colors: [.blue, .cyan],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        style: StrokeStyle(lineWidth: 14, lineCap: .round)
                    )
                    .frame(width: 120, height: 120)
                    .rotationEffect(.degrees(-90))
                    .animation(.spring(response: 0.6, dampingFraction: 0.8), value: incomeUsageProgress)

                // Inner ring - Savings Rate (84 diameter, 12 stroke, 4px gap)
                // Background ring
                Circle()
                    .stroke(Color.purple.opacity(0.05), lineWidth: 12)
                    .frame(width: 84, height: 84)

                Circle()
                    .trim(from: 0, to: savingsProgress)
                    .stroke(
                        LinearGradient(
                            colors: [.purple, .pink],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        style: StrokeStyle(lineWidth: 12, lineCap: .round)
                    )
                    .frame(width: 84, height: 84)
                    .rotationEffect(.degrees(-90))
                    .animation(.spring(response: 0.6, dampingFraction: 0.8), value: savingsProgress)

                // Center value
                VStack(spacing: 2) {
                    Text(String(format: "%.0f%%", budgetProgress * 100))
                        .font(.system(size: 22, weight: .bold, design: .rounded))
                    Text("Budget")
                        .font(.system(size: 9))
                        .foregroundColor(.gray)
                }
            }

            // Ring legends
            HStack(spacing: 12) {
                RingLegend(
                    color: budgetProgress < 0.7 ? .green : budgetProgress < 0.9 ? .orange : .red,
                    label: "Budget",
                    value: limit
                )
                RingLegend(
                    color: .blue,
                    label: "Spent",
                    value: spent
                )
                RingLegend(
                    color: .purple,
                    label: "Saved",
                    value: income - spent
                )
            }
            .font(.system(size: 10))
        }
    }
}

struct RingLegend: View {
    let color: Color
    let label: String
    let value: Double

    var body: some View {
        VStack(spacing: 2) {
            Text(label)
                .foregroundColor(color)
                .font(.system(size: 9, weight: .medium))
            Text(String(format: "%.0f", value))
                .font(.system(size: 10, weight: .semibold))
                .foregroundColor(.white)
        }
    }
}

// MARK: - Modern Balance Card
struct ModernBalanceCard: View {
    let balance: Double

    var body: some View {
        VStack(spacing: 6) {
            Text("Current Balance")
                .font(.system(size: 10))
                .foregroundColor(.gray)

            Text(String(format: "%.2f zł", balance))
                .font(.system(size: 24, weight: .bold, design: .rounded))
                .foregroundColor(balance >= 0 ? .green : .red)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 16)
        .background(
            LinearGradient(
                colors: balance >= 0 ?
                    [Color.green.opacity(0.1), Color.mint.opacity(0.05)] :
                    [Color.red.opacity(0.1), Color.pink.opacity(0.05)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(Color.white.opacity(0.1), lineWidth: 1)
        )
        .padding(.horizontal, 4)
    }
}

// MARK: - Stat Card
struct StatCard: View {
    let title: String
    let value: Double
    let icon: String
    let color: Color

    var body: some View {
        VStack(spacing: 6) {
            Image(systemName: icon)
                .font(.system(size: 16))
                .foregroundColor(color)

            Text(title)
                .font(.system(size: 9))
                .foregroundColor(.gray)

            Text(String(format: "%.0f zł", value))
                .font(.system(size: 11, weight: .semibold))
                .foregroundColor(.white)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 12)
        .background(Color.gray.opacity(0.1))
        .cornerRadius(10)
        .overlay(
            RoundedRectangle(cornerRadius: 10)
                .stroke(Color.white.opacity(0.1), lineWidth: 1)
        )
    }
}

// MARK: - Category Bar Chart
struct CategoryBarChart: View {
    let categories: [ExpenseCategory]

    var topCategories: [ExpenseCategory] {
        Array(categories.prefix(6))
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Top Expenses")
                .font(.system(size: 11, weight: .semibold))
                .foregroundColor(.white)
                .padding(.horizontal, 8)

            Chart(topCategories) { category in
                BarMark(
                    x: .value("Amount", category.total),
                    y: .value("Category", category.category)
                )
                .foregroundStyle(
                    LinearGradient(
                        colors: [category.swiftUIColor, category.swiftUIColor.opacity(0.6)],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                .cornerRadius(4)
            }
            .chartXAxis {
                AxisMarks(position: .bottom) { _ in
                    AxisValueLabel()
                        .font(.system(size: 8))
                        .foregroundStyle(.gray)
                }
            }
            .chartYAxis {
                AxisMarks(position: .leading) { value in
                    AxisValueLabel {
                        if let category = value.as(String.self) {
                            Text(category.capitalized)
                                .font(.system(size: 8))
                                .foregroundStyle(.white)
                        }
                    }
                }
            }
            .frame(height: 140)
            .padding(.horizontal, 8)
        }
        .padding(.vertical, 12)
        .background(Color.gray.opacity(0.1))
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(Color.white.opacity(0.1), lineWidth: 1)
        )
        .padding(.horizontal, 4)
    }
}

#Preview {
    ContentView()
}

struct Content_Preview: PreviewProvider {
  static var previews: some View {
    ContentView()
  }
}
