import Header from "@/components/ui/Header/Header";
import Layout from "@/constants/Layout";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import Ripple from "react-native-material-ripple";
import Animated, { Extrapolation, interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { WalletScreens } from "../Main";
import EditBalanceSheet from "../components/Sheets/EditBalanceSheet";
import ExpenseFiltersSheet from "../components/Sheets/ExpenseFiltersSheet";
import CreateExpenseSheet from "../components/Wallet/CreateExpense/CreateExpenseSheet";
import ScreenLoader from "../components/Wallet/ScreenLoader";
import WalletList from "../components/Wallet/WalletList";
import WalletContextProvider, { useWalletContext } from "../components/WalletContext";
import useGetWallet from "../hooks/useGetWallet";

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
    paddingHorizontal: 10,
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

export default function Wallet(props: WalletScreens<"Wallet">) {
  return (
    <WalletContextProvider>
      <WalletScreen {...props} />
    </WalletContextProvider>
  );
}

function WalletScreen({ navigation }: WalletScreens<"Wallet">) {
  const { data, loading, refetch, filters, dispatch, onEndReached, endReached, filtersActive } = useGetWallet();

  const {
    refs: { bottomSheetRef, filtersRef, editBalanceRef },
  } = useWalletContext();
  const wallet = data?.wallet;

  const scrollY = useSharedValue<number>(0);

  const onAnimatedScrollHandler = useAnimatedScrollHandler({
    onScroll(event) {
      scrollY.value = event.contentOffset.y;
    },
  });

  const animatedContainerStyle = useAnimatedStyle(() => ({
    height: interpolate(scrollY.value, [0, 200], [150, 25], Extrapolation.CLAMP),
    width: interpolate(scrollY.value, [0, 200], [Layout.screen.width, 200], Extrapolation.CLAMP),
    transform: [
      {
        translateY: interpolate(scrollY.value, [0, 200], [0, -40], Extrapolation.CLAMP),
      },
    ],
  }));

  const animatedBalanceStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(scrollY.value, [0, 200], [70, 25], Extrapolation.CLAMP),
  }));

  const balance = loading ? " ..." : (wallet?.balance || 0).toFixed(2);

  const handleShowEditSheet = () => {
    editBalanceRef.current?.expand();
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header
        buttons={[
          {
            onPress: () => filtersRef.current?.snapToIndex(0),
            icon: <Ionicons name="search" size={20} color="#fff" />,
          },
          {
            onPress: () => navigation.navigate("Charts"),
            icon: <Ionicons name="stats-chart" size={20} color="#fff" />,
          },
          {
            onPress: () => bottomSheetRef.current?.snapToIndex(0),
            icon: <AntDesign name="plus" size={20} color="#fff" />,
          },
        ]}
        goBack={false}
      />

      <View style={{ paddingHorizontal: 15 }}>
        <Animated.View style={[styles.header, animatedContainerStyle]}>
          <Ripple onLongPress={handleShowEditSheet}>
            <Animated.Text style={[styles.title, animatedBalanceStyle]}>
              {balance}
              <Text style={{ color: "#ffffff97", fontSize: 18 }}>zł </Text>
            </Animated.Text>
          </Ripple>
        </Animated.View>

        {/* <Statistics /> */}

        {loading && <ScreenLoader />}
      </View>

      <WalletList
        filtersActive={filtersActive}
        isLocked={loading || !data || endReached}
        refetch={refetch}
        scrollY={scrollY}
        onScroll={onAnimatedScrollHandler}
        wallet={data?.wallet}
        onEndReached={onEndReached}
      />

      <ExpenseFiltersSheet ref={filtersRef} filters={filters} dispatch={dispatch} />

      <CreateExpenseSheet onCompleted={() => {}} ref={bottomSheetRef} />

      <EditBalanceSheet />
    </SafeAreaView>
  );
}
