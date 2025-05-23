import { gql, useQuery } from "@apollo/client";
import { useState } from "react";
import { Text, View, StyleSheet, TouchableOpacity, ScrollView, FlatList } from "react-native";
import Colors from "@/constants/Colors";
import Ripple from "react-native-material-ripple";
import Feedback from "react-native-haptic-feedback";
import { CategoryIcon } from "./ExpenseIcon";
import Animated, { FadeInDown } from "react-native-reanimated";
import { BlurView } from "expo-blur";
import lowOpacity from "@/utils/functions/lowOpacity";

interface Notification {
  id: string;
  message: {
    title: string;
    body: string;
    type: string;
    data: {
      [key: string]: any;
    };
  };
  sendAt: string;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    paddingTop: 10,
  },
  notificationCard: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  blurContainer: {
    flex: 1,
  },
  notificationContent: {
    padding: 20,
    paddingRight: 50,
    backgroundColor: "rgba(0, 0, 0, 0.2)", // Semi-transparent overlay
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    gap: 5,
  },
  iconContainer: {
    marginRight: 14,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  contentContainer: {
    flex: 1,
    minHeight: 0,
  },
  title: {
    color: Colors.text_light,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 20,
    marginBottom: 4,
  },
  body: {
    color: Colors.text_light,
    fontSize: 14,
    lineHeight: 18,
    opacity: 0.85,
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  timestamp: {
    color: Colors.secondary_light_1,
    fontSize: 12,
    fontWeight: "500",
  },
  typeTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  typeTagText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: Colors.text_light,
    opacity: 0.8,
  },
  dismissButton: {
    position: "absolute",
    right: 8,
    top: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  dismissText: {
    color: Colors.text_light,
    fontSize: 16,
    fontWeight: "bold",
    lineHeight: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 60,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    overflow: "hidden",
  },
  emptyIconBlur: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  emptyIconContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  emptyText: {
    color: Colors.text_light,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtext: {
    color: Colors.text_light,
    fontSize: 14,
    opacity: 0.6,
    textAlign: "center",
  },
});

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return date.toLocaleDateString();
};

function NotificationCard({
  notification,
  onDismiss,
  index,
}: {
  notification: Notification;
  onDismiss: (id: string) => void;
  index: number;
}) {
  const handleDismiss = () => {
    Feedback.trigger("impactLight");
    onDismiss(notification.id);
  };

  const handlePress = () => {
    Feedback.trigger("selection");
  };

  return (
    <Animated.View style={styles.notificationCard} entering={FadeInDown.delay((index + 1) * 75)}>
      <BlurView intensity={100} tint="dark" style={styles.blurContainer}>
        <Ripple onPress={handlePress} rippleColor="rgba(255, 255, 255, 0.1)" rippleDuration={300}>
          <View style={styles.notificationContent}>
            <View style={styles.headerRow}>
              <View style={styles.iconContainer}>
                <CategoryIcon type="expense" category="bell" size={20} />
              </View>

              <View style={styles.contentContainer}>
                <Text style={styles.title} numberOfLines={2}>
                  {notification.message.title}
                </Text>
              </View>
            </View>

            <Text style={styles.body} numberOfLines={3}>
              {notification.message.body}
            </Text>

            <View style={styles.footerRow}>
              <Text style={styles.timestamp}>{formatTimeAgo(notification.sendAt)}</Text>
            </View>

            <TouchableOpacity
              style={styles.dismissButton}
              onPress={handleDismiss}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.7}
            >
              <Text style={styles.dismissText}>×</Text>
            </TouchableOpacity>
          </View>
        </Ripple>
      </BlurView>
    </Animated.View>
  );
}

export default function WalletNotifications() {
  const [pagination, setPagination] = useState({ skip: 0, take: 25 });
  const [dismissedNotifications, setDismissedNotifications] = useState<Set<string>>(new Set());

  const { data, error, loading } = useQuery(
    gql`
      query WalletNotifications($skip: Int!, $take: Int!) {
        notifications(skip: $skip, take: $take) {
          id
          message
          sendAt
        }
      }
    `,
    { variables: { ...pagination } }
  );

  const handleDismiss = (notificationId: string) => {
    setDismissedNotifications((prev) => new Set([...prev, notificationId]));
  };

  const visibleNotifications =
    data?.notifications?.filter((notification: Notification) => !dismissedNotifications.has(notification.id)) || [];

  if (loading) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>Loading notifications...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>Error loading notifications</Text>
        <Text style={styles.emptySubtext}>{error.message}</Text>
      </View>
    );
  }

  if (visibleNotifications.length === 0) {
    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyIconContainer}>
          <BlurView intensity={40} tint="dark" style={styles.emptyIconBlur} />
          <View style={[styles.emptyIconContent, { backgroundColor: lowOpacity(Colors.secondary, 0.2), width: 70, height: 70 }]}>
            <CategoryIcon type="income" category="bell" size={32} />
          </View>
        </View>
        <Text style={styles.emptyText}>All caught up!</Text>
        <Text style={styles.emptySubtext}>You don't have any new notifications right now.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={visibleNotifications}
      renderItem={({ item, index }) => <NotificationCard index={index} notification={item} onDismiss={handleDismiss} />}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
      style={styles.container}
    />
  );
}
