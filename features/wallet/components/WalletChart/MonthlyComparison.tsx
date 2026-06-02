import Layout from "@/constants/Layout"
import React, { useMemo, useState } from "react"
import { StyleSheet, View, ScrollView } from "react-native"
import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import Color from "color"
import Button from "@/components/ui/Button/Button"
import lowOpacity from "@/utils/functions/lowOpacity"
import { gql, useQuery } from "@apollo/client"
import moment from "moment"
import ChartTemplate, { Types } from "./ChartTemplate"
import { CategoryUtils, Icons } from "../Expense/ExpenseIcon"
import AnimatedBar from "@/components/ui/Charts/AnimatedBar"

const GET_MONTHLY_CATEGORY_COMPARISON = gql`
    query MonthlyCategoryComparison($months: [String!]!) {
        monthlyCategoryComparison(months: $months) {
            month
            categories {
                category
                total
                avg
                count
            }
        }
    }
`

interface CategoryData {
    category: string
    total: number
    avg: number
    count: number
}

interface MonthData {
    month: string
    categories: CategoryData[]
}

interface BarItem {
    type: "bar"
    category: string
    month: string
    value: number
    displayValue: number
    isLastInCategory: boolean
    isFirstInCategory?: boolean
    isOutlier?: boolean
}

interface CategoryItem {
    type: "category"
    category: string
}

type ChartItem = BarItem | CategoryItem

const BAR_WIDTH = 35
const BAR_SPACING = 6
const GROUP_SPACING = 40
const CHART_HEIGHT = 250

interface CustomBarChartProps {
    data: ChartItem[]
    maxValue: number
}

