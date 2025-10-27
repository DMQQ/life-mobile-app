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

        // Generate entries every minute for analytics rotation
        let currentDate = Date()
        for minuteOffset in 0 ..< 5 {
            let entryDate = Calendar.current.date(byAdding: .minute, value: minuteOffset, to: currentDate)!
            let entry = SimpleEntry(date: entryDate, configuration: configuration)
            entries.append(entry)
        }

        return Timeline(entries: entries, policy: .atEnd)
    }

//    func relevances() async -> WidgetRelevances<ConfigurationAppIntent> {
//        // Generate a list containing the contexts this widget is relevant in.
//    }
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
                   let monthlyLimit = walletData.monthlyLimit {
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
    
    private var currentView: Int {
        let minutes = Int(entry.date.timeIntervalSince1970) / 60
        return minutes % 4
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            if let analyticsDataString = UserDefaults.shared?.string(forKey: "analytics_data"),
               let analyticsData = try? JSONDecoder().decode(AnalyticsData.self, from: analyticsDataString.data(using: .utf8) ?? Data()) {
                
                HStack {
                    Text("📊 Analytics")
                        .font(.headline)
                        .fontWeight(.bold)
                    Spacer()
                    Text(getViewTitle(currentView))
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                switch currentView {
                case 0:
                    LimitsChartView(limits: analyticsData.limits)
                case 1:
                    WeeklySpendingView(weeklySpending: analyticsData.weeklySpending)
                case 2:
                    CategoryChartView(categories: analyticsData.topCategories)
                default:
                    SavingsView(savings: analyticsData.savings)
                }
                
            } else {
                VStack {
                    Text("📊 Analytics")
                        .font(.headline)
                        .fontWeight(.bold)
                    Text("No analytics data")
                        .foregroundColor(.secondary)
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
        case 2: return "Categories"
        default: return "Savings"
        }
    }
}

struct LimitsChartView: View {
    let limits: [AnalyticsLimit]
    
    var body: some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 8) {
            ForEach(limits.prefix(4), id: \.category) { limit in
                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text(limit.category.capitalized)
                            .font(.caption2)
                            .fontWeight(.medium)
                            .lineLimit(1)
                        Spacer()
                        Text("\(Int(limit.current))/\(Int(limit.amount))")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                    
                    ZStack(alignment: .leading) {
                        RoundedRectangle(cornerRadius: 3)
                            .fill(Color.gray.opacity(0.3))
                            .frame(height: 6)
                        
                        RoundedRectangle(cornerRadius: 3)
                            .fill(limit.current > limit.amount ? .red : .blue)
                            .frame(height: 6)
                            .frame(maxWidth: .infinity)
                            .scaleEffect(x: min(1.0, limit.current / limit.amount), anchor: .leading)
                            .clipped()
                    }
                }
                .padding(.horizontal, 8)
                .padding(.vertical, 6)
                .background(
                    RoundedRectangle(cornerRadius: 8)
                        .fill(Color.primary.opacity(0.05))
                )
            }
        }
    }
}

struct WeeklySpendingView: View {
    let weeklySpending: [Double]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text("Last 7 days")
                    .font(.caption)
                    .foregroundColor(.secondary)
                Spacer()
                Text("Total: \(weeklySpending.reduce(0, +), specifier: "%.0f")zł")
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
                            .fill(.blue)
                            .frame(height: max(4, height))
                        Text(getDayLabel(index))
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                    .frame(maxWidth: .infinity)
                }
            }
        }
    }
    
    private func getDayLabel(_ index: Int) -> String {
        let calendar = Calendar.current
        let today = Date()
        let targetDate = calendar.date(byAdding: .day, value: index - 6, to: today) ?? today
        let dayOfWeek = calendar.component(.weekday, from: targetDate)
        let days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
        return days[(dayOfWeek - 1) % 7]
    }
}

struct CategoryChartView: View {
    let categories: [AnalyticsCategory]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Top spending")
                .font(.caption)
                .foregroundColor(.secondary)
            
            ForEach(categories.prefix(4), id: \.name) { category in
                HStack {
                    Circle()
                        .fill(getCategoryChartColor(category.name))
                        .frame(width: 8, height: 8)
                    Text(category.name)
                        .font(.caption2)
                        .lineLimit(1)
                    Spacer()
                    Text("\(category.amount, specifier: "%.0f")zł")
                        .font(.caption2)
                        .fontWeight(.medium)
                }
            }
        }
    }
    
    private func getCategoryChartColor(_ category: String) -> Color {
        switch category.lowercased() {
        case "food": return .orange
        case "transportation": return .red
        case "shopping": return .purple
        case "entertainment": return .pink
        default: return .blue
        }
    }
}

struct SavingsView: View {
    let savings: AnalyticsSavings
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("Monthly Progress")
                    .font(.caption)
                    .foregroundColor(.secondary)
                Spacer()
                Text("\(savings.savedPercentage, specifier: "%.0f")%")
                    .font(.caption)
                    .fontWeight(.bold)
                    .foregroundColor(savings.savedPercentage > 0 ? .green : .red)
            }
            
            ZStack(alignment: .leading) {
                RoundedRectangle(cornerRadius: 4)
                    .fill(Color.gray.opacity(0.3))
                    .frame(height: 8)
                
                RoundedRectangle(cornerRadius: 4)
                    .fill(savings.savedPercentage > 0 ? .green : .red)
                    .frame(width: abs(savings.savedPercentage) * 2, height: 8)
            }
            
            HStack {
                VStack(alignment: .leading) {
                    Text("Saved")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                    Text("\(savings.savedAmount, specifier: "%.0f")zł")
                        .font(.caption)
                        .fontWeight(.medium)
                        .foregroundColor(.green)
                }
                Spacer()
                VStack(alignment: .trailing) {
                    Text("Target")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                    Text("\(savings.targetAmount, specifier: "%.0f")zł")
                        .font(.caption)
                        .fontWeight(.medium)
                }
            }
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
        .supportedFamilies([.systemMedium])
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
