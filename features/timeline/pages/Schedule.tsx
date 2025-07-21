import React, { useMemo } from "react";
import { ScrollView, View } from "react-native";
import Text from "@/components/ui/Text/Text";
import Color from "color";
import Colors, { secondary_candidates } from "@/constants/Colors";
import TimeTable from "react-native-calendar-timetable";
import moment from "moment";
import useGetTimeLineQuery from "../hooks/query/useGetTimeLineQuery";
import Ripple from "react-native-material-ripple";
import { TimelineScreenProps } from "../types";
import { AntDesign } from "@expo/vector-icons";

export default function ScheduleScreen({ navigation, route }: TimelineScreenProps<"Schedule">) {
  const { data, selected } = useGetTimeLineQuery(route?.params?.selectedDate);

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

  const trimTime = (t: string, range = 2) => t.split(":").slice(0, range).join(":");

  const randColor = () => secondary_candidates[Math.trunc(Math.random() * secondary_candidates.length)];

  const minHour = Math.min(...(data?.timeline.map((v) => +trimTime(v.beginTime, 1)) || []));

  return (
    <>
      <ScrollView style={{ flex: 1 }} keyboardDismissMode={"on-drag"}>
        <TimeTable
          fromHour={0}
          date={moment(selected).toDate()}
          stickyHours
          style={{
            container: {
              backgroundColor: Colors.primary,
              flex: 1,
            },
            time: {
              color: Colors.foreground,
              fontSize: 15,
            },
            timeContainer: {
              backgroundColor: Colors.ternary,
              borderRadius: 5,
              padding: 5,
              zIndex: 100,
            },
            lines: {
              borderColor: Color(Colors.foreground).darken(0.8).string(),
            },

            nowLine: {
              line: {
                backgroundColor: "red",
              },
              dot: {
                backgroundColor: "red",
              },
            },
          }}
          enableSnapping
          items={items as any}
          hourHeight={80}
          renderItem={(props) => (
            <Ripple
              onPress={() => {
                navigation.navigate("TimelineDetails", {
                  timelineId: props.item.timeline.id,
                });
              }}
              key={props.key}
              style={[
                props.style,
                {
                  backgroundColor: randColor(),
                  borderRadius: 5,
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  overflow: "hidden",
                  minHeight: 50,
                },
              ]}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <Text
                  variant="body"
                  style={{
                    color: Colors.foreground,
                    fontWeight: "bold",
                    letterSpacing: 0.5,
                  }}
                >
                  {props.item.title}
                </Text>

                <Text
                  variant="caption"
                  style={{
                    color: Colors.foreground,
                  }}
                >
                  {trimTime(props.item.timeline.beginTime)} to {trimTime(props.item.timeline.endTime)}
                </Text>
              </View>
            </Ripple>
          )}
        />
      </ScrollView>
    </>
  );
}
