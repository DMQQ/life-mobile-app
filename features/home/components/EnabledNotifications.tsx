import Button from "@/components/ui/Button/Button"
import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import { gql, useMutation, useQuery } from "@apollo/client"
import { BlurView } from "expo-blur"
import { useEffect, useState } from "react"
import { StyleSheet, Switch, View } from "react-native"
import Feedback from "react-native-haptic-feedback"

// GraphQL Queries and Mutations
const GET_NOTIFICATION_SETTINGS = gql`
    query GetNotificationSettings {
        getNotificationSettings {
            id
            isEnable
            enabledNotifications
        }
    }
`

const TOGGLE_ENABLED_NOTIFICATIONS = gql`
    mutation ToggleEnabledNotifications($input: JSON!) {
        toggleEnabledNotifications(input: $input) {
            id
            isEnable
            enabledNotifications
        }
    }
`

// All possible notification types based on the backend implementation
export const NOTIFICATION_TYPES = [
    {
        key: "budgetAlerts",
        title: "Budget Alerts",
        description: "Get notified when you approach spending limits or have low balance",
    },
    {
        key: "subscriptionReminders",
        title: "Subscription Reminders",
        description: "Reminders for upcoming subscription charges",
    },
    {
        key: "weeklyReport",
        title: "Weekly Reports",
        description: "Weekly spending summary and insights",
    },
    {
        key: "monthlyReport",
        title: "Monthly Reports",
        description: "Monthly financial overview and statistics",
    },
    {
        key: "expenseAnalysis",
        title: "Expense Analysis",
        description: "AI-powered spending pattern analysis",
    },
    {
        key: "dailyInsights",
        title: "Daily Insights",
        description: "Daily spending updates and balance information",
    },
    {
        key: "unusualSpending",
        title: "Unusual Spending Alerts",
        description: "Get alerted when spending significantly exceeds your average",
    },
    {
        key: "weekdayWeekendAnalysis",
        title: "Spending Pattern Analysis",
        description: "Analysis of weekday vs weekend spending patterns",
    },
    {
        key: "moneyLeftToday",
        title: "Today's Budget",
        description: "Daily budget reminders and spending allowance",
    },
    {
        key: "monthlyCategoryComparison",
        title: "Monthly Category Analysis",
        description: "Compare spending across categories month-to-month",
    },
    {
        key: "savingRateAnalysis",
        title: "Saving Rate Insights",
        description: "Monthly analysis of your saving rate and investment opportunities",
    },
    {
        key: "spontaneousPurchaseAnalysis",
        title: "Impulse Purchase Insights",
        description: "Analysis of spontaneous purchases and saving opportunities",
    },
    {
        key: "zeroSpendDayChallenge",
        title: "Zero Spend Day Challenges",
        description: "Challenges to take a break from spending and save money",
    },
    {
        key: "roundUpSavingsOpportunity",
        title: "Round-Up Savings Tips",
        description: "Suggestions for automatic round-up savings based on transactions",
    },
]

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {},
    header: {
        marginBottom: 25,
    },
    title: {
        color: Colors.text_light,
        marginBottom: 8,
    },
    subtitle: {
        color: "rgba(255, 255, 255, 0.7)",
    },
    section: {
        borderRadius: 16,
        overflow: "hidden",
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
    },
    sectionContent: {
        padding: 20,
        backgroundColor: "rgba(0, 0, 0, 0.2)",
    },
    notificationItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255, 255, 255, 0.1)",
    },
    lastItem: {
        borderBottomWidth: 0,
    },
    notificationContent: {
        flex: 1,
        marginRight: 15,
    },
    notificationTitle: {
        color: Colors.text_light,
        marginBottom: 4,
    },
    notificationDescription: {
        color: "rgba(255, 255, 255, 0.6)",
    },
    switchContainer: {
        justifyContent: "center",
    },
    saveButtonContainer: {
        marginTop: 20,
        marginBottom: 40,
    },
    masterSwitchContainer: {
        marginBottom: 20,
    },
    masterSwitchItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 10,
    },
    masterSwitchContent: {
        flex: 1,
        marginRight: 15,
    },
    masterSwitchTitle: {
        color: Colors.text_light,
        fontWeight: "600",
    },
    masterSwitchDescription: {
        color: "rgba(255, 255, 255, 0.6)",
        marginTop: 2,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
    },
    loadingText: {
        color: Colors.text_light,
        marginTop: 10,
    },
    errorContainer: {
        backgroundColor: "rgba(255, 0, 0, 0.1)",
        borderColor: "rgba(255, 0, 0, 0.3)",
        borderWidth: 1,
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
    },
    errorText: {
        color: "#ff6b6b",
    },
})

interface NotificationSettings {
    isEnable: boolean
    enabledNotifications: Record<string, boolean>
}

interface NotificationData {
    id: string
    isEnable: boolean
    enabledNotifications: Record<string, boolean> | null
}

