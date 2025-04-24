import Layout from "@/constants/Layout";
import { useMemo, useState } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import Colors, { secondary_candidates } from "@/constants/Colors";
import Color from "color";
import Button from "@/components/ui/Button/Button";
import lowOpacity from "@/utils/functions/lowOpacity";
import { gql, useQuery } from "@apollo/client";
import moment from "moment";

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
`;

interface CategoryData {
  category: string;
  total: number;
  avg: number;
  count: number;
}

interface MonthData {
  month: string;
  categories: CategoryData[];
}

interface BarItem {
  type: "bar";
  category: string;
  month: string;
  value: number;
  displayValue: number;
  color: string;
  isLastInCategory: boolean;
  isFirstInCategory?: boolean;
  isOutlier?: boolean;
}

interface CategoryItem {
  type: "category";
  category: string;
}

type ChartItem = BarItem | CategoryItem;

interface CustomBarChartProps {
  data: ChartItem[];
  maxValue: number;
}

const CustomBarChart: React.FC<CustomBarChartProps> = ({ data, maxValue }) => {
  const [selectedBarInfo, setSelectedBarInfo] = useState<BarItem | null>(null);

  const BAR_WIDTH = 24;
  const BAR_SPACING = 6;
  const GROUP_SPACING = 40;
  const CATEGORY_LABEL_HEIGHT = 20;
  const CHART_HEIGHT = 250;
  const MIN_BAR_HEIGHT = 20;

  const getBarHeight = (value: number): number => {
    if (!value || !maxValue) return 0;
    const proportion = value / maxValue;
    return Math.max(proportion * CHART_HEIGHT, value > 0 ? MIN_BAR_HEIGHT : 0);
  };

  const handleBarPress = (item: BarItem) => {
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
                  const barHeight = getBarHeight(item.displayValue);

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
                            height: barHeight,
                            backgroundColor: item.color,
                            marginTop: CHART_HEIGHT - barHeight,
                          },
                        ]}
                      >
                        {item.value > 0 && (
                          <View style={styles.barValueLabelWrapper}>
                            <Text style={styles.barValueLabelInside}>
                              {item.isOutlier ? "↑" + item.value.toFixed(0) : item.value.toFixed(1)}
                            </Text>
                          </View>
                        )}
                      </View>

                      <Text style={[styles.monthLabel, { color: item.color }]}>{item.month.substring(0, 3)}</Text>
                      {item.isLastInCategory && (
                        <View style={styles.categoryLabelContainer}>
                          <Text style={styles.categoryLabelText}>{item.category}</Text>
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
            <Text style={styles.tooltipTitle}>{selectedBarInfo.month}</Text>
            <Text style={styles.tooltipValue}>{selectedBarInfo.value.toFixed(2)}zł</Text>
            <Text style={styles.tooltipCategory}>{selectedBarInfo.category}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const button = {
  padding: 10,
  paddingHorizontal: 15,
  borderRadius: 7.5,
  backgroundColor: Colors.primary_light,
  flex: 1,
};

const blueText = Color(Colors.primary).lighten(10).string();

const MonthlyCategoryComparison: React.FC = () => {
  const defaultMonths = useMemo(() => {
    const months = [];
    for (let i = 2; i >= 0; i--) {
      const date = moment().subtract(i, "months").format("YYYY-MM-DD");
      months.push(date);
    }
    return months;
  }, []);

  const [selectedMonths] = useState<string[]>(defaultMonths);
  const [viewType, setViewType] = useState<"total" | "avg" | "count">("total");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { loading, error, data } = useQuery(GET_MONTHLY_CATEGORY_COMPARISON, {
    variables: { months: selectedMonths },
  });

  const { chartData, categories, months, maxValue } = useMemo(() => {
    if (!data?.monthlyCategoryComparison || !Array.isArray(data.monthlyCategoryComparison)) {
      return { chartData: [], categories: [], months: [], maxValue: 100 };
    }

    const allCategories = new Set<string>();
    data.monthlyCategoryComparison.forEach((monthData: MonthData) => {
      if (monthData?.categories && Array.isArray(monthData.categories)) {
        monthData.categories.forEach((cat: CategoryData) => {
          if (cat?.category && !["edit", "none", "income"].includes(cat?.category)) allCategories.add(cat.category);
        });
      }
    });

    const categoriesArray = Array.from(allCategories);
    const monthsArray = data.monthlyCategoryComparison.map((monthData: MonthData) => monthData.month || "Unknown");
    const categoriesToShow = selectedCategory ? [selectedCategory] : categoriesArray;
    const allValues: number[] = [];
    let chartDataArray: ChartItem[] = [];

    categoriesToShow.forEach((category) => {
      chartDataArray.push({
        type: "category",
        category,
      });

      data.monthlyCategoryComparison.forEach((monthData: MonthData, monthIndex: number) => {
        const categoryData = monthData.categories?.find((cat) => cat.category === category);
        const value = categoryData
          ? viewType === "total"
            ? categoryData.total
            : viewType === "avg"
            ? categoryData.avg
            : categoryData.count
          : 0;

        if (value > 0) {
          allValues.push(value);
        }

        chartDataArray.push({
          type: "bar",
          category,
          month: monthData.month,
          value,
          displayValue: value,
          color: secondary_candidates[monthIndex % secondary_candidates.length],
          isLastInCategory: monthIndex === data.monthlyCategoryComparison.length - 1,
          isFirstInCategory: monthIndex === 0,
        });
      });
    });

    let maxValueCalculated = 100;

    if (allValues.length > 0) {
      const sortedValues = [...allValues].sort((a, b) => a - b);

      const q1Index = Math.floor(sortedValues.length * 0.25);
      const q3Index = Math.floor(sortedValues.length * 0.75);
      const q1 = sortedValues[q1Index] || 0;
      const q3 = sortedValues[q3Index] || 100;
      const iqr = q3 - q1;

      const upperFence = q3 + 2.5 * iqr;

      const regularValues = sortedValues.filter((v) => v <= upperFence);
      const filteredMax = regularValues.length > 0 ? Math.max(...regularValues) : Math.max(...sortedValues);

      maxValueCalculated = filteredMax * 1.2;

      chartDataArray = chartDataArray.map((item) => {
        if (item.type === "bar" && item.value > upperFence) {
          return {
            ...item,
            isOutlier: true,
            displayValue: maxValueCalculated * 0.95,
          };
        } else if (item.type === "bar") {
          return {
            ...item,
            isOutlier: false,
            displayValue: item.value,
          };
        }
        return item;
      });
    }

    return {
      chartData: chartDataArray,
      categories: categoriesArray,
      months: monthsArray,
      maxValue: maxValueCalculated,
    };
  }, [data, viewType, selectedCategory]);

  const MonthLegend = useMemo(() => {
    if (!months || months.length === 0) return null;

    return (
      <View style={styles.monthLegendContainer}>
        {months.map((month, index) => (
          <View key={index} style={styles.monthLegendItem}>
            <View style={[styles.colorIndicator, { backgroundColor: secondary_candidates[index % secondary_candidates.length] }]} />
            <Text style={styles.monthLegendText}>{month}</Text>
          </View>
        ))}
      </View>
    );
  }, [months]);

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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={{ color: "#fff", fontSize: 18, fontWeight: 600, marginBottom: 5 }}>Monthly Category Comparison</Text>
        <Text style={styles.subtitle}>Monthly comparison of your expenses by category</Text>

        <View style={styles.typeSelectorContainer}>
          {["total", "avg", "count"].map((item) => (
            <Button
              variant="text"
              key={item}
              onPress={() => setViewType(item as "total" | "avg" | "count")}
              style={[
                button,
                {
                  borderWidth: 0.5,
                  borderColor: Colors.primary,
                  marginRight: 5,
                  ...(item === viewType && {
                    backgroundColor: lowOpacity(Colors.secondary, 0.15),
                    borderWidth: 0.5,
                    borderColor: lowOpacity(Colors.secondary, 0.5),
                  }),
                },
              ]}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: viewType === item ? Colors.secondary : blueText,
                  textAlign: "center",
                }}
              >
                {item.toUpperCase()}
              </Text>
            </Button>
          ))}
        </View>
      </View>

      {categories.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilterContainer}>
          <Button
            variant="text"
            key="all-categories"
            onPress={() => setSelectedCategory(null)}
            style={[styles.categoryFilterButton, !selectedCategory && styles.selectedCategoryButton]}
          >
            <Text style={[styles.categoryFilterText, !selectedCategory && styles.selectedCategoryText]}>All</Text>
          </Button>

          {categories.map((category) => (
            <Button
              variant="text"
              key={category}
              onPress={() => setSelectedCategory(category)}
              style={[styles.categoryFilterButton, selectedCategory === category && styles.selectedCategoryButton]}
            >
              <Text style={[styles.categoryFilterText, selectedCategory === category && styles.selectedCategoryText]}>{category}</Text>
            </Button>
          ))}
        </ScrollView>
      )}

      {chartData.length > 0 ? (
        <CustomBarChart data={chartData} maxValue={maxValue} />
      ) : (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No data available for the selected months</Text>
        </View>
      )}
      {MonthLegend}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: Layout.screen.width - 30,
    marginTop: 25,
    marginBottom: 25,
    minHeight: 500,
  },
  header: {
    marginBottom: 10,
  },
  titleContainer: {
    marginBottom: 15,
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    color: "gray",
    fontSize: 16,
    marginBottom: 20,
  },
  typeSelectorContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
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
  monthLegendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
    backgroundColor: Color(Colors.primary).lighten(0.2).string(),
    padding: 10,
    borderRadius: 8,
  },
  monthLegendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  monthLegendText: {
    color: "#fff",
    fontSize: 13,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 300,
  },
  loadingText: {
    color: "#fff",
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
    color: "#fff",
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
    color: "#fff",
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
    bottom: -40,
    left: -80,
    right: -20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  categoryLabelText: {
    color: "#fff",
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
    width: 150,
    zIndex: 10,
  },
  tooltipTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  tooltipValue: {
    color: "#fff",
    fontSize: 16,
    marginVertical: 5,
  },
  tooltipCategory: {
    color: "#fff",
    fontSize: 12,
    opacity: 0.8,
  },
});

export default MonthlyCategoryComparison;
