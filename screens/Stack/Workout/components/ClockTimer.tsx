import React, { useEffect, useRef, useState } from "react";
import { View, Animated, Easing } from "react-native";
import Svg, { Circle, Text } from "react-native-svg";
import Colors from "../../../../constants/Colors";
import Ripple from "react-native-material-ripple";
import { interpolateColor } from "react-native-reanimated";

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
      console.log("onCompleted");
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

  const onReset = () => {
    setIsActive(true);
    setTimer(props.initialSecondsLeft);
    animatedValue.setValue(circumference);
  };

  return (
    <Ripple onPress={onStopTimer}>
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
          fontSize={25}
          x={"50%"}
          y={"50%"}
          textAnchor="middle"
          fill={Colors.secondary}
          fontWeight={"bold"}
          letterSpacing={0.5}
        >
          {time(timer)}
        </Text>

        {props?.text && (
          <Text
            fontSize={25}
            x={"50%"}
            y={"60%"}
            textAnchor="middle"
            fill={Colors.secondary}
            fontWeight={"bold"}
            letterSpacing={0.5}
          >
            {props.text}
          </Text>
        )}
      </Svg>
    </Ripple>
  );
};

export default ClockTimer;
