import BottomSheet from "@gorhom/bottom-sheet";
import { Expense, Wallet } from "@/types";
import WalletItem, { WalletElement, parseDateToText } from "./WalletItem";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Text, NativeScrollEvent, View, StyleSheet, VirtualizedList } from "react-native";
import { WalletSheet } from "../Sheets/WalletSheet";
import Animated, { SharedValue } from "react-native-reanimated";
import { NativeSyntheticEvent } from "react-native";
import moment from "moment";
import Colors from "@/constants/Colors";
import Ripple from "react-native-material-ripple";
import { useWalletContext } from "../WalletContext";
import Color from "color";

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
  const [selected, setSelected] = useState<WalletElement | undefined>(undefined);
  const sheet = useRef<BottomSheet>(null);

  useEffect(() => {
    setSelected(undefined);
    sheet.current?.close();
  }, [props?.wallet?.expenses]);

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
          month: moment(expense.date).format("MMMM YYYY"),
          expenses: [expense],
        });
      }
    }

    return sorted;
  }, [props?.wallet?.expenses]);

  const renderItem = useCallback(
    ({ item }: { item: { month: string; expenses: Expense[] } }) => (
      <MonthExpenseList showTotal={!props.filtersActive} item={item} setSelected={setSelected} sheet={sheet} />
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

      <WalletSheet selected={selected} ref={sheet} />
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
  const [expense, income] = useMemo(() => {
    let income = 0;
    let expense = 0;
    item.expenses.forEach((item) => {
      if (item.type === "income") {
        income += item.amount;
      } else {
        expense += item.amount;
      }
    });
    return [expense * -1, income] as const;
  }, [item.expenses]);

  return (
    <View style={{ marginBottom: 30 }}>
      <View style={styles.monthRow}>
        <Text style={styles.monthText}>{item.month}</Text>

        {showTotal && income !== 0 && expense !== 0 && (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ color: "#66E875" }}> +{income.toFixed(0)}</Text>
            <Text style={{ color: Color(Colors.primary_lighter).lighten(5).hex() }}> / </Text>
            <Text style={{ color: "#F07070" }}>{expense.toFixed(0)}</Text>
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
    color: "#fff",
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 15,
    paddingHorizontal: 5,
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
  },
});
