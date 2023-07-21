import {
  CountdownCircleTimer,
  OnComplete,
  TimeProps,
} from "react-native-countdown-circle-timer";
import Button from "../../../components/ui/Button/Button";
import ScreenContainer from "../../../components/ui/ScreenContainer";
import { View, StyleSheet, Text, ToastAndroid } from "react-native";
import Colors from "../../../constants/Colors";
import Ripple from "react-native-material-ripple";
import { useState, useEffect } from "react";
import { WorkoutScreenProps } from "./types";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../../../utils/redux";
import { workoutActions } from "../../../utils/redux/workout/workout";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import ClockTimer from "./components/ClockTimer";

const styles = StyleSheet.create({
  controlsContainer: {
    flex: 1,
    padding: 5,
    paddingHorizontal: 20,
  },

  exerciseTitle: {
    fontSize: 40,
    color: "#fff",
    fontWeight: "bold",
    letterSpacing: 1,
  },
});

function time({ remainingTime }: TimeProps) {
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;

  return `${minutes < 10 ? "0" + minutes : minutes}:${
    seconds < 10 ? "0" + seconds : seconds
  }`;
}

// prettier-ignore
const NextButton = (props: { onNext: Function; hasNext: boolean,isPending:boolean }) => (
  <Ripple
  //  disabled={!props.hasNext}
    onPress={() => props.onNext()}
    style={{ paddingHorizontal: 10, marginRight: 10 }}
  >
    <Text
      style={{
        color: Colors.secondary,
        fontWeight: "bold",
        letterSpacing: 2,
      }}
    >
      {props.isPending ? 'SKIP' : "NEXT"}
    </Text>
  </Ripple>
);

export default function PendingWorkout({
  navigation,
  route,
}: WorkoutScreenProps<"PendingWorkout">) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSet, setCurrentSet] = useState(1);

  const oneRepTime = 5; //s
  const numberOfReps = 8; // number
  const numberOfSets = 4; // number
  const restTime = 60 * 2; // 2 minutes in ms
  const estimatedDurationTimeOfTheSet = Math.round(numberOfReps * oneRepTime); // s

  //const finished = currentSet > numberOfSets;
  const [finished, setFinished] = useState(false);
  const dispatch = useDispatch();
  const workout = useAppSelector((s) => s.workout);

  const hasNext = workout.activeExerciseIndex <= workout.exercises.length;

  function onNextExercise(skip = false) {
    if (
      typeof workout.exercises[workout.activeExerciseIndex + 1]?.exerciseId ===
      "undefined"
    )
      return ToastAndroid.show(
        "You reached the end of workout",
        ToastAndroid.SHORT
      );
    dispatch(workoutActions.next({ skip: skip }));
    navigation.push("PendingWorkout", {
      workoutId: route.params.workoutId,
      delayTimerStart: route.params.delayTimerStart,
      exerciseId:
        workout.exercises[workout.activeExerciseIndex + 1]?.exerciseId,
    });
  }

  const handleTogglePlay = () => setIsPlaying((p) => !p);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: `${
        workout.exercises.findIndex(
          (ex) => ex.exerciseId === route.params.exerciseId
        ) + 1
      } out of ${workout.exercises.length}`,
      headerTitleAlign: "center",
      headerRight: () => (
        <NextButton
          isPending={!finished}
          hasNext={hasNext}
          onNext={() => onNextExercise(finished)}
        />
      ),
    });
  }, [finished, workout.currentExercise]);

  useEffect(() => {
    if (currentSet > numberOfSets) setFinished(true);
  }, [currentSet]);

  useEffect(() => {
    const id = setTimeout(() => {
      setIsPlaying(true);
    }, route.params.delayTimerStart);

    return () => {
      clearTimeout(id);
    };
  }, [route.params.delayTimerStart]);

  const exercise = workout?.exercises.find(
    (ex) => ex.exerciseId === route.params.exerciseId
  );

  const buttonText =
    currentSet + 1 > numberOfSets
      ? "next exercise"
      : !isPlaying && currentSet < numberOfSets
      ? "Start next set and skip rest"
      : "Workout running";

  const handleActionButtonPress = () => {
    if (
      workout.exercises.findIndex(
        (ex) => ex.exerciseId === route.params.exerciseId
      ) +
        1 ===
        workout.exercises.length &&
      currentSet + 1 > numberOfSets
    ) {
      dispatch(workoutActions.end());
      navigation.navigate("Workout", {
        workoutId: route.params.workoutId,
      });
      return;
    }

    if (!isPlaying && currentSet < numberOfSets) return setIsPlaying(true);

    if (currentSet + 1 > numberOfSets) return onNextExercise();

    // pause
  };

  return (
    <ScreenContainer style={{ padding: 0 }}>
      <View style={styles.controlsContainer}>
        <Text style={styles.exerciseTitle}>{exercise?.title} </Text>
        <Text
          style={{
            color: "gray",
            fontSize: 15,
          }}
        >
          (next{" "}
          {workout.exercises[workout.activeExerciseIndex + 1]?.title || "end"})
        </Text>

        <Text style={{ color: "gray", fontSize: 16, marginTop: 10 }}>
          {exercise?.description} {exercise?.description}
        </Text>
      </View>

      <View
        style={{
          flex: 2,
          alignItems: "center",
          padding: 5,
          paddingHorizontal: 20,
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontSize: 25,
            fontWeight: "bold",
            width: "100%",
            textAlign: "left",
          }}
        >
          Set {currentSet} out of {numberOfSets}
        </Text>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          {isPlaying ? (
            <ClockTimer
              key={2}
              onCompleted={() => {
                setCurrentSet((set) => set + 1);

                handleTogglePlay(); // Start rest
              }}
              initialSecondsLeft={estimatedDurationTimeOfTheSet}
              circleRadius={150}
              circleStroke={150 / 8}
            />
          ) : (
            <ClockTimer
              text="rest"
              key={1}
              textSize={25}
              onCompleted={() => {}}
              initialSecondsLeft={workout.options.rest}
              circleRadius={150}
              circleStroke={150 / 8}
            />
          )}
        </View>
      </View>

      <View style={{ paddingBottom: 10, paddingHorizontal: 10 }}>
        <Button
          onPress={handleActionButtonPress}
          type="contained"
          color="ternary"
          style={{ width: "100%", padding: 18, borderRadius: 100 }}
          fontStyle={{ color: "#000", fontSize: 18 }}
        >
          {buttonText}
        </Button>
      </View>

      {/* <View style={{ flex: 1, backgroundColor: "red" }}></View> */}

      {/* Display list of tips below timer */}

      {/* Open drawer to insert set progress */}

      {/* change amount of sets */}

      {/* Change rest time */}

      {/* Rename headerTitle */}
    </ScreenContainer>
  );
}
