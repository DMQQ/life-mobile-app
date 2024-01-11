import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import BottomSheet from "@gorhom/bottom-sheet";
import { ReactNode, forwardRef, useCallback } from "react";
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
  BottomSheet,
  {
    selected: WalletElement | undefined;
    sheet: { current: BottomSheet | null };
  }
>(({ selected, sheet }, ref) => {
  const backdropComponent = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        opacity={0.55}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    ),
    []
  );

  const amount =
    selected?.type === "expense"
      ? (selected.amount * -1).toFixed(2)
      : selected?.amount.toFixed(2);
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
      snapPoints={["60%"]}
      backdropComponent={backdropComponent}
    >
      <View style={{ padding: 15, flex: 1 }}>
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

          <Text
            style={{
              fontSize: 15,
              color: "rgba(255,255,255,0.2)",
            }}
          >
            Balance before ({selected?.balanceBeforeInteraction}
            zł)
          </Text>

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
            sheet.current?.forceClose();
          }}
          selectedExpense={selected}
        />
      </View>
    </BottomSheet>
  );
});
