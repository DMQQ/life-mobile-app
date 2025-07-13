import React, { useState, useEffect, useMemo, ReactNode } from "react";
import { View, StyleSheet, Text, ScrollView } from "react-native";
import TimeTable from "react-native-calendar-timetable";
import Colors, { secondary_candidates } from "@/constants/Colors";
import moment, { max } from "moment";
import Ripple from "react-native-material-ripple";
import Color from "color";
import DayTimelineItem from "./DayTimelineItem";
import Layout from "@/constants/Layout";
import Animated from "react-native-reanimated";

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  beginTime: string;
  endTime: string;
  date: string;
  isCompleted: boolean;
}

interface CustomTimelineProps {
  events: TimelineEvent[];
  date: string;
  theme: any;
  onEventPress?: (event: TimelineEvent) => void;

  selected: string;

  onScroll: (event: any) => void;
}

const CalendarTimetable = ({ events, selected, onScroll }: CustomTimelineProps) => {
  const items = useMemo(
    () =>
      events.map((t, index) => ({
        title: t.title,
        startDate: moment(selected + "T" + t.beginTime)
          .add(1, "minute")
          .startOf("minute")
          .toDate(),
        endDate: moment(selected + "T" + t.endTime)
          .startOf("minute")
          .subtract(1, "minute")
          .toDate(),
        timeline: t,
        id: index,
      })),
    [events]
  );

  const trimTime = (t: string, range = 2) => t.split(":").slice(0, range).join(":");

  const minHour = Math.min(...(events.map((v) => +trimTime(v.beginTime, 1)) || []));

  const maxHour = Math.max(...(events.map((v) => +trimTime(v.endTime, 1)) || []));

  return (
    <Animated.ScrollView
      keyboardDismissMode={"on-drag"}
      style={{ flex: 1, paddingBottom: 100 }}
      onScroll={onScroll}
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
    >
      <TimeTable
        fromHour={minHour > 0 ? minHour : minHour}
        toHour={maxHour < 23 ? maxHour + 1 : maxHour}
        date={moment(selected).toDate()}
        stickyHours
        style={{
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
        }}
        enableSnapping
        items={items as any}
        hourHeight={150}
        renderItem={(props) => {
          const backgroundColor = secondary_candidates[props.item.id % secondary_candidates.length];

          const textColor = "#fff";

          return (
            <View
              key={props.key}
              style={[
                props.style,
                {
                  backgroundColor: backgroundColor,
                  borderRadius: 5,
                  overflow: "hidden",
                },
                props.item.timeline.isCompleted && {
                  opacity: 0.5,
                },
              ]}
            >
              <DayTimelineItem
                {...props.item.timeline}
                textColor={textColor}
                styles={{
                  padding: 5,
                  paddingHorizontal: 10,
                  flex: 1,
                  alignItems: "flex-start",
                }}
                isSmall={props.style.height < 100}
              />
            </View>
          );
        }}
      />
    </Animated.ScrollView>
  );
};

export default CalendarTimetable;
