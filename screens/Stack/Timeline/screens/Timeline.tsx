import ScreenContainer from "../../../../components/ui/ScreenContainer";
import { View, Text, FlatList, Image } from "react-native";
import Calendar from "../../../../components/Calendar/Calendar";
import moment from "moment";
import timelineStyles from "../components/timeline.styles";
import Ripple from "react-native-material-ripple";
import useGetTimeLineQuery from "../hooks/query/useGetTimeLineQuery";
import Colors from "../../../../constants/Colors";
import { useEffect } from "react";
import Skeleton from "../../../../components/SkeletonLoader/Skeleton";
import { TimelineScreenProps } from "../types";
import TimelineItem from "../components/TimelineItem";
import { MaterialIcons } from "@expo/vector-icons";

export default function Timeline({
  navigation,
}: TimelineScreenProps<"Timeline">) {
  const { data, selected, setSelected, loading } = useGetTimeLineQuery();

  const onDayPress = (day: { dateString: string }) =>
    setSelected(day.dateString);

  function navigateCreateTimelineEventModal() {
    navigation.navigate("TimelineCreate", { selectedDate: selected });
  }

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, []);

  return (
    <ScreenContainer style={{ padding: 0 }}>
      <Calendar onDayPress={onDayPress} />

      <View
        style={{
          padding: 10,

          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={timelineStyles.dayHeader}>
          {moment().format("YYYY-MM-DD") === selected
            ? `Today (${selected})`
            : selected}
        </Text>

        <Ripple
          style={{ padding: 5 }}
          onPress={() => navigation.navigate("Schedule", { selected })}
        >
          <MaterialIcons name="grid-view" size={24} color={Colors.secondary} />
        </Ripple>
      </View>

      {loading && (
        <View style={{ padding: 10 }}>
          <Skeleton
            backgroundColor={Colors.primary_light}
            highlightColor={Colors.primary_lighter}
            size={({ width }) => ({
              width: width - 20,
              height: ((65 + 10) * 3 + 40) * 2 + 30,
            })}
          >
            <View>
              <Skeleton.Item width={(w) => w / 2} height={30} />
              <Skeleton.Item width={(w) => w - 20} height={65} />
              <Skeleton.Item width={(w) => w - 20} height={65} />
              <Skeleton.Item width={(w) => w - 20} height={65} />

              <Skeleton.Item marginTop={30} width={(w) => w / 2} height={30} />
              <Skeleton.Item width={(w) => w - 20} height={65} />
              <Skeleton.Item width={(w) => w - 20} height={65} />
              <Skeleton.Item width={(w) => w - 20} height={65} />
            </View>
          </Skeleton>
        </View>
      )}

      <ListContainer
        navigation={navigation}
        onPress={navigateCreateTimelineEventModal}
        list={data?.timeline || []}
      />
    </ScreenContainer>
  );
}

const ListContainer = (props: {
  list: any[];
  onPress: () => void;
  navigation: any;
}) => (
  <View style={timelineStyles.listHeading}>
    <View style={timelineStyles.listHeadingContainer}>
      <Text style={timelineStyles.listHeadingText}>Events</Text>

      <Ripple style={{ padding: 10 }} onPress={() => props.onPress()}>
        <Text style={{ color: Colors.secondary, fontWeight: "bold" }}>
          CREATE EVENT
        </Text>
      </Ripple>
    </View>

    <FlatList
      keyExtractor={(timeline) => timeline.id}
      data={props.list}
      renderItem={({ item }) => <TimelineItem {...item} />}
    />

    {props.list.length === 0 && (
      <View
        style={{
          padding: 10,

          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <MaterialIcons name="event-busy" color={"#2c2c2c"} size={150} />
        <Text style={{ color: "#2c2c2c", fontWeight: "bold", fontSize: 35 }}>
          No events
        </Text>
      </View>
    )}
  </View>
);