const CustomBarChart: React.FC<CustomBarChartProps> = ({ data, maxValue }) => {
    return (
        <View style={styles.chartWrapper}>
            <View style={styles.yAxisLabels}>
                {[4, 3, 2, 1, 0].map((i) => (
                    <Text key={i} size={10} color={Colors.foreground}>
                        {Math.round((maxValue / 4) * i)}zł
                    </Text>
                ))}
            </View>

            <View style={styles.chartContent}>
                <View style={styles.gridLines}>
                    {[0, 1, 2, 3, 4].map((i) => (
                        <View key={i} style={[styles.gridLine, { top: CHART_HEIGHT - (CHART_HEIGHT / 4) * i }]} />
                    ))}
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={true}
                    contentContainerStyle={{ height: CHART_HEIGHT + 80 }}
                >
                    <View style={{ flexDirection: "row", paddingTop: 10, height: CHART_HEIGHT + 80, marginLeft: 15 }}>
                        {data.map((item, index) => {
                            if (item.type === "category") return null

                            return (
                                <View key={`bar-${index}`} style={{ position: "relative" }}>
                                    <AnimatedBar
                                        value={item.displayValue}
                                        maxValue={maxValue}
                                        chartHeight={CHART_HEIGHT}
                                        label={item.month}
                                        index={index}
                                        barWidth={BAR_WIDTH}
                                        marginRight={item.isLastInCategory ? GROUP_SPACING : BAR_SPACING}
                                        isOutlier={item.isOutlier}
                                        valueLabel={item.value > 0 ? item.value.toFixed(1) : undefined}
                                        color={Colors.secondary}
                                        labelColor={Colors.secondary}
                                    />
                                    {item.isLastInCategory && (
                                        <View style={styles.categoryLabelContainer}>
                                            <Text size={12} weight="bold" color={Colors.foreground} align="center" style={{ backgroundColor: Color(Colors.primary).lighten(0.3).string(), paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 }}>
                                                {CategoryUtils.getCategoryName(item.category)}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            )
                        })}
                    </View>
                </ScrollView>
            </View>
        </View>
    )
}

const blueText = Colors.foreground_secondary

const MonthlyCategoryComparison = ({ dateRange, type: viewType }: { dateRange: [string, string]; type: Types }) => {
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])

    const generateMonthsArray = (startDate: string, endDate: string) => {
        const start = moment(startDate).startOf("month")
        const end = moment(endDate).startOf("month")
        const months: string[] = []
        let current = moment(start)
        while (current.isSameOrBefore(end, "month")) {
            months.push(current.format("YYYY-MM-DD"))
            current.add(1, "month")
        }
        return months
    }

    const { loading, error, data } = useQuery(GET_MONTHLY_CATEGORY_COMPARISON, {
        variables: { months: generateMonthsArray(...dateRange) },
    })

    const toggleCategory = (category: string) => {
        setSelectedCategories((prev) =>
            prev.includes(category) ? prev.filter((cat) => cat !== category) : [...prev, category],
        )
    }

    const selectAllCategories = () => {
        setSelectedCategories([])
    }

    const { chartData, categories, maxValue } = useMemo(() => {
        if (!data?.monthlyCategoryComparison || !Array.isArray(data.monthlyCategoryComparison)) {
            return { chartData: [], categories: [], months: [], maxValue: 100 }
        }

        const allCategories = new Set<string>()
        data.monthlyCategoryComparison.forEach((monthData: MonthData) => {
            if (monthData?.categories && Array.isArray(monthData.categories)) {
                monthData.categories.forEach((cat: CategoryData) => {
                    if (cat?.category && !["edit", "none", "income"].includes(cat?.category))
                        allCategories.add(cat.category)
                })
            }
        })

        const categoriesArray = Array.from(allCategories)
        const categoriesToShow = selectedCategories.length === 0 ? categoriesArray : selectedCategories
        const allValues: number[] = []
        let chartDataArray: ChartItem[] = []

        categoriesToShow.forEach((category) => {
            chartDataArray.push({ type: "category", category })

            data.monthlyCategoryComparison.forEach((monthData: MonthData, monthIndex: number) => {
                const categoryData = monthData.categories?.find((cat) => cat.category === category)
                const value = categoryData
                    ? viewType === "total"
                        ? categoryData.total
                        : viewType === "avg"
                          ? categoryData.avg
                          : categoryData.count
                    : 0

                if (value > 0) allValues.push(value)

                chartDataArray.push({
                    type: "bar",
                    category,
                    month: monthData.month,
                    value,
                    displayValue: value,
                    isLastInCategory: monthIndex === data.monthlyCategoryComparison.length - 1,
                    isFirstInCategory: monthIndex === 0,
                })
            })
        })

        let maxValueCalculated = 100

        if (allValues.length > 0) {
            const sortedValues = [...allValues].sort((a, b) => a - b)
            const q3Index = Math.floor(sortedValues.length * 0.75)
            const q1Index = Math.floor(sortedValues.length * 0.25)
            const iqr = (sortedValues[q3Index] || 100) - (sortedValues[q1Index] || 0)
            const upperFence = (sortedValues[q3Index] || 100) + 2.5 * iqr
            const regularValues = sortedValues.filter((v) => v <= upperFence)
            const filteredMax = regularValues.length > 0 ? Math.max(...regularValues) : Math.max(...sortedValues)
            maxValueCalculated = filteredMax * 1.2

            chartDataArray = chartDataArray.map((item) => {
                if (item.type === "bar" && item.value > upperFence) {
                    return { ...item, isOutlier: true, displayValue: maxValueCalculated * 0.95 }
                } else if (item.type === "bar") {
                    return { ...item, isOutlier: false, displayValue: item.value }
                }
                return item
            })
        }

        return { chartData: chartDataArray, categories: categoriesArray, months: [], maxValue: maxValueCalculated }
    }, [data, viewType, selectedCategories])

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
            {categories.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilterContainer}>
                    <Button
                        variant="text"
                        key="all-categories"
                        onPress={selectAllCategories}
                        style={[
                            styles.categoryFilterButton,
                            selectedCategories.length === 0 && styles.selectedCategoryButton,
                        ]}
                    >
                        <Text size={14} color={selectedCategories.length === 0 ? Colors.secondary : blueText}>
                            All
                        </Text>
                    </Button>

                    {categories.map((category) => (
                        <Button
                            variant="text"
                            key={category}
                            onPress={() => toggleCategory(category)}
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
            )}

            {chartData.length > 0 ? (
                <CustomBarChart data={chartData} maxValue={maxValue} />
            ) : (
                <View style={styles.noDataContainer}>
                    <Text size={16} color={Colors.foreground}>No data available for the selected months</Text>
                </View>
            )}
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
        flex: 1,
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
        backgroundColor: Color(Colors.primary).lighten(0.3).string(),
        borderRadius: 10,
        height: 200,
        width: Layout.screen.width - 60,
    },
    chartWrapper: {
        flexDirection: "row",
        height: 330,
        marginTop: 10,
    },
    yAxisLabels: {
        width: 40,
        height: CHART_HEIGHT,
        justifyContent: "space-between",
        alignItems: "flex-end",
        paddingRight: 5,
    },
    chartContent: {
        flex: 1,
        position: "relative",
    },
    gridLines: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: CHART_HEIGHT,
    },
    gridLine: {
        position: "absolute",
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: Color(Colors.primary).lighten(0.8).string(),
    },
    categoryLabelContainer: {
        position: "absolute",
        bottom: -40,
        left: -80,
        right: -20,
        alignItems: "center",
        justifyContent: "center",
    },
})

export default function MonthlyComparison() {
    return (
        <ChartTemplate
            types={["total", "avg", "count"]}
            title="Category comparison"
            description="Side by side comparison of total expense sum/avg/count in selected date range"
        >
            {({ dateRange, type }) => <MonthlyCategoryComparison type={type} dateRange={dateRange} />}
        </ChartTemplate>
    )
}
