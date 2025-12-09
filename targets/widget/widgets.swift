import WidgetKit
import SwiftUI

extension UserDefaults {
    static let shared = UserDefaults(suiteName: "group.com.dmq.mylifemobile")
}

struct Provider: AppIntentTimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), configuration: ConfigurationAppIntent())
    }

    func snapshot(for configuration: ConfigurationAppIntent, in context: Context) async -> SimpleEntry {
        SimpleEntry(date: Date(), configuration: configuration)
    }
    
    func timeline(for configuration: ConfigurationAppIntent, in context: Context) async -> Timeline<SimpleEntry> {
        var entries: [SimpleEntry] = []


        let currentDate = Date()
        for minuteOffset in 0 ..< 5 {
            let entryDate = Calendar.current.date(byAdding: .minute, value: minuteOffset, to: currentDate)!
            let entry = SimpleEntry(date: entryDate, configuration: configuration)
            entries.append(entry)
        }

        return Timeline(entries: entries, policy: .atEnd)
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let configuration: ConfigurationAppIntent
}

struct WalletSubscription: Codable {
    let id: String
    let amount: Double
    let description: String
    let nextBillingDate: String
    let isActive: Bool
}

struct WalletData: Codable {
    let balance: Double
    let income: Double
    let monthlyPercentageTarget: Double
    let recentExpenses: [WalletExpense]
    let lastUpdated: String
    let monthlySpent: Double?
    let monthlyLimit: Double?
    let upcomingSubscriptions: [WalletSubscription]?
}

struct AnalyticsData: Codable {
    let limits: [AnalyticsLimit]
    let weeklySpending: [Double]
    let topCategories: [AnalyticsCategory]
    let savings: AnalyticsSavings
    let lastUpdated: String
}

struct AnalyticsLimit: Codable {
    let category: String
    let amount: Double
    let current: Double
}

struct AnalyticsCategory: Codable {
    let name: String
    let amount: Double
}

struct AnalyticsSavings: Codable {
    let savedAmount: Double
    let targetAmount: Double
    let savedPercentage: Double
}

struct WalletExpense: Codable {
    let id: String
    let amount: Double
    let description: String
    let date: String
    let type: String
    let category: String
}

struct TimelineData: Codable {
    let events: [TimelineEvent]
    let selectedDate: String
    let totalEvents: Int
    let completedEvents: Int
    let lastUpdated: String
}

struct TimelineEvent: Codable {
    let id: String
    let title: String
    let description: String
    let date: String
    let beginTime: String
    let endTime: String
    let isCompleted: Bool
    let todos: [TimelineTodo]
}

struct TimelineTodo: Codable {
    let id: String
    let title: String
    let isCompleted: Bool
}

