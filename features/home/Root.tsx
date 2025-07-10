import TodaysTimelineEvents from "@/features/home/components/EventsWidget";
import AvailableBalanceWidget from "@/features/home/components/WalletWidget";
import { ScreenProps } from "@/types";
import { useAppSelector } from "@/utils/redux";
import { GET_MAIN_SCREEN } from "@/utils/schemas/GET_MAIN_SCREEN";
import { useQuery } from "@apollo/client";
import Header from "@/components/ui/Header/Header";
import { AntDesign } from "@expo/vector-icons";
import moment from "moment";
import useOffline from "@/utils/hooks/useOffline";
import SkeletonPlaceholder from "@/components/SkeletonLoader/Skeleton";
import { View, Modal, TouchableOpacity, Text, StyleSheet, RefreshControl } from "react-native";
import Layout from "@/constants/Layout";
import Animated, { FadeOut, LinearTransition } from "react-native-reanimated";
import { useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import WorkoutWidget from "../workout/components/WorkoutWidget";
import WalletNotifications, { useGetNotifications } from "../wallet/components/WalletNotifications";
import Colors from "@/constants/Colors";
import Feedback from "react-native-haptic-feedback";
import { BlurView } from "expo-blur";
import SettingsModal from "./components/SettingsModal";
import useAppBackground from "@/utils/hooks/useAppBackground";
import RefreshContextProvider, { useRefresh } from "@/utils/context/RefreshContext";
import useTrackScroll from "@/utils/hooks/ui/useTrackScroll";

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

function Root({}: ScreenProps<"Root">) {
  const workout = useAppSelector((s) => s.workout);
  const offline = useOffline("RootScreen");

  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const { data: home, refetch: refetchHome } = useQuery(GET_MAIN_SCREEN, {
    variables: {
      range: [moment().startOf("month").format("YYYY-MM-DD"), moment().endOf("month").format("YYYY-MM-DD")],
      lastRange: [
        moment().subtract(1, "month").startOf("month").format("YYYY-MM-DD"),
        moment().subtract(1, "month").endOf("month").format("YYYY-MM-DD"),
      ],
    },
    onCompleted: async (data) => {
      await offline.save("RootScreen", data);
      await SplashScreen.hideAsync();

      setTimeout(() => {
        setLoading(false);
      }, 1000);
    },
    onError: (er) => {
      console.log("Error fetching data", er);
      SplashScreen.hideAsync();
      setTimeout(() => {
        setLoading(false);
      }, 500);
    },
  });

  const { unreadCount, refetch: refetchNotifications, ...notification } = useGetNotifications();

  const data = offline.isOffline ? offline.data || {} : home;
  const edge = useSafeAreaInsets();

  const { refreshing, refresh } = useRefresh([refetchHome, refetchNotifications], []);

  useAppBackground({
    onForeground: refresh,
  });

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

  const [scrollY, onScroll] = useTrackScroll();

  const trendPercentage = home?.lastMonthSpendings?.expense
    ? ((home?.monthlySpendings?.expense - home?.lastMonthSpendings?.expense) / home?.lastMonthSpendings?.expense) * 100
    : 0;
  const isIncreasing = trendPercentage > 0;

  return (
    <Animated.View style={{ flex: 1 }} layout={LinearTransition.delay(100)}>
      {loading && <LoadingSkeleton />}
      <Header
        goBack={false}
        animatedValue={parseFloat(home?.monthlySpendings?.expense || 0)}
        animatedValueLoading={loading && data?.wallet?.balance === undefined}
        animatedValueFormat={(value) => `${value?.toFixed(2)}zł`}
        animatedSubtitle={`This month spendings, ${Math.abs(trendPercentage).toFixed(1)}% ${isIncreasing ? "more" : "less"} vs last month`}
        scrollY={scrollY}
        animated={true}
        buttons={[
          {
            icon: <AntDesign name="bells" size={20} color="#fff" />,
            onPress: handleNotificationPress,
          },
          {
            icon: <AntDesign name="setting" size={20} color="#fff" />,
            onPress: handleSettingsPress,
          },
        ]}
      />

      <Animated.ScrollView
        scrollToOverflowEnabled={false}
        overScrollMode={"never"}
        keyboardDismissMode={"on-drag"}
        scrollEventThrottle={16}
        onScroll={onScroll}
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 15,
          paddingBottom: 120,
        }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      >
        <AvailableBalanceWidget
          data={{ wallet: home?.wallet, statistics: home?.monthlySpendings, lastMonthSpendings: home?.lastMonthSpendings }}
          loading={loading}
        />

        <TodaysTimelineEvents data={data?.timelineByCurrentDate} loading={loading} />

        {workout.isWorkoutPending && <WorkoutWidget />}
      </Animated.ScrollView>

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

export default function RootScreen(props: ScreenProps<"Root">) {
  return (
    <RefreshContextProvider>
      <Root {...props} />
    </RefreshContextProvider>
  );
}
