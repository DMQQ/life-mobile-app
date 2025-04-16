import Layout from "@/constants/Layout";
import { StyleSheet, Text, View } from "react-native";
import Ripple from "react-native-material-ripple";
import Colors from "@/constants/Colors";
import Color from "color";
import Animated, { LinearTransition } from "react-native-reanimated";
import { Icons } from "../ExpenseIcon";
import lowOpacity from "@/utils/functions/lowOpacity";

interface ICategory {
  label: string;
  value: number;
  color: string;
}

interface LegendProps {
  data: ICategory[];
  totalSum: number;
  onPress: (item: ICategory) => void;
  selected: string;

  onLongPress?: (item: ICategory) => void;

  excluded?: string[];
}

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const Legend = (props: LegendProps) =>
  props.data.length === 0 ? null : (
    <Animated.View style={styles.tilesContainer} layout={LinearTransition}>
      <View style={{ width: "100%", marginBottom: 10 }}>
        <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>Chart legend</Text>
        <Text style={{ color: "gray", marginTop: 5 }}>Detailed percentage of your expenses</Text>
      </View>
      {props.data.map((item, index) => {
        const isExcluded = props.excluded?.includes(item.label);
        return (
          <Ripple
            onLongPress={() => props.onLongPress?.(item)}
            onPress={() => props.onPress(item)}
            key={index}
            style={[
              styles.tile,

              {
                width: props.data.length - 1 === index && props.data.length % 2 === 1 ? "100%" : (Layout.screen.width - 30) / 2 - 5,
                backgroundColor:
                  props.selected === item.label
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
              {Math.trunc(item.value)}zł
              <Text style={{ color: "gray" }}>
                {!isExcluded && (
                  <>
                    <Text style={{ fontSize: 12 }}>
                      {"  "} / {"  "}
                    </Text>
                    <Text style={{ fontSize: 12 }}>{((item.value / props.totalSum) * 100).toFixed(2)}%</Text>
                  </>
                )}
              </Text>
            </Text>

            <View style={{ width: "100%", overflow: "hidden" }}>
              <View
                style={{
                  width: (((item.value / props.totalSum) * 100).toFixed(2) + "%") as any,
                  height: 5,
                  backgroundColor: item.color,
                  borderRadius: 10,
                  marginTop: 10,
                }}
              />
            </View>

            <View style={styles.tileText}>
              {/* <View style={[styles.dot, { backgroundColor: item.color }]} /> */}

              <View
                style={{
                  backgroundColor: lowOpacity(item.color, 0.2),
                  padding: 7.5,
                  borderRadius: 100,
                }}
              >
                {Icons?.[item.label as keyof typeof Icons]?.icon}
              </View>

              <Text style={{ color: blueText, fontSize: 17 }}>{capitalize(item.label)}</Text>
            </View>
          </Ripple>
        );
      })}
    </Animated.View>
  );

const blueText = Color(Colors.primary).lighten(10).string();

const styles = StyleSheet.create({
  tilesContainer: {
    marginTop: 15,
    width: Layout.window.width - 30,
    gap: 10,
    flexDirection: "row",
    flexWrap: "wrap",
  },

  tile: {
    flexDirection: "column",
    padding: 20,
    backgroundColor: Colors.primary_light,
    borderRadius: 15,
    gap: 5,
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
});

export default Legend;
