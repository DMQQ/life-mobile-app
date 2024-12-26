import { Text, View } from "react-native";
import useGetStatistics, { WalletStatisticsResponse } from "../../hooks/useGetStatistics";
import Layout from "@/constants/Layout";
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { ReactNode, useMemo } from "react";
import moment from "moment";

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
  const oppositeRange = useMemo(() => {
    const size = moment(props.dates.to).diff(moment(props.dates.from), "days");

    if (size === 1)
      return [
        moment(props.dates.from).subtract(1, "day").format("YYYY-MM-DD"),
        moment(props.dates.to).subtract(1, "day").format("YYYY-MM-DD"),
      ];

    if (size === 2)
      return [
        moment(props.dates.from).subtract(2, "day").format("YYYY-MM-DD"),
        moment(props.dates.to).subtract(2, "day").format("YYYY-MM-DD"),
      ];

    if (size >= 7 && size <= 10)
      return [
        moment(props.dates.from).subtract(1, "week").format("YYYY-MM-DD"),
        moment(props.dates.to).subtract(1, "week").format("YYYY-MM-DD"),
      ];

    if (size >= 28 && size <= 31)
      return [
        moment(props.dates.from).subtract(1, "month").format("YYYY-MM-DD"),
        moment(props.dates.to).subtract(1, "month").format("YYYY-MM-DD"),
      ];

    if (size >= 365)
      return [
        moment(props.dates.from).subtract(1, "year").format("YYYY-MM-DD"),
        moment(props.dates.to).subtract(1, "year").format("YYYY-MM-DD"),
      ];

    return ["", ""];
  }, [props.dates]) as [string, string];

  const lastRangeStatistics = useGetStatistics(oppositeRange);

  const percentDiff = (key: keyof WalletStatisticsResponse["statistics"]) => {
    const current = props.data?.[key];
    const previous = lastRangeStatistics.data?.statistics?.[key];

    if (typeof previous !== "number" || typeof current !== "number") return 0;

    if (previous === 0) return current === 0 ? 0 : 100;
    const percent = ((current - previous) / previous) * 100;

    if (percent < 0) return percent.toFixed(2) + "%";

    return "+" + percent.toFixed(2) + "%";
  };

  const getValue = (key: keyof WalletStatisticsResponse["statistics"], t: string = "zł") => {
    let value = lastRangeStatistics.data?.statistics?.[key];

    if (typeof value === "number") value = value.toFixed(2) + " " + (t || "");

    return "\n" + value;
  };

  const omitFields = ["lastBalance"];

  const isEmptyOppositeRange = Object.entries(lastRangeStatistics.data?.statistics || {})
    .filter(([key]) => !omitFields.includes(key))
    .every(([_, value]) => {
      return typeof value === "number" && value === 0;
    });

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

      {lastRangeStatistics.data && !isEmptyOppositeRange && (
        <>
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18, marginTop: 25 }}>Percentage difference in spendings</Text>
          <Text style={{ color: "gray", marginTop: 5 }}>
            Statistics in the previous daterange {"\n"}
            {oppositeRange[0]} to {oppositeRange[1]}
          </Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginTop: 15 }}>
            <Item
              label={"Total expenses: " + getValue("expense")}
              formatValue={false}
              value={percentDiff("expense")}
              icon={<Text style={{ fontSize: 25, color: "red", marginRight: 2.5 }}>%</Text>}
            />
            <Item
              label={"Total income" + getValue("income")}
              formatValue={false}
              value={percentDiff("income")}
              icon={<Text style={{ fontSize: 25, color: "lightgreen", marginRight: 2.5 }}>%</Text>}
            />
            <Item
              label={"Min expense" + getValue("min")}
              formatValue={false}
              value={percentDiff("min")}
              icon={<Text style={{ fontSize: 25, color: "red", marginRight: 2.5 }}>%</Text>}
            />
            <Item
              label={"Max expense" + getValue("max")}
              formatValue={false}
              value={percentDiff("max")}
              icon={<Text style={{ fontSize: 25, color: "lightgreen", marginRight: 2.5 }}>%</Text>}
            />
            <Item
              label={"Average purchase" + getValue("average")}
              formatValue={false}
              value={percentDiff("average")}
              icon={<Text style={{ fontSize: 25, color: "red", marginRight: 2.5 }}>%</Text>}
            />
            <Item
              label={"Total count" + getValue("count", "")}
              formatValue={false}
              value={percentDiff("count")}
              icon={<Text style={{ fontSize: 25, color: "lightgreen", marginRight: 2.5 }}>%</Text>}
            />
            <Item
              label="Top category"
              value={lastRangeStatistics.data.statistics.theMostCommonCategory}
              icon={<MaterialIcons name="category" size={24} color="white" />}
            />
            <Item
              label="Meh category"
              value={lastRangeStatistics.data.statistics.theLeastCommonCategory}
              icon={<MaterialIcons name="category" size={24} color="white" />}
            />
          </View>
        </>
      )}
    </View>
  );
}
