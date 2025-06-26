import { gql, useMutation, useQuery } from "@apollo/client";
import { Text, View, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from "react-native";
import { CategoryIcon, CategoryUtils, Icons } from "./ExpenseIcon";
import lowOpacity from "@/utils/functions/lowOpacity";
import Colors, { secondary_candidates } from "@/constants/Colors";
import Animated, { FadeIn, LinearTransition } from "react-native-reanimated";
import Ripple from "react-native-material-ripple";
import { useEffect, useMemo, useState } from "react";
import Feedback from "react-native-haptic-feedback";
import Modal from "@/components/ui/Modal";
import Layout from "@/constants/Layout";
import { Formik } from "formik";
import ValidatedInput from "@/components/ui/ValidatedInput";
import CategorySelector from "./CreateExpense/CategorySelector";
import Select from "@/components/ui/Select/Select";
import Button from "@/components/ui/Button/Button";
import { useWalletContext } from "./WalletContext";
import * as yup from "yup";
import moment from "moment";
import useGetStatistics from "../hooks/useGetStatistics";
import { AnimatedSelector } from "@/components";
import dayjs from "dayjs";
import { AntDesign } from "@expo/vector-icons";
import Color from "color";

const validationSchema = yup.object().shape({
  category: yup.string().required("Category is required"),
  amount: yup.number().typeError("Amount must be a number").positive("Amount must be positive").required("Amount is required"),
  type: yup.string().required(),
});

const GET_LIMITS = gql`
  query Limits($range: String!, $date: String) {
    limits(range: $range, date: $date) {
      id
      category
      amount
      current
    }
  }
`;

const GET_WALLET = gql`
  query {
    wallet {
      income
      monthlyPercentageTarget
    }
  }
`;

function makePreviousRange(range: string) {
  const date = dayjs();
  switch (range) {
    case "daily":
      return date.subtract(1, "day").format("YYYY-MM-DD");
    case "weekly":
      return date.subtract(1, "week").format("YYYY-MM-DD");
    case "monthly":
      return date.subtract(1, "month").format("YYYY-MM-DD");
    case "yearly":
      return date.subtract(1, "year").format("YYYY-MM-DD");
    default:
      return date.format("YYYY-MM-DD");
  }
}

export default function WalletLimits() {
  const [selectedRange, setSelectedRange] = useState("monthly");

  const { data: limits, loading, error } = useQuery(GET_LIMITS, { variables: { range: selectedRange } });

  const date = useMemo(() => makePreviousRange(selectedRange), [selectedRange]);

  const { data: limitsLastRange } = useQuery(GET_LIMITS, {
    variables: { range: selectedRange, date },
    skip: !date,
    fetchPolicy: "no-cache",
  });

  const prevMap = useMemo(
    () =>
      Object.entries(limitsLastRange?.limits || {}).reduce((acc, [key, value]) => {
        //@ts-ignore
        acc[value.category] = value?.current || 0;
        return acc;
      }, {} as Record<string, number>),
    [limitsLastRange?.limits]
  );

  // Get monthly budget data
  const { data: walletData } = useQuery(GET_WALLET);
  const { data: statistics } = useGetStatistics([moment().startOf("month").toDate(), moment().endOf("month").toDate()]);

  const [categoryPicker, setCategoryPicker] = useState(false);
  const { dispatch, filters } = useWalletContext();
  const [isCreateLimitModalVisible, setCreateLimitModalVisible] = useState(false);
  const [compactMode, setCompactMode] = useState(true);
  const [height, setHeight] = useState(150);

  const [isExactCategory, setIsExactCategory] = useState(false);

  useEffect(() => {
    dispatch({ type: "SET_IS_EXACT_CATEGORY", payload: isExactCategory });
  }, [isExactCategory]);

  const budgetStatus = useMemo(() => {
    let budgetStatus = null;
    if (walletData?.wallet && statistics?.statistics && selectedRange === "monthly") {
      const { income, monthlyPercentageTarget } = walletData.wallet;
      const { expense } = statistics.statistics;

      const targetAmount = income * (monthlyPercentageTarget / 100);
      const percentageSpent = Math.round((expense / targetAmount) * 100);

      const isOverTarget = expense > targetAmount;
      const isOverIncome = expense > income;

      budgetStatus = {
        text: isOverIncome
          ? `${percentageSpent}% over target (${Math.round((expense / income) * 100)}% of income used)`
          : isOverTarget
          ? `${percentageSpent}% spent (${percentageSpent - 100}% over target)`
          : `${percentageSpent}% spent (${100 - percentageSpent}% target remaining)`,
        color: isOverIncome ? "#F07070" : isOverTarget ? Colors.warning : "#66E875",
      };
    }
    return budgetStatus;
  }, [walletData, statistics, selectedRange]);

  const [createLimit] = useMutation(
    gql`
      mutation CreateLimit($input: CreateLimit!) {
        createLimit(input: $input) {
          id
        }
      }
    `,
    {
      onCompleted: (_, client) => {
        setCreateLimitModalVisible(false);
        setCategoryPicker(false);
        Feedback.trigger("impactLight");
      },
      onError: (error) => {
        console.log("Error creating limit:", JSON.stringify(error, null, 2));
      },
      refetchQueries: ["daily", "weekly", "monthly", "yearly"].map((item) => ({
        query: GET_LIMITS,
        variables: { range: item },
      })),
    }
  );

  const handleRangeChange = (range: any) => {
    Feedback.trigger("impactLight");
    setSelectedRange(range);
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { height }]}>
        <ActivityIndicator size="large" color={Colors.secondary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.errorContainer, { height }]}>
        <Text style={styles.errorText}>Failed to load limits</Text>
      </View>
    );
  }

  return (
    <Animated.View
      onLayout={(layout) => setHeight(layout.nativeEvent.layout.height)}
      style={[styles.container, compactMode && { height: undefined }, { height: compactMode ? undefined : height }]}
      layout={LinearTransition}
      entering={FadeIn}
    >
      <View style={styles.headerContainer}>
        <View style={{ flexDirection: "column" }}>
          <Ripple onPress={() => setCompactMode((p) => !p)} onLongPress={() => setCreateLimitModalVisible((p) => !p)}>
            <Text style={styles.header}>Spending Limits</Text>
          </Ripple>
        </View>

        {budgetStatus && (
          <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 5 }}>
            <Animated.Text style={[styles.budgetIndicator, { color: budgetStatus.color }]} entering={FadeIn}>
              {budgetStatus.text}
            </Animated.Text>
          </View>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {limits?.limits?.length === 0 ? (
          <Text style={[styles.emptyText, { width: Layout.screen.width - 30 }]}>No limits set for this period</Text>
        ) : (
          limits?.limits?.map((limit: any, index: number) => {
            const iconData = Icons[limit.category as keyof typeof Icons] || {
              backgroundColor: secondary_candidates[0],
              icon: null,
            };

            const percentage = Math.min(100, (limit.current / limit.amount) * 100);
            const isOverLimit = limit.current > limit.amount;

            // Pick a color from secondary_candidates based on index
            const color = secondary_candidates[index % secondary_candidates.length];

            const isSelected =
              filters.category === limit.category || (Array.isArray(filters.category) && filters.category.includes(limit.category));

            const lightIcon = Color(iconData.backgroundColor).lighten(0.35).hex();

            return (
              <Animated.View
                key={limit.id}
                entering={FadeIn.delay(index * 100)}
                layout={LinearTransition}
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
                      backgroundColor: lowOpacity(iconData.backgroundColor || color, 0.15),
                      flexDirection: compactMode ? "column" : "row",
                      padding: compactMode ? 15 : 22.5,
                    },
                  ]}
                  onPress={() => {
                    Feedback.trigger("impactLight");
                    if (!isSelected) {
                      setIsExactCategory(true);
                      dispatch({ type: "SET_CATEGORY", payload: limit.category });
                    } else {
                      setIsExactCategory(false);
                      dispatch({ type: "SET_CATEGORY", payload: [] as string[] });
                    }
                  }}
                >
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: lowOpacity(iconData.backgroundColor || color, 0.1) },
                      compactMode && { marginRight: 0 },
                    ]}
                  >
                    <Animated.View
                      style={{
                        position: "absolute",
                        top: -7.5,
                        left: -7.5,
                        borderWidth: 1,
                        padding: 2.5,
                        borderRadius: 100,
                        backgroundColor: lowOpacity(iconData.backgroundColor, 0.25),
                        borderColor: iconData.backgroundColor,
                      }}
                    >
                      {limit.current > prevMap[limit.category] ? (
                        <AntDesign name="arrowup" size={12} color={lightIcon} />
                      ) : (
                        <AntDesign name="arrowdown" size={12} color={lightIcon} />
                      )}
                    </Animated.View>
                    <CategoryIcon category={limit.category} type="expense" clear={false} size={20} />
                  </View>

                  <View style={styles.detailsContainer}>
                    {!compactMode && (
                      <View style={[styles.headerRow, { flexDirection: compactMode ? "column" : "row" }]}>
                        <Text style={[styles.categoryText, { textTransform: "capitalize" }]} numberOfLines={1}>
                          {CategoryUtils.getCategoryName(limit.category)}
                        </Text>

                        <Text style={[styles.amountText, isOverLimit && styles.overLimitText]}>
                          {limit.current.toFixed(2)}
                          <Text style={styles.currencyText}> zł</Text>
                          <Text style={styles.slashText}> / </Text>
                          <Text>{limit.amount.toFixed(2)} zł</Text>
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
                        style={[
                          styles.percentageText,
                          {
                            color: isOverLimit ? "#F07070" : iconData.backgroundColor || color,
                          },
                          compactMode && { fontSize: 16 },
                        ]}
                        numberOfLines={1}
                      >
                        {/* {limit.current > prevMap[limit.category] ? (
                          <AntDesign name="arrowup" size={12} color={isOverLimit ? "#F07070" : iconData.backgroundColor || color} />
                        ) : (
                          <AntDesign name="arrowdown" size={12} color={isOverLimit ? "#F07070" : iconData.backgroundColor || color} />
                        )} */}
                        {((limit.current / limit.amount) * 100).toFixed(0)}%
                      </Text>
                    </View>
                  </View>
                </Ripple>
              </Animated.View>
            );
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

      <Modal
        onBackdropPress={() => setCreateLimitModalVisible(false)}
        isVisible={isCreateLimitModalVisible}
        style={{ justifyContent: "center", alignItems: "center" }}
      >
        <View
          style={{
            width: Layout.screen.width * 0.9,
            height: Layout.screen.height * 0.5,
            backgroundColor: Colors.primary,
            borderRadius: 15,
            padding: 15,
          }}
        >
          <Text style={{ fontSize: 22, color: "#fff", fontWeight: "bold", marginBottom: 25 }}>Create limit</Text>
          <Formik
            validationSchema={validationSchema}
            initialValues={{ category: "", amount: "", type: "" }}
            onSubmit={(values) => {
              createLimit({
                variables: {
                  input: { category: values.category, amount: parseFloat(values.amount), type: selectedRange },
                },
              });
            }}
          >
            {(f) => (
              <>
                <View style={{ flex: 1 }}>
                  {!categoryPicker && <ValidatedInput showLabel label="Target limit $$" formik={f} name="amount" />}

                  {categoryPicker ? (
                    <CategorySelector
                      current={f.values.category}
                      dismiss={() => {
                        Feedback.trigger("impactLight");
                        setCategoryPicker(false);
                      }}
                      onPress={(category) => {
                        Feedback.trigger("impactLight");
                        f.setFieldValue("category", category);
                        setCategoryPicker(false);
                      }}
                    />
                  ) : (
                    <ValidatedInput
                      showLabel
                      label="Restricted category"
                      formik={f}
                      name="category"
                      onPress={() => {
                        Feedback.trigger("impactLight");
                        setCategoryPicker(true);
                      }}
                    />
                  )}
                  {!categoryPicker && (
                    <>
                      <Text style={{ marginVertical: 10 }}>
                        <Text style={styles.categoryText}>How often do you want to be reminded?</Text>
                      </Text>
                      <Select
                        setSelected={([v]) => {
                          f.handleChange("type")(v);
                          setCategoryPicker(false);
                        }}
                        options={["daily", "weekly", "monthly", "yearly"]}
                        selected={[f.values.type]}
                        closeOnSelect
                        anchor="top"
                      />
                    </>
                  )}
                </View>
                {!categoryPicker && (
                  <Button disabled={!(f.isValid && f.dirty)} onPress={() => f.handleSubmit()}>
                    Save
                  </Button>
                )}
              </>
            )}
          </Formik>
        </View>
      </Modal>
    </Animated.View>
  );
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
  header: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  budgetIndicator: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
  tabContainer: {
    flexDirection: "row",
    overflow: "hidden",
    gap: 5,
    justifyContent: "center",
  },
  tabButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  activeTabButton: {
    backgroundColor: Colors.secondary,
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  tabText: {
    fontSize: 12,
    color: "#9f9f9f",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "600",
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
  errorText: {
    color: "#F07070",
    fontSize: 15,
  },
  emptyText: {
    textAlign: "center",
    color: "#9f9f9f",
    padding: 30,
    backgroundColor: Colors.primary_lighter,
    borderRadius: 15,
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
  categoryText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
    flex: 1,
  },
  amountText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  currencyText: {
    fontSize: 12,
  },
  slashText: {
    color: "#9f9f9f",
  },
  overLimitText: {
    color: "#F07070",
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
  percentageText: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: "500",
    minWidth: 80,
    textAlign: "center",
    paddingRight: 7.5,
  },
});
