import React, { ReactNode, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import DayTimelineItem from "./DayTimelineItem";
import Colors, { secondary_candidates } from "@/constants/Colors";
import moment from "moment";

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
  children: ReactNode;
}

const timeToHours = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours + minutes / 60;
};

const CustomTimeline: React.FC<CustomTimelineProps> = ({ events, date, theme, onEventPress, children }) => {
  const eventsForDay = events.filter((event) => event.date === date);

  const timeRange = useMemo(() => {
    if (eventsForDay.length === 0) {
      return [8, 16];
    }

    let allTimes: number[] = [];

    eventsForDay.forEach((event) => {
      allTimes.push(timeToHours(event.beginTime));
      allTimes.push(timeToHours(event.endTime));
    });

    const earliest = Math.floor(Math.min(...allTimes));
    const latest = Math.ceil(Math.max(...allTimes));

    return [Math.max(0, earliest - 1), Math.min(24, latest + 1)];
  }, [eventsForDay]);

  const [startHour, endHour] = timeRange;
  const hoursInDay = endHour - startHour;

  const timeLabels = useMemo(() => {
    const labels = [];
    for (let hour = startHour; hour <= endHour; hour++) {
      labels.push(`${hour.toString().padStart(2, "0")}:00`);
    }
    return labels;
  }, [startHour, endHour]);

  return (
    <View style={[styles.container, { backgroundColor: theme.primary_dark }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {children}
        <View style={styles.scrollContainer}>
          <View style={styles.timeColumn}>
            {timeLabels.map((label, index) => (
              <Text key={index} style={[styles.timeLabel, { color: "rgba(255,255,255,0.8)" }]}>
                {label}
              </Text>
            ))}
          </View>

          <View style={styles.eventsContainer}>
            <View style={styles.gridContainer}>
              {timeLabels.map((_, index) => (
                <View key={index} style={[styles.gridLine, { borderColor: Colors.secondary_light_2 }]} />
              ))}
            </View>

            <View style={styles.eventsContent}>
              {eventsForDay.map((event, index) => {
                const eventStart = timeToHours(event.beginTime);
                const eventEnd = timeToHours(event.endTime);

                const relativeStart = eventStart - startHour;
                const eventDuration = eventEnd - eventStart;

                const top = (relativeStart / hoursInDay) * 100;
                const height = (eventDuration / hoursInDay) * 100;

                const minHeight = 5;
                const adjustedHeight = Math.max(height, minHeight);

                const overlappingEvents = eventsForDay.filter((e) => {
                  const eStart = timeToHours(e.beginTime);
                  const eEnd = timeToHours(e.endTime);

                  return eStart < eventEnd && eEnd > eventStart && e.id !== event.id;
                });

                const isOverlapping = overlappingEvents.length > 0;

                const eventWidth = isOverlapping ? 46 : 95;
                const eventLeft = isOverlapping && index % 2 === 1 ? 52 : 2.5;

                return (
                  <TouchableOpacity
                    key={event.id}
                    style={[
                      styles.eventItem,
                      {
                        top: `${top}%`,
                        height: `${adjustedHeight}%`,
                        width: `${eventWidth}%`,
                        left: `${eventLeft}%`,
                      },
                    ]}
                    onPress={() => onEventPress && onEventPress(event)}
                  >
                    <DayTimelineItem
                      {...event}
                      textColor="#fff"
                      location="timeline"
                      styles={{
                        backgroundColor: secondary_candidates[index % secondary_candidates.length],
                        padding: 10,
                        borderRadius: 10,
                        height: "100%",
                      }}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexDirection: "row",
  },
  timeColumn: {
    width: 50,
    paddingTop: 10,
    alignItems: "center",
  },
  timeLabel: {
    height: 90, // Increased from 60 to 90
    fontWeight: "500",
  },
  eventsContainer: {
    flex: 1,
    position: "relative",
  },
  gridContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLine: {
    height: 90, // Increased from 60 to 90
    borderBottomWidth: 1,
    opacity: 0.3,
  },
  eventsContent: {
    flex: 1,
    position: "relative",
    minHeight: 500,
  },
  eventItem: {
    position: "absolute",
    right: 10,
  },
});

export default CustomTimeline;
