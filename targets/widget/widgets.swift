import WidgetKit
import SwiftUI

// MARK: - Shared

extension UserDefaults {
    static let shared = UserDefaults(suiteName: "group.com.dmq.mylifemobile")
}

private let widgetBg = Color(red: 0.051, green: 0.059, blue: 0.078)

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

// MARK: - Data Models

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
    let savings: AnalyticsSavings?
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
    let isRepeat: Bool
    let todos: [TimelineTodo]
}

struct TimelineTodo: Codable {
    let id: String
    let title: String
    let isCompleted: Bool
    let modifiedAt: String?
}

// MARK: - Goals Data Models

struct GoalWidgetEntry: Codable {
    let id: String
    let value: Double
    let date: String
}

struct GoalWidgetCategory: Codable {
    let id: String
    let name: String
    let icon: String
    let target: Double
    let color: String
    let unit: String?
    let entries: [GoalWidgetEntry]
}

struct GoalsWidgetData: Codable {
    let categories: [GoalWidgetCategory]
    let lastUpdated: String
}

// MARK: - Shared Widget Components

private struct WidgetLabel: View {
    let text: String
    var body: some View {
        Text(text)
            .font(.system(size: 10, weight: .semibold, design: .rounded))
            .tracking(1.4)
            .foregroundColor(.white.opacity(0.55))
    }
}

private func relativeTimeString(_ isoString: String) -> String {
    let f = DateFormatter()
    f.locale = Locale(identifier: "en_US_POSIX")
    f.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
    f.timeZone = TimeZone(abbreviation: "UTC")
    guard let date = f.date(from: isoString) else { return "" }
    let secs = Int(Date().timeIntervalSince(date))
    if secs < 60 { return "just now" }
    if secs < 3600 { return "\(secs / 60)m ago" }
    if secs < 86400 { return "\(secs / 3600)h ago" }
    return "\(secs / 86400)d ago"
}

private func weekRangeString() -> String {
    let cal = Calendar.current
    let today = Date()
    let weekday = cal.component(.weekday, from: today)
    let daysFromMonday = (weekday == 1) ? 6 : weekday - 2
    guard let monday = cal.date(byAdding: .day, value: -daysFromMonday, to: today) else { return "" }
    let df = DateFormatter()
    df.dateFormat = "MMM d"
    return "\(df.string(from: monday)) – \(df.string(from: today))"
}

private struct WidgetCard<Content: View>: View {
    let content: Content
    init(@ViewBuilder _ content: () -> Content) { self.content = content() }
    var body: some View {
        content
            .padding(.horizontal, 10)
            .padding(.vertical, 8)
            .background(Color.white.opacity(0.13))
            .clipShape(RoundedRectangle(cornerRadius: 11, style: .continuous))
    }
}

private struct WidgetProgressBar: View {
    let value: Double   // 0–1
    let tint: Color
    var body: some View {
        GeometryReader { geo in
            ZStack(alignment: .leading) {
                Capsule().fill(Color.white.opacity(0.2)).frame(height: 5)
                Capsule()
                    .fill(tint)
                    .frame(width: max(4, geo.size.width * min(1, max(0, value))), height: 5)
            }
        }
        .frame(height: 5)
    }
}

// MARK: - Wallet Widget

