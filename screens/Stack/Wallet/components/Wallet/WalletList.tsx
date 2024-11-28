import BottomSheet from "@gorhom/bottom-sheet";
import { Expense, Wallet } from "@/types";
import WalletItem, { WalletElement, parseDateToText } from "./WalletItem";
import { useState, useRef, useEffect, useMemo, useCallback, useTransition } from "react";
import { Text, NativeScrollEvent, View, StyleSheet, VirtualizedList } from "react-native";
import { WalletSheet } from "../Sheets/WalletSheet";
import Animated, { LinearTransition, SharedValue } from "react-native-reanimated";
import { NativeSyntheticEvent } from "react-native";
import moment from "moment";
import Colors, { Sizing } from "@/constants/Colors";
import Ripple from "react-native-material-ripple";
import { useWalletContext } from "../WalletContext";
import Color from "color";
import { gql, useQuery } from "@apollo/client";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";

const AnimatedList = Animated.createAnimatedComponent(VirtualizedList);

export default function WalletList(props: {
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
  }, [props?.wallet?.expenses.length]);

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
    ({ item }: { item: { month: string; expenses: Expense[] } }) => (
      <MonthExpenseList
        showTotal={!props.filtersActive}
        item={item}
        setSelected={(expense) => {
          navigation.navigate("Expense", {
            expense: expense,
          });
        }}
        sheet={sheet}
      />
    ),
    [props.filtersActive]
  );

  return (
    <>
      <AnimatedList
        onEndReached={!props.isLocked ? props.onEndReached : () => {}}
        onEndReachedThreshold={0.5}
        scrollEventThrottle={16}
        removeClippedSubviews
        onScroll={props.onScroll}
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 15,
        }}
        data={data || []}
        keyExtractor={(expense: any, idx) => expense.month + "_" + idx}
        renderItem={renderItem as any}
        getItem={(data, index) => data[index]}
        getItemCount={(data) => data.length}
        // ListFooterComponent={<Button onPress={props.onEndReached}>Load more</Button>}
      />

      {/* <WalletSheet selected={selected} ref={sheet} /> */}
    </>
  );
}

const MonthExpenseList = ({
  item,
  setSelected,
  sheet,
  showTotal = true,
}: {
  item: { month: string; expenses: Expense[] };
  setSelected: (expense: WalletElement) => void;
  sheet: React.RefObject<BottomSheet>;
  showTotal: boolean;
}) => {
  const diff = useQuery(
    gql`
      query getMonthTotal($date: String!) {
        getMonthTotal(date: $date)
      }
    `,
    { variables: { date: item.month } }
  );

  const amount = diff.data?.getMonthTotal || 0;

  return (
    <View style={{ marginBottom: 30 }}>
      <View style={styles.monthRow}>
        <Text style={styles.monthText}>{moment(item.month).format("MMMM YYYY")}</Text>

        {showTotal && (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ color: amount > 0 ? "#66E875" : "#F07070", fontSize: 18 }}>
              {amount > 0 ? `+${amount.toFixed(2)}` : amount.toFixed(2)}
            </Text>

            <Text style={{ color: Color(Colors.primary_lighter).lighten(5).hex() }}> zł</Text>
          </View>
        )}
      </View>
      {item?.expenses.map((expense, i) => (
        <ListItem
          key={expense.id}
          expenses={item?.expenses}
          item={expense}
          index={i}
          handlePress={() => {
            setSelected(expense as any);
            sheet.current?.snapToIndex(0);
          }}
        />
      ))}
    </View>
  );
};

const ListItem = ({
  item,
  index,
  expenses,
  handlePress,
}: {
  item: Expense;
  index: number;
  expenses: Expense[];
  handlePress: () => void;
}) => {
  const hasPrevious = expenses?.[index - 1] !== undefined;

  const areDatesEqual = useMemo(() => {
    if (!hasPrevious || index === 0) return false;
    return moment(expenses[index - 1].date).isSame(item.date, "day");
  }, [expenses, index]);

  const {
    refs: { bottomSheetRef },
    calendar: { setCalendarDate },
  } = useWalletContext();

  return (
    <>
      {!areDatesEqual && (
        <Ripple
          onPress={() => {
            setCalendarDate(moment(item.date).toDate());
            bottomSheetRef.current?.snapToIndex(0);
          }}
          style={[styles.dateTextContainer, { marginBottom: 5 }]}
        >
          <Text style={styles.dateText}>{parseDateToText(item.date)}</Text>
        </Ripple>
      )}
      <WalletItem index={index} handlePress={handlePress} {...(item as any)} />
    </>
  );
};

const styles = StyleSheet.create({
  monthText: {
    fontSize: Sizing.text,
    fontWeight: "600",
    color: Colors.text_light,
  },

  dateTextContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 5,
  },

  dateText: {
    color: "rgba(255,255,255,0.7)",
    fontWeight: "400",
    fontSize: 15,
  },

  monthRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
});
