import { StyleSheet, Text, View, SafeAreaView } from "react-native";
import useGetWallet from "../hooks/useGetWallet";
import Ripple from "react-native-material-ripple";
import Colors from "../../../../constants/Colors";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { WalletScreens } from "../Main";
import CreateExpenseSheet from "../components/Wallet/CreateExpense/CreateExpenseSheet";
import WalletList from "../components/Wallet/WalletList";
import FloatingButton from "../components/Wallet/FloatingButton";
import ScreenLoader from "../components/Wallet/ScreenLoader";
import ExpenseFiltersSheet from "../components/Sheets/ExpenseFiltersSheet";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import Layout from "@/constants/Layout";
import WalletContextProvider, {
  useWalletContext,
} from "../components/WalletContext";
import EditBalanceSheet from "../components/Sheets/EditBalanceSheet";
import Charts from "../components/Wallet/Charts";

const styles = StyleSheet.create({
  container: {
    padding: 10,
    justifyContent: "center",
  },
  header: {
    width: Layout.screen.width,
    height: 150,
    alignItems: "center",

    backgroundColor: Colors.primary,
    flexDirection: "row",
    paddingHorizontal: 10,
    justifyContent: "space-between",
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

function WalletScreen({}: WalletScreens<"Wallet">) {
  const { data, loading, refetch, filters, dispatch } = useGetWallet();

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
    height: interpolate(
      scrollY.value,
      [0, 200],
      [150, 40],
      Extrapolation.CLAMP
    ),
  }));

  const animatedBalanceStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(
      scrollY.value,
      [0, 200],
      [70, 30],
      Extrapolation.CLAMP
    ),
  }));

  const balance = loading ? " ..." : (wallet?.balance || 0).toFixed(2);

  const handleShowEditSheet = () => {
    editBalanceRef.current?.expand();
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* <StatusBar backgroundColor={Colors.primary} /> */}
      <View style={{ padding: 15 }}>
        <Animated.View style={[styles.header, animatedContainerStyle]}>
          <Ripple onLongPress={handleShowEditSheet}>
            <Animated.Text style={[styles.title, animatedBalanceStyle]}>
              {balance}
              <Text style={{ color: "#ffffff97", fontSize: 18 }}>zł </Text>
            </Animated.Text>
          </Ripple>
        </Animated.View>

        {loading && <ScreenLoader />}
      </View>

      <FloatingButton
        scrollY={scrollY}
        position={1}
        onPress={() => filtersRef.current?.snapToIndex(0)}
      >
        <Ionicons name="filter" size={18} color="#fff" />
      </FloatingButton>

      <FloatingButton
        scrollY={scrollY}
        onPress={() => bottomSheetRef.current?.snapToIndex(0)}
      >
        <AntDesign name="plus" size={30} color="#fff" />
      </FloatingButton>

      {/* <Charts data={data} /> */}

      <WalletList
        refetch={refetch}
        scrollY={scrollY}
        onScroll={onAnimatedScrollHandler}
        wallet={data?.wallet}
      />

      <ExpenseFiltersSheet
        ref={filtersRef}
        filters={filters}
        dispatch={dispatch}
      />

      <CreateExpenseSheet onCompleted={() => {}} ref={bottomSheetRef} />

      <EditBalanceSheet />
    </SafeAreaView>
  );
}
