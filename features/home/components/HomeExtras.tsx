import { FONTS } from "@/constants/Fonts"
import Colors from "@/constants/Colors"
import Layout from "@/constants/Layout"
import { CategoryIcon, CategoryUtils } from "@/features/wallet/components/Expense/ExpenseIcon"
import SubscriptionCalendar from "@/features/wallet/components/Wallet/SubscriptionCalendar"
import { gql, useQuery } from "@apollo/client"
import { useState } from "react"
import { StyleSheet, View } from "react-native"
import Text from "@/components/ui/Text/Text"
import Color from "color"
import moment from "moment"
import GroupSelector from "@/components/ui/GroupSelector"
import Section from "@/components/ui/Section"

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

                    subscription {
                        id
                        isActive
                    }
                }
            }
        }
    }
`

export default function HomeExtras() {
    const [active, setActive] = useState<"limits" | "calendar">("calendar")

    const { data } = useQuery(GET_HOME_EXTRAS, {
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

    const limits = data?.limits ?? []
    const allExpenses = (data?.wallet?.expenses2 ?? []).flatMap((m: any) => m.expenses ?? [])

    return (
        <Section title={active === "limits" ? "Monthly Limits" : "Recent activity"} cardStyle={styles.card}>
            {active === "limits" ? (
                <LimitsContent limits={limits} />
            ) : (
                <SubscriptionCalendar
                    style={{ padding: 0, backgroundColor: Colors.primary_lighter }}
                    expenses={allExpenses}
                />
            )}

            <GroupSelector
                options={[
                    { label: "Calendar", value: "calendar" as const },
                    { label: "Limits", value: "limits" as const },
                ]}
                value={active}
                onChange={(val) => setActive(val)}
            />
        </Section>
    )
}

function LimitsContent({ limits }: { limits: any[] }) {
    if (!limits.length) return <Text size={13} color={Colors.text_dark} align="center" style={{ paddingVertical: 20 }}>No limits set for this month</Text>

    return (
        <View style={styles.limitsContainer}>
            {limits.map((limit: any) => {
                const percentage = Math.min(100, (limit.current / limit.amount) * 100)
                const isOver = limit.current > limit.amount
                const barColor = isOver ? "#F07070" : Colors.secondary

                return (
                    <View key={limit.id} style={styles.limitRow}>
                        <CategoryIcon category={limit.category} type="expense" clear={false} size={14} />
                        <Text size={12} weight="500" color={Colors.text_dark} uppercase numberOfLines={1} style={{ width: 80 }}>
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
                        <Text size={11} weight="600" color={isOver ? "#F07070" : Colors.text_dark} align="right" style={{ width: 36 }}>
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
        padding: 15,
        gap: 15,
    },
    limitsContainer: {
        gap: 10,
    },
    limitRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
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
        fontFamily: FONTS.semibold,
        letterSpacing: 0.3,
        color: Color(Colors.text_light).alpha(0.4).string(),
    },
    activeTabText: {
        color: Colors.text_light,
    },
})
