import { ReactNode, useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import Colors, { secondary_candidates } from "@/constants/Colors";
import { CategoryIcon } from "../components/Wallet/WalletItem";
import SheetActionButtons from "../components/Wallet/WalletSheetControls";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { parseDate } from "@/utils/functions/parseDate";
import Header from "@/components/ui/Header/Header";
import Ripple from "react-native-material-ripple";
import useRefund from "../hooks/useRefundExpense";
import moment from "moment";
import useSubscription from "../hooks/useSubscription";
import { Expense as ExpenseType } from "@/types";

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
  const [expense, setExpense] = useState<ExpenseType>(params?.expense);
  const [selected, setSelected] = useState(expense);

  const amount = selected?.type === "expense" ? (selected.amount * -1).toFixed(2) : selected?.amount.toFixed(2);

  const [refund, { loading: refundLoading }] = useRefund((data) => {
    if (data.refundExpense.type !== "refunded") return;

    setSelected({
      ...selected,
      type: "refunded",
    });
  });

  const subscription = useSubscription();
  const isSubscriptionLoading = subscription.createSubscriptionState.loading || subscription.cancelSubscriptionState.loading;

  const hasSubscription = !!selected?.subscription?.id;

  const isSubscriptionActive = hasSubscription && selected?.subscription?.isActive;

  const handleSubscriptionAction = () => {
    const actionTitle = hasSubscription
      ? isSubscriptionActive
        ? "Disable Subscription"
        : "Enable Subscription"
      : "Create Monthly Subscription";

    Alert.alert(actionTitle, `Are you sure you want to ${actionTitle.toLowerCase()}?`, [
      {
        onPress: async () => {
          try {
            if (isSubscriptionActive && selected?.subscription?.id) {
              const result = await subscription.cancelSubscription({
                variables: { subscriptionId: selected.subscription.id },
              });

              if (result.data?.cancelSubscription) {
                setSelected(result.data.cancelSubscription);
              }
            } else {
              const result = await subscription.createSubscription({
                variables: { expenseId: selected.id },
              });

              if (result.data?.createSubscription) {
                setSelected(result.data.createSubscription);
              }
            }
          } catch (error) {
            Alert.alert("Error", "Failed to update subscription. Please try again.");
          }
        },
        text: "Yes",
      },
      {
        onPress: () => {},
        text: "Cancel",
      },
    ]);
  };

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
            <CategoryIcon type={selected?.type as "expense" | "income"} category={(selected?.category || "none") as any} clear />

            <Text style={{ color: Colors.secondary_light_2, fontSize: 18 }}>{capitalize(selected?.category)}</Text>
          </View>
        )}

        <View style={styles.row}>
          <AntDesign name="calendar" size={24} color={Colors.ternary} style={{ paddingHorizontal: 7.5, padding: 2.5 }} />

          <Text style={{ color: Colors.secondary_light_2, fontSize: 18 }}>{parseDate(selected?.date || "")}</Text>
        </View>
        <View style={styles.row}>
          <MaterialIcons name="money" size={24} color={Colors.ternary} style={{ paddingHorizontal: 7.5, padding: 2.5 }} />

          <Text style={{ color: Colors.secondary_light_2, fontSize: 18 }}>{capitalize(selected?.type)}</Text>
        </View>

        <View style={styles.row}>
          <MaterialIcons name="money" size={24} color={Colors.ternary} style={{ paddingHorizontal: 7.5, padding: 2.5 }} />

          <Text style={{ color: Colors.secondary_light_2, fontSize: 18 }}>Balance before: {selected?.balanceBeforeInteraction} zł</Text>
        </View>

        {/* Refund section */}
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
            disabled={refundLoading || selected?.type === "refunded"}
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
            {refundLoading && <ActivityIndicator size="small" color={Colors.ternary} style={{ marginLeft: 10 }} />}
          </Ripple>
        </View>

        {/* Subscription section */}
        <View
          style={[
            {
              marginTop: 15,
              flexDirection: "column",
              backgroundColor: styles.row.backgroundColor,
              padding: styles.row.padding,
            },
          ]}
        >
          <Ripple onPress={handleSubscriptionAction} disabled={isSubscriptionLoading} style={[{ marginTop: 0, padding: 0, width: "100%" }]}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <MaterialIcons
                  name={isSubscriptionActive ? "check-box" : "check-box-outline-blank"}
                  size={24}
                  color={Colors.ternary}
                  style={{ paddingHorizontal: 7.5, padding: 2.5 }}
                />
                <Text
                  style={{
                    color: isSubscriptionActive ? secondary_candidates[0] : Colors.secondary_light_2,
                    fontSize: 18,
                    textTransform: "uppercase",
                  }}
                >
                  {hasSubscription ? (isSubscriptionActive ? "Subscription is active" : "Subscription is inactive") : "Set up subscription"}
                </Text>
              </View>
              {isSubscriptionLoading && <ActivityIndicator size="small" color={Colors.ternary} />}
            </View>

            {hasSubscription && (
              <>
                <View style={{ flexDirection: "row", justifyContent: "space-between", padding: 10, marginTop: 10 }}>
                  <Text style={{ color: "rgba(255,255,255,0.7)" }}>{isSubscriptionActive ? "Next payment: " : "Last payment: "}</Text>

                  {selected.subscription?.nextBillingDate && (
                    <Text style={{ color: "rgba(255,255,255,0.7)" }}>
                      {moment(+selected?.subscription?.nextBillingDate).format("YYYY-MM-DD")}
                    </Text>
                  )}
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between", padding: 10 }}>
                  <Text style={{ color: "rgba(255,255,255,0.7)" }}>{isSubscriptionActive ? "Active since" : "Created on"}</Text>

                  <Text style={{ color: "rgba(255,255,255,0.7)" }}>{moment(+selected?.subscription?.dateStart).format("YYYY-MM-DD")}</Text>
                </View>
              </>
            )}

            <View style={{ padding: 10, alignItems: "center" }}>
              <Text style={{ color: isSubscriptionActive ? "rgba(255,0,0,0.7)" : "rgba(0,255,0,0.7)" }}>
                {hasSubscription
                  ? isSubscriptionActive
                    ? "Tap to disable subscription"
                    : "Tap to enable subscription"
                  : "Tap to create monthly subscription"}
              </Text>
            </View>
          </Ripple>
        </View>
      </View>

      <View style={{ padding: 15, paddingTop: 5 }}>
        <SheetActionButtons
          onCompleted={() => {
            navigation.goBack();
          }}
          selectedExpense={selected as any}
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
