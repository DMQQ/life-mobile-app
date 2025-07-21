import { Pressable, StyleSheet, Text, VirtualizedList } from "react-native";
import { CommonEvents } from "../CommonEvents.data";
import Animated from "react-native-reanimated";
import Colors from "@/constants/Colors";

const styles = StyleSheet.create({
  tileContent: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontWeight: "400",
    width: 170,
    flexWrap: "wrap",
  },

  tileTitle: {
    color: Colors.foreground,
    fontSize: 22,
    fontWeight: "bold",
    letterSpacing: 0.5,
    marginBottom: 2.5,
  },

  tile: {
    padding: 17.5,
    borderRadius: 17.5,
    minWidth: 150,
    marginRight: 15,
    borderWidth: 1,
    borderColor: Colors.primary_lighter,
  },
});

type EventType = (typeof CommonEvents)[0];

interface TileProps {
  handleSelectQuickOption: (v: EventType) => void;

  item: EventType;

  selected: Partial<EventType>;
}

const Tile = ({ item, selected, ...props }: TileProps) => {
  return (
    <Pressable
      onPress={() => {
        props.handleSelectQuickOption(item);
      }}
      style={[
        {
          backgroundColor:
            selected?.name === item.name
              ? Colors.secondary
              : Colors.primary_light,
        },
        styles.tile,
      ]}
    >
      <Animated.View>
        <Text style={styles.tileTitle}>{item.name}</Text>

        <Text style={styles.tileContent}>{item.content}</Text>
      </Animated.View>
    </Pressable>
  );
};

export default function TilesList(props: {
  selected: Partial<EventType>;
  handleSelectQuickOption: (v: EventType) => void;
}) {
  return (
    <VirtualizedList
      getItemCount={(arr) => arr.length}
      getItem={(arr, index) => arr[index]}
      showsHorizontalScrollIndicator={false}
      style={{ paddingVertical: 10 }}
      horizontal
      data={CommonEvents}
      keyExtractor={(event) => event.name}
      renderItem={({ item, index }) => (
        <Tile
          selected={props.selected}
          handleSelectQuickOption={props.handleSelectQuickOption}
          item={item}
        />
      )}
    />
  );
}
