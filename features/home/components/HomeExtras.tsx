import Colors from "@/constants/Colors"
import Layout from "@/constants/Layout"
import { CategoryIcon, CategoryUtils } from "@/features/wallet/components/Expense/ExpenseIcon"
import SubscriptionCalendar from "@/features/wallet/components/Wallet/SubscriptionCalendar"
import { gql, useQuery } from "@apollo/client"
import { useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import Color from "color"
import moment from "moment"

const GET_HOME_EXTRAS = gql`
    query HomeExtras($filters: GetWalletFilters, $take: Int) {
        limits(range: "monthly") {
            id
            category
            amount
            current
        }
        subscriptions {
            id
            amount
            dateStart
            dateEnd
            description
            isActive
            nextBillingDate
            billingCycle
            totalSpent
            totalAmount
            totalDuration
        }
        wallet {
            expenses2(filters: $filters, take: $take) {
                expenses {
                    id
                    amount
                    date
                    description
                    type
                    category
                }
            }
        }
    }
`

export default function HomeExtras() {
    const [active, setActive] = useState<"limits" | "calendar">("limits")

    const { data, error } = useQuery(GET_HOME_EXTRAS, {
        variables: {
            filters: {
                date: {
                    from: moment().subtract(1, "month").startOf("month").format("YYYY-MM-DD"),
                    to: moment().add(1, "month").endOf("month").format("YYYY-MM-DD"),
                },
            },
            take: 300,
        },
    })

    console.log("home extras error", JSON.stringify(error, null, 2))

    const limits = data?.limits ?? []
    const allExpenses = (data?.wallet?.expenses2 ?? []).flatMap((m: any) => m.expenses ?? [])
    const activeSubscriptions = (data?.subscriptions ?? []).filter((s: any) => s.isActive)

    return (
        <View style={styles.card}>
            <Text style={styles.sectionTitle}>{active === "limits" ? "Monthly Limits" : "Recent activity"}</Text>

            {active === "limits" ? (
                <LimitsContent limits={limits} />
            ) : (
                <SubscriptionCalendar
                    style={{ padding: 0, backgroundColor: Colors.primary_lighter }}
                    subscriptions={activeSubscriptions}
                    expenses={allExpenses}
                />
            )}

            <View style={styles.tabs}>
                <Pressable
                    style={[styles.tab, active === "limits" && styles.activeTab]}
                    onPress={() => setActive("limits")}
                >
                    <Text style={[styles.tabText, active === "limits" && styles.activeTabText]}>Limits</Text>
                </Pressable>
                <Pressable
                    style={[styles.tab, active === "calendar" && styles.activeTab]}
                    onPress={() => setActive("calendar")}
                >
                    <Text style={[styles.tabText, active === "calendar" && styles.activeTabText]}>Calendar</Text>
                </Pressable>
            </View>
        </View>
    )
}

function LimitsContent({ limits }: { limits: any[] }) {
    if (!limits.length) return <Text style={styles.empty}>No limits set for this month</Text>

    return (
        <View style={styles.limitsContainer}>
            {limits.map((limit: any) => {
                const percentage = Math.min(100, (limit.current / limit.amount) * 100)
                const isOver = limit.current > limit.amount
                const barColor = isOver ? "#F07070" : Colors.secondary

                return (
                    <View key={limit.id} style={styles.limitRow}>
                        <CategoryIcon category={limit.category} type="expense" clear={false} size={14} />
                        <Text style={styles.limitLabel} numberOfLines={1}>
                            {CategoryUtils.getCategoryName(limit.category)}
                        </Text>
                        <View style={styles.progressTrack}>
                            <View
                                style={[
                                    styles.progressBar,
                                    { width: `${percentage}%` as any, backgroundColor: barColor },
                                ]}
                            />
                        </View>
                        <Text style={[styles.limitPct, { color: isOver ? "#F07070" : Colors.text_dark }]}>
                            {percentage.toFixed(0)}%
                        </Text>
                    </View>
                )
            })}
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        width: Layout.screen.width - 30,
        alignSelf: "center",
        backgroundColor: Colors.primary_lighter,
        borderRadius: 14,
        padding: 14,
        gap: 12,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: "600",
        letterSpacing: 0.8,
        textTransform: "uppercase",
        color: Colors.text_dark,
    },
    limitsContainer: {
        gap: 10,
    },
    limitRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    limitLabel: {
        fontSize: 12,
        fontWeight: "500",
        color: Colors.text_dark,
        width: 80,
        textTransform: "capitalize",
    },
    progressTrack: {
        flex: 1,
        height: 3,
        backgroundColor: "rgba(255,255,255,0.1)",
        borderRadius: 2,
        overflow: "hidden",
    },
    progressBar: {
        height: "100%",
        borderRadius: 2,
    },
    limitPct: {
        fontSize: 11,
        fontWeight: "600",
        width: 36,
        textAlign: "right",
    },
    empty: {
        fontSize: 13,
        color: Colors.text_dark,
        textAlign: "center",
        paddingVertical: 20,
    },
    tabs: {
        flexDirection: "row",
        backgroundColor: Color(Colors.primary_light).alpha(0.5).string(),
        borderRadius: 10,
        padding: 3,
        gap: 3,
    },
    tab: {
        flex: 1,
        paddingVertical: 7,
        borderRadius: 8,
        alignItems: "center",
    },
    activeTab: {
        backgroundColor: Color(Colors.secondary).alpha(0.18).string(),
        borderWidth: 1,
        borderColor: Color(Colors.secondary).alpha(0.25).string(),
    },
    tabText: {
        fontSize: 12,
        fontWeight: "600",
        letterSpacing: 0.3,
        color: Color(Colors.text_light).alpha(0.4).string(),
    },
    activeTabText: {
        color: Colors.text_light,
    },
})
