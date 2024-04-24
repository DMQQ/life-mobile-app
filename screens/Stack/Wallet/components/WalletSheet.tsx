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
      padding: 5,
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
    <BottomSheet ref={ref} snapPoints={["70%"]}>
      <View style={{ paddingHorizontal: 15, flex: 1 }}>
        <View style={{ flex: 2 }}>
          <View style={{ marginBottom: 15 }}>
            <Txt size={40} color={Colors.secondary}>
              {selected?.description}
            </Txt>
          </View>

          <Txt size={30} color="#fff">
            {amount}
            <Text style={{ fontSize: 17 }}>zł</Text>
          </Txt>

          <View style={{ marginTop: 15 }}>
            <Txt size={18} color={"#fff"}>
              Attached files
            </Txt>

            <View style={{ paddingVertical: 10, flexDirection: "row" }}>
              {[0, 1, 2].map((key) => (
                <View
                  key={key.toString()}
                  style={{
                    height: 75,
                    width: 125,
                    backgroundColor: Colors.primary_darker,
                    borderRadius: 10,
                    marginRight: 10,
                  }}
                />
              ))}
            </View>

            <Txt size={18} color={"#fff"}>
              Comment
            </Txt>
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
