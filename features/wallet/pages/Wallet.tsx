import Header from "@/components/ui/Header/Header";
import Layout from "@/constants/Layout";
import { AntDesign, FontAwesome, Ionicons } from "@expo/vector-icons";
import { SafeAreaView, StyleSheet, Text } from "react-native";
import Ripple from "react-native-material-ripple";
import Animated, { Extrapolation, interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { WalletScreens } from "../Main";
import EditBalanceSheet from "../components/Sheets/EditBalanceSheet";
import WalletList from "../components/Wallet/WalletList";
import { useWalletContext } from "../components/WalletContext";
import useGetWallet from "../hooks/useGetWallet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import InitializeWallet from "../components/InitializeWallet";
import { useEffect, useState } from "react";
import SubscriptionList from "../components/Wallet/SubscriptionList";

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
});

export default function WalletScreen({ navigation, route }: WalletScreens<"Wallet">) {
  const { data, loading, refetch, onEndReached, endReached, filtersActive, error } = useGetWallet();

  const {
    refs: { bottomSheetRef, editBalanceRef },
  } = useWalletContext();
  const wallet = data?.wallet;

  const scrollY = useSharedValue<number>(0);

  const onAnimatedScrollHandler = useAnimatedScrollHandler({
    onScroll(event) {
      scrollY.value = event.contentOffset.y;
    },
  });

  useEffect(() => {
    if (route.params?.expenseId && data?.wallet) {
      const expense = data.wallet.expenses.find((expense) => expense.id === route.params?.expenseId);
      navigation.navigate("Expense", { expense });
    }
  }, [route.params?.expenseId]);

  const insets = useSafeAreaInsets();

  const animatedContainerStyle = useAnimatedStyle(() => ({
    height: interpolate(scrollY.value, [0, 180], [110, 35], Extrapolation.CLAMP),
    width: interpolate(scrollY.value, [0, 180], [Layout.screen.width, 200], Extrapolation.CLAMP),
    transform: [
      {
        translateY: interpolate(scrollY.value, [0, 200], [0, -40], Extrapolation.CLAMP),
      },
    ],

    ...(scrollY.value > 170 ? { position: "absolute", top: insets.top + 50 } : { position: "relative", top: 0 }),
  }));

  const animatedBalanceStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(scrollY.value, [0, 100, 200], [70, 50, 25], Extrapolation.CLAMP),
  }));

  const balance = loading && wallet?.balance === undefined ? " ..." : (wallet?.balance || 0).toFixed(2);

  const handleShowEditSheet = () => {
    editBalanceRef.current?.expand();
  };

  const [showSubscriptionsView, setShowSubscriptionsView] = useState(false);

  if (
    (Array.isArray(error?.cause?.extensions)
      ? //@ts-ignore

        error?.cause?.extensions?.[0]?.response?.statusCode
      : //@ts-ignore

        error?.cause?.extensions?.response?.statusCode) === 404
  )
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <InitializeWallet />
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={{ flex: 1 }}>
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
        <Ripple onLongPress={handleShowEditSheet}>
          <Animated.Text style={[styles.title, animatedBalanceStyle]}>
            {balance}
            <Text style={{ color: "#ffffff97", fontSize: 18 }}>zł </Text>
          </Animated.Text>
        </Ripple>
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
