import Layout from "@/constants/Layout";
import { StyleSheet, Text, View } from "react-native";
import Ripple from "react-native-material-ripple";
import Colors from "@/constants/Colors";
import Color from "color";

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
}

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const Legend = (props: LegendProps) => (
  <View style={styles.tilesContainer}>
    {props.data.map((item, index) => (
      <Ripple
        onPress={() => props.onPress(item)}
        key={index}
        style={[
          styles.tile,

          {
            width: props.data.length - 1 === index && props.data.length % 2 === 1 ? "100%" : (Layout.screen.width - 30) / 2 - 5,
            backgroundColor: props.selected === item.label ? Color(Colors.primary_light).lighten(0.4).string() : Colors.primary_light,
          },
        ]}
      >
        <Text style={styles.totalText}>
          {Math.trunc(item.value)}zł
          <Text style={{ color: "gray" }}>
            <Text style={{ fontSize: 12 }}>
              {"  "} / {"  "}
            </Text>
            <Text style={{ fontSize: 12 }}>{((item.value / props.totalSum) * 100).toFixed(2)}%</Text>
          </Text>
        </Text>

        <View style={styles.tileText}>
          <View style={[styles.dot, { backgroundColor: item.color }]} />
          <Text style={{ color: blueText }}>{capitalize(item.label)}</Text>
        </View>
      </Ripple>
    ))}
  </View>
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
