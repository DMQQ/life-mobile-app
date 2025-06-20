import Header from "@/components/ui/Header/Header";
import Layout from "@/constants/Layout";
import { AntDesign, FontAwesome, Ionicons } from "@expo/vector-icons";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import Ripple from "react-native-material-ripple";
import Animated, {
  Extrapolation,
  FadeIn,
  FadeOut,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { WalletScreens } from "../Main";
import EditBalanceSheet from "../components/Sheets/EditBalanceSheet";
import WalletList from "../components/Wallet/WalletList";
import { useWalletContext } from "../components/WalletContext";
import useGetWallet from "../hooks/useGetWallet";
import InitializeWallet from "../components/InitializeWallet";
import { useEffect, useState } from "react";
import SubscriptionList from "../components/Wallet/SubscriptionList";
import WalletLoader from "../components/WalletLoader";
import Colors from "@/constants/Colors";
import { AnimatedNumber } from "@/components";

const styles = StyleSheet.create({
  container: {
    padding: 10,
    justifyContent: "center",
  },
  header: {
    width: Layout.screen.width,
    height: 150,
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 60,
    fontWeight: "bold",
    textAlign: "center",
    color: "#fff",
    letterSpacing: 1,
  },
  expense_item: {
    height: 80,
    borderRadius: 5,
    padding: 5,
    flexDirection: "row",
  },
  recentText: {
    color: "#7f7f7f",
    fontSize: 25,
    fontWeight: "bold",
    marginTop: 10,
  },
  overlay: {
    backgroundColor: Colors.primary,
    zIndex: 1000,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 125,
  },
});

export default function WalletScreen({ navigation, route }: WalletScreens<"Wallet">) {
  const { data, loading, refetch, onEndReached, endReached, filtersActive, error } = useGetWallet();

  const {
    refs: { bottomSheetRef, editBalanceRef },
  } = useWalletContext();

  const scrollY = useSharedValue<number>(0);

  const onAnimatedScrollHandler = useAnimatedScrollHandler(
    {
      onScroll(event) {
        scrollY.value = event.contentOffset.y;
      },
    },
    []
  );

  useEffect(() => {
    if (route.params?.expenseId && data?.wallet) {
      const expense = data.wallet.expenses.find((expense) => expense.id === route.params?.expenseId);
      navigation.navigate("Expense", { expense });
    }
  }, [route.params?.expenseId]);

  const animatedContainerStyle = useAnimatedStyle(
    () => ({
      height: interpolate(scrollY.value, [0, 150], [150, 0], Extrapolation.CLAMP),
    }),
    []
  );

  const animatedBalanceStyle = useAnimatedStyle(
    () => ({
      transform: [
        {
          scale: interpolate(scrollY.value, [0, 150], [1, 0.4], Extrapolation.CLAMP),
        },
      ],
      top: interpolate(scrollY.value, [0, 150], [25, -60], Extrapolation.CLAMP),
      left: interpolate(scrollY.value, [0, 150], [25, -20], Extrapolation.CLAMP),
      width: interpolate(scrollY.value, [0, 150], [Layout.screen.width - 50, 100], Extrapolation.CLAMP),
    }),
    []
  );

  const balance = loading && data?.wallet?.balance === undefined ? " ..." : (data?.wallet?.balance || 0).toFixed(2);

  const handleShowEditSheet = () => {
    editBalanceRef.current?.expand();
  };

  const [showSubscriptionsView, setShowSubscriptionsView] = useState(false);

  if (
    (Array.isArray(error?.cause?.extensions)
      ? (error as any)?.cause?.extensions?.[0]?.response?.statusCode
      : (error as any)?.cause?.extensions?.response?.statusCode) === 404
  )
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <InitializeWallet />
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {loading && (
        <Animated.View exiting={FadeOut.duration(250)} style={[StyleSheet.absoluteFillObject, styles.overlay]}>
          <WalletLoader />
        </Animated.View>
      )}

      <Header
        buttons={[
          {
            onPress: () => {
              setShowSubscriptionsView(!showSubscriptionsView);
              bottomSheetRef.current?.snapToIndex(showSubscriptionsView ? -1 : 0);
            },
            icon: <FontAwesome name="exchange" size={20} color="#fff" />,
          },
          {
            onPress: () => navigation.navigate("Filters"),
            icon: <Ionicons name="search" size={20} color="#fff" />,
          },
          {
            onPress: () => navigation.navigate("Charts"),
            icon: <Ionicons name="stats-chart" size={20} color="#fff" />,
          },
          {
            onPress: () => navigation.navigate("CreateExpense"),
            icon: <AntDesign name="plus" size={20} color="#fff" />,
          },
        ]}
        goBack={false}
      />

      <Animated.View style={[styles.header, animatedContainerStyle]}>
        <Animated.View style={[{ position: "absolute", left: 25 }, animatedBalanceStyle]}>
          <Ripple onLongPress={handleShowEditSheet}>
            <AnimatedNumber
              value={parseFloat(balance)}
              style={[styles.title, animatedBalanceStyle]}
              formatValue={(value) => `${value.toFixed(2)}zł`}
            />
          </Ripple>
        </Animated.View>
      </Animated.View>

      {showSubscriptionsView ? (
        <SubscriptionList onScroll={onAnimatedScrollHandler} scrollY={scrollY} />
      ) : (
        <WalletList
          filtersActive={filtersActive}
          isLocked={loading || !data || endReached}
          refetch={refetch}
          scrollY={scrollY}
          onScroll={onAnimatedScrollHandler}
          wallet={data?.wallet}
          onEndReached={onEndReached}
        />
      )}

      <EditBalanceSheet />
    </SafeAreaView>
  );
}