struct WalletWidgetView: View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            if let walletDataString = UserDefaults.shared?.string(forKey: "wallet_data"),
               let walletData = try? JSONDecoder().decode(WalletData.self, from: walletDataString.data(using: .utf8) ?? Data()) {
                
                HStack {
                    Text("💰 Wallet")
                        .font(.headline)
                        .fontWeight(.bold)
                    Spacer()
                    Text("\(walletData.balance, specifier: "%.2f")zł")
                        .font(.title2)
                        .fontWeight(.black)
                }
                
                if family == .systemLarge,
                   let monthlySpent = walletData.monthlySpent,
                   let monthlyLimit = walletData.monthlyLimit,
                   monthlyLimit > 0 {
                    VStack(alignment: .leading, spacing: 4) {
                        HStack {
                            Text("Monthly Spending")
                                .font(.caption)
                                .foregroundColor(.secondary)
                            Spacer()
                            Text("\(monthlySpent, specifier: "%.0f") / \(monthlyLimit, specifier: "%.0f")zł")
                                .font(.caption)
                                .fontWeight(.medium)
                        }
                        
                        ZStack(alignment: .leading) {
                            RoundedRectangle(cornerRadius: 4)
                                .fill(Color.gray.opacity(0.3))
                                .frame(height: 8)
                            
                            RoundedRectangle(cornerRadius: 4)
                                .fill(monthlySpent > monthlyLimit ? .red : .blue)
                                .frame(height: 8)
                                .frame(maxWidth: .infinity)
                                .scaleEffect(x: min(1.0, monthlySpent / monthlyLimit), anchor: .leading)
                                .clipped()
                        }
                        
                        HStack {
                            Text("\(Int((monthlySpent / monthlyLimit) * 100))% used")
                                .font(.caption2)
                                .foregroundColor(monthlySpent > monthlyLimit ? .red : .secondary)
                            Spacer()
                            if monthlySpent <= monthlyLimit {
                                Text("\(monthlyLimit - monthlySpent, specifier: "%.0f")zł left")
                                    .font(.caption2)
                                    .foregroundColor(.green)
                            } else {
                                Text("\(monthlySpent - monthlyLimit, specifier: "%.0f")zł over")
                                    .font(.caption2)
                                    .foregroundColor(.red)
                            }
                        }
                    }
                    .padding(.top, 8)
                    .padding(.bottom, 4)
                }
                
                let expenseCount = family == .systemLarge ? 5 : 2
                let expensesToShow: [WalletExpense] = Array(walletData.recentExpenses.prefix(expenseCount))
                ForEach(expensesToShow, id: \.id) { (expense: WalletExpense) in
                    Link(destination: URL(string: "mylife://wallet/expense/id/\(expense.id)")!) {
                        HStack(spacing: 8) {
                                Image(systemName: getCategoryIcon(expense.category))
                                .font(.caption)
                                .foregroundColor(getCategoryColor(expense.category))
                                .frame(width: 16, height: 16)
                            
                            VStack(alignment: .leading, spacing: 1) {
                                Text(expense.description)
                                    .font(.caption2)
                                    .lineLimit(1)
                                HStack(spacing: 4) {
                                    Text(expense.category)
                                        .font(.caption2)
                                        .foregroundColor(.secondary)
                                    Text("•")
                                        .font(.caption2)
                                        .foregroundColor(.secondary)
                                    Text(formatDate(expense.date))
                                        .font(.caption2)
                                        .foregroundColor(.secondary)
                                }
                            }
                            Spacer()
                            Text("\(expense.type == "income" ? "+" : "-")\(expense.amount, specifier: "%.2f")zł")
                                .font(.caption2)
                                .fontWeight(.medium)
                                .foregroundColor(expense.type == "income" ? .green : .red)
                                .strikethrough(expense.type == "refunded", color: .gray)
                        }
                        .padding(.horizontal, 10)
                        .padding(.vertical, 6)
                        .background(
                            RoundedRectangle(cornerRadius: 10)
                                .fill(Color.primary.opacity(0.05))
                        )
                    }
                }
                
                if family == .systemLarge,
                   let subscriptions = walletData.upcomingSubscriptions,
                   !subscriptions.isEmpty {
                    
                    Text("Upcoming Subscriptions:")
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .padding(.top, 8)
                    
                    let subscriptionsToShow: [WalletSubscription] = Array(subscriptions.prefix(2))
                    ForEach(subscriptionsToShow, id: \.id) { (subscription: WalletSubscription) in
                        HStack {
                            VStack(alignment: .leading, spacing: 1) {
                                Text(subscription.description)
                                    .font(.caption2)
                                    .lineLimit(1)
                                Text(formatDate(subscription.nextBillingDate))
                                    .font(.caption2)
                                    .foregroundColor(.orange)
                            }
                            Spacer()
                            Text("\(subscription.amount, specifier: "%.2f")zł")
                                .font(.caption2)
                                .fontWeight(.medium)
                                .foregroundColor(.orange)
                        }
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(
                            RoundedRectangle(cornerRadius: 6)
                                .fill(Color.orange.opacity(0.1))
                        )
                    }
                }
                
            } else {
                Text("No wallet data")
                    .foregroundColor(.secondary)
            }
        }
        .padding(.horizontal, 8)
        .padding(.top, 4)
        .padding(.bottom, 8)
    }
    
    private func formatDate(_ dateString: String) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
        if let date = formatter.date(from: dateString) {
            let displayFormatter = DateFormatter()
            displayFormatter.dateFormat = "MMM dd"
            return displayFormatter.string(from: date)
        }
        return dateString
    }
    
    private func getCategoryIcon(_ category: String) -> String {
        switch category.lowercased() {
        case "housing": return "house.fill"
        case "transportation": return "car.fill"
        case "food": return "fork.knife"
        case "drinks": return "wineglass.fill"
        case "shopping": return "bag.fill"
        case "addictions": return "smoke.fill"
        case "work": return "briefcase.fill"
        case "clothes": return "tshirt.fill"
        case "health": return "pills.fill"
        case "entertainment": return "tv.fill"
        case "utilities": return "bolt.fill"
        case "debt": return "creditcard.fill"
        case "education": return "book.fill"
        case "savings": return "banknote.fill"
        case "travel": return "airplane"
        case "income": return "dollarsign.circle.fill"
        case "animals": return "pawprint.fill"
        case "refunded": return "arrow.counterclockwise"
        case "gifts": return "gift.fill"
        case "sports": return "figure.strengthtraining.traditional"
        case "tech": return "laptopcomputer"
        case "goingout": return "party.popper.fill"
        default: return "circle.fill"
        }
    }
    
    private func getCategoryColor(_ category: String) -> Color {
        switch category.lowercased() {
        case "housing": return .green
        case "transportation": return .red
        case "food": return .purple
        case "drinks": return .orange
        case "shopping": return .red
        case "addictions": return .red
        case "work": return .blue
        case "clothes": return .red
        case "health": return .cyan
        case "entertainment": return .purple
        case "utilities": return .blue
        case "debt": return .red
        case "education": return .yellow
        case "savings": return .pink
        case "travel": return .green
        case "income": return .green
        case "animals": return .red
        case "refunded": return .gray
        case "gifts": return .green
        case "sports": return .green
        case "tech": return .blue
        case "goingout": return .purple
        default: return .gray
        }
    }
}

