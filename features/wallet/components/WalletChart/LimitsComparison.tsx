import Layout from "@/constants/Layout";
import React, { useMemo, useState } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import Colors, { secondary_candidates } from "@/constants/Colors";
import Color from "color";
import Button from "@/components/ui/Button/Button";
import lowOpacity from "@/utils/functions/lowOpacity";
import { gql, useQuery } from "@apollo/client";
import moment from "moment";
import { CategoryUtils, Icons } from "../Expense/ExpenseIcon";
import ChartTemplate from "./ChartTemplate";

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
`;

interface CategoryLimitData {
  category: string;
  spent: number;
  limit: number;
  exceeded: boolean;
}

interface MonthLimitData {
  month: string;
  totalSpent: number;
  generalLimit: number;
  generalLimitExceeded: boolean;
  categories: CategoryLimitData[];
}

interface LimitBarItem {
  type: "bar";
  category: string;
  month: string;
  spent: number;
  limit: number;
  exceeded: boolean;
  color: string;
  isLastInCategory: boolean;
  isFirstInCategory?: boolean;

  isMiddleInCategory?: boolean;
}

interface CategoryItem {
  type: "category";
  category: string;
}

type ChartItem = LimitBarItem | CategoryItem;

interface CustomLimitChartProps {
  data: ChartItem[];
  maxValue: number;
}

const CustomLimitChart: React.FC<CustomLimitChartProps> = ({ data, maxValue }) => {
  const [selectedBarInfo, setSelectedBarInfo] = useState<LimitBarItem | null>(null);

  const BAR_SPACING = 6;
  const CHART_HEIGHT = 250;
  const MIN_BAR_HEIGHT = 20;

  // Calculate number of months for label positioning
  const monthCount = useMemo(() => {
    const bars = data.filter((item) => item.type === "bar") as LimitBarItem[];
    if (bars.length === 0) return 0;
    const firstCategory = bars[0].category;
    return bars.filter((bar) => bar.category === firstCategory).length;
  }, [data]);

  const getBarHeight = (value: number): number => {
    if (!value || !maxValue) return 0;
    const proportion = value / maxValue;
    return Math.max(proportion * CHART_HEIGHT, value > 0 ? MIN_BAR_HEIGHT : 0);
  };

  const getLimitLineHeight = (limit: number): number => {
    if (!limit || !maxValue) return 0;
    const proportion = limit / maxValue;
    return proportion * CHART_HEIGHT;
  };

  const handleBarPress = (item: LimitBarItem) => {
    setSelectedBarInfo(item);
    setTimeout(() => {
      setSelectedBarInfo(null);
    }, 3000);
  };

  return (
    <View style={styles.chartWrapper}>
      <View style={styles.yAxisLabels}>
        {[4, 3, 2, 1, 0].map((i) => (
          <Text key={i} style={styles.yAxisLabel}>
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

        <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={{ height: CHART_HEIGHT + 80 }}>
          <View style={{ flexDirection: "row", paddingTop: 10, height: CHART_HEIGHT + 80, marginLeft: 15 }}>
            {data &&
              data.map((item, index) => {
                if (item.type === "category") {
                  return null;
                } else if (item.type === "bar") {
                  const spentHeight = getBarHeight(item.spent);
                  const limitLineHeight = getLimitLineHeight(item.limit);

                  return (
                    <TouchableOpacity
                      key={`bar-${index}`}
                      style={[
                        styles.barContainer,
                        {
                          marginRight: item.isLastInCategory ? GROUP_SPACING : BAR_SPACING,
                          width: BAR_WIDTH,
                        },
                      ]}
                      onPress={() => handleBarPress(item)}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.bar,
                          {
                            height: spentHeight,
                            backgroundColor: item.exceeded ? "#ff6b6b" : item.color,
                            marginTop: CHART_HEIGHT - spentHeight,
                          },
                        ]}
                      >
                        {item.spent > 0 && (
                          <View style={styles.barValueLabelWrapper}>
                            <Text style={styles.barValueLabelInside}>{item.spent.toFixed(0)}</Text>
                          </View>
                        )}
                      </View>

                      {item.limit > 0 && (
                        <View
                          style={[
                            styles.limitLine,
                            {
                              bottom: limitLineHeight,
                              borderColor: item.exceeded ? "#ff3333" : "#4CAF50",
                            },
                          ]}
                        />
                      )}

                      <Text style={[styles.monthLabel, { color: item.color }]}>{moment(item.month).format("MMM")}</Text>
                      {item.isMiddleInCategory && (
                        <View
                          style={[
                            styles.categoryLabelContainer,
                            {
                              left: -((monthCount * BAR_WIDTH + (monthCount - 1) * BAR_SPACING) / 2 - BAR_WIDTH / 2),
                              width: monthCount * BAR_WIDTH + (monthCount - 1) * BAR_SPACING,
                            },
                          ]}
                        >
                          <Text style={styles.categoryLabelText}>{CategoryUtils.getCategoryName(item.category)}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                }
                return null;
              })}
          </View>
        </ScrollView>

        {selectedBarInfo && (
          <View style={styles.tooltip}>
            <Text style={styles.tooltipTitle}>{moment(selectedBarInfo.month).format("MMM YYYY")}</Text>
            <Text style={[styles.tooltipValue, { color: selectedBarInfo.exceeded ? "#ff6b6b" : "#4CAF50" }]}>
              {selectedBarInfo.spent.toFixed(2)}zł / {selectedBarInfo.limit.toFixed(2)}zł
            </Text>
            <Text style={styles.tooltipCategory}>{CategoryUtils.getCategoryName(selectedBarInfo.category)}</Text>
            {selectedBarInfo.exceeded && <Text style={styles.tooltipExceeded}>Limit Exceeded!</Text>}
          </View>
        )}
      </View>
    </View>
  );
};

const blueText = Color(Colors.primary).lighten(10).string();

const BAR_WIDTH = 35;
const GROUP_SPACING = 40;

const LimitsComparisonComponent = ({ dateRange }: { dateRange: [string, string] }) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showGeneral, setShowGeneral] = useState(true);

  const { loading, error, data } = useQuery(LIMITS_COMPARISON, {
    variables: {
      startDate: dateRange[0],
      endDate: dateRange[1],
    },
  });

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) => (prev.includes(category) ? prev.filter((cat) => cat !== category) : [...prev, category]));
  };

  const selectAllCategories = () => {
    setSelectedCategories([]);
    setShowGeneral(true);
  };

  const { chartData, categories, maxValue } = useMemo(() => {
    if (!data?.statisticsSpendingsLimits || !Array.isArray(data.statisticsSpendingsLimits)) {
      return { chartData: [], categories: [], maxValue: 100 };
    }

    const allCategories = new Set<string>();
    data.statisticsSpendingsLimits.forEach((monthData: MonthLimitData) => {
      if (monthData?.categories && Array.isArray(monthData.categories)) {
        monthData.categories.forEach((cat: CategoryLimitData) => {
          if (cat?.category && !["edit", "none", "income"].includes(cat?.category)) {
            allCategories.add(cat.category);
          }
        });
      }
    });

    const categoriesArray = Array.from(allCategories);
    const categoriesToShow = selectedCategories.length === 0 && showGeneral ? ["general", ...categoriesArray] : selectedCategories;
    let chartDataArray: ChartItem[] = [];
    let allValues: number[] = [];

    categoriesToShow.forEach((category) => {
      chartDataArray.push({
        type: "category",
        category,
      });

      data.statisticsSpendingsLimits.forEach((monthData: MonthLimitData, monthIndex: number) => {
        let spent = 0;
        let limit = 0;
        let exceeded = false;

        if (category === "general") {
          spent = monthData.totalSpent || 0;
          limit = monthData.generalLimit || 0;
          exceeded = monthData.generalLimitExceeded || false;
        } else {
          const categoryData = monthData.categories?.find((cat) => cat.category === category);
          if (categoryData) {
            spent = categoryData.spent;
            limit = categoryData.limit;
            exceeded = categoryData.exceeded;
          }
        }

        allValues.push(spent, limit);

        chartDataArray.push({
          type: "bar",
          category,
          month: monthData.month,
          spent,
          limit,
          exceeded,
          color: secondary_candidates[monthIndex % secondary_candidates.length],
          isLastInCategory: monthIndex === data.statisticsSpendingsLimits.length - 1,
          isFirstInCategory: monthIndex === 0,
          isMiddleInCategory: monthIndex === Math.floor(data.statisticsSpendingsLimits.length / 2),
        });
      });
    });

    const maxValueCalculated = allValues.length > 0 ? Math.max(...allValues) * 1.1 : 100;

    return {
      chartData: chartDataArray,
      categories: categoriesArray,
      maxValue: maxValueCalculated,
    };
  }, [data, selectedCategories, showGeneral]);

  if (loading)
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  if (error)
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
      </View>
    );

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilterContainer}>
        <Button
          variant="text"
          key="all-categories"
          onPress={selectAllCategories}
          style={[styles.categoryFilterButton, selectedCategories.length === 0 && showGeneral && styles.selectedCategoryButton]}
        >
          <Text style={[styles.categoryFilterText, selectedCategories.length === 0 && showGeneral && styles.selectedCategoryText]}>
            All
          </Text>
        </Button>

        <Button
          variant="text"
          key="general"
          onPress={() => {
            setSelectedCategories(["general"]);
            setShowGeneral(true);
          }}
          style={[styles.categoryFilterButton, selectedCategories.includes("general") && styles.selectedCategoryButton]}
        >
          <Text style={[styles.categoryFilterText, selectedCategories.includes("general") && styles.selectedCategoryText]}>General</Text>
        </Button>

        {categories.map((category) => (
          <Button
            variant="text"
            key={category}
            onPress={() => {
              toggleCategory(category);
              setShowGeneral(false);
            }}
            style={[
              styles.categoryFilterButton,
              selectedCategories.includes(category) && {
                ...styles.selectedCategoryButton,
                borderColor: lowOpacity(Icons[category as keyof typeof Icons]?.backgroundColor || Colors.secondary, 0.75),
                backgroundColor: lowOpacity(Icons[category as keyof typeof Icons]?.backgroundColor || Colors.secondary, 0.125),
              },
            ]}
          >
            {Icons[category as keyof typeof Icons]?.icon ? (
              <View style={{ marginRight: 5 }}>
                {React.cloneElement(Icons[category as keyof typeof Icons]?.icon, {
                  size: 15,
                })}
              </View>
            ) : null}
            <Text
              style={[
                styles.categoryFilterText,
                selectedCategories.includes(category) && {
                  ...styles.selectedCategoryText,
                  color: Icons[category as keyof typeof Icons]?.backgroundColor || Colors.secondary,
                },
              ]}
            >
              {CategoryUtils.getCategoryName(category)}
            </Text>
          </Button>
        ))}
      </ScrollView>

      {chartData.length > 0 ? (
        <CustomLimitChart data={chartData} maxValue={maxValue} />
      ) : (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No data available for the selected date range</Text>
        </View>
      )}

      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendIndicator, { backgroundColor: Colors.secondary }]} />
          <Text style={styles.legendText}>Within Limit</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendIndicator, { backgroundColor: "#ff6b6b" }]} />
          <Text style={styles.legendText}>Exceeded Limit</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { borderColor: "#4CAF50" }]} />
          <Text style={styles.legendText}>Limit Line</Text>
        </View>
      </View>
    </View>
  );
};

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
  categoryFilterText: {
    color: blueText,
    fontSize: 14,
  },
  selectedCategoryText: {
    color: Colors.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 300,
  },
  loadingText: {
    color: Colors.foreground,
    fontSize: 16,
  },
  errorContainer: {
    padding: 20,
    backgroundColor: lowOpacity("#ff0000", 0.1),
    borderRadius: 10,
    borderWidth: 1,
    borderColor: lowOpacity("#ff0000", 0.3),
    marginVertical: 20,
  },
  errorText: {
    color: "#ff7777",
    fontSize: 16,
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
  noDataText: {
    color: Colors.foreground,
    fontSize: 16,
  },
  chartWrapper: {
    flexDirection: "row",
    height: 330,
    marginTop: 10,
  },
  yAxisLabels: {
    width: 40,
    height: 250,
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingRight: 5,
  },
  yAxisLabel: {
    color: Colors.foreground,
    fontSize: 10,
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
    height: 250,
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
    bottom: -50,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryLabelText: {
    color: Colors.foreground,
    fontSize: 12,
    fontWeight: "bold",
    backgroundColor: Color(Colors.primary).lighten(0.3).string(),
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    textAlign: "center",
  },
  barContainer: {
    alignItems: "center",
    height: 250,
    position: "relative",
  },
  bar: {
    width: "100%",
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    justifyContent: "center",
    alignItems: "center",
    overflow: "visible",
  },
  barValueLabelWrapper: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  barValueLabelInside: {
    color: "#000",
    fontSize: 10,
    textAlign: "center",
    transform: [{ rotate: "-90deg" }],
    width: 80,
  },
  limitLine: {
    position: "absolute",
    left: -5,
    right: -5,
    height: 2,
    borderTopWidth: 1,
  },
  monthLabel: {
    fontSize: 10,
    fontWeight: "bold",
    marginTop: 5,
  },
  tooltip: {
    position: "absolute",
    top: 50,
    left: 50,
    backgroundColor: Color(Colors.primary).lighten(0.5).string(),
    padding: 10,
    borderRadius: 5,
    width: 180,
    zIndex: 10,
  },
  tooltipTitle: {
    color: Colors.foreground,
    fontWeight: "bold",
    fontSize: 14,
  },
  tooltipValue: {
    fontSize: 16,
    marginVertical: 5,
    fontWeight: "bold",
  },
  tooltipCategory: {
    color: Colors.foreground,
    fontSize: 12,
    opacity: 0.8,
  },
  tooltipExceeded: {
    color: "#ff6b6b",
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 5,
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
    borderRadius: 2,
    marginRight: 6,
  },
  legendLine: {
    width: 20,
    height: 2,
    borderTopWidth: 2,
    borderStyle: "dashed",
    marginRight: 6,
  },
  legendText: {
    color: Colors.foreground,
    fontSize: 12,
  },
});

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
  );
}
