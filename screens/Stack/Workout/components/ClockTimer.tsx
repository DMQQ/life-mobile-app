import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, View } from "react-native";
import Svg, { Circle, Text } from "react-native-svg";
import Colors from "../../../../constants/Colors";
import Ripple from "react-native-material-ripple";
import Button from "../../../../components/ui/Button/Button";
import { AntDesign } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ClockTimerProps {
  initialSecondsLeft: number;
  circleRadius: number;
  circleStroke: number;
  textSize?: number;
  text?: string;
  onCompleted: Function;
}

function time(remainingTime: number) {
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;

  return `${minutes < 10 ? "0" + minutes : minutes}:${
    seconds < 10 ? "0" + seconds : seconds
  }`;
}

const ClockTimer = (props: ClockTimerProps) => {
  const radius = props.circleRadius;

  const initialTime = props.initialSecondsLeft;

  const strokeWidth = props.circleStroke;

  const [timer, setTimer] = useState(initialTime);
  const [isActive, setIsActive] = useState(true);

  const circumference = 2 * Math.PI * radius;
  const progress = (timer / initialTime) * circumference;

  const animationRef = useRef<Animated.CompositeAnimation | null>();

  const animatedValue = useRef(new Animated.Value(circumference)).current;

  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isActive]);

  useEffect(() => {
    if (timer <= 0) {
      setIsActive(false);
      props.onCompleted();
    }
  }, [timer]);

  useEffect(() => {
    animationRef.current = Animated.timing(animatedValue, {
      toValue: 0,
      duration: timer * 1000, // Convert timerValue to milliseconds
      useNativeDriver: true,
      easing: Easing.linear,
    });

    animationRef.current.start();
  }, [animatedValue, progress, timer]);

  const onStopTimer = () => {
    animationRef.current?.stop();
    setIsActive((p) => !p);

    if (!isActive) animationRef.current?.start();

    if (timer === 0) {
      onReset();
    }
  };

  const isFocused = useIsFocused();

  useEffect(() => {
    if (!isFocused) onStopTimer();
  }, [isFocused]);

  const onReset = (time = props.initialSecondsLeft) => {
    setTimeout(() => setIsActive(true), 1000);
    setTimer(time);
    animatedValue.setValue(circumference);
  };

  function changeRestTime(action: "increment" | "decrement") {
    const newTime = action === "increment" ? timer + 15 : timer - 15;

    onReset(newTime);
  }

  return (
    <View>
      <Ripple
        onPress={onStopTimer}
        onLongPress={() => setShowSettings((p) => !p)}
      >
        <Svg width={radius * 2} height={radius * 2}>
          <Circle
            cx={radius}
            cy={radius}
            r={radius - strokeWidth / 2}
            fill="none"
            stroke={Colors.primary}
            strokeWidth={strokeWidth}
          />
          <AnimatedCircle
            strokeLinecap={"round"}
            cx={radius}
            cy={radius}
            r={radius - strokeWidth / 2}
            fill="none"
            stroke={Colors.secondary}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={animatedValue.interpolate({
              inputRange: [0, circumference],
              outputRange: [circumference, 0],
            })}
          />
          <Text
            fontSize={60}
            x={"50%"}
            y={"50%"}
            textAnchor="middle"
            fill={Colors.secondary}
            fontWeight={"bold"}
            letterSpacing={0.5}
          >
            {!isActive
              ? timer === 0
                ? "Time's up"
                : "Paused"
              : `${time(timer)}`}
          </Text>

          {props?.text && (
            <Text
              fontSize={18}
              x={"50%"}
              y={"60%"}
              textAnchor="middle"
              fill={"gray"}
              fontWeight={"bold"}
              letterSpacing={0.5}
            >
              {props.text}
            </Text>
          )}
        </Svg>
      </Ripple>
      {showSettings && (
        <View
          style={{
            flexDirection: "row",
            marginTop: 20,
            justifyContent: "center",
          }}
        >
          <Button
            onPress={() => changeRestTime("decrement")}
            type="contained"
            style={{
              backgroundColor: Colors.secondary,
              marginRight: 10,
            }}
          >
            <AntDesign name="arrowdown" size={24} color="black" />
          </Button>

          <Button
            onPress={() => changeRestTime("increment")}
            style={{
              backgroundColor: Colors.secondary,
            }}
          >
            <AntDesign name="arrowup" size={24} color="black" />
          </Button>
        </View>
      )}
    </View>
  );
};

export default ClockTimer;
