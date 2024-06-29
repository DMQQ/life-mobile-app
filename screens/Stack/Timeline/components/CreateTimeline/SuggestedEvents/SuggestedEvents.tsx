import Button from "@/components/ui/Button/Button";
import Colors from "@/constants/Colors";
import { ActivityIndicator, Text, View } from "react-native";
import Ripple from "react-native-material-ripple";
import { StyleSheet } from "react-native";
import useSuggestedEvents from "./useSuggestedEvents";
import TilesList from "./TilesList";
import SubcategoryList from "./SubcategoryList";
import useCreateTimeline from "../../../hooks/general/useCreateTimeline";
import { useNavigation } from "@react-navigation/native";

interface SuggestedEventsProps {
  date: string;
}

export default function SuggestedEvents(props: SuggestedEventsProps) {
  const navigation = useNavigation<any>();
  const {
    handleSubmit: createTimeline,
    initialValues,
    isLoading,
  } = useCreateTimeline({
    route: {
      params: {
        selectedDate: props.date,
        mode: "edit",
      },
    } as any,
    navigation,
  });
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
    createTimelineAsync: createTimeline,
    initialValues: initialValues,
  });

  const canSubmit = selected.name !== undefined && time !== undefined;

  const hasSubCategory =
    !!selected.name && (selected?.categories?.length || 0) > 0;

  return (
    <View style={styles.container}>
      <Text style={{ color: "#fff", fontSize: 24, fontWeight: "bold" }}>
        Commonly used events
      </Text>
      <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>
        Quick, premade events to use
      </Text>

      <TilesList
        handleSelectQuickOption={handleSelectQuickOption}
        selected={selected}
      />

      {hasSubCategory && (
        <>
          <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>
            Press to set category
          </Text>
          <SubcategoryList
            handleSelectSubCategory={handleSelectSubCategory}
            selected={selected || []}
            subCategory={subCategory}
          />
        </>
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
              {time?.toLocaleTimeString("pl-PL", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
              {" to "}
              {endTime}
            </Text>
          </Ripple>
        )}

      <Button
        onPress={() => handleSubmit()}
        disabled={!canSubmit}
        rippleColor={Colors.secondary}
        fontStyle={{
          fontSize: 16,
        }}
        style={{
          marginTop: 25,
          flexDirection: "row-reverse",
        }}
        icon={
          isLoading && (
            <ActivityIndicator
              style={{ marginHorizontal: 10 }}
              size="small"
              color="#fff"
            />
          )
        }
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
