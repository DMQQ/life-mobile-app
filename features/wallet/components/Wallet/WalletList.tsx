import BottomSheet from "@gorhom/bottom-sheet";
import { Expense, Wallet } from "@/types";
import WalletItem, { parseDateToText } from "./WalletItem";
import { useRef, useEffect, useMemo, useCallback, useState, memo } from "react";
import { Text, NativeScrollEvent, View, StyleSheet, RefreshControl } from "react-native";
import Animated, { FadeIn, FadeInDown, FadeOutDown, LinearTransition, SharedValue } from "react-native-reanimated";
import { NativeSyntheticEvent } from "react-native";
import moment from "moment";
import Colors from "@/constants/Colors";
import Ripple from "react-native-material-ripple";
import { init, useWalletContext } from "../WalletContext";
import { gql, useQuery } from "@apollo/client";
import { useNavigation, useRoute } from "@react-navigation/native";
import WalletLimits from "../Limits";
import { getInvalidExpenses } from "../../pages/WalletCharts";
import Layout from "@/constants/Layout";
import Color from "color";
import { AntDesign } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";

const AnimatedList = Animated.createAnimatedComponent(FlashList);

function WalletList(props: {
  wallet: Wallet;
  scrollY: SharedValue<number>;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  refetch: () => void;
  onEndReached: () => void;
  isLocked: boolean;
  filtersActive: boolean;
}) {
  const route = useRoute<any>();

  const navigation = useNavigation<any>();
  const sheet = useRef<BottomSheet>(null);

  useEffect(() => {
    if (props.wallet?.expenses?.length === undefined) return;

    if (route?.params?.expenseId && props?.wallet?.expenses?.length > 0) {
      const expense = props.wallet.expenses.find((expense) => expense.id === route?.params?.expenseId);

      if (!expense) return;

      navigation.setParams({ expenseId: null });

      navigation.navigate("Expense", {
        expense: expense,
      });
    }
  }, [props?.wallet?.expenses?.length]);

  const data = useMemo(() => {
    const sorted = [] as {
      month: string;
      expenses: Expense[];
    }[];

    if (!props?.wallet?.expenses) return sorted;

    for (const expense of props.wallet.expenses) {
      const previous = sorted[sorted.length - 1];

      if (previous && moment(previous?.expenses[0]?.date).isSame(expense.date, "month")) {
        previous.expenses.push(expense);
      } else {
        sorted.push({
          month: expense.date,
          expenses: [expense],
        });
      }
    }

    return sorted;
  }, [props?.wallet?.expenses]);

  const renderItem = useCallback(
    ({ item, index }: { item: { month: string; expenses: Expense[] }; index: number }) => (
      <MonthExpenseList item={item} monthIndex={index} />
    ),
    [props.filtersActive]
  );

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await props.refetch();

    setRefreshing(false);
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <AnimatedList
        data={data || []}
        estimatedItemSize={80}
        renderItem={renderItem as any}
        keyExtractor={(item: any, index) => item.month}
        onScroll={props.onScroll}
        contentContainerStyle={{
          padding: 15,
        }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        refreshing={refreshing}
        ListHeaderComponent={<WalletLimits />}
        onEndReached={props.onEndReached}
        onEndReachedThreshold={2}
        scrollEventThrottle={16}
        removeClippedSubviews
      />

      <ClearFiltersButton />
    </View>
  );
}

const ClearFiltersButton = () => {
  const { filters, dispatch } = useWalletContext();

  const [hasFilters, diffCount] = useMemo(() => {
    let isDifferent = false;
    let diffCount = 0;

    const flatFilters = (obj: Record<string, any>) => {
      const output = {} as Record<string, any>;

      const flatten = (obj: Record<string, any>, parentKey = "") => {
        for (const key in obj) {
          const value = obj[key];
          const newKey = parentKey ? `${parentKey}.${key}` : key;

          if (typeof value === "object" && value !== null) {
            flatten(value, newKey);
          } else {
            output[newKey] = value;
          }
        }
      };

      flatten(obj);

      return output;
    };

    const flatInitFilters = flatFilters(init);

    const flatCurrentFilters = flatFilters(filters);

    for (const key in flatCurrentFilters) {
      if (flatCurrentFilters[key] !== flatInitFilters[key]) {
        isDifferent = true;
        diffCount++;
      }
    }

    return [isDifferent, diffCount];
  }, [filters]);

  const clearFilters = () => {
    dispatch({ type: "RESET" });
  };

  if (!hasFilters) return null;

  return (
    <Animated.View
      entering={FadeInDown.delay(100)}
      exiting={FadeOutDown}
      style={{ position: "absolute", bottom: 60, width: Layout.screen.width, justifyContent: "center", alignItems: "center" }}
    >
      <Ripple style={styles.filtersButton} onPress={clearFilters}>
        <Text style={{ color: Colors.secondary_light_2 }}>
          {diffCount > 0 ? `Reset (${diffCount}) ${diffCount > 1 ? "filters" : "filter"}` : "Reset filters"}
        </Text>
        <AntDesign name="close" size={18} color={Colors.secondary_light_2} />
      </Ripple>
    </Animated.View>
  );
};

