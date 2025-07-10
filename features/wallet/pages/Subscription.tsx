import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator, FlatList, Dimensions } from "react-native";
import { gql, useQuery, useMutation } from "@apollo/client";
import { AntDesign, Feather, MaterialIcons } from "@expo/vector-icons";
import moment from "moment";
import Ripple from "react-native-material-ripple";

import Header from "@/components/ui/Header/Header";
import Colors from "@/constants/Colors";
import WalletItem, { CategoryIcon } from "../components/Wallet/WalletItem";
import { parseDate } from "@/utils/functions/parseDate";
import { Expense, Subscription } from "@/types";
import useSubscription from "../hooks/useSubscription";
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";

interface SubscriptionDetailsProps {
  route: { params: { subscriptionId: string } };
  navigation: any;
}

const Txt = ({ children, size, color = Colors.secondary }: { children: React.ReactNode; size: number; color?: string }) => (
  <Text
    style={{
      color,
      fontSize: size,
      fontWeight: "bold",
      lineHeight: size + 7.5,
    }}
  >
    {children}
  </Text>
);

const SUBSCRIPTION_QUERY = gql`
  query Subscription($id: String!) {
    subscription(id: $id) {
      id
      amount
      dateStart
      dateEnd
      description
      isActive
      nextBillingDate
      billingCycle
      expenses {
        id
        amount
        date
        description
        category
        balanceBeforeInteraction
        note
      }
    }
  }
`;

