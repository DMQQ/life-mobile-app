import Layout from "@/constants/Layout"
import React, { useMemo, useState } from "react"
import { StyleSheet, View, ScrollView } from "react-native"
import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import Button from "@/components/ui/Button/Button"
import lowOpacity from "@/utils/functions/lowOpacity"
import { gql, useQuery } from "@apollo/client"
import moment from "moment"
import { CategoryUtils, Icons } from "../Expense/ExpenseIcon"
import ChartTemplate from "./ChartTemplate"
import CustomLimitChart, { LimitBarItem } from "./CustomLimitChart"

const LIMITS_COMPARISON = gql`
    query LimitsComparison($startDate: String!, $endDate: String!) {
        statisticsSpendingsLimits(startDate: $startDate, endDate: $endDate) {
            month
            totalSpent
            generalLimit
            generalLimitExceeded
            categories {
                category
                spent
                limit
                exceeded
            }
        }
    }
`

interface CategoryLimitData {
    category: string
    spent: number
    limit: number
    exceeded: boolean
}

interface MonthLimitData {
    month: string
    totalSpent: number
    generalLimit: number
    generalLimitExceeded: boolean
    categories: CategoryLimitData[]
}

interface CategoryChartData {
    category: string
    data: LimitBarItem[]
    maxValue: number
}

const blueText = Colors.foreground_secondary