struct TimelineWidgetView: View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            if let timelineDataString = UserDefaults.shared?.string(forKey: "timeline_data"),
               let timelineData = try? JSONDecoder().decode(TimelineData.self, from: timelineDataString.data(using: .utf8) ?? Data()) {
                
                HStack {
                    Text("📅 Timeline")
                        .font(.headline)
                        .fontWeight(.bold)
                    Spacer()
                    HStack(spacing: 4) {
                        Circle()
                            .fill(.green)
                            .frame(width: 6, height: 6)
                        Text("\(timelineData.completedEvents)")
                            .font(.caption)
                            .fontWeight(.medium)
                        Text("/")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Text("\(timelineData.totalEvents)")
                            .font(.caption)
                            .fontWeight(.medium)
                    }
                }
                .padding(.bottom, 8)
                
                let eventCount = family == .systemLarge ? 4 : 2
                let eventsToShow: [TimelineEvent] = Array(timelineData.events.prefix(eventCount))
                ForEach(eventsToShow, id: \.id) { (event: TimelineEvent) in
                    Link(destination: URL(string: "mylife://timeline/id/\(event.id)")!) {
                        VStack(alignment: .leading, spacing: 4) {
                            HStack(spacing: 8) {
                                let isCompleted = event.isCompleted
                                Image(systemName: isCompleted ? "checkmark.circle.fill" : "circle")
                                    .foregroundColor(isCompleted ? .green : .blue)
                                    .font(.caption)
                                    .frame(width: 16, height: 16)
                                
                                VStack(alignment: .leading, spacing: 1) {
                                    Text(event.title)
                                        .font(.caption)
                                        .fontWeight(.medium)
                                        .lineLimit(1)
                                    
                                    if !event.description.isEmpty && event.todos.isEmpty {
                                        Text(event.description)
                                            .font(.caption2)
                                            .foregroundColor(.secondary)
                                            .lineLimit(1)
                                    }
                                }
                                
                                Spacer()
                                
                                VStack(alignment: .trailing, spacing: 1) {
                                    Text(formatEventDate(event.date))
                                        .font(.caption2)
                                        .foregroundColor(.secondary)
                                    Text("\(formatTime(event.beginTime)) - \(formatTime(event.endTime))")
                                        .font(.caption2)
                                        .foregroundColor(.secondary)
                                }
                            }
                            
                            if !event.todos.isEmpty {
                                VStack(alignment: .leading, spacing: 2) {
                                    let todoCount = family == .systemLarge ? 2 : 1
                                    let todosToShow: [TimelineTodo] = Array(event.todos.prefix(todoCount))
                                    ForEach(todosToShow, id: \.id) { (todo: TimelineTodo) in
                                        HStack(spacing: 6) {
                                            Image(systemName: todo.isCompleted ? "checkmark.square.fill" : "square")
                                                .foregroundColor(todo.isCompleted ? .green : .gray)
                                                .font(.caption2)
                                                .frame(width: 12, height: 12)
                                            Text(todo.title)
                                                .font(.caption2)
                                                .lineLimit(1)
                                                .strikethrough(todo.isCompleted)
                                                .foregroundColor(todo.isCompleted ? .secondary : .primary)
                                            Spacer()
                                        }
                                        .padding(.leading, 20)
                                    }
                                }
                            }
                        }
                        .padding(.horizontal, 10)
                        .padding(.vertical, 6)
                        .background(
                            RoundedRectangle(cornerRadius: 10)
                                .fill(Color.primary.opacity(0.05))
                        )
                    }
                }
                
            } else {
                Text("No timeline data")
                    .foregroundColor(.secondary)
            }
        }
        .padding(.horizontal, 8)
        .padding(.top, 2)
        .padding(.bottom, 8)
    }
    
    private func formatTime(_ timeString: String) -> String {
        if timeString.contains(":") {
            let components = timeString.split(separator: ":")
            if components.count >= 2 {
                return "\(components[0]):\(components[1])"
            }
        }
        return timeString
    }
    
    private func formatEventDate(_ dateString: String) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        guard let date = formatter.date(from: dateString) else { return dateString }
        
        let today = Calendar.current.startOfDay(for: Date())
        let eventDate = Calendar.current.startOfDay(for: date)
        
        let daysDiff = Calendar.current.dateComponents([.day], from: today, to: eventDate).day ?? 0
        
        switch daysDiff {
        case 0: return "Today"
        case 1: return "Tomorrow"
        case 2: return "Day After"
        default:
            let displayFormatter = DateFormatter()
            displayFormatter.dateFormat = "MMM dd"
            return displayFormatter.string(from: date)
        }
    }
}

