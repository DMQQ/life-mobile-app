import { View } from "react-native";
import Text from "@/components/ui/Text/Text";
import useGetStatistics, { WalletStatisticsResponse } from "../../hooks/useGetStatistics";
import Layout from "@/constants/Layout";
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { ReactNode, useEffect, useMemo, useState } from "react";
import moment from "moment";
import Ripple from "react-native-material-ripple";
import lowOpacity from "@/utils/functions/lowOpacity";
import { useWalletContext } from "../WalletContext";

interface ItemProps {
  label: string;
  value: number | string;
  icon?: ReactNode;
  formatValue?: boolean;
  width?: number;
}

const capitalize = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");

export const Item = ({ label, value, icon, formatValue = true, width }: ItemProps) => (
  <View
    style={{
      marginTop: 5,
      width: width || (Layout.screen.width - 30 - 10) / 2,
      flexDirection: "row",
      gap: 10,
      padding: 20,
      backgroundColor: Colors.primary_light,
      borderRadius: 15,
    }}
  >
    {icon}
    <View>
      <Text variant="body" style={{ color: Colors.foreground, fontWeight: "bold" }}>
        {formatValue ? (typeof value === "number" ? value.toFixed(2) + "zł" : value) : value}
      </Text>
      <Text variant="caption" style={{ color: "grey", marginTop: 2.5 }}>{label}</Text>
    </View>
  </View>
);

