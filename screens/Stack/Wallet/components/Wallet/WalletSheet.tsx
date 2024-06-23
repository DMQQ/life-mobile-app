import BottomSheet, {
  BottomSheetGorhom,
} from "@/components/ui/BottomSheet/BottomSheet";
import { ReactNode, forwardRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/Colors";
import { WalletElement } from "./WalletItem";
import SheetActionButtons from "./WalletSheetControls";

const styles = StyleSheet.create({
  text: {
    fontSize: 15,
    marginTop: 10,
    color: "#fff",
    backgroundColor: Colors.secondary_dark_1,
    padding: 5,
    paddingHorizontal: 15,
    borderRadius: 100,
    marginRight: 5,
  },
});

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

          <Txt size={30} color="#fff">
            {amount}
            <Text style={{ fontSize: 16 }}>zł</Text>
          </Txt>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 5,
              marginTop: 10,
            }}
          >
            <Text style={styles.text}>
              {new Date(selected?.date!).toLocaleDateString()}
              {" at "}
              {new Date(selected?.date!).toLocaleTimeString("pl-PL", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>

            <Text style={styles.text}>{selected?.category}</Text>

            <Text style={styles.text}>
              Balance: {selected?.balanceBeforeInteraction.toFixed(2)}zł
            </Text>

            <Text style={styles.text}>Type: {selected?.type}</Text>
          </View>
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