struct AnalyticsWidgetView: View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family
    
    private var currentView: Int {
        let minutes = Int(entry.date.timeIntervalSince1970) / 60
        return minutes % 3
    }
    
    private var analyticsData: AnalyticsData? {
        guard let analyticsDataString = UserDefaults.shared?.string(forKey: "analytics_data"),
              let data = analyticsDataString.data(using: .utf8),
              let decoded = try? JSONDecoder().decode(AnalyticsData.self, from: data) else {
            return nil
        }
        return decoded
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            if let data = analyticsData {
                
                HStack {
                    Text("📊 Analytics")
                        .font(.headline)
                        .fontWeight(.bold)
                    Spacer()
                    Text(getViewTitle(currentView))
                        .font(.caption)
                        .foregroundColor(.secondary)
                }.padding(.bottom, 6)
                
                switch currentView {
                case 0:
                    LimitsChartView(limits: data.limits, family: family)
                case 1:
                    WeeklySpendingView(analyticsData: data, family: family)
                default:
                    CategoryChartView(categories: data.topCategories, family: family)
                }
                
            } else {
                VStack {
                    Text("📊 Analytics")
                        .font(.headline)
                        .fontWeight(.bold)
                        .padding(.bottom, 6)
                    
                    if let analyticsDataString = UserDefaults.shared?.string(forKey: "analytics_data") {
                        Text("Data found but decode failed")
                            .foregroundColor(.orange)
                            .font(.caption)
                        Text("Length: \(analyticsDataString.count)")
                            .foregroundColor(.secondary)
                            .font(.caption2)
                    } else {
                        Text("No analytics data in UserDefaults")
                            .foregroundColor(.secondary)
                            .font(.caption)
                    }
                }
            }
        }
        .padding(.horizontal, 8)
        .padding(.top, 4)
        .padding(.bottom, 8)
    }
    
    private func getViewTitle(_ index: Int) -> String {
        switch index {
        case 0: return "Limits"
        case 1: return "Weekly"
        default: return "Categories"
        }
    }
}

struct LimitsChartView: View {
    let limits: [AnalyticsLimit]
    let family: WidgetFamily
    
    var body: some View {
        let itemCount = family == .systemLarge ? 6 : 3
        let columns = [GridItem(.flexible())]
        
        LazyVGrid(columns: columns, spacing: family == .systemLarge ? 12 : 6) {
            ForEach(limits.prefix(itemCount), id: \.category) { limit in
                VStack(alignment: .leading, spacing: family == .systemLarge ? 16 : 6) {
                    HStack(spacing: 6) {
                        Image(systemName: getCategorySystemIcon(limit.category))
                            .font(.caption)
                            .foregroundColor(getCategoryLimitColor(limit.category))
                            .frame(width: 16, height: 16)
                        
                        VStack(alignment: .leading, spacing: 1) {
                            Text(limit.category.capitalized)
                                .font(family == .systemLarge ? .caption2 : .caption2)
                                .fontWeight(.medium)
                                .lineLimit(1)
                            
                            if family == .systemLarge {
                                Text("\(Int(limit.current))zł / \(Int(limit.amount))zł")
                                    .font(.caption2)
                                    .foregroundColor(.secondary)
                                    .lineLimit(1)
                            }
                        }
                        
                        Spacer()
                        
                        if family != .systemLarge {
                            Text("\(Int(limit.current))/\(Int(limit.amount))")
                                .font(.caption2)
                                .foregroundColor(.secondary)
                        }
                    }
                    
                    VStack(alignment: .leading, spacing: 2) {
                        ZStack(alignment: .leading) {
                            RoundedRectangle(cornerRadius: family == .systemLarge ? 4 : 3)
                                .fill(Color.gray.opacity(0.2))
                                .frame(height: family == .systemLarge ? 8 : 6)
                            
                            RoundedRectangle(cornerRadius: family == .systemLarge ? 4 : 3)
                                .fill(LinearGradient(
                                    gradient: Gradient(colors: [
                                        limit.current > limit.amount ? .red.opacity(0.8) : getCategoryLimitColor(limit.category).opacity(0.8),
                                        limit.current > limit.amount ? .red : getCategoryLimitColor(limit.category)
                                    ]),
                                    startPoint: .leading,
                                    endPoint: .trailing
                                ))
                                .frame(height: family == .systemLarge ? 8 : 6)
                                .frame(maxWidth: .infinity)
                                .scaleEffect(x: min(1.0, limit.amount > 0 ? limit.current / limit.amount : 0), anchor: .leading)
                                .clipped()
                        }
                        
                        if family == .systemLarge && limit.amount > 0 {
                            let percentage = (limit.current / limit.amount) * 100
                            let remaining = max(0, limit.amount - limit.current)
                            
                            HStack {
                                Text("\(Int(percentage))% used")
                                    .font(.caption2)
                                    .foregroundColor(limit.current > limit.amount ? .red : .secondary)
                                
                                Spacer()
                                
                                if remaining > 0 {
                                    Text("\(Int(remaining))zł left")
                                        .font(.caption2)
                                        .foregroundColor(.green)
                                } else {
                                    Text("\(Int(limit.current - limit.amount))zł over")
                                        .font(.caption2)
                                        .foregroundColor(.red)
                                }
                            }
                        }
                    }
                }
                .padding(.horizontal, family == .systemLarge ? 10 : 8)
                .padding(.vertical, family == .systemLarge ? 8 : 6)
                .background(
                    RoundedRectangle(cornerRadius: family == .systemLarge ? 10 : 8)
                        .fill(getCategoryLimitColor(limit.category).opacity(0.05))
                        .overlay(
                            RoundedRectangle(cornerRadius: family == .systemLarge ? 10 : 8)
                                .stroke(getCategoryLimitColor(limit.category).opacity(0.2), lineWidth: 1)
                        )
                )
            }
        }
    }
    
