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

struct DailyCategory: Codable {
    let category: String
    let amount: Double
}

struct DailyBreakdown: Codable, Identifiable {
    let date: String
    let dayOfWeek: String
    let categories: [DailyCategory]
    let total: Double

    var id: String { date }
}

struct RecentExpense: Codable, Identifiable {
    let id: String
    let amount: Double
    let category: String
    let description: String
    let date: String
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
        if categoryLower.starts(with: "subscriptions") { return Color(hex: "#8020FF") }
        if categoryLower.starts(with: "income") { return .green }

        // Default colors for unknown categories
        let defaultColors = ["#00C896", "#F6B161", "#8685EF", "#FF6F61"]
        let index = abs(category.hashValue) % defaultColors.count
        return Color(hex: defaultColors[index])
    }

    static func getIcon(for category: String) -> String {
        let categoryLower = category.lowercased()

        if categoryLower.starts(with: "housing") { return "house.fill" }
        if categoryLower.starts(with: "transportation") { return "car.fill" }
        if categoryLower.starts(with: "food") { return "fork.knife" }
        if categoryLower.starts(with: "drinks") { return "wineglass.fill" }
        if categoryLower.starts(with: "shopping") { return "bag.fill" }
        if categoryLower.starts(with: "addictions") { return "smoke.fill" }
        if categoryLower.starts(with: "work") { return "briefcase.fill" }
        if categoryLower.starts(with: "clothes") { return "tshirt.fill" }
        if categoryLower.starts(with: "health") { return "pills.fill" }
        if categoryLower.starts(with: "entertainment") { return "tv.fill" }
        if categoryLower.starts(with: "utilities") { return "bolt.fill" }
        if categoryLower.starts(with: "debt") { return "creditcard.fill" }
        if categoryLower.starts(with: "education") { return "book.fill" }
        if categoryLower.starts(with: "savings") { return "banknote.fill" }
        if categoryLower.starts(with: "travel") { return "airplane" }
        if categoryLower.starts(with: "animals") || categoryLower.starts(with: "pets") { return "pawprint.fill" }
        if categoryLower.starts(with: "gifts") { return "gift.fill" }
        if categoryLower.starts(with: "sports") { return "figure.run" }
        if categoryLower.starts(with: "tech") { return "laptopcomputer" }
        if categoryLower.starts(with: "goingout") { return "party.popper.fill" }
        if categoryLower.starts(with: "subscriptions") { return "arrow.clockwise" }
        if categoryLower.starts(with: "investments") { return "chart.line.uptrend.xyaxis" }
        if categoryLower.starts(with: "maintenance") { return "wrench.fill" }
        if categoryLower.starts(with: "insurance") { return "shield.checkered" }
        if categoryLower.starts(with: "taxes") { return "doc.text.fill" }
        if categoryLower.starts(with: "children") { return "figure.2.and.child.holdinghands" }
        if categoryLower.starts(with: "donations") { return "heart.fill" }
        if categoryLower.starts(with: "beauty") { return "face.smiling" }

        return "circle.fill"
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

// MARK: - HTTP Client
enum HTTPMethod: String {
    case get = "GET"
    case post = "POST"
}

class HTTPClient {
    static let shared = HTTPClient()
    private init() {}

    func request<T: Decodable>(
        _ method: HTTPMethod,
        url: URL,
        authToken: String,
        body: [String: Any]? = nil
    ) async throws -> T {
        var request = URLRequest(url: url)
        request.httpMethod = method.rawValue
        request.setValue(authToken, forHTTPHeaderField: "authentication")

        if let body = body {
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.httpBody = try JSONSerialization.data(withJSONObject: body)
        }

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw NSError(domain: "APIError", code: 1, userInfo: [NSLocalizedDescriptionKey: "Invalid response"])
        }

        guard (200...299).contains(httpResponse.statusCode) else {
            let responseBody = String(data: data, encoding: .utf8) ?? "No response body"
            throw NSError(domain: "APIError", code: httpResponse.statusCode, userInfo: [
                NSLocalizedDescriptionKey: "HTTP \(httpResponse.statusCode): \(responseBody)"
            ])
        }

        do {
            return try JSONDecoder().decode(T.self, from: data)
        } catch {
            let responseString = String(data: data, encoding: .utf8) ?? "Unable to decode"
            throw NSError(domain: "DecodingError", code: 1, userInfo: [
                NSLocalizedDescriptionKey: "Decode error: \(error.localizedDescription). Response: \(responseString.prefix(300))"
            ])
        }
    }

    func request(
        _ method: HTTPMethod,
        url: URL,
        authToken: String,
        body: [String: Any]? = nil
    ) async throws {
        var request = URLRequest(url: url)
        request.httpMethod = method.rawValue
        request.setValue(authToken, forHTTPHeaderField: "authentication")

        if let body = body {
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.httpBody = try JSONSerialization.data(withJSONObject: body)
        }

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw NSError(domain: "APIError", code: 1, userInfo: [NSLocalizedDescriptionKey: "Invalid response"])
        }

        guard (200...299).contains(httpResponse.statusCode) else {
            let responseBody = String(data: data, encoding: .utf8) ?? "No response body"
            throw NSError(domain: "APIError", code: httpResponse.statusCode, userInfo: [
                NSLocalizedDescriptionKey: "HTTP \(httpResponse.statusCode): \(responseBody.prefix(100))"
            ])
        }
    }
}

