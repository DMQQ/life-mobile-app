import Button from "../../../components/ui/Button/Button";
import ScreenContainer from "../../../components/ui/ScreenContainer";
import {
  View,
  StyleSheet,
  Text,
  ToastAndroid,
  Image,
  Vibration,
} from "react-native";
import Colors from "../../../constants/Colors";
import Ripple from "react-native-material-ripple";
import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { WorkoutScreenProps } from "./types";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../../../utils/redux";
import { workoutActions } from "../../../utils/redux/workout/workout";
import ClockTimer from "./components/ClockTimer";
import Color from "color";
import TimeKeeper from "../../../components/ui/TimeKeeper/TimeKeeper";
import { AntDesign } from "@expo/vector-icons";
import ExerciseProgressSheet from "./components/ExerciseProgressSheet";
import { Exercise } from "../../../types";
import { useIsFocused } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";
import usePlay from "./hooks/usePlay";
import useGetExerciseProgressQuery from "./hooks/useGetExerciseProgressQuery";

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

  addIcon: {
    backgroundColor: Colors.secondary,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 100,
    width: 60,
    height: 60,
    flexDirection: "row",
  },

  buttonsContainer: {
    paddingBottom: 10,
    paddingHorizontal: 10,
    flexDirection: "row",
    justifyContent: "flex-end",
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

const NextExercise = (props: { title?: string }) => (
  <View style={styles.nextExerciseContainer}>
    <Image
      style={{ width: 25, height: 15, marginRight: 5, borderRadius: 5 }}
      source={{
        uri: "https://cdn.w600.comps.canstockphoto.com/men-training-on-the-bench-press-icon-vector-clip-art_csp45589515.jpg",
      }}
    />
    <Text style={{ color: Colors.text_dark }}>{props.title}</Text>
  </View>
);

function PendingWorkout({
  navigation,
  route,
}: WorkoutScreenProps<"PendingWorkout">) {
  const { isPlaying, play, toggle } = usePlay(route.params.delayTimerStart);
  const [currentSet, setCurrentSet] = useState(1);
  // const numberOfSets = 4; // number of sets after which exercise is not marked as skipped
  // const numberOfReps = 12;
  const [finished, setFinished] = useState(false); // set to true if current set is greater than min-amount of sets
  const dispatch = useDispatch();
  const workout = useAppSelector((s) => s.workout);

  const hasNext = workout.activeExerciseIndex <= workout.exercises.length;

  // const exercise = workout.exercises[workout.activeExerciseIndex]; displays current exercise from redux when you go back (screen) via system gesture
  const exercise = useMemo(
    () =>
      workout.exercises.find((ex) => ex.exerciseId === route.params.exerciseId),
    [route.params.exerciseId, workout.exercises]
  );
  const nextExercise = workout.exercises?.[workout.activeExerciseIndex + 1] as
    | Exercise
    | undefined;

  const { data } = useGetExerciseProgressQuery(route.params.exerciseId);

  const { sets: numberOfSets, reps: numberOfReps } = data
    ?.exerciseProgress?.[0] || {
    sets: 4,
    reps: 8,
  };

  function onNextExercise(skip = false) {
    if (typeof nextExercise === "undefined")
      return ToastAndroid.show(
        "You reached the end of workout",
        ToastAndroid.SHORT
      ); // replace toast notification with WorkoutSummary screen (SOOON)

    dispatch(workoutActions.next({ skip: skip }));
    navigation.push("PendingWorkout", {
      workoutId: route.params.workoutId,
      delayTimerStart: route.params.delayTimerStart,
      exerciseId: nextExercise.exerciseId,
    });
  }

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
          onNext={() => onNextExercise(!finished)}
        />
      ),
    });
  }, [finished, workout.currentExercise]);

  useEffect(() => {
    if (currentSet > numberOfSets) setFinished(true);
  }, [currentSet]);

  const buttonText =
    currentSet > numberOfSets
      ? "Next Exercise"
      : !isPlaying
      ? "Skip rest"
      : "Workout running";

  const handleActionButtonPress = () => {
    Vibration.cancel();
    if (currentSet > numberOfSets && typeof nextExercise === "undefined") {
      // dispatch(workoutActions.end());
      navigation.navigate("WorkoutSummary", {
        workoutId: route.params.workoutId,
      });
      return;
    }
    if (!isPlaying && currentSet <= numberOfSets) return play();

    if (currentSet > numberOfSets && hasNext) return onNextExercise();
  };

  const onTimerCompleted = () => {
    setCurrentSet((set) => set + 1);

    toggle();
  };

  const [ex, setEx] = useState<Exercise | undefined>(undefined); // shit workaround, TO DO: forwardRef?? or leave it as it is

  const isFocused = useIsFocused(); // stops timer when screen changes

  return (
    <ScreenContainer style={{ padding: 0 }}>
      <View style={styles.controlsContainer}>
        <Animated.Text
          entering={FadeInDown.delay(50)}
          style={styles.exerciseTitle}
        >
          {exercise?.title}
        </Animated.Text>

        <Animated.View
          entering={FadeInDown.delay(100)}
          style={{ flexDirection: "row", alignItems: "center" }}
        >
          <NextExercise title={nextExercise?.title} />
          <Animated.Text
            entering={FadeInDown.delay(125)}
            style={{ marginHorizontal: 10, color: Colors.text_dark }}
          >
            is next exercise
          </Animated.Text>
        </Animated.View>

        <Animated.Text
          entering={FadeInDown.delay(150)}
          style={{ color: "gray", fontSize: 16, marginTop: 10 }}
        >
          {exercise?.description} {exercise?.description}
        </Animated.Text>
      </View>

      <Animated.View
        entering={FadeInDown.delay(170)}
        style={{
          flex: 2,
        }}
      >
        <View style={{ flex: 2 }}>
          {isPlaying ? (
            <TimeKeeper
              text={`${numberOfReps}x reps`}
              stopTimer={!isFocused}
              pausedOnStart={false}
              headLineText={`Set ${currentSet} out of ${numberOfSets}`}
              onCompleted={onTimerCompleted}
            />
          ) : (
            <View style={{ alignItems: "center" }}>
              <ClockTimer
                text="tap to pause"
                key={1}
                textSize={25}
                onCompleted={() => {
                  Vibration.vibrate([100, 400, 100, 400], true);
                  // setTimeout(Vibration.cancel, 4000);
                }}
                initialSecondsLeft={workout.options.rest}
                circleRadius={150}
                circleStroke={150 / 6}
              />
            </View>
          )}
        </View>
      </Animated.View>

      {/* Transform it into separate component */}
      <View style={styles.buttonsContainer}>
        {buttonText !== "Workout running" && (
          <Button
            onPress={handleActionButtonPress}
            type="contained"
            color="ternary"
            style={{
              flex: 1,
              padding: 18,
              borderRadius: 100,
              marginRight: 10,
            }}
            fontStyle={{ color: "#000", fontSize: 18 }}
          >
            {buttonText}
          </Button>
        )}

        <Ripple onPress={() => setEx(exercise)} style={styles.addIcon}>
          <AntDesign name="plus" color={"#fff"} size={30} />
        </Ripple>
      </View>

      <ExerciseProgressSheet
        selectedExercise={ex}
        onClearSelectedExercise={() => setEx(undefined)}
        workoutId={workout.workoutId}
      />
    </ScreenContainer>
  );
}

export default memo(PendingWorkout);