    private func getCategorySystemIcon(_ category: String) -> String {
        switch category.lowercased() {
        case "housing": return "house.fill"
        case "transportation": return "car.fill"
        case "food": return "fork.knife"
        case "drinks": return "wineglass.fill"
        case "shopping": return "bag.fill"
        case "addictions": return "smoke.fill"
        case "work": return "briefcase.fill"
        case "clothes": return "tshirt.fill"
        case "health": return "pills.fill"
        case "entertainment": return "tv.fill"
        case "utilities": return "bolt.fill"
        case "debt": return "creditcard.fill"
        case "education": return "book.fill"
        case "savings": return "banknote.fill"
        case "travel": return "airplane"
        case "animals", "pets": return "pawprint.fill"
        case "gifts": return "gift.fill"
        case "sports": return "figure.strengthtraining.traditional"
        case "tech": return "laptopcomputer"
        case "goingout": return "party.popper.fill"
        case "subscriptions": return "arrow.clockwise"
        case "investments": return "chart.line.uptrend.xyaxis"
        case "maintenance": return "wrench.fill"
        case "insurance": return "shield.checkered"
        case "taxes": return "doc.text.fill"
        case "children": return "figure.2.and.child.holdinghands"
        case "donations": return "heart.fill"
        case "beauty": return "face.smiling"
        default: return "circle.fill"
        }
    }
    
    private func getCategoryLimitColor(_ category: String) -> Color {
        switch category.lowercased() {
        case "housing": return Color(red: 0.02, green: 0.68, blue: 0.13)
        case "transportation": return Color(red: 0.67, green: 0.02, blue: 0.02)
        case "food": return Color(red: 0.34, green: 0.2, blue: 1.0)
        case "drinks": return Color(red: 1.0, green: 0.47, blue: 0.31)
        case "shopping": return Color(red: 1.0, green: 0.34, blue: 0.2)
        case "addictions": return Color(red: 1.0, green: 0.34, blue: 0.2)
        case "work": return Color(red: 0.34, green: 0.2, blue: 1.0)
        case "clothes": return Color(red: 1.0, green: 0.34, blue: 0.2)
        case "health": return Color(red: 0.03, green: 0.73, blue: 0.71)
        case "entertainment": return Color(red: 0.6, green: 0.02, blue: 0.51)
        case "utilities": return Color(red: 0.34, green: 0.2, blue: 1.0)
        case "debt": return Color(red: 1.0, green: 0.34, blue: 0.2)
        case "education": return Color(red: 0.8, green: 0.6, blue: 0.11)
        case "savings": return Color(red: 0.81, green: 0.04, blue: 0.5)
        case "travel": return Color(red: 0.2, green: 1.0, blue: 0.34)
        case "animals", "pets": return Color(red: 0.51, green: 0.46, blue: 0.09)
        case "gifts": return Color(red: 0.2, green: 1.0, blue: 0.34)
        case "sports": return Color(red: 0.3, green: 0.69, blue: 0.31)
        case "tech": return Color(red: 0.01, green: 0.53, blue: 0.82)
        case "goingout": return Color(red: 0.61, green: 0.15, blue: 0.69)
        case "subscriptions": return Color(red: 0.5, green: 0.2, blue: 1.0)
        case "investments": return Color(red: 0.2, green: 1.0, blue: 0.54)
        case "maintenance": return Color(red: 1.0, green: 0.55, blue: 0.2)
        case "insurance": return Color(red: 0.2, green: 0.34, blue: 1.0)
        case "taxes": return Color(red: 1.0, green: 0.2, blue: 0.2)
        case "children": return Color(red: 1.0, green: 0.2, blue: 0.82)
        case "donations": return Color(red: 0.2, green: 1.0, blue: 0.83)
        case "beauty": return Color(red: 1.0, green: 0.2, blue: 0.63)
        default: return .blue
        }
    }
}

struct WeeklySpendingView: View {
    let analyticsData: AnalyticsData
    let family: WidgetFamily
    
    private var weeklySpending: [Double] {
        analyticsData.weeklySpending
    }
    
