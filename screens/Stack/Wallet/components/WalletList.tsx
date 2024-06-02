import BottomSheet from "@gorhom/bottom-sheet";
import { Wallet } from "../../../../types";
import WalletItem, { WalletElement, parseDateToText } from "./WalletItem";
import { useState, useRef, useEffect } from "react";
import { Text, NativeScrollEvent } from "react-native";
import { WalletSheet } from "../components/WalletSheet";
import Animated, { SharedValue } from "react-native-reanimated";
import { NativeSyntheticEvent } from "react-native";
import moment from "moment";

export default function WalletList(props: {
  wallet: Wallet;
  scrollY: SharedValue<number>;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}) {
  const [selected, setSelected] = useState<WalletElement | undefined>(
    undefined
  );

  const sheet = useRef<BottomSheet | null>(null);

  useEffect(() => {
    // or just replace it
    setSelected(undefined);
    sheet.current?.close();
  }, [props?.wallet?.expenses]);

  const AnimatedWalletItem = ({
    item,
    index,
  }: {
    index: number;
    item: WalletElement;
  }) => {
    return (
      <WalletItem
        index={index}
        animatedStyle={{}}
        handlePress={() => {
          setSelected(item);
          sheet.current?.snapToIndex(0);
        }}
        {...item}
      />
    );
  };

  return (
    <>
      <Animated.FlatList
        removeClippedSubviews
        onScroll={props.onScroll}
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 15,
        }}
        data={props?.wallet?.expenses || []}
        keyExtractor={(expense) => expense.id}
        renderItem={({ item, index }) => {
          const expenses = props.wallet.expenses;

          const hasPrev = expenses?.[index - 1] !== undefined;

          const areDatesEqual = hasPrev
            ? moment(item.date).isSame(
                moment(expenses?.[index - 1].date),
                "date"
              )
            : false;

          return (
            <>
              {!areDatesEqual && (
                <Text
                  style={{
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: 16,
                    padding: 5,
                    marginTop: index === 0 ? 0 : 10,
                  }}
                >
                  {parseDateToText(item.date)}
                </Text>
              )}
              <AnimatedWalletItem index={index} item={item as any} />
            </>
          );
        }}
      />

      <WalletSheet sheet={sheet} selected={selected} ref={sheet} />
    </>
  );
}
