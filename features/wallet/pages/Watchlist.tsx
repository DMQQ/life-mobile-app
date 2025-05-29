import ScreenContainer from "@/components/ui/ScreenContainer";
import { Text, View, StyleSheet, FlatList } from "react-native";
import Colors from "@/constants/Colors";
import { useState } from "react";
import lowOpacity from "@/utils/functions/lowOpacity";
import Color from "color";
import Button from "@/components/ui/Button/Button";
import { Entypo } from "@expo/vector-icons";

const styles = StyleSheet.create({
  list: {
    backgroundColor: Colors.primary_light,
    padding: 20,
    borderRadius: 10,
    marginTop: 20,
  },
  heading: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#fff",
  },
  row: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
  },

  advdisTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 5,
  },
  advdisText: { fontSize: 13, paddingLeft: 10, fontWeight: "500" },

  specTitle: {
    color: Colors.secondary_light_1,
    fontSize: 17,
    padding: 10,
    fontWeight: "600",
  },
});

interface WatchlistItemProps {
  name: string;
  priority: number;
  advantages: string[];
  disadvantages: string[];

  info: Record<string, string | Record<string, any>>;
}

const TEST_DATA = [
  {
    name: "Macbook Pro 14 Inch M2 2023 16/512GB",
    priority: 1,
    advantages: ["High performance", "Good battery life"],
    disadvantages: ["Expensive"],
    info: {
      price: "7000zł to 9000zł",
      cpu: "M2 PRO",
      ram: "16GB",
      storage: "512GB",
    },
  },

  {
    name: "Nowe GPU",
    priority: 2,
    advantages: [],
    disadvantages: ["Brak informacji"],
    info: {},
  },
] as WatchlistItemProps[];

const ItemRow = (props: { color: string; list: string[]; sign: string; title: string }) => (
  <View style={[styles.row, { backgroundColor: lowOpacity(props.color, 0.05) }]}>
    <Text style={[styles.advdisTitle, { color: props.color }]}>{props.title}</Text>

    <View style={{ marginTop: 10 }}>
      {props.list.map((advantage, index) => (
        <Text key={index} style={[styles.advdisText, { color: props.color }]}>
          {props.sign} {advantage}
        </Text>
      ))}
    </View>
  </View>
);

const ItemInfoItem = (props: { title: string; value: string | number | { title: string; value: string | number } }) => (
  <View
    style={{
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 10,
      paddingVertical: 5,
    }}
  >
    <Text
      style={{
        fontWeight: "500",
        color: Colors.secondary_light_2,
        textTransform: "capitalize",
      }}
    >
      {props.title}:
    </Text>

    <Text style={{ fontWeight: "600", color: "#fff" }}>{typeof props.value === "object" ? props.value.value : props.value}</Text>
  </View>
);

const WatchlistItem = (props: WatchlistItemProps) => {
  return (
    <View style={styles.list}>
      <Text style={styles.heading}>{props.name}</Text>

      <View
        style={{
          marginTop: 20,
          backgroundColor: Colors.primary,
          borderRadius: 5,
          padding: 5,
        }}
      >
        <Text style={styles.specTitle}>Product's info</Text>

        {props.info && (
          <View>
            {Object.entries(props.info).map(([key, value], index) => (
              <ItemInfoItem title={key} value={value as any} />
            ))}
          </View>
        )}
      </View>

      <View style={{ marginTop: 10, gap: 10, flexDirection: "row" }}>
        {props.advantages.length > 0 && <ItemRow title="Advantages" sign="+" color="lightgreen" list={props.advantages} />}
        {props.disadvantages.length > 0 && (
          <ItemRow title="Disadvantages" sign="-" color={Color(Colors.error).lighten(0.05).hex()} list={props.disadvantages} />
        )}
      </View>

      <View style={{ flexDirection: "row", gap: 10, marginTop: 30 }}>
        <Button
          style={{
            flex: 1,
            borderRadius: 5,
            backgroundColor: lowOpacity(Colors.error, 0.1),
          }}
        >
          <Entypo name="arrow-bold-down" size={24} color={Colors.error} />
        </Button>

        <Button
          style={{
            flex: 7,
            borderRadius: 5,
            backgroundColor: Colors.primary_lighter,
          }}
        >
          Manage
        </Button>

        <Button
          style={{
            flex: 1,
            borderRadius: 5,
            backgroundColor: lowOpacity("lightgreen", 0.1),
          }}
        >
          <Entypo name="arrow-bold-up" size={24} color="lightgreen" />
        </Button>
      </View>
    </View>
  );
};

export default function Watchlist() {
  const [items, setItems] = useState<any[]>([]);

  return (
    <ScreenContainer>
      <FlatList
        ListHeaderComponent={
          <View
            style={{
              paddingHorizontal: 10,
              marginBottom: 30,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 25,
                color: "#fff",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              Your balance:
            </Text>

            <Text style={{ fontSize: 40, color: "#fff", fontWeight: "bold" }}>
              0<Text style={{ fontSize: 15 }}>zł</Text>
            </Text>
          </View>
        }
        style={{ flex: 1 }}
        data={TEST_DATA}
        renderItem={({ item }) => <WatchlistItem {...item} />}
        keyExtractor={(item) => item.name}
      />
    </ScreenContainer>
  );
}