    var body: some View {
        if family == .systemLarge {
            VStack(alignment: .leading, spacing: 4) {                
                GeometryReader { geometry in
                    HStack(alignment: .bottom, spacing: geometry.size.width / 24) {
                        ForEach(0..<min(7, weeklySpending.count), id: \.self) { index in
                            let maxValue = weeklySpending.max() ?? 1
                            let barHeight = (geometry.size.height * 0.8) * (maxValue > 0 ? (weeklySpending[index] / maxValue) : 0)
                            
                            VStack(spacing: 6) {
                                Text(String(format: "%.0f", weeklySpending[index]))
                                    .font(.caption)
                                    .fontWeight(.semibold)
                                
                                RoundedRectangle(cornerRadius: 5)
                                    .fill(LinearGradient(
                                        gradient: Gradient(colors: isCurrentDay(index) ? [.orange, .red] : [.cyan, .blue]),
                                        startPoint: .top,
                                        endPoint: .bottom
                                    ))
                                    .frame(height: max(12, barHeight))
                                
                                Text(getDayLabel(index))
                                    .font(.caption)
                                    .fontWeight(isCurrentDay(index) ? .bold : .medium)
                                    .foregroundColor(isCurrentDay(index) ? .primary : .secondary)
                            }
                            .frame(maxWidth: .infinity)
                        }
                    }
                }
                
                HStack {
                    let total = weeklySpending.reduce(0, +)
                    let average = weeklySpending.isEmpty ? 0 : total / Double(weeklySpending.count)
                    
                    Text("Total: **\(String(format: "%.0f", total))zł**")
                    Spacer()
                    Text("Avg: **\(String(format: "%.0f", average))zł**")
                    Spacer()
                    Text("Max: **\(String(format: "%.0f", weeklySpending.max() ?? 0))zł**")
                }
                .font(.caption)
                .foregroundColor(.secondary)
                .padding(.top, 4)
            }
            .padding(.vertical)
            .padding(.horizontal, 12)
            
        } else {
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text("Last 7 days")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Spacer()
                    Text("Total: \(String(format: "%.0f", weeklySpending.reduce(0, +)))zł")
                        .font(.caption2)
                        .fontWeight(.medium)
                }
                
                HStack(alignment: .bottom, spacing: 0) {
                    ForEach(0..<min(7, weeklySpending.count), id: \.self) { index in
                        let maxHeight: CGFloat = 50
                        let maxValue = weeklySpending.max() ?? 1
                        let height = CGFloat(weeklySpending[index] / maxValue) * maxHeight
                        
                        VStack(spacing: 2) {
                            Text("\(Int(weeklySpending[index]))")
                                .font(.caption2)
                                .foregroundColor(.primary)
                                .opacity(0.8)
                            
                            RoundedRectangle(cornerRadius: 2)
                                .fill(LinearGradient(
                                    gradient: Gradient(colors: isCurrentDay(index) ? [.orange.opacity(0.8), .orange] : [.blue.opacity(0.8), .blue]),
                                    startPoint: .top,
                                    endPoint: .bottom
                                ))
                                .frame(height: max(4, height))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 2)
                                        .stroke(isCurrentDay(index) ? .orange.opacity(0.3) : .blue.opacity(0.3), lineWidth: 0.5)
                                )
                            
                            Text(getDayLabel(index))
                                .font(.caption2)
                                .fontWeight(isCurrentDay(index) ? .bold : .regular)
                                .foregroundColor(isCurrentDay(index) ? .primary : .secondary)
                        }
                        .frame(maxWidth: .infinity)
                    }
                }
            }
        }
    }
    
    private func getDayLabel(_ index: Int) -> String {
        let days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]
        return days[index % 7]
    }
    
    private func isCurrentDay(_ index: Int) -> Bool {
        let calendar = Calendar.current
        let today = Date()
        let currentWeekday = calendar.component(.weekday, from: today)
        let mondayBasedWeekday = (currentWeekday == 1) ? 6 : currentWeekday - 2
        return index == mondayBasedWeekday
    }
}

struct CategoryChartView: View {
    let categories: [AnalyticsCategory]
    let family: WidgetFamily
    
    var body: some View {
        let itemCount = family == .systemLarge ? 6 : 3
        let columns = [GridItem(.flexible())]
        
        VStack(alignment: .leading, spacing: 4) {
            Text("Top spending categories")
                .font(.caption)
                .foregroundColor(.secondary)
                .padding(.bottom, 8)
            
            LazyVGrid(columns: columns, spacing: family == .systemLarge ? 8 : 6) {
                ForEach(categories.prefix(itemCount), id: \.name) { category in
                    VStack(alignment: .leading, spacing: family == .systemLarge ? 6 : 4) {
                        HStack(spacing: 6) {
                            Image(systemName: getCategorySystemIcon(category.name))
                                .font(.caption)
                                .foregroundColor(getCategoryChartColor(category.name))
                                .frame(width: 16, height: 16)
                            
                            VStack(alignment: .leading, spacing: 1) {
                                Text(category.name.capitalized)
                                    .font(family == .systemLarge ? .caption2 : .caption2)
                                    .fontWeight(.medium)
                                    .lineLimit(1)
                                
                                if family == .systemLarge {
                                    let totalSpending = categories.reduce(0) { $0 + $1.amount }
                                    let percentage = totalSpending > 0 ? (category.amount / totalSpending) * 100 : 0
                                    Text("\(percentage, specifier: "%.0f")% of total")
                                        .font(.caption2)
                                        .foregroundColor(.secondary)
                                        .lineLimit(1)
                                }
                            }
                            
                            Spacer()
                            
                            Text("\(category.amount, specifier: "%.0f")zł")
                                .font(family == .systemLarge ? .caption : .caption2)
                                .fontWeight(.medium)
                                .foregroundColor(getCategoryChartColor(category.name))
                        }
                        
                        if family == .systemLarge {
                            let maxAmount = categories.max(by: { $0.amount < $1.amount })?.amount ?? 1
                            let percentage = maxAmount > 0 ? category.amount / maxAmount : 0
                            
                            ZStack(alignment: .leading) {
                                RoundedRectangle(cornerRadius: 2)
                                    .fill(Color.gray.opacity(0.2))
                                    .frame(height: 4)
                                
                                RoundedRectangle(cornerRadius: 2)
                                    .fill(getCategoryChartColor(category.name))
                                    .frame(height: 4)
                                    .frame(maxWidth: .infinity)
                                    .scaleEffect(x: percentage, anchor: .leading)
                                    .clipped()
                            }
                        }
                    }
                    .padding(.horizontal, family == .systemLarge ? 10 : 8)
                    .padding(.vertical, family == .systemLarge ? 8 : 6)
                    .background(
                        RoundedRectangle(cornerRadius: family == .systemLarge ? 10 : 8)
                            .fill(getCategoryChartColor(category.name).opacity(0.05))
                            .overlay(
                                RoundedRectangle(cornerRadius: family == .systemLarge ? 10 : 8)
                                    .stroke(getCategoryChartColor(category.name).opacity(0.2), lineWidth: 1)
                            )
                    )
                }
            }
        }
    }
    
