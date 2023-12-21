import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { Wallet } from "../../../../types";
import WalletItem, { WalletElement, parseDateToText } from "./WalletItem";
import { useState, useRef, forwardRef, ReactNode, useMemo } from "react";
import { Text, View, NativeScrollEvent } from "react-native";
import Colors from "../../../../constants/Colors";
import Button from "../../../../components/ui/Button/Button";
import useDeleteActivity from "../hooks/useDeleteActivity";
import Color from "color";
import { EvilIcons, Feather } from "@expo/vector-icons";

import Animated, { SharedValue } from "react-native-reanimated";
import { NativeSyntheticEvent } from "react-native";

export const WalletSheet = forwardRef<BottomSheet, { children: ReactNode }>(
  ({ children }, ref) => (
    <BottomSheet
      ref={ref}
      handleIndicatorStyle={{
        backgroundColor: Colors.secondary,
      }}
      backgroundStyle={{
        backgroundColor: Colors.primary,
      }}
      enablePanDownToClose
      index={-1}
      snapPoints={["50%"]}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
        />
      )}
    >
      {children}
    </BottomSheet>
  )
);

export default function WalletList(props: {
  wallet: Wallet;
  scrollY: SharedValue<number>;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}) {
  const [selected, setSelected] = useState<WalletElement | undefined>(
    undefined
  );

  const sheet = useRef<BottomSheet | null>(null);

  const Txt = (props: { children: ReactNode; size: number; color?: any }) => (
    <Text
      style={{
        color: props.color ?? Colors.secondary,
        fontSize: props.size,
        fontWeight: "bold",
        lineHeight: props.size + 5,
      }}
    >
      {props.children}
    </Text>
  );

  const AnimatedWalletItem = ({
    item,
    index,
  }: {
    index: number;
    item: WalletElement;
  }) => {
    return (
      <WalletItem
        animatedStyle={{}}
        handlePress={() => {
          setSelected(item);
          sheet.current?.expand();
        }}
        {...item}
      />
    );
  };

  const walletTransformed = useMemo(() => {
    let output = new Map<string, WalletElement[]>();

    for (let i = 0; i < props?.wallet?.expenses.length; i++) {
      const curr = props.wallet.expenses[i];
      const date = curr.date.split("T")[0];
      let mapItem = output.get(date) || [];

      if (mapItem) {
        output.set(date, [...mapItem, curr]);
      } else {
        output.set(date, [curr]);
      }
    }

    return Array.from(output, ([key, value]) => [key, value]) as [
      string,
      WalletElement[]
    ][];
  }, [props.wallet]);

  return (
    <>
      <Animated.FlatList
        removeClippedSubviews
        onScroll={props.onScroll}
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 10,
        }}
        data={walletTransformed}
        keyExtractor={(entity) => entity[0] as string}
        renderItem={({ item: [date, list] }) => (
          <View style={{ marginBottom: 10 }}>
            <Text
              style={{
                color: "#fff",
                fontWeight: "bold",
                fontSize: 25,
                padding: 5,
              }}
            >
              {parseDateToText(date)}
            </Text>
            <View style={{ padding: 5 }}>
              {list.map((item) => (
                <AnimatedWalletItem index={0} key={item.id} item={item} />
              ))}
            </View>
          </View>
        )}
      />

      <WalletSheet ref={sheet}>
        <View style={{ paddingHorizontal: 10, flex: 1 }}>
          <View style={{ flex: 2 }}>
            <Txt size={45} color={Colors.secondary}>
              {selected?.description}
            </Txt>

            <Text
              style={{
                fontSize: 15,
                color: "rgba(255,255,255,0.2)",
              }}
            >
              Event name
            </Text>

            <Text
              style={{
                fontSize: 50,
                fontWeight: "bold",
                color: "#fff",
                lineHeight: 55,
                marginTop: 15,
              }}
            >
              {selected?.type === "income" ? "+" : "-"}
              {selected?.amount}zł
            </Text>

            <Text
              style={{
                fontSize: 15,
                color: "rgba(255,255,255,0.2)",
              }}
            >
              Balance before transaction ({selected?.balanceBeforeInteraction}
              zł)
            </Text>
          </View>

          <WalletSheetActionButtonsGroup
            onCompleted={() => {
              sheet.current?.forceClose();
            }}
            selectedExpense={selected}
          />
        </View>
      </WalletSheet>
    </>
  );
}

const WalletSheetActionButtonsGroup = (props: {
  selectedExpense: WalletElement | undefined;
  onCompleted: Function;
}) => {
  const { deleteActivity } = useDeleteActivity();

  const onRemove = async () => {
    if (typeof props.selectedExpense?.id !== "undefined")
      await deleteActivity({
        variables: {
          id: props.selectedExpense?.id,
        },
        onCompleted() {
          props.onCompleted();
        },
      });
  };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 15,
      }}
    >
      <Button
        icon={
          <Feather
            name="edit-3"
            style={{ marginRight: 5 }}
            size={24}
            color={Colors.secondary}
          />
        }
        type="contained"
        fontStyle={{ color: Colors.secondary, textTransform: "none" }}
        style={{
          backgroundColor: Color(Colors.secondary).alpha(0.15).string(),
          flexDirection: "row-reverse",
          flex: 1,
          marginLeft: 10,
          borderRadius: 5,
        }}
      >
        Edit
      </Button>

      <Button
        icon={
          <EvilIcons
            name="trash"
            size={30}
            style={{
              marginRight: 2.5,
            }}
            color={Colors.error}
          />
        }
        onPress={onRemove}
        type="contained"
        fontStyle={{
          color: Colors.error,
          textTransform: "none",
        }}
        style={{
          backgroundColor: Color(Colors.error).alpha(0.15).string(),
          flex: 1,
          flexDirection: "row-reverse",
          borderRadius: 5,
        }}
      >
        Remove
      </Button>
    </View>
  );
};
