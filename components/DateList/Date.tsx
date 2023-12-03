import Color from "color";
import Ripple from "react-native-material-ripple";
import Colors, { secondary_candidates } from "../../constants/Colors";
import { StyleSheet, Text, View } from "react-native";
import { Date as TDate } from "./fns";
import moment from "moment";
import { memo, useMemo } from "react";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    borderRadius: 10,
    width: 75,
    justifyContent: "center",
    height: 100,
    margin: 5,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 100,
    marginRight: 2,
    borderWidth: 1,
    borderColor: "#fff",
  },
});

interface DateProps extends TDate {
  isSelected: boolean;
  onPress: Function;

  tasks: number;
}

const bg = Color(Colors.primary).lighten(0.5).hex();

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
      entering={FadeIn}
      exiting={FadeOut}
      onPress={() => props.onPress()}
      style={[styles.container, { backgroundColor: dateItemBg }]}
    >
      <Dots tasks={tasks} />
      <Text style={{ color: "#fff", fontSize: 30, fontWeight: "bold" }}>
        {props.dayNumber}
      </Text>
      <Text style={{ color: "#ffffffcb", fontSize: 16 }}>
        {props.dayName.slice(0, 3)}
      </Text>
      <Text style={{ color: "#ffffff8c", fontSize: 12 }}>
        {moment.months()[moment(props.date).month()].slice(0, 3)}
      </Text>
    </AnimatedRipple>
  );
}