    private func getCategorySystemIcon(_ category: String) -> String {
        switch category.lowercased() {
        case "housing": return "house.fill"
        case "transportation": return "car.fill"
        case "food": return "fork.knife"
        case "drinks": return "wineglass.fill"
        case "shopping": return "bag.fill"
        case "addictions": return "smoke.fill"
        case "work": return "briefcase.fill"
        case "clothes": return "tshirt.fill"
        case "health": return "pills.fill"
        case "entertainment": return "tv.fill"
        case "utilities": return "bolt.fill"
        case "debt": return "creditcard.fill"
        case "education": return "book.fill"
        case "savings": return "banknote.fill"
        case "travel": return "airplane"
        case "animals", "pets": return "pawprint.fill"
        case "gifts": return "gift.fill"
        case "sports": return "figure.strengthtraining.traditional"
        case "tech": return "laptopcomputer"
        case "goingout": return "party.popper.fill"
        case "subscriptions": return "arrow.clockwise"
        case "investments": return "chart.line.uptrend.xyaxis"
        case "maintenance": return "wrench.fill"
        case "insurance": return "shield.checkered"
        case "taxes": return "doc.text.fill"
        case "children": return "figure.2.and.child.holdinghands"
        case "donations": return "heart.fill"
        case "beauty": return "face.smiling"
        default: return "circle.fill"
        }
    }
    
    private func getCategoryChartColor(_ category: String) -> Color {
        switch category.lowercased() {
        case "housing": return Color(red: 0.02, green: 0.68, blue: 0.13)
        case "transportation": return Color(red: 0.67, green: 0.02, blue: 0.02)
        case "food": return Color(red: 0.34, green: 0.2, blue: 1.0)
        case "drinks": return Color(red: 1.0, green: 0.47, blue: 0.31)
        case "shopping": return Color(red: 1.0, green: 0.34, blue: 0.2)
        case "addictions": return Color(red: 1.0, green: 0.34, blue: 0.2)
        case "work": return Color(red: 0.34, green: 0.2, blue: 1.0)
        case "clothes": return Color(red: 1.0, green: 0.34, blue: 0.2)
        case "health": return Color(red: 0.03, green: 0.73, blue: 0.71)
        case "entertainment": return Color(red: 0.6, green: 0.02, blue: 0.51)
        case "utilities": return Color(red: 0.34, green: 0.2, blue: 1.0)
        case "debt": return Color(red: 1.0, green: 0.34, blue: 0.2)
        case "education": return Color(red: 0.8, green: 0.6, blue: 0.11)
        case "savings": return Color(red: 0.81, green: 0.04, blue: 0.5)
        case "travel": return Color(red: 0.2, green: 1.0, blue: 0.34)
        case "animals", "pets": return Color(red: 0.51, green: 0.46, blue: 0.09)
        case "gifts": return Color(red: 0.2, green: 1.0, blue: 0.34)
        case "sports": return Color(red: 0.3, green: 0.69, blue: 0.31)
        case "tech": return Color(red: 0.01, green: 0.53, blue: 0.82)
        case "goingout": return Color(red: 0.61, green: 0.15, blue: 0.69)
        case "subscriptions": return Color(red: 0.5, green: 0.2, blue: 1.0)
        case "investments": return Color(red: 0.2, green: 1.0, blue: 0.54)
        case "maintenance": return Color(red: 1.0, green: 0.55, blue: 0.2)
        case "insurance": return Color(red: 0.2, green: 0.34, blue: 1.0)
        case "taxes": return Color(red: 1.0, green: 0.2, blue: 0.2)
        case "children": return Color(red: 1.0, green: 0.2, blue: 0.82)
        case "donations": return Color(red: 0.2, green: 1.0, blue: 0.83)
        case "beauty": return Color(red: 1.0, green: 0.2, blue: 0.63)
        default: return .blue
        }
    }
}

