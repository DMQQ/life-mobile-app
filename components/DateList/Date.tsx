import Color from "color";
import Ripple from "react-native-material-ripple";
import Colors, { secondary_candidates } from "../../constants/Colors";
import { StyleSheet, Text, View } from "react-native";
import { Date as TDate } from "./fns";
import moment from "moment";
import { memo, useMemo } from "react";
import Animated, { FadeIn } from "react-native-reanimated";
import { Rounded } from "@/constants/Values";
import { Padding } from "@/constants/Layout";

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    borderRadius: Rounded.m,
    width: 75,
    justifyContent: "center",
    height: 100,
    margin: Padding.xs,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: Rounded.full,
    marginRight: 1,
    borderWidth: 0.5,
    borderColor: Colors.primary,
  },
});

interface DateProps extends TDate {
  isSelected: boolean;

  onPress: Function;

  tasks: number;

  onLongPress: Function;
}

const bg = Colors.primary_lighter;

const AnimatedRipple = Animated.createAnimatedComponent(Ripple);

const Dots = memo((props: { tasks: number[] }) =>
  props.tasks.length > 0 ? (
    <View style={{ flexDirection: "row", position: "absolute", top: -3 }}>
      {props.tasks.map((_, i) => (
        <Animated.View
          entering={FadeIn}
          key={i}
          style={[
            styles.indicator,
            { backgroundColor: secondary_candidates[i] },
          ]}
        />
      ))}
    </View>
  ) : null
);

export default function Date(props: DateProps) {
  const tasks = useMemo(
    () => Array.from(new Array(props?.tasks > 4 ? 4 : props.tasks).keys()),
    [props?.tasks]
  );

  const dateItemBg = props.isSelected
    ? Colors.secondary
    : props.date === moment().format("YYYY-MM-DD")
    ? Color(bg).lighten(0.5).hex()
    : bg;

  return (
    <AnimatedRipple
      delayLongPress={500}
      onLongPress={() => props.onLongPress()}
      onPress={() => props.onPress()}
      style={[styles.container, { backgroundColor: dateItemBg }]}
    >
      <Dots tasks={tasks} />
      <Text style={{ color: "#fff", fontSize: 32, fontWeight: "bold" }}>
        {props.dayNumber}
      </Text>
      <Text style={{ color: "#ffffffcb", fontSize: 17 }}>
        {props.dayName.slice(0, 3)}
      </Text>
      <Text style={{ color: "#ffffff8c", fontSize: 11 }}>
        {moment.months()[moment(props.date).month()].slice(0, 3)}
      </Text>
    </AnimatedRipple>
  );
}
