import { gql, useQuery } from "@apollo/client";
import { View, Text, StyleSheet, VirtualizedList, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import Colors, { Sizing } from "@/constants/Colors";
import { useCallback, useMemo } from "react";
import SubscriptionItem from "./SubscriptionItem";
import Reanimated, { SharedValue } from "react-native-reanimated";
import WalletLimits from "../Limits";

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

const AnimatedVirtualizedList = Reanimated.createAnimatedComponent(VirtualizedList);

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

  const flatData = useMemo(() => {
    const sections = [];

    if (groupedData.active.length > 0) {
      sections.push({ type: "header", title: "Active Subscriptions", count: groupedData.active.length });
      sections.push(...groupedData.active.map((sub: Subscription) => ({ type: "subscription", data: sub })));
    }

    if (groupedData.inactive.length > 0) {
      sections.push({ type: "header", title: "Inactive Subscriptions", count: groupedData.inactive.length });
      sections.push(...groupedData.inactive.map((sub: Subscription) => ({ type: "subscription", data: sub })));
    }

    return sections;
  }, [groupedData]);

  const renderItem = useCallback(
    ({ item, index }: { item: any; index: number }) => {
      if (item.type === "header") {
        return (
          <View style={styles.headerContainer}>
            <Text style={styles.headerText}>{item.title}</Text>
            <View style={[styles.countBadge, { backgroundColor: item.title.includes("Active") ? Colors.secondary : "#F07070" }]}>
              <Text style={styles.countText}>{item.count}</Text>
            </View>
          </View>
        );
      }

      const subscriptionIndex = flatData.slice(0, index).filter((item) => item.type === "subscription").length;

      return (
        <SubscriptionItem
          subscription={item.data}
          index={subscriptionIndex}
          onPress={() => {
            console.log("Subscription pressed:", item.data.id);
          }}
        />
      );
    },
    [flatData]
  );

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
    <AnimatedVirtualizedList
      ListHeaderComponent={WalletLimits}
      data={flatData}
      keyExtractor={(item, index) => (item.type === "header" ? `header-${index}` : `subscription-${item.data.id}`)}
      renderItem={renderItem as any}
      getItem={(data, index) => data[index]}
      getItemCount={(data) => data.length}
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
      removeClippedSubviews
    />
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
