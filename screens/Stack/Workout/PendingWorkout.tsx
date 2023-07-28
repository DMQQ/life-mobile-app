import Button from "../../../components/ui/Button/Button";
import ScreenContainer from "../../../components/ui/ScreenContainer";
import { View, StyleSheet, Text, ToastAndroid, Image } from "react-native";
import Colors from "../../../constants/Colors";
import Ripple from "react-native-material-ripple";
import { useState, useEffect } from "react";
import { WorkoutScreenProps } from "./types";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../../../utils/redux";
import { workoutActions } from "../../../utils/redux/workout/workout";
import ClockTimer from "./components/ClockTimer";
import Color from "color";
import TimeKeeper from "../../../components/ui/TimeKeeper/TimeKeeper";

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
    marginBottom: 5,
  },

  nextButtonText: {
    color: Colors.secondary,
    fontWeight: "bold",
    letterSpacing: 2,
  },

  nextExerciseContainer: {
    padding: 5,
    paddingHorizontal: 10,
    flexDirection: "row",
    backgroundColor: Color(Colors.primary).lighten(0.8).string(),
    alignItems: "center",
    borderRadius: 10,
  },
});

// prettier-ignore
const NextButton = (props: { onNext: Function; hasNext: boolean,isPending:boolean }) => (
  <Ripple
    onPress={() => props.onNext()}
    style={{ paddingHorizontal: 10, marginRight: 10 }}
  >
    <Text
      style={styles.nextButtonText}
    >
      {props.isPending ? 'SKIP' : "NEXT"}
    </Text>
  </Ripple>
);

const NextExercise = () => (
  <View style={styles.nextExerciseContainer}>
    <Image
      style={{ width: 25, height: 15, marginRight: 5, borderRadius: 5 }}
      source={{
        uri: "https://cdn.w600.comps.canstockphoto.com/men-training-on-the-bench-press-icon-vector-clip-art_csp45589515.jpg",
      }}
    />
    <Text style={{ color: Colors.text_dark }}>Bench Press</Text>
  </View>
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
  };

  return (
    <ScreenContainer style={{ padding: 0 }}>
      <View style={styles.controlsContainer}>
        <Text style={styles.exerciseTitle}>{exercise?.title} </Text>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <NextExercise />
          <Text style={{ marginHorizontal: 10, color: Colors.text_dark }}>
            is next exercise
          </Text>
        </View>

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
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <TimeKeeper
                onCompleted={() => {
                  setCurrentSet((set) => set + 1);

                  handleTogglePlay(); // Start rest
                }}
              />
            </View>
          ) : (
            <ClockTimer
              text="rest"
              key={1}
              textSize={25}
              onCompleted={() => {}}
              initialSecondsLeft={workout.options.rest}
              circleRadius={150}
              circleStroke={150 / 6}
            />
          )}
        </View>
      </View>

      <View style={{ paddingBottom: 10, paddingHorizontal: 10 }}>
        {buttonText !== "Workout running" && (
          <Button
            onPress={handleActionButtonPress}
            type="contained"
            color="ternary"
            style={{ width: "100%", padding: 18, borderRadius: 100 }}
            fontStyle={{ color: "#000", fontSize: 18 }}
          >
            {buttonText}
          </Button>
        )}
      </View>
    </ScreenContainer>
  );
}
