import { ReactNode, useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View, ActivityIndicator, ScrollView } from "react-native";
import Colors, { secondary_candidates } from "@/constants/Colors";
import WalletItem, { CategoryIcon } from "../components/Wallet/WalletItem";
import { AntDesign, Feather, MaterialIcons } from "@expo/vector-icons";
import { parseDate } from "@/utils/functions/parseDate";
import Header from "@/components/ui/Header/Header";
import Ripple from "react-native-material-ripple";
import useRefund from "../hooks/useRefundExpense";
import moment from "moment";
import useSubscription from "../hooks/useSubscription";
import { Expense as ExpenseType } from "@/types";
import useDeleteActivity from "../hooks/useDeleteActivity";
import { gql, useLazyQuery, useQuery } from "@apollo/client";

const similarCategories = {
  food: ["drinks"],
  drinks: ["food"],
  transport: ["travel"],
  travel: ["transportation"],
  entertainment: ["subscriptions", "gifts"],
  electronics: ["subscriptions", "gifts", "entertainment"],
} as const;

const useGetSimilarExpenses = ({ description: name, date, category, type, amount }: ExpenseType) => {
  return useLazyQuery(
    gql`
      query GetSimilarExpenses($filters: GetWalletFilters, $skip: Int, $take: Int) {
        wallet {
          id
          balance
          expenses(filters: $filters, take: $take, skip: $skip) {
            id
            amount
            date
            description
            type
            category
            balanceBeforeInteraction
            note
            subscription {
              id
              isActive
              nextBillingDate
              dateStart
            }
          }
        }
      }
    `,
    {
      variables: {
        filters: {
          title: name,
          amount: {
            from: amount - amount * 0.5,
            to: amount + amount * 0.5,
          },
          date: {
            // from: moment(date).subtract(30, "days").format("YYYY-MM-DD"),
            // to: moment(date).add(30, "days").format("YYYY-MM-DD"),
          },
          category: [category, ...(similarCategories[category as keyof typeof similarCategories] || [])].filter(Boolean),
          type,
        },
        skip: 0,
        take: 6,
      },
    }
  );
};

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
  const [selected, setSelected] = useState(params?.expense);

  const amount = selected?.type === "expense" ? (selected.amount * -1).toFixed(2) : selected?.amount.toFixed(2);

  const [refund, { loading: refundLoading }] = useRefund((data) => {
    if (data.refundExpense.type !== "refunded") return;

    setSelected({
      ...selected,
      type: "refunded",
    });
  });

  const [getLazyExpenses, { data: similar, called }] = useGetSimilarExpenses(selected);
  const [calls, setCalls] = useState(0);
  useEffect(() => {
    if (selected != null) {
      getLazyExpenses();
    }
  }, [selected]);

  useEffect(() => {
    if (!called || calls > 1) return;

    if (similar?.wallet?.expenses.length === 1) {
      getLazyExpenses({
        variables: {
          filters: {
            title: "",
            amount: {
              from: 0,
              to: 1000000,
            },
            date: {
              // from: moment(selected.date).subtract(30, "days").format("YYYY-MM-DD"),
              // to: moment(selected.date).add(30, "days").format("YYYY-MM-DD"),
            },
            category: [selected?.category, ...(similarCategories[selected.category as keyof typeof similarCategories] || [])].filter(
              Boolean
            ),
            type: selected.type,
          },
          skip: 0,
          take: 6,
        },
      });
      setCalls(calls + 1);
    }
  }, [similar?.wallet?.expenses, calls]);

  const handleRefund = () => {
    Alert.alert("Refund Expense", "Are you sure you want to refund this expense?", [
      {
        onPress: async () => {
          try {
            await refund({ variables: { expenseId: selected.id } });
          } catch (error) {
            Alert.alert("Error", "Failed to refund the expense. Please try again.");
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

  const { deleteActivity } = useDeleteActivity();

  const handleDelete = async () => {
    const onRemove = async () => {
      if (typeof selected?.id !== "undefined")
        await deleteActivity({
          variables: {
            id: selected?.id,
          },

          onCompleted() {
            navigation.goBack();
          },
        });
    };

    Alert.alert("Delete Expense", "Are you sure you want to delete this expense?", [
      {
        onPress: onRemove,
        text: "Yes",
      },
      {
        onPress: () => {},
        text: "Cancel",
      },
    ]);
  };

  const handleEdit = () => {
    navigation.navigate("CreateExpense", {
      ...selected,
      isEditing: true,
    });
  };

  return (
    <View style={{ flex: 1, paddingTop: 15 }}>
      <Header
        buttons={[
          {
            icon: <Feather name="trash" size={20} color="white" />,
            onPress: handleDelete,
          },
          {
            icon: <Feather name="edit-2" size={20} color="white" />,
            onPress: handleEdit,
            style: { marginLeft: 20 },
          },
        ]}
        goBack
        backIcon={<AntDesign name="close" size={24} color="white" />}
      />
      <ScrollView style={{ flex: 1, marginTop: 5 }}>
        <View style={{ marginBottom: 30, marginTop: 15, paddingHorizontal: 15 }}>
          <View style={[styles.row, { marginTop: 0, padding: 15, flexWrap: "wrap" }]}>
            <Txt size={30} color={"#fff"}>
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
          <View style={[styles.row]}>
            <Ripple
              disabled={refundLoading || selected?.type === "refunded"}
              onPress={handleRefund}
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
          <View style={styles.row}>
            <MaterialIcons
              name={isSubscriptionActive ? "refresh" : "refresh"}
              size={24}
              color={Colors.ternary}
              style={{ paddingHorizontal: 7.5, padding: 2.5 }}
            />

            <Text style={{ color: Colors.secondary_light_2, fontSize: 18 }}>
              {hasSubscription ? (isSubscriptionActive ? "Subscription active" : "Subscription inactive") : "Set up subscription"}
            </Text>

            {isSubscriptionLoading && <ActivityIndicator size="small" color={Colors.ternary} style={{ marginLeft: 10 }} />}
          </View>

          {hasSubscription && (
            <>
              <View style={styles.row}>
                <MaterialIcons name="date-range" size={24} color={Colors.ternary} style={{ paddingHorizontal: 7.5, padding: 2.5 }} />
                <Text style={{ color: Colors.secondary_light_2, fontSize: 18 }}>
                  {isSubscriptionActive ? "Next payment: " : "Last payment: "}
                  {selected.subscription?.nextBillingDate && moment(+selected?.subscription?.nextBillingDate).format("YYYY-MM-DD")}
                </Text>
              </View>
              <View style={styles.row}>
                <MaterialIcons name="history" size={24} color={Colors.ternary} style={{ paddingHorizontal: 7.5, padding: 2.5 }} />
                <Text style={{ color: Colors.secondary_light_2, fontSize: 18 }}>
                  {isSubscriptionActive ? "Active since: " : "Created on: "}
                  {moment(+selected?.subscription?.dateStart).format("YYYY-MM-DD")}
                </Text>
              </View>
            </>
          )}

          {/* Subscription action button */}
          <Ripple
            onPress={handleSubscriptionAction}
            disabled={isSubscriptionLoading}
            style={[
              styles.row,
              {
                marginTop: 10,
                justifyContent: "center",
                backgroundColor: isSubscriptionActive ? "rgba(255,59,48,0.2)" : "rgba(52,199,89,0.2)",
              },
            ]}
          >
            <Text
              style={{
                color: isSubscriptionActive ? "rgba(255,59,48,0.9)" : "rgba(52,199,89,0.9)",
                fontSize: 16,
                fontWeight: "bold",
              }}
            >
              {hasSubscription ? (isSubscriptionActive ? "Disable Subscription" : "Enable Subscription") : "Create Monthly Subscription"}
            </Text>
          </Ripple>
        </View>

        {similar?.wallet?.expenses?.length > 1 && (
          <View style={{ paddingHorizontal: 15, marginBottom: 25 }}>
            <Txt size={20} color={"#fff"}>
              Recent similar expenses
            </Txt>

            <View style={{ marginTop: 25 }}>
              {similar?.wallet?.expenses
                ?.filter((items: any) => items.id !== selected?.id)
                .map((item: any) => (
                  <WalletItem
                    key={item.id}
                    {...item}
                    handlePress={() => {
                      navigation.push("Expense", {
                        expense: item,
                      });
                    }}
                  />
                ))}
            </View>
          </View>
        )}
      </ScrollView>
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
    padding: 15,
    borderRadius: 15,
    backgroundColor: Colors.primary_light,
    marginTop: 10,
  },
});