const MonthExpenseList = ({ item, monthIndex = 0 }: { item: { month: string; expenses: Expense[] }; monthIndex?: number }) => {
  const diff = useQuery(
    gql`
      query getMonthTotal($date: String!) {
        getMonthTotal(date: $date)
      }
    `,
    { variables: { date: item.month } }
  );

  const amount = diff.data?.getMonthTotal || 0;

  const sum = useCallback((items: Expense[]) => {
    const expenses = items.reduce((acc, expense) => {
      if (getInvalidExpenses(expense)) return acc;
      const value = expense.amount;
      return acc + (isNaN(value) ? 0 : value);
    }, 0);

    const income = items.reduce((acc, expense) => {
      if (expense.type !== "income") return acc;
      const value = expense.amount;
      return acc + (isNaN(value) ? 0 : value);
    }, 0);
    return [expenses, income] as [number, number];
  }, []);

  const items = useMemo(() => {
    return item?.expenses.map((expense, i) => (
      <ListItem
        key={expense.id}
        expenses={item?.expenses}
        item={expense}
        index={i}
        sum={sum(
          item?.expenses.filter((item) => {
            return moment(item.date).isSame(expense.date, "day");
          })
        )}
        monthIndex={monthIndex}
      />
    ));
  }, [item.expenses]);

  return (
    <Animated.View style={{ marginBottom: 30, marginTop: monthIndex === 0 ? 30 : 0 }} layout={LinearTransition.delay(100)}>
      <View style={styles.monthRow}>
        <Text style={styles.monthText}>{moment(item.month).format("MMMM YYYY")}</Text>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ color: amount > 0 ? "#66E875" : "#F07070", fontSize: 17, fontWeight: "600" }}>
            {amount > 0 ? `+${amount.toFixed(2)}` : amount.toFixed(2)}{" "}
            <Text style={{ color: amount > 0 ? "#66E875" : "#F07070", fontSize: 13 }}>zł</Text>
          </Text>
        </View>
      </View>
      {items}
    </Animated.View>
  );
};

interface ListItemProps {
  item: Expense;
  index: number;
  expenses: Expense[];
  sum: [number, number];
  monthIndex?: number;
}

const ListItem = ({ item, index, expenses, sum }: ListItemProps) => {
  const hasPrevious = expenses?.[index - 1] !== undefined;

  const areDatesEqual = useMemo(() => {
    if (!hasPrevious || index === 0) return false;
    return moment(expenses[index - 1].date).isSame(item.date, "day");
  }, [expenses, index]);

  const {
    calendar: { setCalendarDate },
  } = useWalletContext();

  const navigation = useNavigation<any>();

  const onPress = useCallback(() => {
    setCalendarDate(moment(item.date).toDate());
    navigation.navigate("CreateExpense", {
      date: moment(item.date).format("YYYY-MM-DD"),
    });
  }, [item.date]);

  const handleNavigation = useCallback(() => {
    navigation.navigate("Expense", {
      expense: item,
    });
  }, [item]);

  return (
    <Animated.View entering={FadeIn.delay(100)} layout={LinearTransition.delay(100)}>
      {!areDatesEqual && (
        <Ripple onPress={onPress} style={styles.dateTextContainer}>
          <Text style={styles.dateText}>{parseDateToText(item.date)}</Text>

          <View style={{ gap: 5, flexDirection: "row" }}>
            {sum[0] > 0 && (
              <Text
                style={{
                  color: sum[0] > 0 ? "#F07070" : "#66E875",
                  fontSize: 15,
                  fontWeight: "600",
                }}
              >
                {sum[0] > 0 ? `-${sum[0].toFixed(2)}` : sum[0].toFixed(2)} zł
              </Text>
            )}
            {sum[0] > 0 && sum[1] > 0 && <Text style={styles.dateText}>/</Text>}
            {sum[1] > 0 && (
              <Text
                style={{
                  color: sum[1] > 0 ? "#66E875" : "#F07070",
                  fontSize: 15,
                  fontWeight: "600",
                }}
              >
                {sum[1] > 0 ? `+${sum[1].toFixed(2)}` : sum[1].toFixed(2)} zł
              </Text>
            )}
          </View>
        </Ripple>
      )}
      <WalletItem index={index} handlePress={handleNavigation} {...(item as any)} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  monthText: {
    fontSize: 25,
    fontWeight: "700",
    color: Colors.text_light,
  },

  dateTextContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 5,
    marginBottom: 15,
    marginTop: 25,
    alignItems: "center",
  },

  dateText: {
    color: "rgba(255,255,255,0.7)",
    fontWeight: "600",
    fontSize: 15,
  },

  monthRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },

  filtersButton: {
    zIndex: 1000,
    paddingVertical: 7.5,
    paddingHorizontal: 22.5,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: Color(Colors.secondary_light_1).darken(0.5).string(),
    backgroundColor: Color(Colors.secondary_light_1).darken(0.8).string(),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingRight: 15,
    width: 160,
  },
});

export default memo(WalletList);
