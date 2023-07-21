import { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, View, SafeAreaView } from "react-native";
import useGetWallet from "./hooks/useGetWallet";
import Ripple from "react-native-material-ripple";
import Colors from "../../../constants/Colors";
import Animated from "react-native-reanimated";
import ActionTiles from "./components/ActionTiles";
import BalanceAlertEditModal from "./components/BalanceAlertEditModal";
import Skeleton from "../../../components/SkeletonLoader/Skeleton";
import { WalletScreens } from ".";
import { StatusBar } from "expo-status-bar";
import AddExpenseBottomSheet from "./components/AddExpenseBottomSheet";
import BottomSheet from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheet/BottomSheet";
import WalletList, { WalletSheet } from "./components/WalletList";

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
    color: Colors.secondary,
  },

  expense_item: {
    height: 80,
    borderRadius: 5,
    padding: 5,
    flexDirection: "row",
  },

  expense_list: {},
});

export default function WalletScreen({ navigation }: WalletScreens<"Wallet">) {
  const { data, loading } = useGetWallet();

  const wallet = data?.wallet;

  const [modalVisible, setModalVisible] = useState(false);

  const bottomSheetRef = useRef<BottomSheet>(null);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar backgroundColor={Colors.primary} />
      <View style={{ padding: 10 }}>
        <Animated.View
          style={[styles.header, { backgroundColor: Colors.primary }]}
        >
          <Ripple onLongPress={() => setModalVisible((p) => !p)}>
            <Text style={styles.title}>
              <Text style={{ color: "#fff", fontSize: 25 }}>zł </Text>
              {loading ? " ..." : (wallet?.balance || 0).toFixed(2)}
            </Text>
          </Ripple>
          <Text style={{ color: "#ffffff97", fontSize: 15, marginTop: -10 }}>
            Total balance
          </Text>
        </Animated.View>

        <ActionTiles
          onAddExpense={() => bottomSheetRef.current?.snapToIndex(1)}
        />

        <Ripple
          style={{
            paddingHorizontal: 5,
            marginBottom: 10,
          }}
        >
          <Text
            style={{
              color: Colors.secondary,
              fontSize: 25,
              fontWeight: "bold",
              marginTop: 10,
            }}
          >
            Recent expenses ({wallet?.expenses.length})
          </Text>
        </Ripple>

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

      <WalletList wallet={data?.wallet} />

      <BalanceAlertEditModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />

      <AddExpenseBottomSheet onCompleted={() => {}} ref={bottomSheetRef} />
    </SafeAreaView>
  );
}
