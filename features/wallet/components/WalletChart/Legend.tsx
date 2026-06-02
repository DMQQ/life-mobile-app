import Layout from "@/constants/Layout";
import { StyleSheet, View } from "react-native";
import Text from "@/components/ui/Text/Text";
import Ripple from "react-native-material-ripple";
import Colors from "@/constants/Colors";
import Color from "color";
import { CategoryIcon, CategoryUtils, Icons } from "../Expense/ExpenseIcon";
import lowOpacity from "@/utils/functions/lowOpacity";
import { useEffect, useMemo, useState } from "react";
import { Feather } from "@expo/vector-icons";

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

  const [showAll, setShowAll] = useState(false);

  const legendList = useMemo(
    () =>
      data?.slice(0, showAll ? data.length : 8).map((item, index) => {
        const isExcluded = props.excluded?.includes(item.category);
        const percentage = (props?.excluded?.length || 0) > 0 ? (item.total / props.totalSum) * 100 : item.percentage;
        const isLastOdd = data?.length - 1 === index && data?.length % 2 === 1;
        const tileWidth = isLastOdd ? "100%" : (Layout.screen.width - 30) / 2 - 7.5;

        return (
          <Ripple
            onLongPress={() => props.onLongPress?.(item)}
            onPress={() => props.onPress(item)}
            key={item.category}
            style={[
              styles.tile,
              {
                width: tileWidth,
                backgroundColor:
                  props.selected === item.category
                    ? Color(Colors.primary_light).lighten(0.4).string()
                    : isExcluded
                    ? Color(Colors.primary_light).darken(0.4).string()
                    : Colors.primary_light,
              },
            ]}
          >
            <Text size={22} weight="bold" color={isExcluded ? "rgba(255,255,255,0.5)" : Colors.foreground} mono>
              {Math.trunc(item.total)}zł
              <Text color="gray">
                {!isExcluded && (
                  <>
                    <Text size={12} color="gray">
                      {"  "} / {"  "}
                    </Text>
                    <Text size={12} color="gray">{percentage.toFixed(2)}%</Text>
                  </>
                )}
              </Text>
            </Text>
            <View style={styles.tileText}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <CategoryIcon size={20} category={item.category as any} type="expense" />
              </View>

              <View style={{ gap: 1.5 }}>
                <Text size={15} weight="500" color={blueText}>
                  {capitalize(CategoryUtils.getCategoryName(item.category ?? "None"))}
                </Text>
                <Text size={11} color="rgba(255,255,255,0.6)">{item.count} Transactions</Text>
              </View>
            </View>

            <View
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 5,
                backgroundColor: "rgba(255,255,255,0.1)",
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  width: `${Math.min(percentage, 100)}%`,
                  height: 5,
                  backgroundColor: Icons[item.category as keyof typeof Icons]?.backgroundColor || Colors.secondary,
                  borderRadius: 10,
                }}
              />
            </View>
          </Ripple>
        );
      }),
    [data, props.selected, props.excluded, props.totalSum, showAll]
  );

  return data?.length === 0 ? null : (
    <View style={styles.tilesContainer}>
      <View style={{ width: "100%", marginBottom: 10, flexDirection: "row", justifyContent: "space-between" }}>
        <View>
          <Text size={18} weight="bold" color={Colors.foreground}>Chart legend</Text>
          <Text color="gray" style={{ marginTop: 5 }}>Detailed percentage of your expenses</Text>
        </View>

        <View style={{ alignItems: "center" }}>
          <Ripple onPress={props.toggleMode} style={styles.viewToggle}>
            <Feather name="repeat" size={20} color={Colors.secondary} />
            <Text uppercase color={Colors.secondary}>{props.detailed}</Text>
          </Ripple>
        </View>
      </View>
      {legendList}
      <View style={{ justifyContent: "center", alignItems: "center", padding: 10, width: "100%" }}>
        <Ripple onPress={() => setShowAll((p) => !p)} style={{ width: Layout.screen.width / 3 }}>
          {data?.length > 8 && (
            <Text weight="bold" align="center" color={Colors.secondary}>
              {showAll ? "Show less" : "Show all" + (showAll ? "" : ` (${data.length})`)}
            </Text>
          )}
        </Ripple>
      </View>
    </View>
  );
};

const blueText = Colors.foreground;

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