export default function EnabledNotifications() {
    const [settings, setSettings] = useState<NotificationSettings>({
        isEnable: true,
        enabledNotifications: {} as Record<string, boolean>,
    })

    const [hasChanges, setHasChanges] = useState(false)

    // Query to get current settings
    const { data, loading, error } = useQuery<{ getNotificationSettings: NotificationData }>(
        GET_NOTIFICATION_SETTINGS,
        {
            onCompleted: (data) => {
                if (data?.getNotificationSettings) {
                    setSettings({
                        isEnable: data.getNotificationSettings.isEnable,
                        enabledNotifications: data.getNotificationSettings.enabledNotifications || {},
                    })
                }
            },
            errorPolicy: "all", // Continue rendering even with errors
        },
    )

    // Mutation to save changes
    const [toggleEnabledNotifications, { loading: saving }] = useMutation(TOGGLE_ENABLED_NOTIFICATIONS, {
        onCompleted: () => {
            setHasChanges(false)
            Feedback.trigger("notificationSuccess")
        },
        onError: (error) => {
            console.error("Error saving notification settings:", error)
            Feedback.trigger("notificationError")
        },
    })

    // Initialize default values for missing notification types
    useEffect(() => {
        if (data?.getNotificationSettings?.enabledNotifications) {
            const currentSettings = data.getNotificationSettings.enabledNotifications
            const defaultSettings: Record<string, boolean> = {}

            // Set default to true for all notification types if not explicitly set
            NOTIFICATION_TYPES.forEach((type) => {
                defaultSettings[type.key] = currentSettings[type.key] !== false
            })

            setSettings((prev) => ({
                ...prev,
                enabledNotifications: defaultSettings,
            }))
        }
    }, [data])

    const handleMasterToggle = (value: boolean) => {
        Feedback.trigger("selection")
        setSettings((prev) => ({
            ...prev,
            isEnable: value,
        }))
        setHasChanges(true)
    }

    const handleNotificationToggle = (key: string, value: boolean) => {
        Feedback.trigger("selection")
        setSettings((prev) => ({
            ...prev,
            enabledNotifications: {
                ...prev.enabledNotifications,
                [key]: value,
            },
        }))
        setHasChanges(true)
    }

    const handleSave = async () => {
        try {
            Feedback.trigger("impactMedium")
            await toggleEnabledNotifications({
                variables: {
                    input: settings.enabledNotifications,
                },
            })
        } catch (error) {
            console.error("Failed to save notification settings:", error)
        }
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text variant="body" style={styles.loadingText}>
                    Loading notification settings...
                </Text>
            </View>
        )
    }

    return (
        <View style={styles.content}>
            <View style={styles.header}>
                <Text variant="title" style={styles.title}>
                    Notification Settings
                </Text>
                <Text variant="body" style={styles.subtitle}>
                    Choose which notifications you want to receive
                </Text>
            </View>

            {error && (
                <View style={styles.errorContainer}>
                    <Text variant="body" style={styles.errorText}>
                        Unable to load current settings. Using defaults.
                    </Text>
                </View>
            )}

            {/* Master Switch */}
            <View style={styles.section}>
                <BlurView intensity={20} tint="dark">
                    <View style={[styles.sectionContent, styles.masterSwitchContainer]}>
                        <View style={styles.masterSwitchItem}>
                            <View style={styles.masterSwitchContent}>
                                <Text variant="body" style={styles.masterSwitchTitle}>
                                    Enable All Notifications
                                </Text>
                                <Text variant="caption" style={styles.masterSwitchDescription}>
                                    Master toggle for all push notifications
                                </Text>
                            </View>
                            <View style={styles.switchContainer}>
                                <Switch
                                    value={settings.isEnable}
                                    onValueChange={handleMasterToggle}
                                    trackColor={{
                                        false: "rgba(255, 255, 255, 0.2)",
                                        true: Colors.secondary,
                                    }}
                                    thumbColor={settings.isEnable ? Colors.primary : "rgba(255, 255, 255, 0.8)"}
                                />
                            </View>
                        </View>
                    </View>
                </BlurView>
            </View>

            {/* Individual Notification Types */}
            <View style={styles.section}>
                <BlurView intensity={20} tint="dark">
                    <View style={styles.sectionContent}>
                        <Text variant="body" style={styles.masterSwitchTitle}>
                            Notification Types
                        </Text>
                        <Text variant="caption" style={[styles.masterSwitchDescription, { marginBottom: 15 }]}>
                            Control specific types of notifications
                        </Text>

                        {NOTIFICATION_TYPES.map((notification, index) => {
                            const isEnabled = settings.enabledNotifications[notification.key] !== false
                            const isDisabled = !settings.isEnable

                            return (
                                <View
                                    key={notification.key}
                                    style={[
                                        styles.notificationItem,
                                        index === NOTIFICATION_TYPES.length - 1 && styles.lastItem,
                                    ]}
                                >
                                    <View style={styles.notificationContent}>
                                        <Text
                                            variant="body"
                                            style={[styles.notificationTitle, isDisabled && { opacity: 0.5 }]}
                                        >
                                            {notification.title}
                                        </Text>
                                        <Text
                                            variant="caption"
                                            style={[styles.notificationDescription, isDisabled && { opacity: 0.5 }]}
                                        >
                                            {notification.description}
                                        </Text>
                                    </View>
                                    <View style={styles.switchContainer}>
                                        <Switch
                                            value={isEnabled && settings.isEnable}
                                            onValueChange={(value) => handleNotificationToggle(notification.key, value)}
                                            disabled={!settings.isEnable}
                                            trackColor={{
                                                false: "rgba(255, 255, 255, 0.2)",
                                                true: Colors.secondary,
                                            }}
                                            thumbColor={
                                                isEnabled && settings.isEnable
                                                    ? Colors.primary
                                                    : "rgba(255, 255, 255, 0.8)"
                                            }
                                        />
                                    </View>
                                </View>
                            )
                        })}
                    </View>
                </BlurView>
            </View>

            {/* Save Button */}
            <View style={styles.saveButtonContainer}>
                <Button
                    onPress={handleSave}
                    disabled={!hasChanges || saving}
                    style={{
                        opacity: !hasChanges || saving ? 0.6 : 1,
                    }}
                >
                    {saving ? "Saving..." : "Save Changes"}
                </Button>
            </View>
        </View>
    )
}
