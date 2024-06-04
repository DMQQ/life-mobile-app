import { useState, useRef } from "react";
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
import BalanceAlertEditModal from "../components/BalanceAlertEditModal";
import Skeleton from "../../../../components/SkeletonLoader/Skeleton";
import { WalletScreens } from "../Main";
import { StatusBar } from "expo-status-bar";
import CreateExpenseSheet from "../components/AddExpenseBottomSheet";
import BottomSheet from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheet/BottomSheet";
import WalletList from "../components/WalletList";
import Color from "color";
import FloatingButton from "../components/FloatingButton";

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

export default function WalletScreen({}: WalletScreens<"Wallet">) {
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
    ] as any,
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

        {loading && (
          <Skeleton
            backgroundColor={Color(Colors.primary_lighter)
              .lighten(0.5)
              .string()}
            highlightColor={Colors.secondary}
            size={(props) => ({
              width: props.width - 20,
              height: props.height,
            })}
          >
            <View>
              <Skeleton.Item width={(w) => w / 3} height={25} />
              <Skeleton.Item width={(w) => w - 20} height={55} />
              <Skeleton.Item width={(w) => w - 20} height={55} />
              <Skeleton.Item width={(w) => w - 20} height={55} />
              <Skeleton.Item width={(w) => w / 3} height={25} marginTop={30} />
              <Skeleton.Item width={(w) => w - 20} height={55} />
              <Skeleton.Item width={(w) => w - 20} height={55} />
              <Skeleton.Item width={(w) => w / 3} height={25} marginTop={30} />
              <Skeleton.Item width={(w) => w - 20} height={55} />
              <Skeleton.Item width={(w) => w - 20} height={55} />
            </View>
          </Skeleton>
        )}
      </View>

      <FloatingButton
        scrollY={scrollY}
        onPress={() => bottomSheetRef.current?.snapToIndex(0)}
      />

      <WalletList
        scrollY={scrollY}
        onScroll={onAnimatedScrollHandler}
        wallet={data?.wallet}
      />

      <BalanceAlertEditModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />

      <CreateExpenseSheet onCompleted={() => {}} ref={bottomSheetRef} />
    </SafeAreaView>
  );
}
