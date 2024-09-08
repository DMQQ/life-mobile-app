import { Text, View } from "react-native";
import { WalletStatisticsResponse } from "../../hooks/useGetStatistics";
import Layout from "@/constants/Layout";
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { ReactNode } from "react";

interface StatisticsSummaryProps {
  data: WalletStatisticsResponse["statistics"] | undefined;
  dates: {
    from: string;
    to: string;
  };
}

interface ItemProps {
  label: string;
  value: number | string;
  icon?: ReactNode;
  formatValue?: boolean;
  width?: number;
}

export const Item = ({ label, value, icon, formatValue = true, width }: ItemProps) => (
  <View
    style={{
      marginTop: 5,
      width: width || (Layout.screen.width - 30 - 10) / 2,
      flexDirection: "row",
      gap: 10,
      alignItems: "center",
      padding: 20,
      backgroundColor: Colors.primary_light,
      borderRadius: 15,
    }}
  >
    {icon}
    <View>
      <Text style={{ color: "#fff", fontSize: 17, fontWeight: "bold" }}>
        {formatValue ? (typeof value === "number" ? value.toFixed(2) + "zł" : value) : value}
      </Text>
      <Text style={{ color: "grey", fontSize: 13, marginTop: 2.5 }}>{label}</Text>
    </View>
  </View>
);

export default function StatisticsSummary(props: StatisticsSummaryProps) {
  if (!props.data) return null;

  return (
    <View style={{ width: Layout.screen.width - 30, marginTop: 25, marginBottom: 25 }}>
      <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>Statistics Summary</Text>

      <Text style={{ color: "gray", marginTop: 5 }}>
        From {props.dates.from} to {props.dates.to}
      </Text>

      <View style={{ flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginTop: 15 }}>
        <Item label="Total expenses" value={props.data.expense} icon={<MaterialIcons name="attach-money" size={24} color="red" />} />
        <Item label="Total income" value={props.data.income} icon={<Ionicons name="cash-outline" size={24} color="lightgreen" />} />
        <Item label="Min expense" value={props.data.min} icon={<MaterialIcons name="trending-down" size={24} color="red" />} />
        <Item label="Max expense" value={props.data.max} icon={<MaterialIcons name="trending-up" size={24} color="lightgreen" />} />
        <Item label="Average purchase" value={props.data.average} icon={<FontAwesome5 name="chart-bar" size={24} color="red" />} />
        <Item
          label="Total count"
          formatValue={false}
          value={props.data.count}
          icon={<Ionicons name="receipt-outline" size={24} color="lightgreen" />}
        />
        <Item
          label="Top category"
          value={props.data.theMostCommonCategory}
          icon={<MaterialIcons name="category" size={24} color="white" />}
        />
        <Item
          label="Meh category"
          value={props.data.theLeastCommonCategory}
          icon={<MaterialIcons name="category" size={24} color="white" />}
        />
      </View>
    </View>
  );
}