// MARK: - API Service
class FinanceService: ObservableObject {
    @Published var categories: [ExpenseCategory] = []
    @Published var walletData: WalletData?
    @Published var dailyBreakdown: [DailyBreakdown] = []
    @Published var recentExpenses: [RecentExpense] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var isAuthenticated = false

    let defaultToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50SWQiOiI0ZWVlZjY5Ny1kMjJlLTQyM2MtYThlNS1mZDhkYzRjYzc0OTQiLCJpYXQiOjE3NjUyMTE1NzksImV4cCI6MTc2ODgxMTU3OX0.ush-Y1U5p2xQn9_0_u_zCwXZzRi1i9UzpOXp81MmkF8"
    private let httpClient = HTTPClient.shared

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

    // MARK: - Helper Methods
    private func getCurrentMonthDateRange() throws -> (String, String) {
        let calendar = Calendar.current
        let now = Date()
        guard let startOfMonth = calendar.date(from: calendar.dateComponents([.year, .month], from: now)),
              let endOfMonth = calendar.date(byAdding: DateComponents(month: 1, day: -1), to: startOfMonth) else {
            throw NSError(domain: "DateError", code: 1, userInfo: [NSLocalizedDescriptionKey: "Failed to calculate dates"])
        }

        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd"
        return (dateFormatter.string(from: startOfMonth), dateFormatter.string(from: endOfMonth))
    }

