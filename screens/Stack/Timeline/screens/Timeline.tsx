import { View, Text, ScrollView } from "react-native";
import Calendar from "../../../../components/Calendar/Calendar";
import moment from "moment";
import timelineStyles from "../components/timeline.styles";
import Ripple from "react-native-material-ripple";
import useGetTimeLineQuery from "../hooks/query/useGetTimeLineQuery";
import Colors from "../../../../constants/Colors";
import { useEffect, useMemo, useState } from "react";
import Skeleton from "../../../../components/SkeletonLoader/Skeleton";
import { TimelineScreenProps } from "../types";
import TimelineItem from "../components/TimelineItem";
import {
  AntDesign,
  Feather,
  FontAwesome,
  FontAwesome5,
  MaterialIcons,
} from "@expo/vector-icons";
import DateList from "../../../../components/DateList/DateList";
import useUser from "../../../../utils/hooks/useUser";
import { gql, useQuery } from "@apollo/client";
import Color from "color";
import Overlay from "../../../../components/ui/Overlay/Overlay";
import Animated, { FadeInUp, FadeOutDown } from "react-native-reanimated";

const GET_MONTHLY_EVENTS = gql`
  query GetMonthlyEvents($date: String!) {
    timelineMonth(date: $date) {
      date
    }
  }
`;

const groupDates = (dates: { date: string }[]) => {
  const map = new Map();

  for (let i = 0; i < dates.length; i++) {
    const item = map.get(dates[i].date);
    if (item) {
      map.set(dates[i].date, item + 1);
    } else {
      map.set(dates[i].date, 1);
    }
  }

  const res = {} as { [key: string]: number };

  map.forEach((val, key) => {
    res[key] = val;
  });

  return res;
};

const Loader = (props: { loading: boolean }) =>
  props.loading ? (
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
  ) : null;

const iconColor = Color(Colors.primary).lighten(4.5).hex();

export default function Timeline({
  navigation,
}: TimelineScreenProps<"Timeline">) {
  const { data, selected, setSelected, loading } = useGetTimeLineQuery();

  const usr = useUser();

  const { data: monthData, refetch } = useQuery(GET_MONTHLY_EVENTS, {
    variables: { date: moment().format("YYYY-MM-DD") },
    context: {
      headers: {
        authentication: usr.token,
      },
    },
    onError: (err) => console.log(JSON.stringify(err, null, 2)),
  });

  const onDayPress = (day: { dateString: string }) =>
    setSelected(day.dateString);

  const createTimeline = () =>
    navigation.navigate("TimelineCreate", { selectedDate: selected });

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, []);

  const dayEventsSorted = useMemo(
    () => groupDates(monthData?.timelineMonth || []),
    [monthData?.timelineMonth]
  );

  const displayDate =
    moment().format("YYYY-MM-DD") === selected
      ? `Today (${selected})`
      : selected;

  const [switchView, setSwitchView] = useState<"date-list" | "calendar">(
    "date-list"
  );

  const [isFloatingVisible, setIsFloatingVisible] = useState(false);

  return (
    <ScrollView>
      {switchView === "calendar" && (
        <Calendar
          monthData={monthData}
          refetch={refetch}
          onDayPress={onDayPress}
        />
      )}

      {switchView === "date-list" && (
        <DateList
          onMenuPress={() => setSwitchView("calendar")}
          dayEvents={dayEventsSorted}
          selectedDate={selected}
          setSelected={setSelected}
        />
      )}

      <View style={timelineStyles.dateRow}>
        <Text style={timelineStyles.dayHeader}>{displayDate}</Text>

        <Ripple
          onPress={() => setIsFloatingVisible((f) => !f)}
          style={{ paddingHorizontal: 10 }}
        >
          <AntDesign name="bars" color={iconColor} size={24} />
        </Ripple>

        <Overlay
          isVisible={isFloatingVisible}
          onClose={() => setIsFloatingVisible(false)}
          opacity={0.65}
        >
          <Animated.View
            entering={FadeInUp}
            exiting={FadeOutDown}
            style={timelineStyles.floatingContainer}
          >
            <Ripple
              style={[timelineStyles.floatingButton, { marginBottom: 10 }]}
              onPress={() =>
                setSwitchView((sw) =>
                  sw === "calendar" ? "date-list" : "calendar"
                )
              }
            >
              <AntDesign name="calendar" size={24} color={iconColor} />
              <Text style={timelineStyles.floatingText}>
                {switchView === "calendar" ? "Date list" : "Calendar"}
              </Text>
            </Ripple>

            <Ripple
              style={timelineStyles.floatingButton}
              onPress={() => navigation.navigate("Schedule", { selected })}
            >
              <Feather name="list" size={24} color={iconColor} />

              <Text style={timelineStyles.floatingText}>List</Text>
            </Ripple>
          </Animated.View>
        </Overlay>
      </View>

      <ListContainer
        list={data?.timeline || []}
        navigation={navigation}
        onPress={createTimeline}
      />

      <Loader loading={loading} />
    </ScrollView>
  );
}

const ListContainer = (props: {
  list: any[];
  onPress: () => void;
  navigation: any;
}) => (
  <View style={timelineStyles.listHeading}>
    <View style={timelineStyles.listHeadingContainer}>
      <Text style={timelineStyles.listHeadingText}>My events</Text>

      <Ripple
        style={{
          padding: 7.5,
          paddingHorizontal: 10,
          backgroundColor: Colors.secondary,
          borderRadius: 25,
        }}
        onPress={props.onPress}
      >
        <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 13 }}>
          CREATE EVENT
        </Text>
      </Ripple>
    </View>

    {props.list.map((timeline) => (
      <TimelineItem
        styles={{
          backgroundColor: Color(Colors.primary).lighten(0.5).string(),
          borderRadius: 15,
          padding: 20,
        }}
        key={timeline.id}
        location="timeline"
        {...timeline}
      />
    ))}

    {/* <VirtualizedList
      ListEmptyComponent={
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
      }
      style={{ zIndex: 1000 }}
      data={props.list}
      getItem={(list, index) => list[index] as any}
      getItemCount={(arr) => arr.length}
      keyExtractor={(timeline) => timeline.id}
      renderItem={({ item }) => <TimelineItem location="timeline" {...item} />}
    /> */}
  </View>
);
