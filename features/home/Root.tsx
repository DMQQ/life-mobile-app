import TodaysTimelineEvents from "@/features/home/components/EventsWidget";
import AvailableBalanceWidget from "@/features/home/components/WalletWidget";
import { ScreenProps } from "@/types";
import { useAppSelector } from "@/utils/redux";
import { GET_MAIN_SCREEN } from "@/utils/schemas/GET_MAIN_SCREEN";
import { gql, useQuery } from "@apollo/client";
import { ScrollView } from "react-native-gesture-handler";
import Header from "@/components/ui/Header/Header";
import { AntDesign } from "@expo/vector-icons";
import moment from "moment";
import useOffline from "@/utils/hooks/useOffline";
import SkeletonPlaceholder from "@/components/SkeletonLoader/Skeleton";
import { View, Modal, TouchableOpacity, Text, StyleSheet, RefreshControl } from "react-native";
import Layout from "@/constants/Layout";
import Animated, { FadeIn, FadeOut, LinearTransition } from "react-native-reanimated";
import { useCallback, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import WorkoutWidget from "../workout/components/WorkoutWidget";
import WalletNotifications, { useGetNotifications } from "../wallet/components/WalletNotifications";
import Colors from "@/constants/Colors";
import Feedback from "react-native-haptic-feedback";
import { BlurView } from "expo-blur";
import SettingsModal from "./components/SettingsModal";
import useAppBackground from "@/utils/hooks/useAppBackground";

const LoadingSkeleton = () => {
  const insets = useSafeAreaInsets();
  return (
    <Animated.View
      exiting={FadeOut.duration(250)}
      style={[StyleSheet.absoluteFillObject, { top: insets.top, zIndex: 1000, flex: 1, padding: 15, backgroundColor: Colors.primary }]}
    >
      <SkeletonPlaceholder size={(size) => size}>
        <View>
          {/* Main Balance */}
          <SkeletonPlaceholder.Item width={(w) => w - 30} height={35} />

          {/* Weekly Overview */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              width: Layout.screen.width - 30,
              marginTop: 15,
            }}
          >
            <SkeletonPlaceholder.Item width={(w) => (w - 30) / 2} height={50} />
            <SkeletonPlaceholder.Item width={(w) => (w - 30) / 3.5} height={30} />
          </View>

          <View style={{ marginTop: 12.5 }}>
            <SkeletonPlaceholder.Item width={(w) => w / 2} height={20} />
            <SkeletonPlaceholder.Item width={(w) => w - 30} height={20} />
            <SkeletonPlaceholder.Item width={(w) => w - 30} height={15} />
          </View>

          {/* Recent Transactions */}
          <View style={{ marginTop: 15 }}>
            <SkeletonPlaceholder.Item width={(w) => w - 30} height={25} />

            <View style={{ flexDirection: "row", gap: 15, marginTop: 5 }}>
              <SkeletonPlaceholder.Item width={(w) => w / 2.6} height={90} />
              <SkeletonPlaceholder.Item width={(w) => w / 2.6} height={90} />
              <SkeletonPlaceholder.Item width={(w) => w / 2.6} height={90} />
            </View>

            <View style={{ marginTop: 15 }}>
              <SkeletonPlaceholder.Item width={(w) => w / 2} height={20} />

              <SkeletonPlaceholder.Item width={(w) => w - 30} height={60} />
              <SkeletonPlaceholder.Item width={(w) => w - 30} height={60} marginTop={10} />
              <SkeletonPlaceholder.Item width={(w) => w - 30} height={60} marginTop={10} />
            </View>
          </View>

          {/* For Today Section */}
          <View style={{ marginTop: 30 }}>
            <SkeletonPlaceholder.Item width={(w) => w - 30} height={25} />
            <SkeletonPlaceholder.Item width={(w) => w - 30} height={70} marginTop={15} />
            <SkeletonPlaceholder.Item width={(w) => w - 30} height={70} marginTop={15} />
            <SkeletonPlaceholder.Item width={(w) => w - 30} height={70} marginTop={15} />
          </View>
        </View>
      </SkeletonPlaceholder>
    </Animated.View>
  );
};

