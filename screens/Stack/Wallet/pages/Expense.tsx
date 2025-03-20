import { ReactNode, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Colors, { secondary_candidates } from "@/constants/Colors";
import { CategoryIcon, WalletElement } from "../components/Wallet/WalletItem";
import SheetActionButtons from "../components/Wallet/WalletSheetControls";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { parseDate } from "@/utils/functions/parseDate";
import Header from "@/components/ui/Header/Header";
import Ripple from "react-native-material-ripple";
import useRefund from "../hooks/useRefundExpense";
import moment from "moment";

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
  const { expense } = params as { expense: WalletElement };

  const [selected, setSelected] = useState(expense);

  const amount = selected?.type === "expense" ? (selected.amount * -1).toFixed(2) : selected?.amount.toFixed(2);

  const [refund, { loading }] = useRefund((data) => {
    if (data.refundExpense.type !== "refunded") return;

    setSelected({
      ...selected,
      type: "refunded",
    });
  });

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

        {selected?.category && (
          <View style={[styles.row, { padding: 0, paddingRight: 10, paddingLeft: 0 }]}>
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

        <View
          style={[
            {
              marginTop: 15,
              flexDirection: "column",
              backgroundColor: styles.row.backgroundColor,
              padding: styles.row.padding,
              opacity: selected?.type === "refunded" ? 0.5 : 1,
            },
          ]}
        >
          <Ripple
            disabled={loading || selected?.type === "refunded"}
            onPress={() => refund({ variables: { expenseId: selected.id } })}
            style={[styles.row, { marginTop: 0, padding: 0, width: "100%" }]}
          >
            <MaterialIcons
              name={selected?.type === "refunded" ? "check-box" : "check-box-outline-blank"}
              size={24}
              color={Colors.ternary}
              style={{ paddingHorizontal: 7.5, padding: 2.5 }}
            />
            <Text style={{ color: Colors.secondary_light_2, fontSize: 18 }} numberOfLines={1}>
              {selected?.type === "refunded" ? selected?.note ?? `Refunded at ${moment().format("YYYY MM DD HH:SS")}` : "Refund"}
            </Text>
          </Ripple>
        </View>
        <View
          style={[
            {
              marginTop: 15,
              flexDirection: "column",
              backgroundColor: styles.row.backgroundColor,
              padding: styles.row.padding,
              opacity: !!selected?.subscription?.id ? 1 : 0.5,
            },
          ]}
        >
          <Ripple disabled={loading || !selected?.subscription?.id} style={[{ marginTop: 0, padding: 0, width: "100%" }]}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <MaterialIcons
                name={selected?.subscription?.isActive ? "check-box" : "check-box-outline-blank"}
                size={24}
                color={Colors.ternary}
                style={{ paddingHorizontal: 7.5, padding: 2.5 }}
              />
              <Text
                style={{ color: selected?.subscription?.isActive ? secondary_candidates[0] : Colors.secondary_light_2, fontSize: 18 }}
                numberOfLines={1}
              >
                {selected?.subscription?.isActive ? "Subscription is active" : "Subscription is not active"}
              </Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", padding: 10, marginTop: 10 }}>
              <Text style={{ color: "rgba(255,255,255,0.7)" }}>
                {selected?.subscription?.isActive ? "Next payment: " : "Last payment: "}
              </Text>

              {selected.subscription?.nextBillingDate && (
                <Text style={{ color: "rgba(255,255,255,0.7)" }}>
                  {moment(+selected?.subscription?.nextBillingDate).format("YYYY-MM-DD")}
                </Text>
              )}
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", padding: 10 }}>
              <Text style={{ color: "rgba(255,255,255,0.7)" }}>Active since</Text>

              <Text style={{ color: "rgba(255,255,255,0.7)" }}>{moment(+selected?.subscription?.dateStart).format("YYYY-MM-DD")}</Text>
            </View>
          </Ripple>
        </View>
      </View>

      <View style={{ padding: 15, paddingTop: 5 }}>
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