export default function StatisticsSummary() {
  const { filters } = useWalletContext();
  const { data: stats } = useGetStatistics([filters.date.from, filters.date.to]);

  const oppositeRange = useMemo(() => {
    const size = moment(filters.date.to).diff(moment(filters.date.from), "days");

    if (size === 1)
      return [
        moment(filters.date.from).subtract(1, "day").format("YYYY-MM-DD"),
        moment(filters.date.to).subtract(1, "day").format("YYYY-MM-DD"),
      ];

    if (size === 2)
      return [
        moment(filters.date.from).subtract(2, "day").format("YYYY-MM-DD"),
        moment(filters.date.to).subtract(2, "day").format("YYYY-MM-DD"),
      ];

    if (size >= 7 && size <= 10)
      return [
        moment(filters.date.from).subtract(1, "week").format("YYYY-MM-DD"),
        moment(filters.date.to).subtract(1, "week").format("YYYY-MM-DD"),
      ];

    if (size >= 28 && size <= 31)
      return [
        moment(filters.date.from).subtract(1, "month").format("YYYY-MM-DD"),
        moment(filters.date.to).subtract(1, "month").format("YYYY-MM-DD"),
      ];

    if (size >= 365)
      return [
        moment(filters.date.from).subtract(1, "year").format("YYYY-MM-DD"),
        moment(filters.date.to).subtract(1, "year").format("YYYY-MM-DD"),
      ];

    return ["", ""];
  }, [filters.date]) as [string, string];

  const lastRangeStatistics = useGetStatistics(oppositeRange);

  const percentDiff = (key: keyof WalletStatisticsResponse["statistics"]) => {
    const current = stats?.statistics?.[key];
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

  const [view, setView] = useState<"last" | "current">("current");

  if (!stats?.statistics) return null;

  return (
    <View style={{ width: Layout.screen.width - 30, marginTop: 25, marginBottom: 50, minHeight: 475 }}>
      <View style={{ flexDirection: "row" }}>
        <View style={{ flex: 1 }}>
          {view === "current" ? (
            <>
              <Text variant="body" style={{ color: Colors.foreground, fontWeight: "bold" }}>Statistics Summary</Text>

              <Text variant="body" style={{ color: "gray", marginTop: 5 }}>
                From {filters.date.from} to {filters.date.to}
              </Text>
            </>
          ) : (
            <>
              <Text variant="body" style={{ color: Colors.foreground, fontWeight: "bold" }}>Difference in spendings</Text>
              <Text variant="body" style={{ color: "gray", marginTop: 5 }}>
                Dates {oppositeRange[0]} to {oppositeRange[1]}
              </Text>
            </>
          )}
        </View>
        {lastRangeStatistics.data && !isEmptyOppositeRange && (
          <View style={{ alignItems: "flex-end" }}>
            <Ripple
              onPress={() => setView((p) => (p === "current" ? "last" : "current"))}
              style={{
                backgroundColor: lowOpacity(Colors.secondary, 0.15),
                borderWidth: 0.5,
                borderColor: lowOpacity(Colors.secondary, 0.5),
                padding: 7.5,
                paddingHorizontal: 15,
                borderRadius: 10,
              }}
            >
              <Text variant="body" style={{ color: Colors.secondary }}>{view === "current" ? "Last range" : "Current range"}</Text>
            </Ripple>
          </View>
        )}
      </View>

      {view === "current" ? (
        <View style={{ flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginTop: 15 }}>
          <Item
            label={"Total expenses" + "\n"}
            value={stats.statistics.expense}
            icon={<MaterialIcons name="attach-money" size={24} color="red" />}
          />
          <Item
            label={"Total income" + "\n"}
            value={stats.statistics.income}
            icon={<Ionicons name="cash-outline" size={24} color="lightgreen" />}
          />
          <Item
            label={"Min expense" + "\n"}
            value={stats.statistics.min}
            icon={<MaterialIcons name="trending-down" size={24} color="red" />}
          />
          <Item
            label={"Max expense" + "\n"}
            value={stats.statistics.max}
            icon={<MaterialIcons name="trending-up" size={24} color="lightgreen" />}
          />
          <Item
            label={"Average purchase" + "\n"}
            value={stats.statistics.average}
            icon={<FontAwesome5 name="chart-bar" size={24} color="red" />}
          />
          <Item
            label={"Total count" + "\n"}
            formatValue={false}
            value={stats.statistics.count}
            icon={<Ionicons name="receipt-outline" size={24} color="lightgreen" />}
          />
          <Item
            label={"Top category"}
            value={capitalize(stats.statistics.theMostCommonCategory)}
            icon={<MaterialIcons name="category" size={24} color={Colors.foreground} />}
          />
          <Item
            label="Uncommon category"
            value={capitalize(stats.statistics.theLeastCommonCategory)}
            icon={<MaterialIcons name="category" size={24} color={Colors.foreground} />}
          />
        </View>
      ) : (
        <>
          <View style={{ flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginTop: 15 }}>
            <Item
              label={"Total expenses: " + getValue("expense")}
              formatValue={false}
              value={percentDiff("expense")}
              icon={<Text variant="subheading" style={{ color: "red", marginRight: 2.5 }}>%</Text>}
            />
            <Item
              label={"Total income" + getValue("income")}
              formatValue={false}
              value={percentDiff("income")}
              icon={<Text variant="subheading" style={{ color: "lightgreen", marginRight: 2.5 }}>%</Text>}
            />
            <Item
              label={"Min expense" + getValue("min")}
              formatValue={false}
              value={percentDiff("min")}
              icon={<Text variant="subheading" style={{ color: "red", marginRight: 2.5 }}>%</Text>}
            />
            <Item
              label={"Max expense" + getValue("max")}
              formatValue={false}
              value={percentDiff("max")}
              icon={<Text variant="subheading" style={{ color: "lightgreen", marginRight: 2.5 }}>%</Text>}
            />
            <Item
              label={"Average purchase" + getValue("average")}
              formatValue={false}
              value={percentDiff("average")}
              icon={<Text variant="subheading" style={{ color: "red", marginRight: 2.5 }}>%</Text>}
            />
            <Item
              label={"Total count" + getValue("count", "")}
              formatValue={false}
              value={percentDiff("count")}
              icon={<Text variant="subheading" style={{ color: "lightgreen", marginRight: 2.5 }}>%</Text>}
            />
            {lastRangeStatistics?.data && (
              <>
                <Item
                  label="Top category"
                  value={capitalize(lastRangeStatistics.data.statistics.theMostCommonCategory)}
                  icon={<MaterialIcons name="category" size={24} color={Colors.foreground} />}
                />
                <Item
                  label="Meh category"
                  value={capitalize(lastRangeStatistics.data.statistics.theLeastCommonCategory)}
                  icon={<MaterialIcons name="category" size={24} color={Colors.foreground} />}
                />
              </>
            )}
          </View>
        </>
      )}
    </View>
  );
}
