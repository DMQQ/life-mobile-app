import Color from "color";
import { Text, View } from "react-native";
import Colors, { Sizing } from "../../constants/Colors";
import { ViewMoreButton } from "../ui/Button/Button";
import { useNavigation } from "@react-navigation/native";
import { Expense, Wallet } from "../../types";

const ExpenseItem = (props: { text: string }) => (
  <View style={{ flexDirection: "row", alignItems: "center", marginRight: 5 }}>
    <View
      style={{
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.secondary,
        marginHorizontal: 5,
      }}
    />
    <Text style={{ color: "#fff" }}>{props.text}</Text>
  </View>
);

export default function AvailableBalanceWidget(props: { data: Wallet }) {
  const navigation = useNavigation<any>();

  return (
    <View
      style={{
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: Color(Colors.primary).lighten(0.5).string(),
        borderRadius: 10,
        marginTop: 20,
      }}
    >
      <View style={{ marginBottom: 10 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <Text
            style={{
              color: Colors.secondary,
              fontSize: Sizing.heading,
              fontWeight: "bold",
            }}
          >
            Available Balance
          </Text>

          <ViewMoreButton
            text="See more"
            onPress={() => navigation.navigate("WalletScreens")}
          />
        </View>
        <Text
          style={{ fontSize: 35, color: Colors.secondary, fontWeight: "bold" }}
        >
          {props?.data?.balance.toFixed(2)}zł
        </Text>
      </View>

      <Text style={{ color: "#fff" }}>
        Today's expenses ({props?.data?.expenses?.length}) of total{" "}
        {props?.data?.expenses
          .reduce((acc, curr) => acc + curr.amount, 0)
          .toFixed(2)}
        zł
      </Text>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 10,
        }}
      >
        {props?.data?.expenses?.slice(0, 3).map((item: Expense) => (
          <ExpenseItem key={item.id} text={item.description} />
        ))}
      </View>
    </View>
  );
}