    private func getCurrentWeekDateRange() throws -> (String, String) {
        let calendar = Calendar.current
        let now = Date()

        var weekStart = calendar.date(from: calendar.dateComponents([.yearForWeekOfYear, .weekOfYear], from: now))!
        let weekday = calendar.component(.weekday, from: weekStart)
        if weekday == 1 {
            weekStart = calendar.date(byAdding: .day, value: 1, to: weekStart)!
        }

        guard let weekEnd = calendar.date(byAdding: .day, value: 6, to: weekStart) else {
            throw NSError(domain: "DateError", code: 1, userInfo: [NSLocalizedDescriptionKey: "Failed to calculate dates"])
        }

        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd"
        return (dateFormatter.string(from: weekStart), dateFormatter.string(from: weekEnd))
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

        // Fetch all data in parallel
        do {
            async let expenses = fetchExpensesFromAPI(authToken: authToken)
            async let walletInfo = fetchWalletDataFromAPI(authToken: authToken)
            async let daily = fetchDailyBreakdownFromAPI(authToken: authToken)
            async let recent = fetchRecentExpensesFromAPI(authToken: authToken)

            let (expensesData, wallet, dailyData, recentData) = try await (expenses, walletInfo, daily, recent)

            await MainActor.run {
                self.categories = expensesData.statisticsLegend
                self.walletData = wallet
                self.dailyBreakdown = dailyData
                self.recentExpenses = recentData
                isLoading = false
            }
        } catch {
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
        let (startDate, endDate) = try getCurrentMonthDateRange()

        var components = URLComponents(string: "https://life.dmqq.dev/statistics/legend")!
        components.queryItems = [
            URLQueryItem(name: "startDate", value: startDate),
            URLQueryItem(name: "endDate", value: endDate),
            URLQueryItem(name: "displayMode", value: "general")
        ]

        guard let url = components.url else {
            throw NSError(domain: "URLError", code: 1, userInfo: [NSLocalizedDescriptionKey: "Invalid URL"])
        }

        let statisticsLegend: [ExpenseCategory] = try await httpClient.request(.get, url: url, authToken: authToken)

        return ExpensesData(
            statisticsLegend: statisticsLegend,
            lastUpdated: ISO8601DateFormatter().string(from: Date())
        )
    }

    private func fetchWalletDataFromAPI(authToken: String) async throws -> WalletData {
        struct WalletResponse: Codable {
            let balance: Double
            let income: Double
            let monthlyPercentageTarget: Double
        }

        struct RestResponse: Codable {
            let wallet: WalletResponse
            let monthlySpendings: WalletStatistics
        }

        let (startDate, endDate) = try getCurrentMonthDateRange()

        var components = URLComponents(string: "https://life.dmqq.dev/statistics/wallet-summary")!
        components.queryItems = [
            URLQueryItem(name: "startDate", value: startDate),
            URLQueryItem(name: "endDate", value: endDate)
        ]

        guard let url = components.url else {
            throw NSError(domain: "URLError", code: 1, userInfo: [NSLocalizedDescriptionKey: "Invalid URL"])
        }

        let restResponse: RestResponse = try await httpClient.request(.get, url: url, authToken: authToken)

        return WalletData(
            balance: restResponse.wallet.balance,
            income: restResponse.wallet.income,
            monthlyPercentageTarget: restResponse.wallet.monthlyPercentageTarget,
            monthlySpent: restResponse.monthlySpendings.expense
        )
    }

    private func fetchDailyBreakdownFromAPI(authToken: String) async throws -> [DailyBreakdown] {
        let (startDate, endDate) = try getCurrentWeekDateRange()

        var components = URLComponents(string: "https://life.dmqq.dev/statistics/daily-breakdown")!
        components.queryItems = [
            URLQueryItem(name: "startDate", value: startDate),
            URLQueryItem(name: "endDate", value: endDate)
        ]

        guard let url = components.url else {
            throw NSError(domain: "URLError", code: 1, userInfo: [NSLocalizedDescriptionKey: "Invalid URL"])
        }

        return try await httpClient.request(.get, url: url, authToken: authToken)
    }

    private func fetchRecentExpensesFromAPI(authToken: String) async throws -> [RecentExpense] {
        var components = URLComponents(string: "https://life.dmqq.dev/statistics/recent-expenses")!
        components.queryItems = [URLQueryItem(name: "limit", value: "4")]

        guard let url = components.url else {
            throw NSError(domain: "URLError", code: 1, userInfo: [NSLocalizedDescriptionKey: "Invalid URL"])
        }

        return try await httpClient.request(.get, url: url, authToken: authToken)
    }
}

// MARK: - Main View
struct ContentView: View {
    @StateObject private var service = FinanceService()
    @EnvironmentObject var sessionManager: WatchSessionManager
    @State private var showingAddExpense = false

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

