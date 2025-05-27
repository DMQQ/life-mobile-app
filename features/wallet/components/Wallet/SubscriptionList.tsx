import { gql, useQuery } from "@apollo/client";
import { View, Text, StyleSheet, ScrollView, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import Colors, { Sizing } from "@/constants/Colors";
import { useCallback, useMemo, useState } from "react";
import SubscriptionItem from "./SubscriptionItem";
import Animated, { SharedValue } from "react-native-reanimated";
import WalletLimits from "../Limits";
import { RefreshControl } from "react-native-gesture-handler";

interface Subscription {
  id: string;
  amount: number;
  dateStart: string;
  dateEnd: string;
  description: string;
  isActive: boolean;
  nextBillingDate: string;
  billingCycle: string;
  expenses: {
    amount: number;
    id: string;
    date: string;
    description: string;
    category: string;
  }[];
}

interface SubscriptionListProps {
  scrollY: SharedValue<number>;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  contentContainerStyle?: any;
}

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export default function SubscriptionList({ onScroll, contentContainerStyle }: SubscriptionListProps) {
  const { data, loading, refetch } = useQuery(gql`
    query Subscriptions {
      subscriptions {
        id
        amount
        dateStart
        dateEnd
        description
        isActive
        nextBillingDate
        billingCycle
        expenses {
          amount
          id
          date
          description
          category
        }
      }
    }
  `);

  const groupedData = useMemo(() => {
    if (!data?.subscriptions) return { active: [], inactive: [] };

    const active = data.subscriptions.filter((sub: Subscription) => sub.isActive);
    const inactive = data.subscriptions.filter((sub: Subscription) => !sub.isActive);

    return { active, inactive };
  }, [data?.subscriptions]);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading subscriptions...</Text>
      </View>
    );
  }

  if (!data?.subscriptions || data.subscriptions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No subscriptions found</Text>
        <Text style={styles.emptySubtext}>Add your first subscription to start tracking</Text>
      </View>
    );
  }

  return (
    <AnimatedScrollView
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      onScroll={onScroll}
      scrollEventThrottle={16}
      style={{ flex: 1 }}
      contentContainerStyle={[
        {
          padding: 15,
          paddingBottom: 60,
        },
        contentContainerStyle,
      ]}
    >
      <WalletLimits />

      {groupedData.active.length > 0 && (
        <>
          <View style={styles.headerContainer}>
            <Text style={styles.headerText}>Active Subscriptions</Text>
            <View style={[styles.countBadge, { backgroundColor: Colors.secondary }]}>
              <Text style={styles.countText}>{groupedData.active.length}</Text>
            </View>
          </View>

          {groupedData.active.map((subscription, index) => (
            <SubscriptionItem
              key={subscription.id}
              subscription={subscription}
              index={index}
              onPress={() => {
                console.log("Subscription pressed:", subscription.id);
              }}
            />
          ))}
        </>
      )}

      {groupedData.inactive.length > 0 && (
        <>
          <View style={styles.headerContainer}>
            <Text style={styles.headerText}>Inactive Subscriptions</Text>
            <View style={[styles.countBadge, { backgroundColor: "#F07070" }]}>
              <Text style={styles.countText}>{groupedData.inactive.length}</Text>
            </View>
          </View>

          {groupedData.inactive.map((subscription, index) => (
            <SubscriptionItem
              key={subscription.id}
              subscription={subscription}
              index={index + groupedData.active.length}
              onPress={() => {
                console.log("Subscription pressed:", subscription.id);
              }}
            />
          ))}
        </>
      )}
    </AnimatedScrollView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    marginTop: 10,
  },
  headerText: {
    fontSize: Sizing.text,
    fontWeight: "600",
    color: Colors.text_light,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: "center",
  },
  countText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    color: Colors.text_light,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    color: Colors.text_light,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtext: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    textAlign: "center",
  },
});
