// Widget-specific data types for iOS widget consumption

export interface WidgetExpense {
  id: string
  amount: number
  description: string
  date: string
  type: string
  category: string
}

export interface WidgetSubscription {
  id: string
  amount: number
  description: string
  nextBillingDate: string
  isActive: boolean
}

export interface WidgetWalletData {
  balance: number
  income: number
  monthlyPercentageTarget: number
  recentExpenses: WidgetExpense[]
  lastUpdated: string
  monthlySpent?: number
  monthlyLimit?: number
  upcomingSubscriptions?: WidgetSubscription[]
}

export interface WidgetTodo {
  id: string
  title: string
  isCompleted: boolean
}

export interface WidgetTimelineEvent {
  id: string
  title: string
  description: string
  date: string
  beginTime: string
  endTime: string
  isCompleted: boolean
  todos: WidgetTodo[]
}

export interface WidgetTimelineData {
  events: WidgetTimelineEvent[]
  selectedDate: string
  totalEvents: number
  completedEvents: number
  lastUpdated: string
}

export interface WidgetAnalyticsLimit {
  category: string
  amount: number
  current: number
}

export interface WidgetAnalyticsCategory {
  name: string
  amount: number
}

export interface WidgetAnalyticsSavings {
  savedAmount: number
  targetAmount: number
  savedPercentage: number
}

export interface WidgetAnalyticsData {
  limits: WidgetAnalyticsLimit[]
  weeklySpending: number[]
  topCategories: WidgetAnalyticsCategory[]
  savings: WidgetAnalyticsSavings
  lastUpdated: string
}

export interface WidgetStore {
  wallet: WidgetWalletData | null
  timeline: WidgetTimelineData | null
  analytics: WidgetAnalyticsData | null
}