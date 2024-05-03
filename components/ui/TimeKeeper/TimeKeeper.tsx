import { View, Text, StyleSheet } from "react-native";
import { useState, useEffect, memo, useMemo } from "react";
import Colors from "../../../constants/Colors";
import Ripple from "react-native-material-ripple";
import { Ionicons } from "@expo/vector-icons";
import Color from "color";
import { useIsFocused } from "@react-navigation/native";

function parseTime(remainingTime: number) {
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;

  return `${minutes < 10 ? "0" + minutes : minutes}:${
    seconds < 10 ? "0" + seconds : seconds
  }`;
}

interface TimeKeeperProps {
  onCompleted?: (time: number) => void;
  onStoped?: () => void;

  stopTimer?: boolean;

  stopTimerOnN?: number;

  headLineText?: string;

  finishButtonText?: string;

  pausedOnStart?: boolean;

  text: string;
}

const styles = StyleSheet.create({
  headline: { color: "#ffffff97", fontSize: 15, textAlign: "center" },
  finish: {
    backgroundColor: Color(Colors.secondary).alpha(0.25).string(),
    borderRadius: 5,
    padding: 10,
    marginLeft: 10,
    width: "40%",
    alignItems: "center",
    justifyContent: "center",
  },
  timer: {
    color: Colors.secondary,
    fontSize: 100,
    fontWeight: "bold",
    lineHeight: 110,
    textAlign: "center",
  },
  text: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  stop: {
    borderRadius: 5,
    padding: 10,
  },
  finishText: { color: Colors.secondary, fontSize: 20 },
});

function TimeKeeper(props: TimeKeeperProps) {
  const [time, setTime] = useState(0); // seconds
  const [isStopped, setIsStopped] = useState(props?.pausedOnStart || false);

  const isFocused = useIsFocused();

  useEffect(() => {
    if (
      isStopped ||
      props?.stopTimer ||
      !isFocused ||
      (props?.stopTimerOnN && props?.stopTimerOnN === time)
    )
      return;

    const interval = setInterval(() => {
      setTime((t) => t + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [isStopped, props?.stopTimer, isFocused]);

  const backgroundColor = useMemo(
    () =>
      isStopped
        ? Color(Colors.ternary).alpha(0.25).string()
        : Color(Colors.error).alpha(0.25).string(),
    [isStopped]
  );

  function onStopPress() {
    setIsStopped((p) => !p);
    props.onStoped?.();
  }

  function onCompleted() {
    props.onCompleted?.(time);
  }

  return (
    <View
      style={{
        alignItems: "center",
      }}
    >
      <View style={{ justifyContent: "center" }}>
        <Text style={styles.headline}>
          {props.headLineText || "Scored time"}
        </Text>
        <Text style={styles.timer}>{parseTime(time)}</Text>
      </View>
      <View style={{ justifyContent: "center" }}>
        <Text style={styles.text}>{props.text}</Text>
      </View>
      {/* Controls */}
      <View style={{ flexDirection: "row", marginTop: 20 }}>
        <Ripple
          onPress={onStopPress}
          style={[styles.stop, { backgroundColor }]}
        >
          <Ionicons
            name={isStopped ? "play" : "pause"}
            color={isStopped ? Colors.ternary : Colors.error}
            size={30}
          />
        </Ripple>

        <Ripple onPress={onCompleted} style={styles.finish}>
          <Text style={styles.finishText}>
            {props?.finishButtonText || "Finish"}
          </Text>
        </Ripple>
      </View>
    </View>
  );
}

export default memo(TimeKeeper);