export default function SubscriptionDetails({ route, navigation }: SubscriptionDetailsProps) {
  const { subscriptionId } = route.params;

  const { data, loading, error, refetch } = useQuery(SUBSCRIPTION_QUERY, {
    variables: { id: subscriptionId },
  });

  const [subscription, setSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    if (data?.subscription) {
      setSubscription(data.subscription);
    }
  }, [data?.subscription]);

  const formatBillingCycle = (cycle: Pick<Subscription, "billingCycle">["billingCycle"]) => {
    const cycles = {
      daily: "Daily",
      weekly: "Weekly",
      monthly: "Monthly",
      yearly: "Yearly",
    };
    return cycles[cycle] || cycle;
  };

  const getSubscriptionDuration = () => {
    const start = moment(subscription?.dateStart ? new Date(+subscription?.dateStart) : new Date());
    const now = moment();
    const duration = moment.duration(now.diff(start));

    const years = duration.years();
    const months = duration.months();
    const days = duration.days();

    if (years > 0) {
      return `${years}y ${months}m`;
    } else if (months > 0) {
      return `${months}m ${days}d`;
    } else if (days > 0) {
      return `${days} days`;
    }
    return "Started today";
  };

  const totalSpent = subscription?.expenses.reduce((sum, expense) => sum + expense.amount, 0) || 0;
  const avgMonthlySpend = (subscription?.expenses?.length || 0) > 0 ? totalSpent / (subscription?.expenses?.length || 0) : 0;
  const daysUntilNext = moment(parseInt(subscription?.nextBillingDate || "0")).diff(moment(), "days");
  const isOverdue = daysUntilNext < 0;

  const sortedExpenses = [...(subscription?.expenses || [])].sort((a, b) => moment(b.date).diff(moment(a.date)));

  const sub = useSubscription();
  const isSubscriptionLoading = sub.createSubscriptionState.loading || sub.cancelSubscriptionState.loading;

  const hasSubscription = !!subscription?.id;

  const isSubscriptionActive = hasSubscription && subscription?.isActive;

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
            if (isSubscriptionActive && subscription?.id) {
              const result = await sub.cancelSubscription({
                variables: { subscriptionId: subscription.id },
              });

              if (result.data?.cancelSubscription) {
                setSubscription(result.data.cancelSubscription);
                refetch();
              }
            } else {
              const result = await sub.createSubscription({
                variables: { expenseId: subscription?.id },
              });

              if (result.data?.createSubscription) {
                setSubscription(result.data.createSubscription);
                refetch();
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

  const handleExpensePress = (expense: Expense) => {
    navigation.navigate("Expense", { expense });
  };

  const scrollY = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (ev) => {
      scrollY.value = ev.contentOffset.y;
    },
  });

  if (loading || !subscription) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.secondary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, paddingTop: 15, paddingBottom: 55 }}>
      <Header
        containerStyle={{
          height: 60,
          paddingTop: 15,
        }}
        scrollY={scrollY}
        title="Subscription Details"
        goBack
        backIcon={<AntDesign name="close" size={24} color="white" />}
        initialHeight={1}
      />

      <Animated.ScrollView onScroll={onScroll} style={{ flex: 1, marginTop: 5 }}>
        <View style={{ marginBottom: 30, marginTop: 15, paddingHorizontal: 15 }}>
          <View
            style={[
              styles.row,
              {
                padding: 0,
                flexWrap: "wrap",
                backgroundColor: "transparent",
                marginVertical: 20,
                alignItems: "center",
              },
            ]}
          >
            <Txt size={35} color="#fff">
              {subscription.description}
            </Txt>

            <View style={{ marginTop: 2.5 }}>
              <Txt size={20} color={"#fff"}>
                {subscription.amount.toFixed(2)}
                <Text style={{ fontSize: 16 }}>zł</Text>
              </Txt>
            </View>
          </View>

          <View style={[styles.row, { paddingVertical: 0, paddingLeft: 5 }]}>
            <CategoryIcon type="expense" category="subscriptions" />
            <Text style={{ color: Colors.secondary_light_2, fontSize: 18 }}>
              {formatBillingCycle(subscription.billingCycle)} Subscription
            </Text>
          </View>

          <View style={styles.row}>
            <MaterialIcons
              name={subscription.isActive ? "play-circle-filled" : "pause-circle-filled"}
              size={24}
              color={Colors.ternary}
              style={{ paddingHorizontal: 7.5, padding: 2.5 }}
            />
            <Text style={{ color: Colors.secondary_light_2, fontSize: 18 }}>
              Status:{" "}
              <View
                style={{
                  padding: 2.5,
                  paddingHorizontal: 7.5,
                  backgroundColor: subscription.isActive ? "green" : Colors.error,
                  borderRadius: 10,
                  marginTop: -3.5,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff", textTransform: "uppercase" }}>{subscription.isActive ? " Active" : " Inactive"}</Text>
              </View>
            </Text>
          </View>

          <View style={styles.row}>
            <AntDesign name="calendar" size={24} color={Colors.ternary} style={{ paddingHorizontal: 7.5, padding: 2.5 }} />
            <Text style={{ color: Colors.secondary_light_2, fontSize: 18 }}>Started: {parseDate(+subscription.dateStart)}</Text>
          </View>

          <View style={styles.row}>
            <MaterialIcons name="schedule" size={24} color={Colors.ternary} style={{ paddingHorizontal: 7.5, padding: 2.5 }} />
            <Text style={{ color: Colors.secondary_light_2, fontSize: 18 }}>Running for: {getSubscriptionDuration()}</Text>
          </View>

          {subscription.isActive && (
            <View style={styles.row}>
              <MaterialIcons name="event" size={24} color={Colors.ternary} style={{ paddingHorizontal: 7.5, padding: 2.5 }} />
              <Text
                style={{
                  color: isOverdue ? "#F07070" : Colors.secondary_light_2,
                  fontSize: 18,
                }}
              >
                {isOverdue ? "Overdue" : `Next billing: ${parseDate(+subscription.nextBillingDate)}`}
              </Text>
            </View>
          )}

          <Ripple
            onPress={handleSubscriptionAction}
            disabled={isSubscriptionLoading}
            style={[
              styles.row,
              {
                marginTop: 10,
                justifyContent: "center",
                backgroundColor: subscription.isActive ? "rgba(255,59,48,0.2)" : "rgba(52,199,89,0.2)",
              },
            ]}
          >
            {isSubscriptionLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text
                style={{
                  color: subscription.isActive ? "rgba(255,59,48,0.9)" : "rgba(52,199,89,0.9)",
                  fontSize: 16,
                  fontWeight: "bold",
                }}
              >
                {subscription.isActive ? "Disable Subscription" : "Enable Subscription"}
              </Text>
            )}
          </Ripple>
        </View>

        {subscription.expenses.length > 0 && (
          <>
            <View style={{ paddingHorizontal: 15, marginBottom: 25 }}>
              <Txt size={20} color="#fff">
                Statistics
              </Txt>

              <View style={[styles.statsContainer, { marginTop: 15 }]}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{subscription.expenses.length}</Text>
                  <Text style={styles.statLabel}>Total Payments</Text>
                </View>

                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{totalSpent.toFixed(2)}zł</Text>
                  <Text style={styles.statLabel}>Total Spent</Text>
                </View>

                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{avgMonthlySpend.toFixed(2)}zł</Text>
                  <Text style={styles.statLabel}>Avg Payment</Text>
                </View>
              </View>
            </View>

            <View style={{ paddingHorizontal: 15, marginBottom: 25 }}>
              <Txt size={20} color="#fff">
                Payment History
              </Txt>

              <View style={{ marginTop: 15 }}>
                {sortedExpenses.slice(0, 10).map((expense: any) => (
                  <WalletItem
                    key={expense.id}
                    {...expense}
                    handlePress={() =>
                      handleExpensePress({
                        ...expense,
                        type: "expense",
                      })
                    }
                    type="expense"
                  />
                ))}

                {subscription.expenses.length > 10 && (
                  <View style={styles.morePaymentsContainer}>
                    <Text style={styles.morePaymentsText}>+{subscription.expenses.length - 10} more payments</Text>
                  </View>
                )}
              </View>
            </View>
          </>
        )}

        {subscription.expenses.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No payments yet</Text>
            <Text style={styles.emptySubtext}>Payments will appear here once the subscription becomes active</Text>
          </View>
        )}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.primary,
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
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: Colors.primary_light,
    borderRadius: 15,
    padding: 20,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  statLabel: {
    color: Colors.secondary_light_2,
    fontSize: 12,
    textAlign: "center",
  },
  emptyContainer: {
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtext: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    textAlign: "center",
  },
  morePaymentsContainer: {
    alignItems: "center",
    paddingVertical: 15,
  },
  morePaymentsText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    fontStyle: "italic",
  },
});
