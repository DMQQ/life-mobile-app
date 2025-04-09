import Header from "@/components/ui/Header/Header";
import Layout from "@/constants/Layout";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
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
import CreateExpenseSheet from "../components/Wallet/CreateExpense/CreateExpenseSheet";
import ScreenLoader from "../components/Wallet/ScreenLoader";
import WalletList from "../components/Wallet/WalletList";
import { useWalletContext } from "../components/WalletContext";
import useGetWallet from "../hooks/useGetWallet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import InitializeWallet from "../components/InitializeWallet";
import { useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";

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
    height: interpolate(scrollY.value, [0, 200], [150, 35], Extrapolation.CLAMP),
    width: interpolate(scrollY.value, [0, 200], [Layout.screen.width, 200], Extrapolation.CLAMP),
    transform: [
      {
        translateY: interpolate(scrollY.value, [0, 200], [0, -40], Extrapolation.CLAMP),
      },
    ],

    ...(scrollY.value > 200 ? { position: "absolute", top: insets.top + 50 } : { position: "relative", top: 0 }),
  }));

  const animatedBalanceStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(scrollY.value, [0, 200], [70, 25], Extrapolation.CLAMP),
  }));

  const balance = loading ? " ..." : (wallet?.balance || 0).toFixed(2);

  const handleShowEditSheet = () => {
    editBalanceRef.current?.expand();
  };

  const [isLoaderVisible, setIsLoaderVisible] = useState(true);

  useEffect(() => {
    if (!loading) {
      const timeout = setTimeout(() => {
        setIsLoaderVisible(false);
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [loading]);

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
    <SafeAreaView style={{ flex: 1, position: "relative" }}>
      {isLoaderVisible && (
        <Animated.View
          exiting={FadeOut.duration(500)}
          style={{
            flex: 1,
            width: Layout.screen.width,
            height: Layout.screen.height,
            position: "absolute",
            zIndex: 1000,
            backgroundColor: "#000",
          }}
        >
          <ScreenLoader />
        </Animated.View>
      )}

      <Header
        buttons={[
          {
            onPress: () => navigation.navigate("Filters"),
            icon: <Ionicons name="search" size={20} color="#fff" />,
          },
          {
            onPress: () => navigation.navigate("Charts"),
            icon: <Ionicons name="stats-chart" size={20} color="#fff" />,
          },
          {
            // onPress: () => bottomSheetRef.current?.snapToIndex(0),
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

      <WalletList
        filtersActive={filtersActive}
        isLocked={loading || !data || endReached}
        refetch={refetch}
        scrollY={scrollY}
        onScroll={onAnimatedScrollHandler}
        wallet={data?.wallet}
        onEndReached={onEndReached}
      />

      <EditBalanceSheet />
    </SafeAreaView>
  );
}
