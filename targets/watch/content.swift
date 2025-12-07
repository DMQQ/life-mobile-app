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
class ExpenseService: ObservableObject {
    @Published var categories: [ExpenseCategory] = []
    @Published var isLoading = false
    @Published var errorMessage: String?

    var totalSpent: Double {
        categories.reduce(0) { $0 + $1.total }
    }

    func fetchExpenses() async {
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

        // Try to read expenses data from shared storage
        if let expensesDataString = sharedDefaults.string(forKey: "expenses_data"),
           let expensesData = try? JSONDecoder().decode(ExpensesData.self, from: expensesDataString.data(using: .utf8) ?? Data()) {

            await MainActor.run {
                self.categories = expensesData.statisticsLegend
                isLoading = false
            }
            return
        }

        // Fallback: show error if no data available
        await MainActor.run {
            errorMessage = "No expense data available.\nPlease open the iPhone app first."
            isLoading = false
        }
    }
}

// MARK: - Main View
struct ContentView: View {
    @StateObject private var service = ExpenseService()

    var body: some View {
        NavigationStack {
            Group {
                if service.isLoading {
                    ProgressView("Loading...")
                } else if let errorMessage = service.errorMessage {
                    VStack(spacing: 8) {
                        Image(systemName: "exclamationmark.triangle")
                            .font(.title)
                            .foregroundColor(.orange)
                        Text(errorMessage)
                            .font(.caption)
                            .multilineTextAlignment(.center)
                        Button("Retry") {
                            Task {
                                await service.fetchExpenses()
                            }
                        }
                        .buttonStyle(.bordered)
                    }
                    .padding()
                } else if !service.categories.isEmpty {
                    ExpenseOverviewView(categories: service.categories, totalSpent: service.totalSpent)
                } else {
                    VStack(spacing: 12) {
                        Image(systemName: "chart.pie")
                            .font(.largeTitle)
                            .foregroundColor(.blue)
                        Text("No data")
                            .font(.caption)
                    }
                }
            }
            .navigationTitle("Expenses")
            .navigationBarTitleDisplayMode(.inline)
        }
        .task {
            await service.fetchExpenses()
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