            // Glass UI + Button overlay (global)
            GeometryReader { geometry in
                VStack(spacing: 0) {
                    HStack(spacing: 0) {
                        AddExpenseButton(action: { showingAddExpense = true })
                        Spacer(minLength: 0)
                    }
                    .padding(.top, 16)
                    .padding(.leading, 16)
                    Spacer(minLength: 0)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
                .allowsHitTesting(true)
            }
            .edgesIgnoringSafeArea(.top)
        }
        .sheet(isPresented: $showingAddExpense) {
            AddExpenseView(service: service, isPresented: $showingAddExpense)
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

// MARK: - Page Title Overlay
struct PageTitleOverlay: View {
    let currentPage: Int

    var pageTitle: String {
        switch currentPage {
        case 0: return "Overview"
        case 1: return "Weekly"
        case 2: return "Recent"
        case 3: return "Categories"
        default: return ""
        }
    }

    var body: some View {
        GeometryReader { geometry in
            VStack(spacing: 0) {
                HStack(spacing: 0) {
                    Spacer(minLength: 0)
                    Text(pageTitle)
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(.white.opacity(0.9))
                    Spacer(minLength: 0)
                }
                .padding(.top, 16)
                Spacer(minLength: 0)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
        }
        .edgesIgnoringSafeArea(.top)
    }
}

// MARK: - Glass UI Add Button
struct AddExpenseButton: View {
    let action: () -> Void

    var body: some View {
        Button(action: action) {
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
    @State private var currentPage = 0

    var body: some View {
        TabView(selection: $currentPage) {
            // Page 0 - Rings
            VStack(spacing: 0) {
                Spacer()
                FitnessRingsView(
                    spent: wallet.monthlySpent,
                    limit: service.monthlyLimit,
                    income: wallet.income,
                    balance: wallet.balance
                )
                .padding(.top, 20)
                Spacer()
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .tag(0)

            // Page 1 - Weekly Spending
            VStack(spacing: 8) {
                if !service.dailyBreakdown.isEmpty {
                    WeeklySpendingChart(dailyData: service.dailyBreakdown)
                        .padding(.top, 24)
                } else {
                    Spacer()
                    Text("No data")
                        .font(.caption)
                        .foregroundColor(.gray)
                    Spacer()
                }
            }
            .tag(1)

            // Page 2 - Recent Expenses
            VStack(spacing: 4) {
                if !service.recentExpenses.isEmpty {
                      VStack(spacing: 6) {
                          ForEach(service.recentExpenses) { expense in
                              RecentExpenseRow(expense: expense)
                          }
                      }
                      .padding(.horizontal, 4)
                      .padding(.top, 28)
                } else {
                    Spacer()
                    Text("No expenses")
                        .font(.caption)
                        .foregroundColor(.gray)
                    Spacer()
                }
            }
            .tag(2)

            // Page 3 - Bar Chart
            if !service.categories.isEmpty {
                  CategoryBarChart(categories: service.categories)
                      .padding(.top, 28)
                      .tag(3)
            }
        }
        .tabViewStyle(.verticalPage)
        .overlay(
            PageTitleOverlay(currentPage: currentPage)
        )
    }
}

// MARK: - Fitness Style Nested Rings
struct FitnessRingsView: View {
    let spent: Double
    let limit: Double
    let income: Double
    let balance: Double

    // Outer ring - Savings Rate (money saved vs income)
    var savingsProgress: Double {
        guard income > 0 else { return 0 }
        let saved = income - spent
        return max(0, min(saved / income, 1.0))
    }

    // Middle ring - Budget Remaining (how much budget is left)
    var budgetRemainingProgress: Double {
        guard limit > 0 else { return 0 }
        let remaining = max(0, limit - spent)
        return min(remaining / limit, 1.0)
    }

    // Inner ring - Spending Rate (spent vs income)
    var spentProgress: Double {
        guard income > 0 else { return 0 }
        return min(spent / income, 1.0)
    }

    var body: some View {
        VStack(spacing: 16) {
            ZStack {
                // Outer ring - Savings (152 diameter, 15 stroke)
                // Background ring
                Circle()
                    .stroke(Color(red: 0.0, green: 0.78, blue: 0.59).opacity(0.1), lineWidth: 15)
                    .frame(width: 152, height: 152)

                Circle()
                    .trim(from: 0, to: savingsProgress)
                    .stroke(
                        LinearGradient(
                            colors: [
                                Color(red: 0.0, green: 0.78, blue: 0.59),  // #00C896 teal
                                Color(red: 0.34, green: 0.98, blue: 0.52)  // lighter mint green
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        style: StrokeStyle(lineWidth: 15, lineCap: .round)
                    )
                    .frame(width: 152, height: 152)
                    .rotationEffect(.degrees(-90))
                    .animation(.spring(response: 0.6, dampingFraction: 0.8), value: savingsProgress)

                // Middle ring - Budget Remaining (114 diameter, 13 stroke, 4px gap)
                // Background ring
                Circle()
                    .stroke(Color(red: 0.53, green: 0.52, blue: 0.94).opacity(0.1), lineWidth: 13)
                    .frame(width: 114, height: 114)

                Circle()
                    .trim(from: 0, to: budgetRemainingProgress)
                    .stroke(
                        LinearGradient(
                            colors: [
                                Color(red: 0.53, green: 0.52, blue: 0.94),  // #8685EF violet
                                Color(red: 0.73, green: 0.72, blue: 0.98)   // lighter lavender
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        style: StrokeStyle(lineWidth: 13, lineCap: .round)
                    )
                    .frame(width: 114, height: 114)
                    .rotationEffect(.degrees(-90))
                    .animation(.spring(response: 0.6, dampingFraction: 0.8), value: budgetRemainingProgress)

                // Inner ring - Spent (80 diameter, 11 stroke, 4px gap)
                // Background ring
                Circle()
                    .stroke(Color(red: 0.20, green: 0.64, blue: 0.98).opacity(0.1), lineWidth: 11)
                    .frame(width: 80, height: 80)

                Circle()
                    .trim(from: 0, to: spentProgress)
                    .stroke(
                        LinearGradient(
                            colors: [
                                Color(red: 0.20, green: 0.64, blue: 0.98),  // #34A3FA blue
                                Color(red: 0.34, green: 0.89, blue: 0.98)   // lighter cyan
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        style: StrokeStyle(lineWidth: 11, lineCap: .round)
                    )
                    .frame(width: 80, height: 80)
                    .rotationEffect(.degrees(-90))
                    .animation(.spring(response: 0.6, dampingFraction: 0.8), value: spentProgress)

                // Center value
                VStack(spacing: 2) {
                    Text(String(format: "%.0f%%", spentProgress * 100))
                        .font(.system(size: 20, weight: .bold, design: .rounded))
                    Text("Spent")
                        .font(.system(size: 8))
                        .foregroundColor(.gray)
                }
            }

            // Ring legends
            HStack(spacing: 12) {
                RingLegend(
                    color: Color(red: 0.0, green: 0.78, blue: 0.59),
                    label: "Saved",
                    value: income - spent
                )
                RingLegend(
                    color: Color(red: 0.53, green: 0.52, blue: 0.94),
                    label: "Budget",
                    value: max(0, limit - spent)
                )
                RingLegend(
                    color: Color(red: 0.20, green: 0.64, blue: 0.98),
                    label: "Spent",
                    value: spent
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

// MARK: - Weekly Spending Chart
struct WeeklySpendingChart: View {
    let dailyData: [DailyBreakdown]

    // Ensure all 7 days are present
    var allDays: [DailyBreakdown] {
        let dayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        let dataDict = Dictionary(uniqueKeysWithValues: dailyData.map { ($0.dayOfWeek, $0) })

        return dayOrder.map { dayName in
            dataDict[dayName] ?? DailyBreakdown(
                date: "",
                dayOfWeek: dayName,
                categories: [],
                total: 0
            )
        }
    }

    // Calculate segment data with gaps
    struct SegmentData: Identifiable {
        let id = UUID()
        let day: String
        let category: String
        let yStart: Double
        let yEnd: Double
        let color: Color
    }

    var segmentedData: [SegmentData] {
        var segments: [SegmentData] = []
        let gapSize: Double = 2.5  // Gap between segments

        for day in allDays {
            var cumulativeHeight: Double = 0

            // If no categories, add a placeholder to ensure the day appears
            if day.categories.isEmpty {
                segments.append(SegmentData(
                    day: day.dayOfWeek,
                    category: "",
                    yStart: 0,
                    yEnd: 0.01,  // Tiny invisible bar to force day to appear
                    color: .clear
                ))
            } else {
                for cat in day.categories {
                    let segmentStart = cumulativeHeight
                    let segmentEnd = cumulativeHeight + cat.amount

                    segments.append(SegmentData(
                        day: day.dayOfWeek,
                        category: cat.category,
                        yStart: segmentStart,
                        yEnd: segmentEnd - gapSize,  // Subtract gap
                        color: CategoryColorMap.getColor(for: cat.category)
                    ))

                    cumulativeHeight = segmentEnd
                }
            }
        }

        return segments
    }

    var body: some View {
        Chart {
            ForEach(segmentedData) { segment in
                BarMark(
                    x: .value("Day", segment.day),
                    yStart: .value("Start", segment.yStart),
                    yEnd: .value("End", segment.yEnd),
                    width: 12
                )
                .foregroundStyle(
                    LinearGradient(
                        colors: [
                            segment.color,
                            segment.color.opacity(0.7)
                        ],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
                .cornerRadius(5)
            }
        }
        .chartXAxis {
            AxisMarks(values: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]) { value in
                AxisValueLabel()
                    .font(.system(size: 9))
                    .foregroundStyle(.white)
            }
        }
        .chartYAxis {
            AxisMarks(position: .leading, values: .automatic(desiredCount: 5)) { value in
                AxisGridLine(stroke: StrokeStyle(lineWidth: 0.5))
                    .foregroundStyle(Color.white.opacity(0.1))
                AxisValueLabel()
                    .font(.system(size: 7))
                    .foregroundStyle(.gray)
            }
        }
        .chartPlotStyle { plotArea in
            plotArea.background(.clear)
        }
        .frame(height: 135)
        .padding(.horizontal, 4)
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

// MARK: - Recent Expense Row
struct RecentExpenseRow: View {
    let expense: RecentExpense

    var body: some View {
        HStack(spacing: 8) {
            // Category icon
            Image(systemName: CategoryColorMap.getIcon(for: expense.category))
                .font(.system(size: 12))
                .foregroundColor(CategoryColorMap.getColor(for: expense.category))
                .frame(width: 20, height: 20)

            VStack(alignment: .leading, spacing: 2) {
                Text(expense.category.capitalized.split(separator: ":")[
                  expense.category.contains(":") ? 1 : 0
                ])
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(.white)

                if !expense.description.isEmpty {
                    Text(expense.description)
                        .font(.system(size: 8))
                        .foregroundColor(.gray)
                        .lineLimit(1)
                }
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 2) {
                Text(String(format: "%.0f zł", expense.amount))
                    .font(.system(size: 10, weight: .semibold))
                    .foregroundColor(.white)

                Text(expense.date)
                    .font(.system(size: 8))
                    .foregroundColor(.gray)
            }
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 6)
        .background(Color.gray.opacity(0.1))
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(Color.white.opacity(0.1), lineWidth: 0.5)
        )
    }
}

// MARK: - Add Expense View
struct AddExpenseView: View {
    @Environment(\.dismiss) var dismiss
    let service: FinanceService
    @Binding var isPresented: Bool

    @State private var amount: Double? = nil
    @State private var description: String = ""
    @State private var isIncome: Bool = false
    @State private var isSubmitting: Bool = false
    @State private var errorMessage: String?

    var body: some View {
        ScrollView {
            VStack(spacing: 12) {
                Spacer()
                    .frame(height: 4)

                // Income/Expense Toggle
                HStack(spacing: 8) {
                    Button(action: { isIncome = false }) {
                        Text("Expense")
                            .font(.system(size: 11, weight: isIncome ? .regular : .bold))
                            .foregroundColor(isIncome ? .gray : .white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 6)
                            .background(isIncome ? Color.clear : Color.blue)
                            .cornerRadius(8)
                    }
                    .buttonStyle(.plain)

                    Button(action: { isIncome = true }) {
                        Text("Income")
                            .font(.system(size: 11, weight: isIncome ? .bold : .regular))
                            .foregroundColor(isIncome ? .white : .gray)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 6)
                            .background(isIncome ? Color.green : Color.clear)
                            .cornerRadius(8)
                    }
                    .buttonStyle(.plain)
                }
                .padding(4)
                .background(Color.gray.opacity(0.2))
                .cornerRadius(10)

                // Amount Input
                VStack(alignment: .leading, spacing: 4) {
                    Text("Amount")
                        .font(.system(size: 10))
                        .foregroundColor(.gray)

                    TextField("", value: $amount, format: .number)
                }

                // Description Input (supports voice dictation automatically on watchOS)
                VStack(alignment: .leading, spacing: 4) {
                    Text("Description")
                        .font(.system(size: 10))
                        .foregroundColor(.gray)

                    TextField("Tap to speak", text: $description)
                }

                // Error Message
                if let errorMessage = errorMessage {
                    Text(errorMessage)
                        .font(.system(size: 10))
                        .foregroundColor(.red)
                        .padding(8)
                }

                // Submit Button
                Button(action: submitExpense) {
                    ZStack {
                        // Glass background
                        Capsule()
                            .fill(.ultraThinMaterial)

                        // Color overlay
                        Capsule()
                            .fill(
                                LinearGradient(
                                    colors: [
                                        (isIncome ? Color.green : Color.blue).opacity(0.8),
                                        (isIncome ? Color.green : Color.blue).opacity(0.4)
                                    ],
                                    startPoint: .top,
                                    endPoint: .bottom
                                )
                            )

                        // Highlight shine
                        Capsule()
                            .fill(
                                LinearGradient(
                                    colors: [
                                        Color.white.opacity(0.3),
                                        Color.clear
                                    ],
                                    startPoint: .top,
                                    endPoint: .center
                                )
                            )

                        // Border
                        Capsule()
                            .strokeBorder(Color.white.opacity(0.4), lineWidth: 1)

                        // Content
                        HStack {
                            Spacer()
                            if isSubmitting {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            } else {
                                Text("Save")
                                    .font(.system(size: 13, weight: .semibold))
                                    .foregroundColor(.white)
                            }
                            Spacer()
                        }
                    }
                    .frame(height: 50)
                }
                .buttonStyle(.plain)
                .disabled(isSubmitting || amount == nil || amount! <= 0)
                .opacity((isSubmitting || amount == nil || amount! <= 0) ? 0.5 : 1.0)
            }
            .padding(.horizontal, 8)
        }
    }

    func submitExpense() {
        guard let validAmount = amount, validAmount > 0 else {
            errorMessage = "Invalid amount"
            return
        }

        isSubmitting = true
        errorMessage = nil

        Task {
            do {
                try await createExpenseAPI(
                    amount: validAmount,
                    description: description.isEmpty ? (isIncome ? "Income" : "Expense") : description,
                    type: isIncome ? "income" : "expense"
                )

                await MainActor.run {
                    isPresented = false
                    dismiss()
                    // Refresh data
                    Task {
                        await service.fetchData()
                    }
                }
            } catch let error as NSError {
                await MainActor.run {
                    errorMessage = error.localizedDescription
                    isSubmitting = false
                }
            }
        }
    }

    func createExpenseAPI(amount: Double, description: String, type: String) async throws {
        let sharedDefaults = UserDefaults(suiteName: "group.com.dmq.mylifemobile")
        let authToken = sharedDefaults?.string(forKey: "auth_token") ?? service.defaultToken

        let url = URL(string: "https://life.dmqq.dev/statistics/create-expense")!
        let body: [String: Any] = [
            "amount": amount,
            "description": description,
            "type": type
        ]

        try await HTTPClient.shared.request(.post, url: url, authToken: authToken, body: body)
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
