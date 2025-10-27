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

        // Generate a timeline consisting of five entries an hour apart, starting from the current date.
        let currentDate = Date()
        for hourOffset in 0 ..< 5 {
            let entryDate = Calendar.current.date(byAdding: .hour, value: hourOffset, to: currentDate)!
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
                
                // Wallet Header
                HStack {
                    Text("💰 Wallet")
                        .font(.headline)
                        .fontWeight(.bold)
                    Spacer()
                    Text("\(walletData.balance, specifier: "%.2f")zł")
                        .font(.title2)
                        .fontWeight(.black)
                }
                
                // Monthly Spending Chart (Large Widget Only)
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
                        
                        // Progress Bar
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
                
                ForEach(walletData.recentExpenses.prefix(family == .systemLarge ? 5 : 2), id: \.id) { expense in
                    HStack(spacing: 8) {
                        // Category Icon
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
                
                // Upcoming Subscriptions (Large Widget Only)
                if family == .systemLarge,
                   let subscriptions = walletData.upcomingSubscriptions,
                   !subscriptions.isEmpty {
                    
                    Text("Upcoming Subscriptions:")
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .padding(.top, 8)
                    
                    ForEach(subscriptions.prefix(2), id: \.id) { subscription in
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
                
                // Timeline Header
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
                
                // Today's Events
                ForEach(timelineData.events.prefix(family == .systemLarge ? 5 : 2), id: \.id) { event in
                    VStack(alignment: .leading, spacing: 4) {
                        HStack(spacing: 8) {
                            Image(systemName: event.isCompleted ? "checkmark.circle.fill" : "circle")
                                .foregroundColor(event.isCompleted ? .green : .blue)
                                .font(.caption)
                                .frame(width: 16, height: 16)
                            
                            VStack(alignment: .leading, spacing: 1) {
                                Text(event.title)
                                    .font(.caption)
                                    .fontWeight(.medium)
                                    .lineLimit(1)
                                
                                if !event.description.isEmpty {
                                    Text(event.description)
                                        .font(.caption2)
                                        .foregroundColor(.secondary)
                                        .lineLimit(1)
                                }
                            }
                            
                            Spacer()
                            
                            Text("\(formatTime(event.beginTime)) - \(formatTime(event.endTime))")
                                .font(.caption2)
                                .foregroundColor(.secondary)
                        }
                        
                        if !event.todos.isEmpty {
                            VStack(alignment: .leading, spacing: 2) {
                                ForEach(event.todos.prefix(family == .systemLarge ? 3 : 1), id: \.id) { todo in
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
        // Handle both HH:mm:ss and HH:mm formats
        if timeString.contains(":") {
            let components = timeString.split(separator: ":")
            if components.count >= 2 {
                return "\(components[0]):\(components[1])"
            }
        }
        return timeString
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
