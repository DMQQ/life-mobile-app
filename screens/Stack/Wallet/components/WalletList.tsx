import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { Wallet } from "../../../../types";
import WalletItem, { WalletElement, parseDateToText } from "./WalletItem";
import {
  useState,
  useRef,
  forwardRef,
  ReactNode,
  useMemo,
  useCallback,
} from "react";
import { Text, View, NativeScrollEvent } from "react-native";
import Colors from "../../../../constants/Colors";
import Button from "../../../../components/ui/Button/Button";
import useDeleteActivity from "../hooks/useDeleteActivity";
import Color from "color";
import Animated, { SharedValue } from "react-native-reanimated";
import { NativeSyntheticEvent } from "react-native";

export const WalletSheet = forwardRef<BottomSheet, { children: ReactNode }>(
  ({ children }, ref) => {
    const backdropComponent = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
        />
      ),
      []
    );

    return (
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
        snapPoints={["40%"]}
        backdropComponent={backdropComponent}
      >
        {children}
      </BottomSheet>
    );
  }
);

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

export default function WalletList(props: {
  wallet: Wallet;
  scrollY: SharedValue<number>;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}) {
  const [selected, setSelected] = useState<WalletElement | undefined>(
    undefined
  );

  const sheet = useRef<BottomSheet | null>(null);

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

  const walletTransformed = useMemo(() => {
    let output = new Map<string, WalletElement[]>();

    for (let expense of props?.wallet?.expenses || []) {
      const date = expense.date.split("T")[0];
      let mapItem = output.get(date) || [];

      if (mapItem) {
        output.set(date, [...mapItem, expense]);
      } else {
        output.set(date, [expense]);
      }
    }

    return Array.from(output, ([key, value]) => [key, value]) as [
      string,
      WalletElement[]
    ][];
  }, [props.wallet]);

  const renderItem = useCallback(
    ({
      item: [date, list],
    }: {
      item: [string, WalletElement[]];
      index: number;
    }) => (
      <View style={{ marginBottom: 15 }}>
        <Text
          style={{
            color: "#fff",
            fontWeight: "bold",
            fontSize: 20,
            padding: 10,
          }}
        >
          {parseDateToText(date)}
        </Text>
        <View style={{ padding: 5 }}>
          {list.map((item, index) => (
            <AnimatedWalletItem index={index} key={item.id} item={item} />
          ))}
        </View>
      </View>
    ),
    []
  );

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
        keyExtractor={([key]) => key as string}
        renderItem={renderItem}
      />

      <WalletSheet ref={sheet}>
        <View style={{ padding: 15, flex: 1 }}>
          <View style={{ flex: 2 }}>
            <Txt size={75} color={"#fff"}>
              {selected?.description}
            </Txt>

            <Text
              style={{
                fontSize: 40,
                fontWeight: "bold",
                color: Colors.secondary,
                lineHeight: 55,
                marginTop: 15,
              }}
            >
              {selected?.type === "expense"
                ? (selected.amount * -1).toFixed(2)
                : selected?.amount.toFixed(2)}
              <Text style={{ fontSize: 20 }}>zł</Text>
            </Text>

            <Text
              style={{
                fontSize: 15,
                color: "rgba(255,255,255,0.2)",
              }}
            >
              Balance before ({selected?.balanceBeforeInteraction}
              zł)
            </Text>
          </View>

          <SheetActionButtons
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

const SheetActionButtons = (props: {
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
        marginTop: 20,
      }}
    >
      <Button
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
