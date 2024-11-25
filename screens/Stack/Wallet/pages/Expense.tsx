import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/Colors";
import { CategoryIcon, WalletElement } from "../components/Wallet/WalletItem";
import SheetActionButtons from "../components/Wallet/WalletSheetControls";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { parseDate } from "@/utils/functions/parseDate";
import Layout from "@/constants/Layout";
import Header from "@/components/ui/Header/Header";

const capitalize = (s = "") => s.charAt(0).toUpperCase() + s.slice(1);

const Txt = (props: { children: ReactNode; size: number; color?: any }) => (
  <Text
    style={{
      color: props.color ?? Colors.secondary,
      fontSize: props.size,
      fontWeight: "bold",
      lineHeight: props.size + 7.5,
    }}
  >
    {props.children}
  </Text>
);

export default function Expense({ route: { params }, navigation }: any) {
  const { expense: selected } = params as { expense: WalletElement };

  const amount = selected?.type === "expense" ? (selected.amount * -1).toFixed(2) : selected?.amount.toFixed(2);

  return (
    <View style={{ flex: 1, paddingTop: 15 }}>
      <Header buttons={[]} goBack backIcon={<AntDesign name="close" size={24} color="white" />} />
      <View style={{ marginBottom: 30, marginTop: 15, paddingHorizontal: 15 }}>
        <View style={[styles.row, { marginTop: 0, padding: 15, flexWrap: "wrap" }]}>
          <Txt size={20} color={"#fff"}>
            {capitalize(selected?.description)}
          </Txt>

          <Txt size={20} color={Colors.secondary_light_2}>
            {amount}
            <Text style={{ fontSize: 16 }}>zł</Text>
          </Txt>
        </View>

        {selected?.type !== "income" && (
          <View style={styles.row}>
            <CategoryIcon type={selected?.type as "expense" | "income"} category={selected?.category || "none"} clear />

            <Text style={{ color: Colors.secondary_light_2, fontSize: 18 }}>{capitalize(selected?.category)}</Text>
          </View>
        )}

        <View style={styles.row}>
          <AntDesign name="calendar" size={24} color={Colors.ternary} style={{ paddingHorizontal: 7.5, padding: 2.5 }} />

          <Text style={{ color: Colors.secondary_light_2, fontSize: 18 }}>{parseDate(selected?.date || "")}</Text>
        </View>
        <View style={styles.row}>
          <AntDesign name="clockcircle" size={24} color={Colors.ternary} style={{ paddingHorizontal: 7.5, padding: 2.5 }} />

          <Text style={{ color: Colors.secondary_light_2, fontSize: 18 }}>
            {new Date(selected?.date || new Date()).toISOString().split("T")[1].split(".")[0]}
          </Text>
        </View>

        <View style={styles.row}>
          <MaterialIcons name="money" size={24} color={Colors.ternary} style={{ paddingHorizontal: 7.5, padding: 2.5 }} />

          <Text style={{ color: Colors.secondary_light_2, fontSize: 18 }}>{capitalize(selected?.type)}</Text>
        </View>

        <View style={styles.row}>
          <MaterialIcons name="money" size={24} color={Colors.ternary} style={{ paddingHorizontal: 7.5, padding: 2.5 }} />

          <Text style={{ color: Colors.secondary_light_2, fontSize: 18 }}>Balance before: {selected?.balanceBeforeInteraction} zł</Text>
        </View>
      </View>

      <View style={{ padding: 15 }}>
        <SheetActionButtons
          onCompleted={() => {
            navigation.goBack();
          }}
          selectedExpense={selected}
        />
      </View>
    </View>
  );
}

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

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    backgroundColor: Colors.primary_light,
    marginTop: 10,
  },
});
