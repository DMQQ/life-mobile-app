import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { Wallet } from "../../../../types";
import WalletItem, { WalletElement } from "./WalletItem";
import { useState, useRef, forwardRef, ReactNode } from "react";
import { ScrollView, Text, View, VirtualizedList } from "react-native";
import Colors from "../../../../constants/Colors";
import Button from "../../../../components/ui/Button/Button";
import useDeleteActivity from "../hooks/useDeleteActivity";
import Color from "color";
import { EvilIcons, Feather } from "@expo/vector-icons";

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

export default function WalletList(props: { wallet: Wallet }) {
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

  return (
    <>
      <VirtualizedList
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 10,
        }}
        getItemCount={(data) => data.length}
        data={props?.wallet?.expenses || []}
        keyExtractor={(expense: WalletElement) => expense.id}
        getItem={(data, index) => data[index] as WalletElement}
        renderItem={({ item }) => (
          <WalletItem
            handlePress={() => {
              setSelected(item);
              sheet.current?.snapToIndex(0);
            }}
            {...item}
          />
        )}
      />

      <WalletSheet ref={sheet}>
        <View style={{ paddingHorizontal: 10, flex: 1 }}>
          <View style={{ flex: 2 }}>
            <Text style={{ fontSize: 15, color: "rgba(255,255,255,0.2)" }}>
              Expense name
            </Text>
            <Txt size={45} color={Colors.secondary}>
              {selected?.description}
            </Txt>

            <Text
              style={{
                fontSize: 15,
                marginTop: 10,
                color: "rgba(255,255,255,0.2)",
              }}
            >
              Total amount, before {selected?.balanceBeforeInteraction}zł
            </Text>

            <Text
              style={{
                fontSize: 50,
                fontWeight: "bold",
                color: "#fff",
                lineHeight: 55,
              }}
            >
              {selected?.type === "income" ? "+" : "-"}
              {selected?.amount}zł
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
        }}
      >
        Edit event
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
        }}
      >
        Remove event
      </Button>
    </View>
  );
};
