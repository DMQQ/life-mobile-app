import BottomSheet, {
  BottomSheetGorhom,
} from "@/components/ui/BottomSheet/BottomSheet";
import { ReactNode, forwardRef } from "react";
import { Text, View } from "react-native";
import Colors from "@/constants/Colors";
import { WalletElement } from "./WalletItem";
import SheetActionButtons from "./WalletSheetControls";

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

export const WalletSheet = forwardRef<
  BottomSheetGorhom,
  {
    selected: WalletElement | undefined;
  }
>(({ selected }, ref) => {
  const amount =
    selected?.type === "expense"
      ? (selected.amount * -1).toFixed(2)
      : selected?.amount.toFixed(2);

  return (
    <BottomSheet ref={ref} snapPoints={["50%"]}>
      <View style={{ paddingHorizontal: 15, flex: 1 }}>
        <View style={{ flex: 2 }}>
          <View style={{ marginBottom: 15 }}>
            <Txt size={40} color={Colors.secondary}>
              {selected?.description}
            </Txt>
          </View>

          <Txt size={25} color="#fff">
            {amount}
            <Text style={{ fontSize: 17 }}>zł</Text>
          </Txt>

          <Text style={{ fontSize: 15, marginTop: 10, color: "#fff" }}>
            {new Date(selected?.date!).toLocaleDateString()}
            {"-"}
            {new Date(selected?.date!).toLocaleTimeString()}
          </Text>

          <Text style={{ fontSize: 15, marginTop: 10, color: "#fff" }}>
            {selected?.category}
          </Text>

          <Text style={{ fontSize: 15, marginTop: 10, color: "#fff" }}>
            Balance: {selected?.balanceBeforeInteraction.toFixed(2)}zł
          </Text>

          <Text style={{ fontSize: 15, marginTop: 10, color: "#fff" }}>
            Type: {selected?.type}
          </Text>
        </View>

        <SheetActionButtons
          onCompleted={() => {
            (ref as any).current.forceClose();
          }}
          selectedExpense={selected}
        />
      </View>
    </BottomSheet>
  );
});
