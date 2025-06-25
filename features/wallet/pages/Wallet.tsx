import Header from "@/components/ui/Header/Header";
import Layout from "@/constants/Layout";
import { AntDesign, FontAwesome, Ionicons } from "@expo/vector-icons";
import { SafeAreaView, StyleSheet } from "react-native";
import Ripple from "react-native-material-ripple";
import Animated, {
  Extrapolation,
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
  balance: { color: "rgba(255,255,255,0.6)", fontSize: 16, textAlign: "center", opacity: 0.8 },
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
        scrollY={scrollY}
        animated={true}
        subtitleStyles={{ textAlign: "center" }}
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
        animatedValue={parseFloat(balance)}
        animatedValueLoading={loading && data?.wallet?.balance === undefined}
        animatedValueFormat={(value) => `${value.toFixed(2)}zł`}
        animatedSubtitle="Current Balance (zł)"
        onAnimatedTitleLongPress={handleShowEditSheet}
      />

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
