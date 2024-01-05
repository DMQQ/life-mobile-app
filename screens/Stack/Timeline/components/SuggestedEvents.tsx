import Button from "@/components/ui/Button/Button";
import Colors from "@/constants/Colors";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import moment from "moment";
import { useState } from "react";
import { FlatList, Pressable, Text, View, VirtualizedList } from "react-native";
import Ripple from "react-native-material-ripple";
import Animated from "react-native-reanimated";
import { InitialValuesType } from "../hooks/mutation/useCreateTimeline";
import { StyleSheet } from "react-native";
import { CommonEvents } from "./CommonEvents.data";

type EventType = (typeof CommonEvents)[0];

interface SuggestedEventsProps {
  date: string;

  createTimelineAsync: (input: InitialValuesType) => Promise<void>;

  initialValues: InitialValuesType;
}

export default function SuggestedEvents(props: SuggestedEventsProps) {
  const [selected, setSelected] = useState<Partial<EventType>>({});

  const [subCategory, setSubCategory] = useState<string>("");

  const [time, setTime] = useState<Date>();

  const handleSelectQuickOption = (item: (typeof CommonEvents)[0]) => {
    setSelected((prev) => (prev.name === item.name ? {} : item));
    setSubCategory("");
  };

  const handleSelectSubCategory = (sub: string) => {
    setSubCategory((prev) => (prev === sub ? "" : sub));
  };

  const handleSetTime = () => {
    DateTimePickerAndroid.open({
      value: new Date(), // i need only time so no need to have correct date
      display: "default",
      positiveButtonLabel: "Set time",
      negativeButtonLabel: "Cancel",
      is24Hour: true,
      mode: "time",

      onChange(event, date) {
        setTime(date);
      },
    });
  };

  const endTime = moment(time).add(1, "hour").toDate().toLocaleTimeString();

  const handleSubmit = async () => {
    if (time === undefined) return;

    const title = selected.name + " - " + subCategory;

    const _time = {
      begin: time?.toLocaleTimeString()!,
      end: endTime,
    };

    const finalData = {
      title,
      desc: selected.content || "",
      ..._time,
      tags: "pre-made-event",
      date: moment().format("YYYY-MM-DD"),
    };

    await props.createTimelineAsync({ ...props.initialValues, ...finalData });

    setTime(undefined);
    setSelected({});
    setSubCategory("");
  };

  const canSubmit = selected.name !== undefined && time !== undefined;

  const hasSubCategory =
    !!selected.name && (selected?.categories?.length || 0) > 0;

  return (
    <View style={styles.container}>
      <Text style={{ color: "#fff", fontSize: 22, fontWeight: "bold" }}>
        Commonly used events
      </Text>
      <Text style={{ color: "rgba(255,255,255,0.7)" }}>
        Quick, premade events to use
      </Text>

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
            selected={selected}
            handleSelectQuickOption={handleSelectQuickOption}
            item={item}
          />
        )}
      />

      <Text style={{ color: "rgba(255,255,255,0.7)", padding: 5 }}>
        Press to use and set the options
      </Text>

      {hasSubCategory && (
        <FlatList
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 10 }}
          horizontal
          data={selected.categories}
          keyExtractor={(opt) => opt}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => handleSelectSubCategory(item)}
              style={[
                {
                  backgroundColor:
                    subCategory === item
                      ? Colors.secondary
                      : Colors.primary_light,
                },
                styles.subcategory,
              ]}
            >
              <Text style={{ color: "#fff" }}>{item}</Text>
            </Pressable>
          )}
        />
      )}

      {selected.name !== undefined &&
        ((selected?.categories?.length || 0) > 0 ? subCategory : true) && (
          <Ripple style={styles.time} onPress={handleSetTime}>
            <Text style={{ color: "#fff", fontSize: 17 }}>Set time</Text>
            <Text style={{ color: "#fff", fontSize: 17 }}>
              {time !== undefined && time?.toLocaleTimeString()} to {endTime}
            </Text>
          </Ripple>
        )}

      <Button
        onPress={() => handleSubmit()}
        disabled={!canSubmit}
        rippleColor={Colors.secondary}
        type="outlined"
        fontStyle={{ fontSize: 16 }}
        style={{
          marginTop: 20,
          borderWidth: 1,
        }}
      >
        Create quick event
      </Button>
    </View>
  );
}

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

const styles = StyleSheet.create({
  container: {
    width: "100%",
    padding: 5,
    paddingBottom: 15,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary_lighter,
  },

  tileContent: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontWeight: "400",
    width: 170,
    flexWrap: "wrap",
  },

  tileTitle: {
    color: "#fff",
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
  },

  time: {
    padding: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  subcategory: {
    padding: 7.5,
    paddingHorizontal: 15,
    marginRight: 10,
    borderRadius: 100,
  },
});