struct WalletWidget: Widget {
    let kind: String = "WalletWidget"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: kind, intent: ConfigurationAppIntent.self, provider: Provider()) { entry in
            WalletWidgetView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("Wallet")
        .description("View your balance and recent expenses")
    }
}

struct AnalyticsWidget: Widget {
    let kind: String = "AnalyticsWidget"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: kind, intent: ConfigurationAppIntent.self, provider: Provider()) { entry in
            AnalyticsWidgetView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("Analytics")
        .description("View spending analytics and charts")
        .supportedFamilies([.systemMedium, .systemLarge])
    }
}

struct TimelineWidget: Widget {
    let kind: String = "TimelineWidget"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: kind, intent: ConfigurationAppIntent.self, provider: Provider()) { entry in
            TimelineWidgetView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("Timeline")
        .description("View your schedule and tasks")
    }
}

// MARK: - Watch Complication Widget
struct WatchExpenseWidgetView: View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
        if family == .accessoryCircular {
            if let walletDataString = UserDefaults.shared?.string(forKey: "wallet_data"),
               let walletData = try? JSONDecoder().decode(WalletData.self, from: walletDataString.data(using: .utf8) ?? Data()) {

                let income = walletData.income
                let spent = walletData.monthlySpent ?? 0
                let limit = walletData.monthlyLimit ?? (income * walletData.monthlyPercentageTarget / 100)

                ZStack {
                    // Outer ring - Savings (teal/green)
                    Circle()
                        .trim(from: 0, to: savedProgress(income: income, spent: spent))
                        .stroke(
                            Color(red: 0.0, green: 0.78, blue: 0.59),
                            style: StrokeStyle(lineWidth: 6, lineCap: .round)
                        )
                        .rotationEffect(.degrees(-90))

                    // Middle ring - Budget Remaining (violet/purple)
                    Circle()
                        .trim(from: 0, to: budgetRemainingProgress(limit: limit, spent: spent))
                        .stroke(
                            Color(red: 0.53, green: 0.52, blue: 0.94),
                            style: StrokeStyle(lineWidth: 6, lineCap: .round)
                        )
                        .rotationEffect(.degrees(-90))
                        .padding(8)

                    // Inner ring - Spending Rate (blue)
                    Circle()
                        .trim(from: 0, to: spentProgress(income: income, spent: spent))
                        .stroke(
                            Color(red: 0.20, green: 0.64, blue: 0.98),
                            style: StrokeStyle(lineWidth: 6, lineCap: .round)
                        )
                        .rotationEffect(.degrees(-90))
                        .padding(16)

                    // Center text
                    VStack(spacing: 0) {
                        Text("\(Int(spent))")
                            .font(.system(size: 16, weight: .bold, design: .rounded))
                        Text("spent")
                            .font(.system(size: 8, weight: .medium))
                            .foregroundColor(.secondary)
                    }
                }
            } else {
                ZStack {
                    Circle()
                        .stroke(Color.gray.opacity(0.3), lineWidth: 6)
                    Text("--")
                        .font(.system(size: 16, weight: .bold))
                }
            }
        } else {
            Text("Unsupported")
                .font(.caption2)
        }
    }

    private func savedProgress(income: Double, spent: Double) -> Double {
        guard income > 0 else { return 0 }
        let saved = income - spent
        return max(0, min(saved / income, 1.0))
    }

    private func budgetRemainingProgress(limit: Double, spent: Double) -> Double {
        guard limit > 0 else { return 0 }
        let remaining = max(0, limit - spent)
        return min(remaining / limit, 1.0)
    }

    private func spentProgress(income: Double, spent: Double) -> Double {
        guard income > 0 else { return 0 }
        return min(spent / income, 1.0)
    }
}

struct WatchExpenseWidget: Widget {
    let kind: String = "WatchExpenseWidget"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: kind, intent: ConfigurationAppIntent.self, provider: Provider()) { entry in
            WatchExpenseWidgetView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("Expenses")
        .description("View your spending rings")
        .supportedFamilies([.accessoryCircular])
    }
}

extension ConfigurationAppIntent {
    fileprivate static var smiley: ConfigurationAppIntent {
        let intent = ConfigurationAppIntent()
        intent.favoriteEmoji = "😀"
        return intent
    }

    fileprivate static var starEyes: ConfigurationAppIntent {
        let intent = ConfigurationAppIntent()
        intent.favoriteEmoji = "🤩"
        return intent
    }
}

#Preview(as: .systemSmall) {
    WalletWidget()
} timeline: {
    SimpleEntry(date: .now, configuration: .smiley)
    SimpleEntry(date: .now, configuration: .starEyes)
}

#Preview(as: .systemSmall) {
    TimelineWidget()
} timeline: {
    SimpleEntry(date: .now, configuration: .smiley)
    SimpleEntry(date: .now, configuration: .starEyes)
}