struct WalletWidgetView: View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            if let str = UserDefaults.shared?.string(forKey: "wallet_data"),
               let data = try? JSONDecoder().decode(WalletData.self, from: str.data(using: .utf8) ?? Data()) {
                walletContent(data)
            } else {
                emptyState("wallet.pass")
            }
            Spacer(minLength: 0)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .padding(14)
    }

    @ViewBuilder
    private func walletContent(_ data: WalletData) -> some View {
        // Header
        HStack(alignment: .top) {
            VStack(alignment: .leading, spacing: 2) {
                WidgetLabel(text: "SPENT THIS MONTH")
                let spent = data.monthlySpent ?? 0
                Text(formatCurrency(spent))
                    .font(.system(size: 32, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
                    .lineLimit(1)
                    .minimumScaleFactor(0.65)
                if let limit = data.monthlyLimit, limit > 0 {
                    let pct = Int((spent / limit) * 100)
                    let over = spent > limit
                    Text(over ? "\(Int(spent - limit)) zł over limit" : "\(Int(limit - spent)) zł left of \(Int(limit)) zł")
                        .font(.system(size: 10, weight: .medium))
                        .foregroundColor(over ? Color(red: 1, green: 0.45, blue: 0.45) : .white.opacity(0.5))
                } else if data.income > 0 {
                    let pct = Int((spent / data.income) * 100)
                    Text("\(pct)% of income")
                        .font(.system(size: 10, weight: .medium))
                        .foregroundColor(.white.opacity(0.5))
                }
            }
            Spacer()
            VStack(alignment: .trailing, spacing: 6) {
                Link(destination: URL(string: "mylife://wallet/create-expense")!) {
                    ZStack {
                        Circle().fill(Color.white.opacity(0.15)).frame(width: 30, height: 30)
                        Image(systemName: "plus").font(.system(size: 13, weight: .bold)).foregroundColor(.white)
                    }
                }
                let updated = relativeTimeString(data.lastUpdated)
                if !updated.isEmpty {
                    Text(updated).font(.system(size: 9)).foregroundColor(.white.opacity(0.35))
                }
            }
        }
        .padding(.bottom, 12)

        // Budget progress bar (medium + large)
        if family != .systemSmall,
           let spent = data.monthlySpent,
           let limit = data.monthlyLimit,
           limit > 0 {
            WidgetProgressBar(
                value: spent / limit,
                tint: spent > limit ? Color(red: 1, green: 0.4, blue: 0.4) : .white
            )
            .padding(.bottom, 10)
        }

        // Expense rows
        let count = family == .systemLarge ? 5 : (family == .systemMedium ? 3 : 2)
        VStack(spacing: 5) {
            ForEach(Array(data.recentExpenses.prefix(count)), id: \.id) { expense in
                Link(destination: URL(string: "mylife://wallet/expense/id/\(expense.id)")!) {
                    expenseRow(expense)
                }
            }
        }

        // Subscriptions (large only)
        if family == .systemLarge,
           let subs = data.upcomingSubscriptions, !subs.isEmpty {
            WidgetLabel(text: "UPCOMING")
                .padding(.top, 14)
                .padding(.bottom, 5)
            VStack(spacing: 5) {
                ForEach(Array(subs.prefix(2)), id: \.id) { sub in
                    WidgetCard {
                        HStack {
                            VStack(alignment: .leading, spacing: 2) {
                                Text(sub.description)
                                    .font(.system(size: 12, weight: .semibold))
                                    .foregroundColor(.white)
                                    .lineLimit(1)
                                Text(formatDate(sub.nextBillingDate))
                                    .font(.system(size: 10))
                                    .foregroundColor(.white.opacity(0.55))
                            }
                            Spacer()
                            Text("–\(formatCurrency(sub.amount))")
                                .font(.system(size: 12, weight: .bold, design: .rounded))
                                .foregroundColor(Color(red: 1, green: 0.8, blue: 0.35))
                        }
                    }
                }
            }
        }
    }

    @ViewBuilder
    private func expenseRow(_ expense: WalletExpense) -> some View {
        WidgetCard {
            HStack(spacing: 10) {
                ZStack {
                    Circle()
                        .fill(Color.white.opacity(0.15))
                        .frame(width: 28, height: 28)
                    Image(systemName: getCategoryIcon(expense.category))
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundColor(.white)
                }
                VStack(alignment: .leading, spacing: 1) {
                    Text(expense.description)
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.white)
                        .lineLimit(1)
                    Text(expense.category.capitalized)
                        .font(.system(size: 10))
                        .foregroundColor(.white.opacity(0.5))
                }
                Spacer()
                Text("\(expense.type == "income" ? "+" : "–")\(formatCurrency(expense.amount))")
                    .font(.system(size: 12, weight: .bold, design: .rounded))
                    .foregroundColor(expense.type == "income" ? Color(red: 0.4, green: 1, blue: 0.65) : .white)
                    .strikethrough(expense.type == "refunded", color: .white.opacity(0.5))
            }
        }
    }

    @ViewBuilder
    private func emptyState(_ icon: String) -> some View {
        VStack(spacing: 6) {
            Image(systemName: icon)
                .font(.system(size: 22, weight: .light))
                .foregroundColor(.white.opacity(0.35))
            Text("No data")
                .font(.system(size: 12))
                .foregroundColor(.white.opacity(0.4))
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private func formatCurrency(_ amount: Double) -> String {
        String(format: amount.truncatingRemainder(dividingBy: 1) == 0 ? "%.0f zł" : "%.2f zł", amount)
    }

    private func formatDate(_ dateString: String) -> String {
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
        if let date = f.date(from: dateString) {
            let d = DateFormatter()
            d.dateFormat = "MMM d"
            return d.string(from: date)
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
}

// MARK: - Timeline Widget

struct TimelineWidgetView: View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            if let str = UserDefaults.shared?.string(forKey: "timeline_data"),
               let data = try? JSONDecoder().decode(TimelineData.self, from: str.data(using: .utf8) ?? Data()) {
                timelineContent(data)
            } else {
                VStack(alignment: .leading, spacing: 2) {
                    WidgetLabel(text: "TIMELINE")
                    Text(todayDateString())
                        .font(.system(size: 32, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                    Text("Nothing scheduled")
                        .font(.system(size: 10, weight: .medium))
                        .foregroundColor(.white.opacity(0.4))
                        .padding(.top, 2)
                }
            }
            Spacer(minLength: 0)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .padding(14)
    }

    @ViewBuilder
    private func timelineContent(_ data: TimelineData) -> some View {
        // Header
        HStack(alignment: .top) {
            VStack(alignment: .leading, spacing: 2) {
                WidgetLabel(text: "TIMELINE")
                Text(todayDateString())
                    .font(.system(size: 32, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
                    .lineLimit(1)
                    .minimumScaleFactor(0.6)
                HStack(spacing: 4) {
                    Text("\(data.completedEvents) / \(data.totalEvents) done")
                        .font(.system(size: 10, weight: .medium))
                        .foregroundColor(.white.opacity(0.5))
                }
            }
            Spacer()
            VStack(alignment: .trailing, spacing: 6) {
                Link(destination: URL(string: "mylife://timeline/create")!) {
                    ZStack {
                        Circle().fill(Color.white.opacity(0.12))
                        if data.totalEvents > 0 {
                            Circle()
                                .stroke(Color.white.opacity(0.2), lineWidth: 3)
                            Circle()
                                .trim(from: 0, to: Double(data.completedEvents) / Double(data.totalEvents))
                                .stroke(Color.white, style: StrokeStyle(lineWidth: 3, lineCap: .round))
                                .rotationEffect(.degrees(-90))
                        }
                        Image(systemName: "plus").font(.system(size: 13, weight: .bold)).foregroundColor(.white)
                    }
                    .frame(width: 30, height: 30)
                }
                let updated = relativeTimeString(data.lastUpdated)
                if !updated.isEmpty {
                    Text(updated).font(.system(size: 9)).foregroundColor(.white.opacity(0.35))
                }
            }
        }
        .padding(.bottom, 12)

        // Events
        let count = family == .systemLarge ? 4 : 2
        VStack(spacing: 5) {
            ForEach(Array(data.events.prefix(count)), id: \.id) { event in
                Link(destination: URL(string: "mylife://timeline/id/\(event.id)")!) {
                    eventRow(event)
                }
            }
        }
    }

    @ViewBuilder
    private func eventRow(_ event: TimelineEvent) -> some View {
        let dimmed = event.isCompleted
        WidgetCard {
            VStack(alignment: .leading, spacing: 6) {
                HStack(spacing: 9) {
                    Image(systemName: event.isCompleted ? "checkmark.circle.fill" : "circle")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(event.isCompleted ? Color(red: 0.4, green: 1, blue: 0.65).opacity(0.6) : .white.opacity(0.7))

                    VStack(alignment: .leading, spacing: 1) {
                        Text(event.title)
                            .font(.system(size: 12, weight: dimmed ? .regular : .semibold))
                            .foregroundColor(.white.opacity(dimmed ? 0.4 : 1))
                            .lineLimit(1)
                            .strikethrough(dimmed, color: .white.opacity(0.3))
                        if !event.description.isEmpty && event.todos.isEmpty {
                            Text(event.description)
                                .font(.system(size: 10))
                                .foregroundColor(.white.opacity(dimmed ? 0.25 : 0.5))
                                .lineLimit(1)
                        }
                    }

                    Spacer()

                    VStack(alignment: .trailing, spacing: 1) {
                        Text(formatEventDate(event.date))
                            .font(.system(size: 10, weight: .medium))
                            .foregroundColor(.white.opacity(dimmed ? 0.25 : 0.55))
                        Text("\(formatTime(event.beginTime))–\(formatTime(event.endTime))")
                            .font(.system(size: 10))
                            .foregroundColor(.white.opacity(dimmed ? 0.2 : 0.4))
                    }
                }

                if !event.todos.isEmpty {
                    let todoCount = family == .systemLarge ? 2 : 1
                    VStack(alignment: .leading, spacing: 3) {
                        ForEach(Array(event.todos.prefix(todoCount)), id: \.id) { todo in
                            HStack(spacing: 6) {
                                Image(systemName: todo.isCompleted ? "checkmark.square.fill" : "square")
                                    .font(.system(size: 10))
                                    .foregroundColor(todo.isCompleted ? Color(red: 0.4, green: 1, blue: 0.65) : .white.opacity(0.4))
                                Text(todo.title)
                                    .font(.system(size: 10))
                                    .foregroundColor(todo.isCompleted ? .white.opacity(0.4) : .white.opacity(0.75))
                                    .strikethrough(todo.isCompleted, color: .white.opacity(0.3))
                                    .lineLimit(1)
                            }
                            .padding(.leading, 6)
                        }
                    }
                }
            }
        }
    }

    private func todayDateString() -> String {
        let df = DateFormatter()
        df.dateFormat = "EEE, MMM d"
        return df.string(from: Date())
    }

    private func formatTime(_ t: String) -> String {
        if t.contains(":") {
            let c = t.split(separator: ":")
            if c.count >= 2 { return "\(c[0]):\(c[1])" }
        }
        return t
    }

    private func formatEventDate(_ dateString: String) -> String {
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd"
        guard let date = f.date(from: dateString) else { return dateString }
        let today = Calendar.current.startOfDay(for: Date())
        let eventDay = Calendar.current.startOfDay(for: date)
        let diff = Calendar.current.dateComponents([.day], from: today, to: eventDay).day ?? 0
        switch diff {
        case 0: return "Today"
        case 1: return "Tomorrow"
        default:
            let d = DateFormatter(); d.dateFormat = "MMM d"
            return d.string(from: date)
        }
    }
}

// MARK: - Analytics Widget

struct AnalyticsWidgetView: View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family

    private var currentView: Int {
        UserDefaults.shared?.integer(forKey: "analytics_view_index") ?? 0
    }

    private var analyticsData: AnalyticsData? {
        guard let str = UserDefaults.shared?.string(forKey: "analytics_data"),
              let data = str.data(using: .utf8),
              let decoded = try? JSONDecoder().decode(AnalyticsData.self, from: data) else { return nil }
        return decoded
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            if let data = analyticsData {
                // Header — compact on medium to maximise chart space
                if family == .systemMedium {
                    HStack(alignment: .center) {
                        VStack(alignment: .leading, spacing: 1) {
                            WidgetLabel(text: "ANALYTICS")
                            Text(viewTitle)
                                .font(.system(size: 20, weight: .bold, design: .rounded))
                                .foregroundColor(.white)
                        }
                        Spacer()
                        HStack(spacing: 8) {
                            HStack(spacing: 3) {
                                ForEach(0..<3, id: \.self) { i in
                                    Circle()
                                        .fill(i == currentView ? Color.white : Color.white.opacity(0.3))
                                        .frame(width: i == currentView ? 5 : 3, height: i == currentView ? 5 : 3)
                                }
                            }
                            Button(intent: SwitchAnalyticsViewIntent()) {
                                ZStack {
                                    Circle().fill(Color.white.opacity(0.15)).frame(width: 26, height: 26)
                                    Image(systemName: "chevron.right").font(.system(size: 10, weight: .bold)).foregroundColor(.white)
                                }
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding(.bottom, 8)
                } else {
                    // Large: full header with subtitle and context
                    HStack(alignment: .top) {
                        VStack(alignment: .leading, spacing: 2) {
                            WidgetLabel(text: "ANALYTICS")
                            Text(viewTitle)
                                .font(.system(size: 32, weight: .bold, design: .rounded))
                                .foregroundColor(.white)
                            Group {
                                if currentView == 0 {
                                    let overCount = data.limits.filter { $0.current > $0.amount }.count
                                    if overCount > 0 {
                                        Text("\(overCount) limit\(overCount > 1 ? "s" : "") exceeded")
                                            .foregroundColor(Color(red: 1, green: 0.45, blue: 0.45))
                                    } else {
                                        Text("All within budget")
                                            .foregroundColor(Color(red: 0.4, green: 1, blue: 0.65))
                                    }
                                } else if currentView == 1 {
                                    let total = data.weeklySpending.reduce(0, +)
                                    Text("\(weekRangeString()) · \(Int(total)) zł")
                                } else {
                                    let total = data.topCategories.reduce(0) { $0 + $1.amount }
                                    Text("Total \(Int(total)) zł this month")
                                }
                            }
                            .font(.system(size: 10, weight: .medium))
                            .foregroundColor(.white.opacity(0.5))
                        }
                        Spacer()
                        VStack(alignment: .trailing, spacing: 6) {
                            Button(intent: SwitchAnalyticsViewIntent()) {
                                ZStack {
                                    Circle().fill(Color.white.opacity(0.15)).frame(width: 30, height: 30)
                                    Image(systemName: "chevron.right").font(.system(size: 11, weight: .bold)).foregroundColor(.white)
                                }
                            }
                            .buttonStyle(.plain)
                            let updated = relativeTimeString(data.lastUpdated)
                            if !updated.isEmpty {
                                Text(updated).font(.system(size: 9)).foregroundColor(.white.opacity(0.35))
                            }
                            HStack(spacing: 4) {
                                ForEach(0..<3, id: \.self) { i in
                                    Circle()
                                        .fill(i == currentView ? Color.white : Color.white.opacity(0.3))
                                        .frame(width: i == currentView ? 6 : 4, height: i == currentView ? 6 : 4)
                                }
                            }
                        }
                    }
                    .padding(.bottom, 10)
                }

                switch currentView {
                case 0:
                    if data.limits.isEmpty {
                        analyticsEmpty("No limits configured", icon: "slider.horizontal.3")
                    } else {
                        LimitsChartView(limits: data.limits, family: family)
                    }
                case 1:
                    if data.weeklySpending.isEmpty || data.weeklySpending.allSatisfy({ $0 == 0 }) {
                        analyticsEmpty("No spending this week", icon: "chart.bar")
                    } else {
                        WeeklySpendingView(analyticsData: data, family: family)
                            .layoutPriority(1)
                    }
                default:
                    if data.topCategories.isEmpty {
                        analyticsEmpty("No category data yet", icon: "tag")
                    } else {
                        CategoryChartView(categories: data.topCategories, family: family)
                    }
                }

            } else {
                VStack(spacing: 6) {
                    WidgetLabel(text: "ANALYTICS")
                    Spacer()
                    Image(systemName: "chart.bar.xaxis")
                        .font(.system(size: 22, weight: .light))
                        .foregroundColor(.white.opacity(0.35))
                    Text("No data available")
                        .font(.system(size: 12))
                        .foregroundColor(.white.opacity(0.4))
                    Spacer()
                }
                .frame(maxWidth: .infinity)
            }
            Spacer(minLength: 0)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .padding(14)
    }

    private var viewTitle: String {
        switch currentView {
        case 0: return "Limits"
        case 1: return "Weekly"
        default: return "Categories"
        }
    }

    @ViewBuilder
    private func analyticsEmpty(_ message: String, icon: String) -> some View {
        VStack(spacing: 6) {
            Image(systemName: icon)
                .font(.system(size: 20, weight: .light))
                .foregroundColor(.white.opacity(0.35))
            Text(message)
                .font(.system(size: 11))
                .foregroundColor(.white.opacity(0.4))
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

// MARK: - Limits Chart

struct LimitsChartView: View {
    let limits: [AnalyticsLimit]
    let family: WidgetFamily

    var body: some View {
        if family == .systemLarge {
            // Full card view for large
            VStack(spacing: 7) {
                ForEach(Array(limits.prefix(6)), id: \.category) { limit in
                    let pct = limit.amount > 0 ? limit.current / limit.amount : 0
                    let over = limit.current > limit.amount
                    let tint: Color = over ? Color(red: 1, green: 0.4, blue: 0.4) : .white
                    WidgetCard {
                        VStack(spacing: 5) {
                            HStack(spacing: 8) {
                                Image(systemName: getCategorySystemIcon(limit.category))
                                    .font(.system(size: 11, weight: .semibold))
                                    .foregroundColor(.white)
                                    .frame(width: 16)
                                Text(limit.category.capitalized)
                                    .font(.system(size: 12, weight: .semibold))
                                    .foregroundColor(.white)
                                    .lineLimit(1)
                                Spacer()
                                Text("\(Int(limit.current)) / \(Int(limit.amount)) zł")
                                    .font(.system(size: 10, weight: .semibold, design: .rounded))
                                    .foregroundColor(over ? Color(red: 1, green: 0.5, blue: 0.5) : .white.opacity(0.7))
                            }
                            WidgetProgressBar(value: pct, tint: tint)
                        }
                    }
                }
            }
        } else {
            // Compact rows for medium — fits 5 items
            VStack(spacing: 6) {
                ForEach(Array(limits.prefix(5)), id: \.category) { limit in
                    let pct = limit.amount > 0 ? limit.current / limit.amount : 0
                    let over = limit.current > limit.amount
                    let tint: Color = over ? Color(red: 1, green: 0.4, blue: 0.4) : .white
                    VStack(spacing: 3) {
                        HStack(spacing: 7) {
                            Image(systemName: getCategorySystemIcon(limit.category))
                                .font(.system(size: 10, weight: .semibold))
                                .foregroundColor(.white.opacity(0.75))
                                .frame(width: 13)
                            Text(limit.category.capitalized)
                                .font(.system(size: 11, weight: .semibold))
                                .foregroundColor(.white)
                                .lineLimit(1)
                            Spacer()
                            Text("\(Int(limit.current)) / \(Int(limit.amount)) zł")
                                .font(.system(size: 10, weight: .medium, design: .rounded))
                                .foregroundColor(over ? Color(red: 1, green: 0.5, blue: 0.5) : .white.opacity(0.55))
                        }
                        WidgetProgressBar(value: pct, tint: tint)
                    }
                }
            }
        }
    }

    private func getCategorySystemIcon(_ category: String) -> String {
        let name = category.split(separator: ":").last.map(String.init) ?? category
        switch name.lowercased() {
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
}

// MARK: - Weekly Spending

struct WeeklySpendingView: View {
    let analyticsData: AnalyticsData
    let family: WidgetFamily

    private var weeklySpending: [Double] { analyticsData.weeklySpending }

    var body: some View {
        let maxVal = weeklySpending.max() ?? 1
        let todayIdx = currentDayIndex()
        let isLarge = family == .systemLarge

        GeometryReader { geo in
            let dayLabelH: CGFloat = 13
            let valueH: CGFloat = isLarge ? 13 : 0
            let spacing: CGFloat = isLarge ? 8 : 4 // spacing above and below bar
            let barMaxH = max(20, geo.size.height - dayLabelH - valueH - spacing)

            HStack(alignment: .bottom, spacing: 0) {
                ForEach(0..<min(7, weeklySpending.count), id: \.self) { i in
                    let h = CGFloat(weeklySpending[i] / maxVal) * barMaxH
                    let isToday = i == todayIdx
                    let isFuture = i > todayIdx
                    let barOpacity: Double = isToday ? 1.0 : isFuture ? 0.15 : max(0.25, 0.6 - Double(todayIdx - i) * 0.06)
                    VStack(spacing: 4) {
                        if isLarge {
                            if weeklySpending[i] > 0 {
                                Text("\(Int(weeklySpending[i]))")
                                    .font(.system(size: 9, weight: isToday ? .bold : .regular, design: .rounded))
                                    .foregroundColor(.white.opacity(isToday ? 0.9 : 0.45))
                            } else {
                                Text(" ").font(.system(size: 9))
                            }
                        }
                        RoundedRectangle(cornerRadius: 5, style: .continuous)
                            .fill(Color.white.opacity(barOpacity))
                            .frame(height: max(4, h))
                        Text(getDayLabel(i))
                            .font(.system(size: 9, weight: isToday ? .bold : .regular))
                            .foregroundColor(.white.opacity(isToday ? 1 : 0.45))
                    }
                    .frame(maxWidth: .infinity)
                }
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private func getDayLabel(_ index: Int) -> String {
        ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"][index % 7]
    }

    private func currentDayIndex() -> Int {
        let wd = Calendar.current.component(.weekday, from: Date())
        return (wd == 1) ? 6 : wd - 2
    }
}

// MARK: - Category Chart

struct CategoryChartView: View {
    let categories: [AnalyticsCategory]
    let family: WidgetFamily

    var body: some View {
        let total = categories.reduce(0) { $0 + $1.amount }
        let maxAmt = categories.max(by: { $0.amount < $1.amount })?.amount ?? 1
        if family == .systemLarge {
            VStack(spacing: 7) {
                ForEach(Array(categories.prefix(6)), id: \.name) { cat in
                    let pct = total > 0 ? cat.amount / total : 0
                    WidgetCard {
                        VStack(spacing: 5) {
                            HStack(spacing: 8) {
                                Image(systemName: getCategorySystemIcon(cat.name))
                                    .font(.system(size: 11, weight: .semibold))
                                    .foregroundColor(.white)
                                    .frame(width: 16)
                                Text((cat.name.split(separator: ":").last.map(String.init) ?? cat.name).capitalized)
                                    .font(.system(size: 12, weight: .semibold))
                                    .foregroundColor(.white)
                                    .lineLimit(1)
                                Spacer()
                                Text("\(Int(pct * 100))%")
                                    .font(.system(size: 10, weight: .medium))
                                    .foregroundColor(.white.opacity(0.55))
                                Text("\(Int(cat.amount)) zł")
                                    .font(.system(size: 12, weight: .bold, design: .rounded))
                                    .foregroundColor(.white)
                            }
                            WidgetProgressBar(value: cat.amount / maxAmt, tint: .white.opacity(0.85))
                        }
                    }
                }
            }
        } else {
            // Compact rows for medium — fits 5 items without card background
            VStack(spacing: 6) {
                ForEach(Array(categories.prefix(5)), id: \.name) { cat in
                    let pct = total > 0 ? cat.amount / total : 0
                    VStack(spacing: 3) {
                        HStack(spacing: 7) {
                            Image(systemName: getCategorySystemIcon(cat.name))
                                .font(.system(size: 10, weight: .semibold))
                                .foregroundColor(.white.opacity(0.75))
                                .frame(width: 13)
                            Text(cat.name.capitalized)
                                .font(.system(size: 11, weight: .semibold))
                                .foregroundColor(.white)
                                .lineLimit(1)
                            Spacer()
                            Text("\(Int(pct * 100))%")
                                .font(.system(size: 10, weight: .medium))
                                .foregroundColor(.white.opacity(0.55))
                            Text("\(Int(cat.amount)) zł")
                                .font(.system(size: 11, weight: .bold, design: .rounded))
                                .foregroundColor(.white)
                        }
                        WidgetProgressBar(value: cat.amount / maxAmt, tint: .white.opacity(0.85))
                    }
                }
            }
        }
    }

    private func getCategorySystemIcon(_ category: String) -> String {
        let name = category.split(separator: ":").last.map(String.init) ?? category
        switch name.lowercased() {
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
}

// MARK: - Daily Routine Widget

struct RoutineEntry: TimelineEntry {
    let date: Date
    let configuration: ConfigurationAppIntent
}

struct RoutineProvider: AppIntentTimelineProvider {
    func placeholder(in context: Context) -> RoutineEntry {
        RoutineEntry(date: Date(), configuration: ConfigurationAppIntent())
    }

    func snapshot(for configuration: ConfigurationAppIntent, in context: Context) async -> RoutineEntry {
        RoutineEntry(date: Date(), configuration: configuration)
    }

    func timeline(for configuration: ConfigurationAppIntent, in context: Context) async -> Timeline<RoutineEntry> {
        var entries: [RoutineEntry] = []
        let now = Date()
        entries.append(RoutineEntry(date: now, configuration: configuration))

        // Schedule a new entry at each future event's beginTime so the widget
        // automatically reveals events as they unlock throughout the day
        if let str = UserDefaults.shared?.string(forKey: "timeline_data"),
           let raw = str.data(using: .utf8),
           let data = try? JSONDecoder().decode(TimelineData.self, from: raw) {
            let today = Calendar.current.startOfDay(for: now)
            let todayStr: String = {
                let f = DateFormatter(); f.dateFormat = "yyyy-MM-dd"; return f.string(from: now)
            }()
            for event in data.events where event.date == todayStr {
                if let begin = routineParseTime(event.beginTime, on: today) {
                    let showFrom = begin.addingTimeInterval(-30 * 60)
                    if showFrom > now { entries.append(RoutineEntry(date: showFrom, configuration: configuration)) }
                }
                if let end = routineParseTime(event.endTime, on: today) {
                    let hideAt = end.addingTimeInterval(30 * 60)
                    if hideAt > now { entries.append(RoutineEntry(date: hideAt, configuration: configuration)) }
                }
            }
        }

        // Refresh at midnight each day so the next day's events load (3 days stored)
        for dayOffset in 1...2 {
            let midnight = Calendar.current.startOfDay(
                for: Calendar.current.date(byAdding: .day, value: dayOffset, to: now)!
            )
            entries.append(RoutineEntry(date: midnight, configuration: configuration))
        }

        return Timeline(entries: entries.sorted { $0.date < $1.date }, policy: .atEnd)
    }
}

private func routineParseTime(_ timeString: String, on day: Date) -> Date? {
    let parts = timeString.split(separator: ":")
    guard parts.count >= 2,
          let hour = Int(parts[0]),
          let minute = Int(parts[1]) else { return nil }
    return Calendar.current.date(bySettingHour: hour, minute: minute, second: 0, of: day)
}

struct DailyRoutineWidgetView: View {
    var entry: RoutineProvider.Entry
    @Environment(\.widgetFamily) var family

    private var data: TimelineData? {
        guard let str = UserDefaults.shared?.string(forKey: "timeline_data"),
              let raw = str.data(using: .utf8),
              let decoded = try? JSONDecoder().decode(TimelineData.self, from: raw) else { return nil }
        return decoded
    }

    // All events for today sorted by beginTime
    private var todayEvents: [TimelineEvent] {
        guard let data else { return [] }
        let todayStr = iso8601DateOnly(entry.date)
        return data.events
            .filter { $0.date == todayStr }
            .sorted { $0.beginTime < $1.beginTime }
    }

    // All today's events (alias kept for checklist body)
    private var unlockedEvents: [TimelineEvent] { todayEvents }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            headerView
            Spacer().frame(height: 10)
            if family == .systemSmall {
                smallBody
            } else {
                checklistBody
            }
            Spacer(minLength: 0)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .padding(14)
    }

    // MARK: Header

    @ViewBuilder
    private var headerView: some View {
        let total = totalAllItems
        let done = doneItems
        let allDone = allDoneCheck

        HStack(alignment: .top) {
            VStack(alignment: .leading, spacing: 2) {
                WidgetLabel(text: "DAILY ROUTINE")
                if todayEvents.isEmpty {
                    Text("Nothing today")
                        .font(.system(size: 26, weight: .bold, design: .rounded))
                        .foregroundColor(.white.opacity(0.35))
                } else {
                    HStack(alignment: .firstTextBaseline, spacing: 4) {
                        Text("\(done)")
                            .font(.system(size: 32, weight: .bold, design: .rounded))
                            .foregroundColor(allDone ? Color(red: 0.4, green: 1, blue: 0.65) : .white)
                        Text("/ \(total)")
                            .font(.system(size: 20, weight: .medium, design: .rounded))
                            .foregroundColor(.white.opacity(0.35))
                    }
                }
            }
            Spacer()
            Link(destination: URL(string: "mylife://timeline")!) {
                ZStack {
                    Circle()
                        .stroke(Color.white.opacity(0.15), lineWidth: 3)
                    if total > 0 {
                        Circle()
                            .trim(from: 0, to: Double(done) / Double(total))
                            .stroke(
                                allDone ? Color(red: 0.4, green: 1, blue: 0.65) : Color.white,
                                style: StrokeStyle(lineWidth: 3, lineCap: .round)
                            )
                            .rotationEffect(.degrees(-90))
                    }
                    Circle().fill(Color.white.opacity(0.12)).frame(width: 26, height: 26)
                    Image(systemName: "calendar")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(.white)
                }
                .frame(width: 34, height: 34)
            }
        }
    }

    // MARK: Small (progress only)

    @ViewBuilder
    private var smallBody: some View {
        if todayEvents.isEmpty {
            VStack(spacing: 4) {
                Image(systemName: "calendar.badge.checkmark")
                    .font(.system(size: 16, weight: .light))
                    .foregroundColor(.white.opacity(0.25))
                Text("No routine\ntoday")
                    .font(.system(size: 10))
                    .foregroundColor(.white.opacity(0.25))
                    .multilineTextAlignment(.center)
                    .lineLimit(2)
            }
        } else {
            let done = doneItems
            let unlocked = totalItems
            VStack(alignment: .leading, spacing: 8) {
                WidgetProgressBar(value: totalAllItems > 0 ? Double(done) / Double(totalAllItems) : 0, tint: Color(red: 0.4, green: 1, blue: 0.65))
                VStack(alignment: .leading, spacing: 4) {
                    ForEach(Array(unlockedEvents.prefix(2)), id: \.id) { event in
                        HStack(spacing: 6) {
                            Image(systemName: event.isCompleted ? "checkmark.circle.fill" : "circle")
                                .font(.system(size: 11))
                                .foregroundColor(event.isCompleted ? Color(red: 0.4, green: 1, blue: 0.65) : .white.opacity(0.5))
                            Text(event.title)
                                .font(.system(size: 11, weight: event.isCompleted ? .regular : .medium))
                                .foregroundColor(.white.opacity(event.isCompleted ? 0.35 : 0.9))
                                .strikethrough(event.isCompleted, color: .white.opacity(0.3))
                                .lineLimit(1)
                        }
                    }
                    if unlocked > 2 {
                        Text("+\(unlocked - 2) more")
                            .font(.system(size: 10))
                            .foregroundColor(.white.opacity(0.3))
                    }
                }
            }
        }
    }

    // MARK: Medium / Large checklist

    @ViewBuilder
    private var checklistBody: some View {
        if todayEvents.isEmpty {
            HStack(spacing: 8) {
                Image(systemName: "calendar.badge.checkmark")
                    .font(.system(size: 14, weight: .light))
                    .foregroundColor(.white.opacity(0.3))
                Text("Nothing scheduled for today")
                    .font(.system(size: 11))
                    .foregroundColor(.white.opacity(0.3))
                    .lineLimit(2)
            }
        } else {
            VStack(spacing: 6) {
                ForEach(unlockedEvents, id: \.id) { event in
                    routineRow(event)
                }
            }
            if allDoneCheck {
                HStack(spacing: 5) {
                    Image(systemName: "checkmark.seal.fill")
                        .font(.system(size: 11))
                        .foregroundColor(Color(red: 0.4, green: 1, blue: 0.65))
                    Text("All done for today!")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundColor(Color(red: 0.4, green: 1, blue: 0.65))
                }
                .padding(.top, 6)
            }
        }
    }

    // MARK: Item counts (todos-aware)

    private var doneItems: Int {
        unlockedEvents.reduce(0) { acc, event in
            event.todos.isEmpty ? acc + (event.isCompleted ? 1 : 0) : acc + event.todos.filter { $0.isCompleted }.count
        }
    }

    private var totalItems: Int {
        unlockedEvents.reduce(0) { $0 + ($1.todos.isEmpty ? 1 : $1.todos.count) }
    }

    private var totalAllItems: Int {
        todayEvents.reduce(0) { $0 + ($1.todos.isEmpty ? 1 : $1.todos.count) }
    }

    private var allDoneCheck: Bool { totalItems > 0 && doneItems == totalItems }

    // MARK: Checkbox shape

    @ViewBuilder
    private func checkboxShape(completed: Bool) -> some View {
        ZStack {
            RoundedRectangle(cornerRadius: 5, style: .continuous)
                .fill(completed
                    ? Color(red: 0.4, green: 1, blue: 0.65).opacity(0.2)
                    : Color.white.opacity(0.12))
                .frame(width: 22, height: 22)
            if completed {
                Image(systemName: "checkmark")
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(Color(red: 0.4, green: 1, blue: 0.65))
            }
        }
    }

    // MARK: Rows

    @ViewBuilder
    private func routineRow(_ event: TimelineEvent) -> some View {
        if event.todos.isEmpty {
            // Event with no todos — one checkbox for the whole event
            WidgetCard {
                HStack(spacing: 10) {
                    Button(intent: ToggleRoutineEventIntent(eventId: event.id)) {
                        checkboxShape(completed: event.isCompleted)
                    }
                    .buttonStyle(.plain)
                    Text(event.title)
                        .font(.system(size: 13, weight: event.isCompleted ? .regular : .semibold))
                        .foregroundColor(.white.opacity(event.isCompleted ? 0.35 : 1))
                        .strikethrough(event.isCompleted, color: .white.opacity(0.25))
                        .lineLimit(1)
                    Spacer()
                    Text(routineFormatTime(event.beginTime))
                        .font(.system(size: 10, weight: .medium, design: .rounded))
                        .foregroundColor(.white.opacity(event.isCompleted ? 0.2 : 0.45))
                }
            }
        } else {
            // Event with todos — group header + one row per todo
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(event.title)
                        .font(.system(size: 10, weight: .semibold))
                        .foregroundColor(.white.opacity(0.45))
                        .lineLimit(1)
                    Spacer()
                    Text(routineFormatTime(event.beginTime))
                        .font(.system(size: 9, weight: .medium, design: .rounded))
                        .foregroundColor(.white.opacity(0.3))
                }
                .padding(.horizontal, 10)
                .padding(.vertical, 5)
                .background(Color.white.opacity(0.06))
                .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))

                ForEach(event.todos, id: \.id) { todo in
                    routineTodoRow(todo, eventId: event.id, date: event.date)
                }
            }
        }
    }

    @ViewBuilder
    private func routineTodoRow(_ todo: TimelineTodo, eventId: String, date: String) -> some View {
        WidgetCard {
            HStack(spacing: 10) {
                Button(intent: ToggleRoutineTodoIntent(todoId: todo.id, eventId: eventId, date: date, newIsCompleted: !todo.isCompleted)) {
                    checkboxShape(completed: todo.isCompleted)
                }
                .buttonStyle(.plain)
                VStack(alignment: .leading, spacing: 1) {
                    Text(todo.title)
                        .font(.system(size: 13, weight: todo.isCompleted ? .regular : .semibold))
                        .foregroundColor(.white.opacity(todo.isCompleted ? 0.35 : 1))
                        .strikethrough(todo.isCompleted, color: .white.opacity(0.25))
                        .lineLimit(1)
                    if todo.isCompleted, let at = todo.modifiedAt, let timeStr = parseTodoTime(at) {
                        Text("Done at \(timeStr)")
                            .font(.system(size: 9))
                            .foregroundColor(.white.opacity(0.3))
                    }
                }
                Spacer()
            }
        }
    }

    private func parseTodoTime(_ iso: String) -> String? {
        let f = ISO8601DateFormatter()
        f.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        guard let date = f.date(from: iso) else { return nil }
        let d = DateFormatter()
        d.dateFormat = "HH:mm"
        return d.string(from: date)
    }

    // MARK: Helpers

    private func routineFormatTime(_ t: String) -> String {
        let parts = t.split(separator: ":")
        guard parts.count >= 2 else { return t }
        return "\(parts[0]):\(parts[1])"
    }

    private func iso8601DateOnly(_ date: Date) -> String {
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd"
        return f.string(from: date)
    }
}

// MARK: - Contribution Grid

private struct ContributionGridView: View {
    let entries: [GoalWidgetEntry]
    let target: Double
    let color: Color
    let weeks: Int
    let cellSize: CGFloat
    let cellSpacing: CGFloat
    let weekSpacing: CGFloat

    private var gridData: (entries: [[(value: Double, goalMet: Bool)]], startDate: Date) {
        let cal = Calendar.current
        let today = cal.startOfDay(for: Date())
        let weekday = cal.component(.weekday, from: today)
        let daysFromSunday = weekday - 1
        guard let thisSunday = cal.date(byAdding: .day, value: -daysFromSunday, to: today),
              let startDate = cal.date(byAdding: .day, value: -(weeks - 1) * 7, to: thisSunday) else {
            return ([], Date())
        }

        let map: [String: Double] = Dictionary(entries.map { ($0.date, $0.value) }) { _, latest in latest }

        var result: [[(value: Double, goalMet: Bool)]] = []
        var current = startDate
        let df = DateFormatter()
        df.dateFormat = "yyyy-MM-dd"

        for _ in 0..<weeks {
            var week: [(Double, Bool)] = []
            for _ in 0..<7 {
                let key = df.string(from: current)
                let value = map[key] ?? 0
                week.append((value, value >= target))
                current = cal.date(byAdding: .day, value: 1, to: current)!
            }
            result.append(week)
        }
        return (result, startDate)
    }

    var body: some View {
        HStack(spacing: weekSpacing) {
            ForEach(0..<gridData.entries.count, id: \.self) { weekIndex in
                let week = gridData.entries[weekIndex]
                VStack(spacing: cellSpacing) {
                    ForEach(0..<week.count, id: \.self) { dayIndex in
                        let (value, goalMet) = week[dayIndex]
                        RoundedRectangle(cornerRadius: max(1, cellSize * 0.22), style: .continuous)
                            .fill(cellColor(value: value, goalMet: goalMet))
                            .frame(width: cellSize, height: cellSize)
                    }
                }
            }
        }
    }

    private func cellColor(value: Double, goalMet: Bool) -> Color {
        if value == 0 { return Color.white.opacity(0.08) }
        if goalMet { return color }
        return color.opacity(0.15)
    }
}

// MARK: - Goals Widget

struct GoalsWidgetView: View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family

    private var data: GoalsWidgetData? {
        guard let str = UserDefaults.shared?.string(forKey: "goals_data"),
              let raw = str.data(using: .utf8),
              let decoded = try? JSONDecoder().decode(GoalsWidgetData.self, from: raw) else { return nil }
        return decoded
    }

    private var selectedIndex: Int {
        let idx = UserDefaults.shared?.integer(forKey: "goals_view_index") ?? 0
        guard let data else { return 0 }
        return min(idx, max(0, data.categories.count - 1))
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            if let data, !data.categories.isEmpty {
                goalsContent(data)
            } else {
                emptyState
            }
            Spacer(minLength: 0)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .padding(10)
    }

    private func gridParams(isLarge: Bool) -> (visibleCount: Int, gridWeeks: Int, cellSz: CGFloat, cellSp: CGFloat, weekSp: CGFloat) {
        isLarge
            ? (min(3, data?.categories.count ?? 1), 27, 9, 2, 3)
            : (1, 27, 9.5, 2, 3)
    }

    @ViewBuilder
    private func goalsContent(_ data: GoalsWidgetData) -> some View {
        let isLarge = family == .systemLarge
        let total = data.categories.count
        let params = gridParams(isLarge: isLarge)

        VStack(spacing: isLarge ? 6 : 0) {
            ForEach(0..<params.visibleCount, id: \.self) { i in
                let idx = (selectedIndex + i) % total
                goalCard(data.categories[idx], gridWeeks: params.gridWeeks, cellSz: params.cellSz, cellSp: params.cellSp, weekSp: params.weekSp)
            }
        }

        if isLarge, total > 3 {
            HStack {
                Spacer()
                Button(intent: SwitchGoalsIntent()) {
                    HStack(spacing: 3) {
                        ForEach(0..<(total + 2) / 3, id: \.self) { page in
                            Circle()
                                .fill(page == selectedIndex / 3 ? Color.white : Color.white.opacity(0.3))
                                .frame(width: 4, height: 4)
                        }
                    }
                }
                .buttonStyle(.plain)
            }
            .padding(.top, 2)
        }
    }

    // MARK: - Single goal card (used for both medium and large)

    private func goalCard(_ cat: GoalWidgetCategory, gridWeeks: Int, cellSz: CGFloat, cellSp: CGFloat, weekSp: CGFloat) -> some View {
        let goalColor = Color(hex: cat.color) ?? .white
        let todayVal = todayValue(cat)
        let today = todayDateString()

        return VStack(alignment: .leading, spacing: 2) {
            // Top row: icon + name on left, [- value +] on right
            HStack(spacing: 0) {
                HStack(spacing: 4) {
                    Image(systemName: cat.icon)
                        .font(.system(size: 10, weight: .semibold))
                        .foregroundColor(goalColor)
                    Text(cat.name)
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundColor(.white)
                        .lineLimit(1)
                }
                Spacer()
                HStack(spacing: 6) {
                    Button(intent: UpdateGoalValueIntent(goalId: cat.id, date: today, currentValue: todayVal, delta: -1)) {
                        ZStack {
                            Circle()
                                .fill(Color.white.opacity(0.1))
                                .frame(width: 20, height: 20)
                            Image(systemName: "minus")
                                .font(.system(size: 8, weight: .bold))
                                .foregroundColor(.white.opacity(0.55))
                        }
                    }
                    .buttonStyle(.plain)

                    HStack(alignment: .firstTextBaseline, spacing: 2) {
                        Text("\(Int(todayVal))")
                            .font(.system(size: 12, weight: .bold, design: .rounded))
                            .foregroundColor(todayVal >= cat.target ? goalColor : .white)
                        if let u = cat.unit, !u.isEmpty {
                            Text(u)
                                .font(.system(size: 9))
                                .foregroundColor(.white.opacity(0.4))
                        }
                    }

                    Button(intent: UpdateGoalValueIntent(goalId: cat.id, date: today, currentValue: todayVal, delta: 1)) {
                        ZStack {
                            Circle()
                                .fill(goalColor.opacity(0.2))
                                .frame(width: 20, height: 20)
                            Image(systemName: "plus")
                                .font(.system(size: 8, weight: .bold))
                                .foregroundColor(goalColor)
                        }
                    }
                    .buttonStyle(.plain)
                }
            }

            // Grid
            ContributionGridView(
                entries: cat.entries,
                target: cat.target,
                color: goalColor,
                weeks: gridWeeks,
                cellSize: cellSz,
                cellSpacing: cellSp,
                weekSpacing: weekSp
            )
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 6)
        .background(Color.white.opacity(0.08))
        .clipShape(RoundedRectangle(cornerRadius: 11, style: .continuous))
    }

    private var emptyState: some View {
        VStack(spacing: 6) {
            Image(systemName: "target")
                .font(.system(size: 22, weight: .light))
                .foregroundColor(.white.opacity(0.35))
            Text("No goals yet")
                .font(.system(size: 12))
                .foregroundColor(.white.opacity(0.4))
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private func todayDateString() -> String {
        let df = DateFormatter()
        df.dateFormat = "yyyy-MM-dd"
        return df.string(from: Date())
    }

    private func todayValue(_ cat: GoalWidgetCategory) -> Double {
        let today = todayDateString()
        return cat.entries.first(where: { $0.date == today })?.value ?? 0
    }

    private func streakLabel(_ cat: GoalWidgetCategory) -> String {
        let cal = Calendar.current
        let df = DateFormatter()
        df.dateFormat = "yyyy-MM-dd"
        let map: [String: Double] = Dictionary(cat.entries.map { ($0.date, $0.value) }) { _, latest in latest }
        var streak = 0
        var day = cal.startOfDay(for: Date())
        // Walk backwards from yesterday
        day = cal.date(byAdding: .day, value: -1, to: day)!
        while true {
            let key = df.string(from: day)
            guard let val = map[key], val >= cat.target else { break }
            streak += 1
            guard let prev = cal.date(byAdding: .day, value: -1, to: day) else { break }
            day = prev
        }
        return "\(streak)d streak"
    }
}

// MARK: - Color Hex Helper

extension Color {
    init?(hex: String) {
        var str = hex.trimmingCharacters(in: .whitespacesAndNewlines).uppercased()
        if str.hasPrefix("#") { str.removeFirst() }
        guard str.count == 6,
              let num = UInt64(str, radix: 16) else { return nil }
        self.init(
            red: Double((num >> 16) & 0xFF) / 255,
            green: Double((num >> 8) & 0xFF) / 255,
            blue: Double(num & 0xFF) / 255
        )
    }
}

// MARK: - Widget Configurations

struct WalletWidget: Widget {
    let kind: String = "WalletWidget"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: kind, intent: ConfigurationAppIntent.self, provider: Provider()) { entry in
            WalletWidgetView(entry: entry)
                .containerBackground(widgetBg, for: .widget)
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
                .containerBackground(widgetBg, for: .widget)
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
                .containerBackground(widgetBg, for: .widget)
        }
        .configurationDisplayName("Timeline")
        .description("View your schedule and tasks")
    }
}

struct DailyRoutineWidget: Widget {
    let kind: String = "DailyRoutineWidget"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: kind, intent: ConfigurationAppIntent.self, provider: RoutineProvider()) { entry in
            DailyRoutineWidgetView(entry: entry)
                .containerBackground(widgetBg, for: .widget)
        }
        .configurationDisplayName("Daily Routine")
        .description("Check off your recurring daily events as they unlock")
    }
}

// MARK: - Watch Expense Widget

struct WatchExpenseWidgetView: View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
        if family == .accessoryCircular {
            accessoryCircularView
        } else {
            iosWidgetView
        }
    }

    @ViewBuilder
    private var accessoryCircularView: some View {
        if let str = UserDefaults.shared?.string(forKey: "wallet_data"),
           let data = try? JSONDecoder().decode(WalletData.self, from: str.data(using: .utf8) ?? Data()) {

            let income = data.income
            let spent = data.monthlySpent ?? 0
            let limit = data.monthlyLimit ?? (income * data.monthlyPercentageTarget / 100)

            ZStack {
                Circle()
                    .trim(from: 0, to: savedProgress(income: income, spent: spent))
                    .stroke(Color(red: 0.0, green: 0.78, blue: 0.59), style: StrokeStyle(lineWidth: 6, lineCap: .round))
                    .rotationEffect(.degrees(-90))
                Circle()
                    .trim(from: 0, to: budgetRemainingProgress(limit: limit, spent: spent))
                    .stroke(Color(red: 0.53, green: 0.52, blue: 0.94), style: StrokeStyle(lineWidth: 6, lineCap: .round))
                    .rotationEffect(.degrees(-90))
                    .padding(8)
                Circle()
                    .trim(from: 0, to: spentProgress(income: income, spent: spent))
                    .stroke(Color(red: 0.20, green: 0.64, blue: 0.98), style: StrokeStyle(lineWidth: 6, lineCap: .round))
                    .rotationEffect(.degrees(-90))
                    .padding(16)
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
                Circle().stroke(Color.gray.opacity(0.3), lineWidth: 6)
                Text("--").font(.system(size: 16, weight: .bold))
            }
        }
    }

    @ViewBuilder
    private var iosWidgetView: some View {
        if let str = UserDefaults.shared?.string(forKey: "wallet_data"),
           let data = try? JSONDecoder().decode(WalletData.self, from: str.data(using: .utf8) ?? Data()) {

            let income = data.income
            let spent = data.monthlySpent ?? 0
            let limit = data.monthlyLimit ?? (income * data.monthlyPercentageTarget / 100)
            let saved = income - spent

            VStack(alignment: .leading, spacing: 0) {
                // Header
                VStack(alignment: .leading, spacing: 2) {
                    WidgetLabel(text: "SPENDING")
                    Text("\(Int(spent)) zł")
                        .font(.system(size: family == .systemSmall ? 26 : 30, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                }
                .padding(.bottom, 12)

                if family == .systemLarge {
                    HStack(alignment: .center, spacing: 20) {
                        ZStack {
                            Circle()
                                .stroke(Color.white.opacity(0.12), lineWidth: 9)
                            Circle()
                                .trim(from: 0, to: savedProgress(income: income, spent: spent))
                                .stroke(Color(red: 0.4, green: 1, blue: 0.65), style: StrokeStyle(lineWidth: 9, lineCap: .round))
                                .rotationEffect(.degrees(-90))
                            Circle()
                                .stroke(Color.white.opacity(0.12), lineWidth: 9)
                                .padding(14)
                            Circle()
                                .trim(from: 0, to: budgetRemainingProgress(limit: limit, spent: spent))
                                .stroke(Color.white.opacity(0.75), style: StrokeStyle(lineWidth: 9, lineCap: .round))
                                .rotationEffect(.degrees(-90))
                                .padding(14)
                            Circle()
                                .stroke(Color.white.opacity(0.12), lineWidth: 9)
                                .padding(28)
                            Circle()
                                .trim(from: 0, to: spentProgress(income: income, spent: spent))
                                .stroke(Color(red: 1, green: 0.8, blue: 0.35), style: StrokeStyle(lineWidth: 9, lineCap: .round))
                                .rotationEffect(.degrees(-90))
                                .padding(28)
                        }
                        .aspectRatio(1, contentMode: .fit)

                        VStack(alignment: .leading, spacing: 14) {
                            ringLegend(color: Color(red: 1, green: 0.8, blue: 0.35), label: "Spent", value: "\(Int(spent)) zł")
                            ringLegend(color: .white.opacity(0.75), label: "Budget left", value: "\(Int(max(0, limit - spent))) zł")
                            ringLegend(color: Color(red: 0.4, green: 1, blue: 0.65), label: "Saved", value: "\(Int(saved)) zł")
                        }
                        .frame(maxWidth: 130, alignment: .leading)
                    }
                    .padding(.vertical, 6)

                    HStack {
                        statBlock(label: "Income", value: "\(Int(income)) zł")
                        Spacer()
                        statBlock(label: "Budget", value: "\(Int(limit)) zł")
                        Spacer()
                        statBlock(label: "Save rate", value: "\(Int(savedProgress(income: income, spent: spent) * 100))%")
                    }
                    .padding(.top, 12)
                    .padding(.horizontal, 2)
                } else {
                    HStack(spacing: 14) {
                        ZStack {
                            Circle()
                                .stroke(Color.white.opacity(0.12), lineWidth: 7)
                            Circle()
                                .trim(from: 0, to: savedProgress(income: income, spent: spent))
                                .stroke(Color(red: 0.4, green: 1, blue: 0.65), style: StrokeStyle(lineWidth: 7, lineCap: .round))
                                .rotationEffect(.degrees(-90))
                            Circle()
                                .stroke(Color.white.opacity(0.12), lineWidth: 7)
                                .padding(10)
                            Circle()
                                .trim(from: 0, to: budgetRemainingProgress(limit: limit, spent: spent))
                                .stroke(Color.white.opacity(0.75), style: StrokeStyle(lineWidth: 7, lineCap: .round))
                                .rotationEffect(.degrees(-90))
                                .padding(10)
                            Circle()
                                .stroke(Color.white.opacity(0.12), lineWidth: 7)
                                .padding(20)
                            Circle()
                                .trim(from: 0, to: spentProgress(income: income, spent: spent))
                                .stroke(Color(red: 1, green: 0.8, blue: 0.35), style: StrokeStyle(lineWidth: 7, lineCap: .round))
                                .rotationEffect(.degrees(-90))
                                .padding(20)
                        }
                        .frame(width: 90, height: 90)

                        if family == .systemMedium {
                            VStack(alignment: .leading, spacing: 8) {
                                ringLegend(color: Color(red: 1, green: 0.8, blue: 0.35), label: "Spent", value: "\(Int(spent)) zł")
                                ringLegend(color: .white.opacity(0.75), label: "Budget left", value: "\(Int(max(0, limit - spent))) zł")
                                ringLegend(color: Color(red: 0.4, green: 1, blue: 0.65), label: "Saved", value: "\(Int(saved)) zł")
                            }
                        }
                    }
                }
                Spacer(minLength: 0)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
            .padding(14)
        } else {
            VStack(spacing: 6) {
                WidgetLabel(text: "SPENDING")
                Spacer()
                Image(systemName: "chart.pie")
                    .font(.system(size: 22, weight: .light))
                    .foregroundColor(.white.opacity(0.35))
                Text("No data")
                    .font(.system(size: 12))
                    .foregroundColor(.white.opacity(0.4))
                Spacer()
            }
            .padding(14)
        }
    }

    @ViewBuilder
    private func ringLegend(color: Color, label: String, value: String) -> some View {
        HStack(spacing: 6) {
            Circle().fill(color).frame(width: 7, height: 7)
            Text(label)
                .font(.system(size: 11))
                .foregroundColor(.white.opacity(0.55))
            Spacer()
            Text(value)
                .font(.system(size: 12, weight: .bold, design: .rounded))
                .foregroundColor(.white)
        }
    }

    @ViewBuilder
    private func statBlock(label: String, value: String) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(label.uppercased())
                .font(.system(size: 9, weight: .semibold))
                .tracking(0.8)
                .foregroundColor(.white.opacity(0.5))
            Text(value)
                .font(.system(size: 14, weight: .bold, design: .rounded))
                .foregroundColor(.white)
        }
    }

    private func savedProgress(income: Double, spent: Double) -> Double {
        guard income > 0 else { return 0 }
        return max(0, min((income - spent) / income, 1.0))
    }

    private func budgetRemainingProgress(limit: Double, spent: Double) -> Double {
        guard limit > 0 else { return 0 }
        return min(max(0, limit - spent) / limit, 1.0)
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
                .containerBackground(widgetBg, for: .widget)
        }
        .configurationDisplayName("Expenses")
        .description("View your spending rings")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge, .accessoryCircular])
    }
}

struct GoalsWidget: Widget {
    let kind: String = "GoalsWidget"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: kind, intent: ConfigurationAppIntent.self, provider: Provider()) { entry in
            GoalsWidgetView(entry: entry)
                .containerBackground(widgetBg, for: .widget)
        }
        .configurationDisplayName("Goals")
        .description("View your goal tracking grids")
        .supportedFamilies([.systemMedium, .systemLarge])
    }
}

// MARK: - Previews

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