const NotificationBadge = ({ count }: { count: number }) => {
  if (count === 0) return null;

  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{count > 9 ? "+" : count}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    alignItems: "center",
    transform: [{ translateY: -1 }],
  },
  modalContainer: {
    flex: 1,
  },
  blurBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)", // Semi-transparent overlay
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    paddingTop: 60,
  },
  modalTitle: {
    color: Colors.text_light,
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 8,
  },
  notificationsContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
});

export default function Root({ navigation }: ScreenProps<"Root">) {
  const workout = useAppSelector((s) => s.workout);
  const user = useAppSelector((s) => s.user);
  const offline = useOffline("RootScreen");

  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const { data: home, refetch: refetchHome } = useQuery(GET_MAIN_SCREEN, {
    variables: {
      range: [
        moment().subtract(1, "day").startOf("week").format("YYYY-MM-DD"),
        moment().subtract(1, "day").endOf("week").format("YYYY-MM-DD"),
      ],
    },
    onCompleted: async (data) => {
      await offline.save("RootScreen", data);
      setLoading(false);
      await SplashScreen.hideAsync();
    },
    onError: (er) => {
      console.log("Error fetching data", er);
      setLoading(false);
      SplashScreen.hideAsync();
    },
  });

  const { unreadCount, refetch: refetchNotifications, ...notification } = useGetNotifications();

  const data = offline.isOffline ? offline.data || {} : home;
  const edge = useSafeAreaInsets();

  const refetchApp = useCallback(() => Promise.any([refetchNotifications, refetchHome]), []);

  useAppBackground({
    onForeground: refetchApp,
  });

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetchApp();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const handleNotificationPress = () => {
    Feedback.trigger("impactLight");
    setShowNotifications(true);
  };

  const closeNotifications = () => {
    Feedback.trigger("impactLight");
    setShowNotifications(false);
  };

  const handleSettingsPress = () => {
    Feedback.trigger("impactLight");
    setShowSettings(true);
  };

  const closeSettings = () => {
    Feedback.trigger("impactLight");
    setShowSettings(false);
  };

  return (
    <Animated.View style={{ padding: 0, flex: 1, paddingTop: edge.top }} layout={LinearTransition.delay(100)}>
      {loading && <LoadingSkeleton />}
      <Header
        titleAnimatedStyle={{}}
        title={`Hello, ${user?.user?.email.split("@")[0]}`}
        buttons={[
          {
            icon: (
              <View>
                <AntDesign name="bells" size={20} color="#fff" />
                <NotificationBadge count={unreadCount} />
              </View>
            ),
            onPress: handleNotificationPress,
          },
          {
            icon: <AntDesign name="setting" size={20} color="#fff" />,
            onPress: handleSettingsPress,
          },
        ]}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 15,
          paddingBottom: 100,
        }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <AvailableBalanceWidget
          data={{
            wallet: data?.wallet,
            statistics: {
              weeklySpendings: data?.weeklySpendings,
            },
          }}
          loading={loading}
        />

        <TodaysTimelineEvents data={data?.timelineByCurrentDate} loading={loading} />

        {workout.isWorkoutPending && <WorkoutWidget />}
      </ScrollView>

      <Modal
        visible={showNotifications}
        animationType="slide"
        presentationStyle="overFullScreen"
        transparent={true}
        onRequestClose={closeNotifications}
      >
        <View style={styles.modalContainer}>
          <BlurView intensity={80} tint="dark" style={styles.blurBackground} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notifications</Text>
              <TouchableOpacity onPress={closeNotifications} style={styles.closeButton}>
                <AntDesign name="close" size={24} color={Colors.text_light} />
              </TouchableOpacity>
            </View>
            <View style={styles.notificationsContainer}>
              <WalletNotifications {...notification} />
            </View>
          </View>
        </View>
      </Modal>

      <SettingsModal visible={showSettings} onClose={closeSettings} />
    </Animated.View>
  );
}
