import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Color from "color";
import Colors, { secondary_candidates } from "../../../../constants/Colors";
import TimeTable from "react-native-calendar-timetable";
import moment from "moment";
import useGetTimeLineQuery from "../hooks/query/useGetTimeLineQuery";
import Ripple from "react-native-material-ripple";
import { TimelineScreenProps } from "../types";
import { AntDesign } from "@expo/vector-icons";

const styles = StyleSheet.create({
  headerContainer: {
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.primary,
  },
  headerDate: {
    fontWeight: "bold",
    fontSize: 22.5,
    color: "#fff",
    padding: 10,
  },
  itemContainer: {
    backgroundColor: secondary_candidates[7],
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    overflow: "hidden",
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    alignItems: "center",
  },
  itemHeaderText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
});

const timeTableStyle = {
  container: {
    backgroundColor: Colors.primary,
    flex: 1,
  },
  time: {
    color: "#fff",
    fontSize: 15,
  },
  timeContainer: {
    backgroundColor: Colors.ternary,
    borderRadius: 5,
    padding: 5,
    zIndex: 100,
  },
  lines: {
    borderColor: Color("#fff").darken(0.8).string(),
  },

  nowLine: {
    line: {
      backgroundColor: "red",
    },
    dot: {
      backgroundColor: "red",
    },
  },
};

export default function ScheduleScreen({
  navigation,
  route,
}: TimelineScreenProps<"Schedule">) {
  const { data, selected } = useGetTimeLineQuery(route?.params?.selected);

  const items = useMemo(
    () =>
      data?.timeline.map((t) => ({
        title: t.title,
        startDate: moment(selected + "T" + t.beginTime).toDate(),
        endDate: moment(selected + "T" + t.endTime).toDate(),
        timeline: t,
      })),
    [data]
  );

  const trimTime = (t: string, range = 2) =>
    t.split(":").slice(0, range).join(":");

  const Header = () => (
    <View style={styles.headerContainer}>
      <Ripple
        style={{ padding: 5 }}
        onPress={() => navigation.canGoBack() && navigation.goBack()}
      >
        <AntDesign name="arrowleft" color={"#fff"} size={22} />
      </Ripple>

      <Text style={styles.headerDate}>{route.params.selected}</Text>
    </View>
  );

  const onItemPress = (id: string) => {
    navigation.navigate("TimelineDetails", {
      timelineId: id,
    });
  };

  return (
    <>
      <Header />

      <ScrollView>
        <TimeTable
          fromHour={0}
          date={moment(selected).toDate()}
          stickyHours
          style={timeTableStyle}
          enableSnapping
          items={items as any}
          hourHeight={80}
          renderItem={(props) => (
            <Ripple
              onPress={() => onItemPress(props.item.timeline.id)}
              key={props.key}
              style={[props.style, styles.itemContainer]}
            >
              <View style={styles.itemHeader}>
                <Text style={styles.itemHeaderText}>{props.item.title}</Text>

                <Text
                  style={{
                    color: "#fff",
                    fontSize: 14,
                  }}
                >
                  {trimTime(props.item.timeline.beginTime)} to{" "}
                  {trimTime(props.item.timeline.endTime)}
                </Text>
              </View>

              {props.style.height > 50 && (
                <Text style={{ color: "#fff" }} numberOfLines={5}>
                  {props.item.timeline.description}
                </Text>
              )}
            </Ripple>
          )}
        />
      </ScrollView>
    </>
  );
}
