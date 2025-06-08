import Layout from "@/constants/Layout";
import { StyleSheet, Text, View } from "react-native";
import Ripple from "react-native-material-ripple";
import Colors from "@/constants/Colors";
import Color from "color";
import { CategoryUtils, Icons } from "../ExpenseIcon";
import lowOpacity from "@/utils/functions/lowOpacity";
import { useEffect, useMemo, useState } from "react";
import { AntDesign } from "@expo/vector-icons";

interface ICategory {
  category: string;

  percentage: number;

  total: number;

  count: string;
}

interface LegendProps {
  totalSum: number;
  onPress: (item: ICategory) => void;
  selected: string;

  onLongPress?: (item: ICategory) => void;

  excluded?: string[];

  startDate: string;

  endDate: string;

  detailed: string;

  toggleMode: () => void;

  statisticsLegendData: {
    statisticsLegend: ICategory[];
  };
}

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const Legend = (props: LegendProps) => {
  const [data, setData] = useState<ICategory[]>(props.statisticsLegendData?.statisticsLegend || []);

  useEffect(() => {
    if (props.statisticsLegendData?.statisticsLegend?.length > 0) {
      setData(props.statisticsLegendData.statisticsLegend);
    }
  }, [props.statisticsLegendData]);

  const legendList = useMemo(
    () =>
      data?.map((item, index) => {
        const isExcluded = props.excluded?.includes(item.category);

        const percentage = (props?.excluded?.length || 0) > 0 ? (item.total / props.totalSum) * 100 : item.percentage;

        return (
          <Ripple
            onLongPress={() => props.onLongPress?.(item)}
            onPress={() => props.onPress(item)}
            key={item.category}
            style={[
              styles.tile,

              {
                width: data?.length - 1 === index && data?.length % 2 === 1 ? "100%" : (Layout.screen.width - 30) / 2 - 7.5,
                backgroundColor:
                  props.selected === item.category
                    ? Color(Colors.primary_light).lighten(0.4).string()
                    : isExcluded
                    ? Color(Colors.primary_light).darken(0.4).string()
                    : Colors.primary_light,
              },
            ]}
          >
            <Text
              style={[
                styles.totalText,
                {
                  color: isExcluded ? "rgba(255,255,255,0.5)" : "#fff",
                },
              ]}
            >
              {Math.trunc(item.total)}zł
              <Text style={{ color: "gray" }}>
                {!isExcluded && (
                  <>
                    <Text style={{ fontSize: 12 }}>
                      {"  "} / {"  "}
                    </Text>
                    <Text style={{ fontSize: 12 }}>{percentage.toFixed(2)}%</Text>
                  </>
                )}
              </Text>
            </Text>
            <View style={styles.tileText}>
              <View
                style={{
                  backgroundColor: lowOpacity(Icons[item.category as keyof typeof Icons]?.backgroundColor, 0.2),
                  borderRadius: 100,
                  width: 40,
                  height: 40,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {CategoryUtils.getCategoryIcon(item.category)}
              </View>

              <View style={{ gap: 1.5 }}>
                <Text style={{ color: blueText, fontSize: 15, fontWeight: 500 }}>
                  {capitalize(CategoryUtils.getCategoryName(item.category ?? "None"))}
                </Text>
                <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>(No transactions {item.count})</Text>
              </View>
            </View>
            <View
              style={{
                width: data?.length - 1 === index && data?.length % 2 === 1 ? "100%" : (Layout.screen.width - 30) / 2 - 7.5,
                overflow: "hidden",
                position: "absolute",
                bottom: 0,
                marginTop: 10,
              }}
            >
              <View
                style={{
                  width: (percentage + "%") as any,
                  height: 5,
                  backgroundColor: Icons[item.category as keyof typeof Icons]?.backgroundColor,
                  borderRadius: 10,
                }}
              />
            </View>
          </Ripple>
        );
      }),
    [data]
  );

  return data?.length === 0 ? null : (
    <View style={styles.tilesContainer}>
      <View style={{ width: "100%", marginBottom: 10, flexDirection: "row", justifyContent: "space-between" }}>
        <View>
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>Chart legend</Text>
          <Text style={{ color: "gray", marginTop: 5 }}>Detailed percentage of your expenses</Text>
        </View>

        <View style={{ alignItems: "center" }}>
          <Ripple onPress={props.toggleMode} style={styles.viewToggle}>
            <AntDesign name="swap" size={20} color={Colors.secondary} />
            <Text style={{ color: Colors.secondary, textTransform: "capitalize" }}>{props.detailed}</Text>
          </Ripple>
        </View>
      </View>
      {legendList}
    </View>
  );
};

const blueText = "#fff";

const styles = StyleSheet.create({
  tilesContainer: {
    marginTop: 15,
    width: Layout.window.width - 30,
    gap: 15,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  tile: {
    flexDirection: "column",
    padding: 20,
    backgroundColor: Colors.primary_light,
    borderRadius: 15,
    gap: 5,
    paddingBottom: 30,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 10,
    marginRight: 10,
  },
  tileText: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 10,
  },
  expenseTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
  },
  totalText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  listHeader: {
    flex: 1,
    paddingHorizontal: 15,
    alignItems: "center",
    marginBottom: 30,
  },

  viewToggle: {
    backgroundColor: lowOpacity(Colors.secondary, 0.15),
    borderWidth: 0.5,
    borderColor: lowOpacity(Colors.secondary, 0.5),
    padding: 7.5,
    paddingHorizontal: 15,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
});

export default Legend;
