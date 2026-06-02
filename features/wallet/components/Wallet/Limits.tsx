import { AnimatedSelector } from "@/components"
import Colors, { secondary_candidates } from "@/constants/Colors"
import Layout from "@/constants/Layout"
import { gql, useQuery } from "@apollo/client"
import Color from "color"
import dayjs from "dayjs"
import moment from "moment"
import { useEffect, useMemo, useState } from "react"
import { ScrollView, StyleSheet, View } from "react-native"
import Text from "@/components/ui/Text/Text"
import Feedback from "react-native-haptic-feedback"
import Ripple from "react-native-material-ripple"
import Animated, { FadeIn, LinearTransition } from "react-native-reanimated"
import useGetStatistics from "../../hooks/useGetStatistics"
import { CategoryIcon, CategoryUtils, Icons } from "../Expense/ExpenseIcon"
import { useWalletContext } from "../WalletContext"
import { SymbolView } from "expo-symbols"

const GET_LIMITS = gql`
    query Limits($range: String!, $date: String) {
        limits(range: $range, date: $date) {
            id
            category
            amount
            current
        }
    }
`

const GET_WALLET = gql`
    query GetWalletLimits {
        wallet {
            income
            monthlyPercentageTarget
        }
    }
`

function makePreviousRange(range: string) {
    const date = dayjs()
    switch (range) {
        case "daily":
            return date.subtract(1, "day").format("YYYY-MM-DD")
        case "weekly":
            return date.subtract(1, "week").format("YYYY-MM-DD")
        case "monthly":
            return date.subtract(1, "month").format("YYYY-MM-DD")
        case "yearly":
            return date.subtract(1, "year").format("YYYY-MM-DD")
        default:
            return date.format("YYYY-MM-DD")
    }
}

