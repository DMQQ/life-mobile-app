import { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, View, SafeAreaView } from "react-native";
import useGetWallet from "../hooks/useGetWallet";
import Ripple from "react-native-material-ripple";
import Colors from "../../../../constants/Colors";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import ActionTiles from "../components/ActionTiles";
import BalanceAlertEditModal from "../components/BalanceAlertEditModal";
import Skeleton from "../../../../components/SkeletonLoader/Skeleton";
import { WalletScreens } from "../Main";
import { StatusBar } from "expo-status-bar";
import AddExpenseBottomSheet from "../components/AddExpenseBottomSheet";
import BottomSheet from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheet/BottomSheet";
import WalletList from "../components/WalletList";

const styles = StyleSheet.create({
  container: {
    padding: 10,
    justifyContent: "center",
  },
  header: {
    width: "100%",
    height: 150,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 60,
    fontWeight: "bold",
    // color: Colors.secondary,
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

  expense_list: {},
});

export default function WalletScreen({ navigation }: WalletScreens<"Wallet">) {
  const { data, loading } = useGetWallet();

  const wallet = data?.wallet;

  const [modalVisible, setModalVisible] = useState(false);

  const bottomSheetRef = useRef<BottomSheet | null>(null);

  const scrollY = useSharedValue<number>(0);

  const onAnimatedScrollHandler = useAnimatedScrollHandler({
    onScroll(event) {
      scrollY.value = event.contentOffset.y;
    },
  });

  const animatedContainerStyle = useAnimatedStyle(() => ({
    height: interpolate(scrollY.value, [0, 200], [150, 60], Extrapolate.CLAMP),
  }));

  const animatedBalanceStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(scrollY.value, [0, 200], [70, 30], Extrapolate.CLAMP),
    transform: [
      {
        translateX: interpolate(
          scrollY.value,
          [0, 200],
          [0, -110],
          Extrapolate.CLAMP
        ),
      },
    ],
  }));

  const balance = loading ? " ..." : (wallet?.balance || 0).toFixed(2);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar backgroundColor={Colors.primary} />
      <View style={{ padding: 10 }}>
        <Animated.View
          style={[
            styles.header,
            { backgroundColor: Colors.primary },
            animatedContainerStyle,
          ]}
        >
          <Ripple onLongPress={() => setModalVisible((p) => !p)}>
            <Animated.Text style={[styles.title, animatedBalanceStyle]}>
              {balance}
              <Text style={{ color: "#ffffff97", fontSize: 20 }}>zł </Text>
            </Animated.Text>
          </Ripple>
        </Animated.View>

        <ActionTiles
          scrollY={scrollY}
          onAddExpense={() => bottomSheetRef.current?.snapToIndex(0)}
          // onAddExpense={() => navigation.navigate("CreateActivity")}
        />

        {loading && (
          <Skeleton
            backgroundColor={Colors.primary_light}
            highlightColor={Colors.primary_lighter}
            size={(props) => ({
              width: props.width - 20,
              height: props.height,
            })}
          >
            <View>
              <Skeleton.Item width={(w) => w - 20} height={65} />
              <Skeleton.Item width={(w) => w - 20} height={65} />
              <Skeleton.Item width={(w) => w - 20} height={65} />
              <Skeleton.Item width={(w) => w - 20} height={65} />
              <Skeleton.Item width={(w) => w - 20} height={65} />
              <Skeleton.Item width={(w) => w - 20} height={65} />
            </View>
          </Skeleton>
        )}
      </View>

      <WalletList
        scrollY={scrollY}
        onScroll={onAnimatedScrollHandler}
        wallet={data?.wallet}
      />

      <BalanceAlertEditModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />

      <AddExpenseBottomSheet onCompleted={() => {}} ref={bottomSheetRef} />
    </SafeAreaView>
  );
}
