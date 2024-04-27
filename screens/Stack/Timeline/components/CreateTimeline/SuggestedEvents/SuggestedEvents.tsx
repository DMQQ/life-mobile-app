import Button from "@/components/ui/Button/Button";
import Colors from "@/constants/Colors";
import { FlatList, Pressable, Text, View } from "react-native";
import Ripple from "react-native-material-ripple";
import { InitialValuesType } from "../../../hooks/mutation/useCreateTimeline";
import { StyleSheet } from "react-native";
import { CommonEvents } from "../CommonEvents.data";
import Color from "color";
import useSuggestedEvents from "./useSuggestedEvents";
import TilesList from "./TilesList";
import SubcategoryList from "./SubcategoryList";

type EventType = (typeof CommonEvents)[0];

interface SuggestedEventsProps {
  date: string;

  createTimelineAsync: (input: InitialValuesType) => Promise<void>;

  initialValues: InitialValuesType;
}

export default function SuggestedEvents(props: SuggestedEventsProps) {
  const {
    endTime,
    handleSelectQuickOption,
    handleSelectSubCategory,
    handleSetTime,
    handleSubmit,
    selected,
    subCategory,
    time,
  } = useSuggestedEvents({
    createTimelineAsync: props.createTimelineAsync,
    initialValues: props.initialValues,
  });

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

      <TilesList
        handleSelectQuickOption={handleSelectQuickOption}
        selected={selected}
      />

      <Text style={{ color: "rgba(255,255,255,0.7)", padding: 5 }}>
        Press to use and set the options
      </Text>

      {hasSubCategory && (
        <SubcategoryList
          handleSelectSubCategory={handleSelectSubCategory}
          selected={selected || []}
          subCategory={subCategory}
        />
      )}

      {selected.name !== undefined &&
        ((selected?.categories?.length || 0) > 0 ? subCategory : true) && (
          <Ripple
            style={styles.time}
            onPress={handleSetTime}
            onLayout={() => handleSetTime()}
          >
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
        fontStyle={{
          fontSize: 15,
          color: canSubmit ? "#fff" : Color(Colors.secondary).darken(0.5).hex(),
        }}
        style={{
          marginTop: 20,
          borderWidth: 1,
          backgroundColor: canSubmit ? Colors.secondary : "transparent",
        }}
      >
        Create quick event
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    padding: 5,
    paddingBottom: 15,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary_lighter,
  },

  time: {
    padding: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
});