export default function WalletLimits({ navigation }: { navigation: any }) {
    const [selectedRange, setSelectedRange] = useState("monthly")

    const {
        data: limitsData,
        loading: isLoading,
        error,
        previousData,
    } = useQuery(GET_LIMITS, { variables: { range: selectedRange } })

    const date = useMemo(() => makePreviousRange(selectedRange), [selectedRange])

    const { data: limitsLastRange } = useQuery(GET_LIMITS, {
        variables: { range: selectedRange, date },
        skip: !date,
        fetchPolicy: "no-cache",
        returnPartialData: true,
    })

    const limits = limitsData || previousData

    const loading = isLoading && !limitsData

    const prevMap = useMemo(
        () =>
            Object.entries(limitsLastRange?.limits || {}).reduce(
                (acc, [key, value]) => {
                    //@ts-ignore
                    acc[value.category] = value?.current || 0
                    return acc
                },
                {} as Record<string, number>,
            ),
        [limitsLastRange?.limits],
    )

    // Get monthly budget data
    const { data: walletData } = useQuery(GET_WALLET)
    const { data: statistics } = useGetStatistics([
        moment().startOf("month").toDate(),
        moment().endOf("month").toDate(),
    ])

    const { dispatch, filters } = useWalletContext()
    const [compactMode, setCompactMode] = useState(true)
    const [height, setHeight] = useState(150)

    const [isExactCategory, setIsExactCategory] = useState(false)

    useEffect(() => {
        dispatch({ type: "SET_IS_EXACT_CATEGORY", payload: isExactCategory })
    }, [isExactCategory])

    const budgetStatus = useMemo(() => {
        let budgetStatus = null
        if (walletData?.wallet && statistics?.statistics && selectedRange === "monthly") {
            const { income, monthlyPercentageTarget } = walletData.wallet
            const { expense } = statistics.statistics

            const targetAmount = (income ?? 0) * ((monthlyPercentageTarget ?? 0) / 100)
            const percentageSpent = Math.round(((expense ?? 0) / (targetAmount || 1)) * 100)

            const isOverTarget = (expense ?? 0) > (targetAmount ?? 0)
            const isOverIncome = (expense ?? 0) > (income ?? 0)

            budgetStatus = {
                text: isOverIncome
                    ? `${percentageSpent}% over target (${Math.round(((expense ?? 0) / (income ?? 1)) * 100)}% of income used)`
                    : isOverTarget
                      ? `${percentageSpent}% spent (${percentageSpent - 100}% over target)`
                      : `${percentageSpent}% spent (${100 - percentageSpent}% target remaining)`,
                color: isOverIncome ? "#F07070" : isOverTarget ? Colors.warning : "#66E875",
            }
        }
        return budgetStatus
    }, [walletData, statistics, selectedRange])

    const handleRangeChange = (range: any) => {
        Feedback.trigger("impactLight")
        setSelectedRange(range)
    }

    if (error) {
        return (
            <View style={[styles.errorContainer, { height }]}>
                <Text size={15} color="#F07070">Failed to load limits</Text>
            </View>
        )
    }

    return (
        <Animated.View
            onLayout={(layout) => setHeight(layout.nativeEvent.layout.height)}
            style={[
                styles.container,
                compactMode && { height: undefined },
                { height: compactMode ? undefined : height },
            ]}
            entering={FadeIn}
        >
            <View style={styles.headerContainer}>
                <View style={{ flexDirection: "column" }}>
                    <Ripple
                        onPress={() => {
                            Feedback.trigger("impactLight")
                            setCompactMode((p) => !p)
                        }}
                        onLongPress={() => {
                            Feedback.trigger("impactLight")
                            setCompactMode((p) => !p)
                        }}
                        style={{ flexDirection: "row", alignItems: "center", gap: 7.5 }}
                    >
                        <SymbolView name="gauge" size={20} tintColor={Colors.secondary} />
                        <Text size={18} weight="600" color={Colors.foreground}>Spending Limits</Text>
                    </Ripple>
                </View>

                {budgetStatus && (
                    <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 5 }}>
                        <Text size={12} weight="500" color={budgetStatus.color} style={{ marginTop: 4 }}>
                            {budgetStatus.text}
                        </Text>
                    </View>
                )}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {limits?.limits?.length === 0 ? (
                    <Text size={14} color="#9f9f9f" align="center" style={{ width: Layout.screen.width - 30, padding: 30, backgroundColor: Colors.primary_lighter, borderRadius: 15 }}>
                        No limits set for this period
                    </Text>
                ) : (
                    limits?.limits?.map((limit: any, index: number) => {
                        const iconData = Icons[limit.category as keyof typeof Icons] || {
                            backgroundColor: secondary_candidates[0],
                            icon: null,
                        }

                        const percentage = Math.min(100, (limit.current / limit.amount) * 100)
                        const isOverLimit = limit.current > limit.amount

                        const color = secondary_candidates[index % secondary_candidates.length]

                        const isSelected =
                            filters.category === limit.category ||
                            (Array.isArray(filters.category) && filters.category.includes(limit.category))

                        return (
                            <Animated.View
                                key={limit.id}
                                style={[
                                    {
                                        marginRight: 15,
                                        width: compactMode
                                            ? (Layout.screen.width - 30 - 3 * 15) / 4
                                            : limits?.limits?.length > 1
                                              ? Layout.screen.width * 0.8
                                              : Layout.screen.width - 30,
                                    },
                                    !isSelected && filters.category.length > 0 && { opacity: 0.5 },
                                ]}
                            >
                                <Ripple
                                    style={[
                                        styles.limitCard,
                                        {
                                            backgroundColor: Colors.primary_lighter,
                                            borderWidth: 1,
                                            borderColor: Colors.borderColor,
                                            flexDirection: compactMode ? "column" : "row",
                                            padding: compactMode ? 15 : 22.5,
                                        },
                                    ]}
                                    onPress={() => {
                                        Feedback.trigger("impactLight")
                                        if (!isSelected) {
                                            setIsExactCategory(true)
                                            dispatch({ type: "SET_CATEGORY", payload: limit.category })
                                        } else {
                                            setIsExactCategory(false)
                                            dispatch({ type: "SET_CATEGORY", payload: [] as string[] })
                                        }
                                    }}
                                >
                                    <View
                                        style={[
                                            styles.iconContainer,
                                            { backgroundColor: Colors.primary_lighter },
                                            compactMode && { marginRight: 0 },
                                        ]}
                                    >
                                        <CategoryIcon
                                            category={limit.category}
                                            type="expense"
                                            clear={false}
                                            size={20}
                                        />
                                    </View>

                                    <View style={styles.detailsContainer}>
                                        {!compactMode && (
                                            <View
                                                style={[
                                                    styles.headerRow,
                                                    { flexDirection: compactMode ? "column" : "row" },
                                                ]}
                                            >
                                                <Text size={15} weight="600" color={Colors.foreground} uppercase flex={1} numberOfLines={1}>
                                                    {CategoryUtils.getCategoryName(limit.category)}
                                                </Text>

                                                <Text size={14} weight="600" color={isOverLimit ? "#F07070" : Colors.foreground}>
                                                    {limit.current.toFixed(2)}
                                                    <Text size={12} color={isOverLimit ? "#F07070" : Colors.foreground}> zł</Text>
                                                    <Text size={14} color="#9f9f9f"> / </Text>
                                                    <Text size={14} color={isOverLimit ? "#F07070" : Colors.foreground}>{limit.amount.toFixed(2)} zł</Text>
                                                </Text>
                                            </View>
                                        )}

                                        <View style={[styles.progressContainer, compactMode && { marginTop: 5 }]}>
                                            <View style={styles.progressBackground}>
                                                <Animated.View
                                                    style={[
                                                        styles.progressFill,
                                                        {
                                                            width: `${percentage}%`,
                                                            backgroundColor: isOverLimit
                                                                ? "#F07070" // Same red as expense items
                                                                : iconData.backgroundColor || color,
                                                        },
                                                    ]}
                                                />
                                            </View>

                                            <Text
                                                size={compactMode ? 12 : 12}
                                                weight="500"
                                                color={isOverLimit ? "#F07070" : iconData.backgroundColor || color}
                                                align="center"
                                                style={{ marginLeft: 8, minWidth: 80, paddingRight: 7.5 }}
                                                numberOfLines={2}
                                            >
                                                {percentage.toFixed(0)}%
                                            </Text>
                                        </View>
                                    </View>
                                </Ripple>
                            </Animated.View>
                        )
                    })
                )}
            </ScrollView>

            <View style={styles.tabContainer}>
                <AnimatedSelector
                    items={["daily", "weekly", "monthly", "yearly"]}
                    selectedItem={selectedRange}
                    onItemSelect={handleRangeChange}
                    containerStyle={{ backgroundColor: Colors.primary }}
                    scale={0.75}
                />
            </View>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 15,
        height: 150,
    },
    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start", // Changed from center to allow for budget indicator below
        marginBottom: 15,
        height: 25,
    },
    tabContainer: {
        flexDirection: "row",
        overflow: "hidden",
        gap: 5,
        justifyContent: "center",
    },
    loadingContainer: {
        padding: 30,
        alignItems: "center",
        backgroundColor: Colors.primary_lighter,
        borderRadius: 15,
        marginBottom: 15,
        height: 150,
    },
    errorContainer: {
        padding: 20,
        alignItems: "center",
        backgroundColor: Colors.primary_lighter,
        borderRadius: 15,
        marginBottom: 15,
    },
    limitCard: {
        padding: 15,
        backgroundColor: Colors.primary_lighter,
        borderRadius: 15,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
    },
    iconContainer: {
        padding: 10,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    detailsContainer: {
        flex: 1,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    progressContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    progressBackground: {
        flex: 1,
        height: 4,
        backgroundColor: "rgba(255,255,255,0.15)",
        borderRadius: 2,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        borderRadius: 2,
    },
})