const LimitsComparisonComponent = ({ dateRange }: { dateRange: [string, string] }) => {
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])
    const [showGeneral, setShowGeneral] = useState(true)

    const { loading, error, data } = useQuery(LIMITS_COMPARISON, {
        variables: {
            startDate: dateRange[0],
            endDate: dateRange[1],
        },
    })

    const toggleCategory = (category: string) => {
        setSelectedCategories((prev) =>
            prev.includes(category) ? prev.filter((cat) => cat !== category) : [...prev, category],
        )
    }

    const selectAllCategories = () => {
        setSelectedCategories([])
        setShowGeneral(true)
    }

    const { categoryCharts, categories } = useMemo(() => {
        if (!data?.statisticsSpendingsLimits || !Array.isArray(data.statisticsSpendingsLimits)) {
            return { categoryCharts: [], categories: [] }
        }

        const allCategories = new Set<string>()
        data.statisticsSpendingsLimits.forEach((monthData: MonthLimitData) => {
            if (monthData?.categories && Array.isArray(monthData.categories)) {
                monthData.categories.forEach((cat: CategoryLimitData) => {
                    if (cat?.category && !["edit", "none", "income"].includes(cat?.category)) {
                        allCategories.add(cat.category)
                    }
                })
            }
        })

        const categoriesArray = Array.from(allCategories)
        const categoriesToShow =
            selectedCategories.length === 0 && showGeneral ? ["general", ...categoriesArray] : selectedCategories

        const charts: CategoryChartData[] = categoriesToShow.map((category) => {
            const chartData: LimitBarItem[] = []
            const values: number[] = []

            data.statisticsSpendingsLimits.forEach((monthData: MonthLimitData, monthIndex: number) => {
                let spent = 0
                let limit = 0
                let exceeded = false

                if (category === "general") {
                    spent = monthData.totalSpent || 0
                    limit = monthData.generalLimit || 0
                    exceeded = monthData.generalLimitExceeded || false
                } else {
                    const categoryData = monthData.categories?.find((cat) => cat.category === category)
                    if (categoryData) {
                        spent = categoryData.spent
                        limit = categoryData.limit
                        exceeded = categoryData.exceeded
                    }
                }

                values.push(spent, limit)

                chartData.push({
                    type: "bar",
                    category,
                    month: monthData.month,
                    spent,
                    limit,
                    exceeded,
                    isLastInCategory: monthIndex === data.statisticsSpendingsLimits.length - 1,
                    isFirstInCategory: monthIndex === 0,
                    isMiddleInCategory: monthIndex === Math.floor(data.statisticsSpendingsLimits.length / 2),
                })
            })

            const maxValue = values.length > 0 ? Math.max(...values) * 1.1 : 100

            return { category, data: chartData, maxValue }
        })

        return { categoryCharts: charts, categories: categoriesArray }
    }, [data, selectedCategories, showGeneral])

    if (loading)
        return (
            <View style={styles.loadingContainer}>
                <Text size={16} color={Colors.foreground}>Loading...</Text>
            </View>
        )
    if (error)
        return (
            <View style={styles.errorContainer}>
                <Text size={16} color="#ff7777">Error: {error.message}</Text>
            </View>
        )

    return (
        <View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilterContainer}>
                <Button
                    variant="text"
                    key="all-categories"
                    onPress={selectAllCategories}
                    style={[
                        styles.categoryFilterButton,
                        selectedCategories.length === 0 && showGeneral && styles.selectedCategoryButton,
                    ]}
                >
                    <Text
                        size={14}
                        color={selectedCategories.length === 0 && showGeneral ? Colors.secondary : blueText}
                    >
                        All
                    </Text>
                </Button>

                <Button
                    variant="text"
                    key="general"
                    onPress={() => {
                        setSelectedCategories(["general"])
                        setShowGeneral(true)
                    }}
                    style={[
                        styles.categoryFilterButton,
                        selectedCategories.includes("general") && styles.selectedCategoryButton,
                    ]}
                >
                    <Text
                        size={14}
                        color={selectedCategories.includes("general") ? Colors.secondary : blueText}
                    >
                        General
                    </Text>
                </Button>

                {categories.map((category) => (
                    <Button
                        variant="text"
                        key={category}
                        onPress={() => {
                            toggleCategory(category)
                            setShowGeneral(false)
                        }}
                        style={[
                            styles.categoryFilterButton,
                            selectedCategories.includes(category) && {
                                ...styles.selectedCategoryButton,
                                borderColor: lowOpacity(
                                    Icons[category as keyof typeof Icons]?.backgroundColor || Colors.secondary,
                                    0.75,
                                ),
                                backgroundColor: lowOpacity(
                                    Icons[category as keyof typeof Icons]?.backgroundColor || Colors.secondary,
                                    0.125,
                                ),
                            },
                        ]}
                    >
                        {Icons[category as keyof typeof Icons]?.icon ? (
                            <View style={{ marginRight: 5 }}>
                                {React.cloneElement(Icons[category as keyof typeof Icons]?.icon, { size: 15 })}
                            </View>
                        ) : null}
                        <Text
                            size={14}
                            color={selectedCategories.includes(category) ? (Icons[category as keyof typeof Icons]?.backgroundColor || Colors.secondary) : blueText}
                        >
                            {CategoryUtils.getCategoryName(category)}
                        </Text>
                    </Button>
                ))}
            </ScrollView>

            {categoryCharts.length > 0 ? (
                <ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    decelerationRate="fast"
                    snapToInterval={Layout.screen.width - 30}
                    snapToAlignment="start"
                    contentContainerStyle={styles.horizontalChartsContainer}
                >
                    {categoryCharts.map((chart) => (
                        <View key={chart.category} style={styles.categoryChartContainer}>
                            <View style={styles.categoryChartHeader}>
                                {Icons[chart.category as keyof typeof Icons]?.icon ? (
                                    <View style={{ marginRight: 8 }}>
                                        {React.cloneElement(Icons[chart.category as keyof typeof Icons]?.icon, {
                                            size: 18,
                                            color: Icons[chart.category as keyof typeof Icons]?.backgroundColor,
                                        })}
                                    </View>
                                ) : null}
                                <Text
                                    size={16}
                                    weight="bold"
                                    color={Icons[chart.category as keyof typeof Icons]?.backgroundColor || Colors.secondary}
                                >
                                    {CategoryUtils.getCategoryName(chart.category)}
                                </Text>
                            </View>
                            <CustomLimitChart data={chart.data} maxValue={chart.maxValue} />
                        </View>
                    ))}
                </ScrollView>
            ) : (
                <View style={styles.noDataContainer}>
                    <Text size={16} color={Colors.foreground}>No data available for the selected date range</Text>
                </View>
            )}

            <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendIndicator, { backgroundColor: Colors.secondary }]} />
                    <Text size={12} color={Colors.foreground}>Spent</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendIndicator, { backgroundColor: Colors.secondary_dark_2 }]} />
                    <Text size={12} color={Colors.foreground}>Limit</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendIndicator, { backgroundColor: Colors.danger }]} />
                    <Text size={12} color={Colors.foreground}>Exceeded</Text>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    categoryFilterContainer: {
        flexDirection: "row",
        marginBottom: 15,
    },
    categoryFilterButton: {
        backgroundColor: lowOpacity(Colors.primary, 0.3),
        borderWidth: 0.5,
        borderColor: Colors.primary,
        borderRadius: 7.5,
        padding: 8,
        paddingHorizontal: 15,
        marginRight: 8,
        gap: 5,
        alignItems: "center",
        justifyContent: "center",
    },
    selectedCategoryButton: {
        backgroundColor: lowOpacity(Colors.secondary, 0.15),
        borderColor: lowOpacity(Colors.secondary, 0.5),
    },
    loadingContainer: {
        justifyContent: "center",
        alignItems: "center",
        minHeight: 300,
    },
    errorContainer: {
        padding: 20,
        backgroundColor: lowOpacity("#ff0000", 0.1),
        borderRadius: 10,
        borderWidth: 1,
        borderColor: lowOpacity("#ff0000", 0.3),
        marginVertical: 20,
    },
    noDataContainer: {
        padding: 30,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.primary_light,
        borderRadius: 10,
        height: 200,
        width: Layout.screen.width - 60,
    },
    legendContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 20,
        paddingHorizontal: 20,
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "center",
    },
    legendIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 6,
    },
    horizontalChartsContainer: {
        flexDirection: "row",
    },
    categoryChartContainer: {
        width: Layout.screen.width - 30,
    },
    categoryChartHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 5,
        paddingLeft: 10,
    },
})

export { LimitsComparisonComponent }

export default function LimitsComparison() {
    return (
        <ChartTemplate
            initialStartDate={moment().startOf("year").format("YYYY-MM-DD")}
            types={[]}
            title="Limits comparison"
            description="limits comparison per month in range"
        >
            {({ dateRange, type }) => <LimitsComparisonComponent dateRange={dateRange} />}
        </ChartTemplate>
    )
}
