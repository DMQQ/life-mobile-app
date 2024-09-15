import Color from "color";
import { FlatList, ScrollView, StyleSheet, Text, View } from "react-native";
import Colors, { Sizing } from "../../../../constants/Colors";
import { ViewMoreButton } from "../../../../components/ui/Button/Button";
import { useNavigation } from "@react-navigation/native";
import { Wallet } from "../../../../types";
import Layout, { Padding, Rounded } from "../../../../constants/Layout";
import Skeleton from "@/components/SkeletonLoader/Skeleton";
import { Item } from "../../Wallet/components/WalletChart/StatisticsSummary";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import WalletItem from "../../Wallet/components/Wallet/WalletItem";

const backgroundColor = Colors.primary_lighter;

const styles = StyleSheet.create({
  dot: {
    width: 7.5,
    height: 7.5,
    borderRadius: 5,
    backgroundColor: "#fff",
    marginHorizontal: 5,
  },
  container: {
    padding: Padding.xxl,
    backgroundColor,
    borderRadius: Rounded.xxl,
  },
  title_row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    color: "#ffffff",
    fontSize: Sizing.subHead,
    fontWeight: "bold",
  },
  balance: {
    fontSize: 60,
    color: "#fff",
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.25)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
    marginTop: 10,
  },
  activity: {
    color: "#ffffff",
    fontSize: Sizing.tooltip,
  },
  list: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  expense_container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Color(Colors.primary_lighter).lighten(0.5).string(),
    padding: 5,
    paddingHorizontal: 15,
    borderRadius: 100,
  },
});

export default function AvailableBalanceWidget(props: {
  data: {
    wallet: Wallet;
    statistics: {
      thisMonth?: any;
      lastMonth?: any;
      weeklySpendings: any;
    };
  };
  loading: boolean;
}) {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      {props.loading ? (
        <Skeleton
          size={({ width }) => ({
            width,
            height: 175,
          })}
          backgroundColor={Color(Colors.primary_lighter).lighten(0.5).string()}
          highlightColor={Colors.secondary}
        >
          <View>
            <Skeleton.Item width={(w) => w - 70} height={25} />
            <Skeleton.Item width={(w) => w - 70} height={100} marginTop={10} />

            <View style={{ flexDirection: "row", marginTop: 0 }}>
              <Skeleton.Item width={(w) => (w - 70) / 3 - 5} height={20} marginRight={5} />
              <Skeleton.Item width={(w) => (w - 70) / 3 - 5} height={20} marginRight={5} />
              <Skeleton.Item width={(w) => (w - 70) / 3} height={20} />
            </View>
          </View>
        </Skeleton>
      ) : (
        <>
          <View>
            <View style={styles.title_row}>
              <Text style={styles.title}>Available Balance</Text>

              <ViewMoreButton bg="#fff" text="See more" onPress={() => navigation.navigate("WalletScreens")} />
            </View>
            <Text style={styles.balance}>
              {props?.data?.wallet?.balance.toFixed(2)}
              <Text style={{ fontSize: 25 }}>zł</Text>
            </Text>

            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold", marginTop: 15, marginBottom: 5 }}>Last three transactions</Text>

            <FlatList
              pagingEnabled
              horizontal
              data={props?.data?.wallet?.expenses}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <WalletItem
                  containerStyle={{
                    width: Layout.screen.width - 80,
                    backgroundColor: Colors.primary_light,
                  }}
                  handlePress={() => navigation.navigate("WalletScreens")}
                  {...(item as any)}
                />
              )}
            />

            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold", marginTop: 15, marginBottom: 5 }}>Weekly Spendings</Text>
            <ScrollView horizontal contentContainerStyle={{ gap: 10 }}>
              <Item
                label="Spent this week"
                value={props.data.statistics.weeklySpendings?.expense}
                icon={<MaterialCommunityIcons name="calendar-week" size={30} color="#fff" />}
              />
              <Item
                label="Income"
                value={props.data.statistics.weeklySpendings?.income}
                icon={<MaterialCommunityIcons name="cash" size={30} color="#fff" />}
              />
              <Item
                label="Expense"
                value={props.data.statistics.weeklySpendings?.expense}
                icon={<MaterialCommunityIcons name="cash-remove" size={30} color="#fff" />}
              />
              <Item
                label="Average"
                value={props.data.statistics.weeklySpendings?.average}
                icon={<MaterialCommunityIcons name="cash-multiple" size={30} color="#fff" />}
              />
            </ScrollView>
          </View>
        </>
      )}
    </View>
  );
}
