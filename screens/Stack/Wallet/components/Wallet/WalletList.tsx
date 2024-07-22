import BottomSheet from "@gorhom/bottom-sheet";
import { Expense, Wallet } from "@/types";
import WalletItem, { WalletElement, parseDateToText } from "./WalletItem";
import { useState, useRef, useEffect, useMemo } from "react";
import { Text, NativeScrollEvent, View, StyleSheet } from "react-native";
import { WalletSheet } from "./WalletSheet";
import Animated, { SharedValue } from "react-native-reanimated";
import { NativeSyntheticEvent } from "react-native";
import moment from "moment";
import { gql, useQuery } from "@apollo/client";
import Colors from "@/constants/Colors";
import Color from "color";
import { RefreshControl } from "react-native-gesture-handler";

export default function WalletList(props: {
  wallet: Wallet;
  scrollY: SharedValue<number>;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  refetch: () => void;
}) {
  const [selected, setSelected] = useState<WalletElement | undefined>(
    undefined
  );

  const [refreshing, setRefreshing] = useState(false);

  const sheet = useRef<BottomSheet>(null);

  useEffect(() => {
    // or just replace it
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

      if (
        previous &&
        moment(previous?.expenses[0]?.date).isSame(expense.date, "month")
      ) {
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

  return (
    <>
      <Animated.FlatList
        refreshing={refreshing}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={props.refetch} />
        }
        removeClippedSubviews
        onScroll={props.onScroll}
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 15,
        }}
        data={data || []}
        keyExtractor={(expense, idx) => expense.month + "_" + idx}
        renderItem={({ item }) => (
          <MonthExpenseList
            item={item}
            setSelected={setSelected}
            sheet={sheet}
          />
        )}
      />

      <WalletSheet sheet={sheet as any} selected={selected} ref={sheet} />
    </>
  );
}

const displayTotal = (data: { getMonthTotal: number }) => {
  const total = Math.trunc(data.getMonthTotal);

  return `${total > 0 ? `+${total}` : total} zł`;
};

const totalTextColor = (data: { getMonthTotal: number }) => {
  return data.getMonthTotal > 0 ? "#F07070" : "#66E875";
};

const MonthExpenseList = ({
  item,
  setSelected,
  sheet,
}: {
  item: { month: string; expenses: Expense[] };
  setSelected: (expense: WalletElement) => void;
  sheet: React.RefObject<BottomSheet>;
}) => {
  const date = useMemo(
    () => moment(item.expenses?.[0].date).format("YYYY-MM-DD"),
    []
  );

  const { data, loading } = useQuery(
    gql`
      query GetMonthlyDiff($date: String!) {
        getMonthTotal(date: $date)
      }
    `,
    {
      variables: {
        date: date,
      },
    }
  );

  return (
    <View style={{ marginBottom: 10 }}>
      <View style={styles.monthRow}>
        <Text style={styles.monthText}>{item.month}</Text>

        {!loading && data.getMonthTotal !== 0 && (
          <Text
            style={{
              color: totalTextColor(data),
              fontSize: 15,
            }}
          >
            {displayTotal(data)}
          </Text>
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
            sheet.current?.expand();
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

  const areDatesEqual = (() => {
    if (!hasPrevious) return false;

    if (index === 0) return false;

    return moment(expenses[index - 1].date).isSame(item.date, "day");
  })();

  return (
    <>
      {!areDatesEqual && (
        <View style={styles.dateTextContainer}>
          <Text style={styles.dateText}>{parseDateToText(item.date)}</Text>
        </View>
      )}
      <WalletItem index={index} handlePress={handlePress} {...(item as any)} />
    </>
  );
};

const styles = StyleSheet.create({
  monthText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 10,
    paddingHorizontal: 5,
  },

  dateTextContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 5,
  },

  dateText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  monthRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
