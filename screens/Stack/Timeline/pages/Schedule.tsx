import React, { useMemo } from "react";
import { FlatList, ScrollView, StyleSheet, Text, View } from "react-native";
import Color from "color";
import Colors, { secondary_candidates } from "../../../../constants/Colors";
import TimeTable from "react-native-calendar-timetable";
import moment from "moment";
import useGetTimeLineQuery from "../hooks/query/useGetTimeLineQuery";
import Ripple from "react-native-material-ripple";
import { TimelineScreenProps } from "../types";
import { AntDesign } from "@expo/vector-icons";

const styles = StyleSheet.create({});

export default function ScheduleScreen({
  navigation,
  route,
}: TimelineScreenProps<"Schedule">) {
  return <></>;
}
