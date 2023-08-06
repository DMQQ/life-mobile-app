import { View, Text } from "react-native";
import { useState, useEffect, ReactNode } from "react";
import Colors from "../../../constants/Colors";
import Ripple from "react-native-material-ripple";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import Color from "color";

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

export default function TimeKeeper(props: TimeKeeperProps) {
  const [time, setTime] = useState(0); // seconds
  const [isStopped, setIsStopped] = useState(props?.pausedOnStart || false);

  useEffect(() => {
    if (
      isStopped ||
      props?.stopTimer ||
      (props?.stopTimerOnN && props?.stopTimerOnN === time)
    )
      return;

    const interval = setInterval(() => {
      setTime((t) => t + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [isStopped, props?.stopTimer]);

  return (
    <View
      style={{
        alignItems: "center",
      }}
    >
      <View style={{ justifyContent: "center" }}>
        <Text style={{ color: "#ffffff97", fontSize: 15, textAlign: "center" }}>
          {props.headLineText || "Scored time"}
        </Text>
        <Text
          style={{
            color: Colors.secondary,
            fontSize: 100,
            fontWeight: "bold",
            lineHeight: 110,
            textAlign: "center",
          }}
        >
          {parseTime(time)}
        </Text>
      </View>
      <View style={{ justifyContent: "center" }}>
        <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>
          {props.text}
        </Text>
      </View>
      {/* Controls */}
      <View style={{ flexDirection: "row", marginTop: 20 }}>
        <Ripple
          onPress={() => {
            setIsStopped((p) => !p);
            props.onStoped?.();
          }}
          style={{
            backgroundColor: isStopped
              ? Color(Colors.ternary).alpha(0.25).string()
              : Color(Colors.error).alpha(0.25).string(),
            borderRadius: 5,
            padding: 10,
          }}
        >
          <Ionicons
            name={isStopped ? "play" : "pause"}
            color={isStopped ? Colors.ternary : Colors.error}
            size={30}
          />
        </Ripple>

        <Ripple
          onPress={() => props.onCompleted?.(time)}
          style={{
            backgroundColor: Color(Colors.secondary).alpha(0.25).string(),
            borderRadius: 5,
            padding: 10,
            marginLeft: 10,
            width: "40%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: Colors.secondary, fontSize: 20 }}>
            {props?.finishButtonText || "Finish"}
          </Text>
        </Ripple>
      </View>
    </View>
  );
}
