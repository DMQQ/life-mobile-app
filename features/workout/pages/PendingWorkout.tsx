import Button from "@/components/ui/Button/Button";
import ScreenContainer from "@/components/ui/ScreenContainer";
import { View, StyleSheet, Text, Image, Vibration } from "react-native";
import Colors from "@/constants/Colors";
import Ripple from "react-native-material-ripple";
import { useState, useEffect, useMemo, memo } from "react";
import { WorkoutScreenProps } from "../types";
import { useDispatch } from "react-redux";
import { useAppSelector } from "@/utils/redux";
import { workoutActions } from "@/utils/redux/workout/workout";
import ClockTimer from "../components/ClockTimer";
import Color from "color";
import TimeKeeper from "@/components/ui/TimeKeeper/TimeKeeper";
import { AntDesign } from "@expo/vector-icons";
import ExerciseProgressSheet from "../components/ExerciseProgressSheet";
import { Exercise } from "@/types";
import Animated, { FadeInDown } from "react-native-reanimated";
import usePlay from "../hooks/usePlay";
import useGetExerciseProgressQuery from "../hooks/useGetExerciseProgressQuery";

const styles = StyleSheet.create({
  controlsContainer: {
    flex: 1,
    padding: 5,
    paddingHorizontal: 20,
  },

  exerciseTitle: {
    fontSize: 40,
    color: Colors.foreground,
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

  tabButton: {
    flex: 1,
    padding: 18,
    borderRadius: 100,
    marginRight: 10,
  },
});

interface NextButtonProps {
  onNext: Function;
  hasNext: boolean;
  isPending: boolean;
}

const NextButton = (props: NextButtonProps) => (
  <Ripple onPress={() => props.onNext()}>
    <Text style={styles.nextButtonText}>{props.isPending ? "SKIP" : "NEXT"}</Text>
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

const Header = (props: { nextButtonProps: NextButtonProps; text: string; navigation: any }) => (
  <View
    style={{
      height: 50,
      flexDirection: "row",
      justifyContent: "space-between",
      padding: 10,
      alignItems: "center",
      paddingHorizontal: 15,
    }}
  >
    <Ripple style={{ padding: 5 }} onPress={() => props.navigation.goBack()}>
      <AntDesign name="arrowleft" color={Colors.text_light} size={22} />
    </Ripple>

    <Text
      style={{
        color: Colors.text_light,
        fontSize: 18,
        fontWeight: "bold",
        flex: 1,
        textAlign: "center",
      }}
    >
      {props.text}
    </Text>

    <NextButton {...props.nextButtonProps} />
  </View>
);

function PendingWorkout({ navigation, route }: WorkoutScreenProps<"PendingWorkout">) {
  const { isPlaying, play, toggle } = usePlay(route.params.delayTimerStart);
  const [currentSet, setCurrentSet] = useState(1);
  const dispatch = useDispatch();
  const workout = useAppSelector((s) => s.workout);
  const hasNext = workout.activeExerciseIndex <= workout.exercises.length;
  const exercise = useMemo(
    () => workout.exercises.find((ex) => ex.exerciseId === route.params.exerciseId),
    [route.params.exerciseId, workout.exercises]
  );
  const nextExercise = workout.exercises?.[workout.activeExerciseIndex + 1];

  const progress = useGetExerciseProgressQuery(route.params.exerciseId);

  const { sets: numberOfSets, reps: numberOfReps } = progress?.[0] || {
    sets: 4,
    reps: 8,
  };

  const isFinished = currentSet > numberOfSets;

  function onNextExercise(skip = false) {
    dispatch(workoutActions.next({ skip: skip }));
    if (typeof nextExercise === "undefined")
      return navigation.navigate("WorkoutSummary", {
        workoutId: route.params.workoutId,
      });

    navigation.push("PendingWorkout", {
      workoutId: route.params.workoutId,
      delayTimerStart: route.params.delayTimerStart,
      exerciseId: nextExercise.exerciseId,
    });
  }

  const buttonText = currentSet > numberOfSets ? "Next Exercise" : !isPlaying ? "Skip rest" : "Workout running";

  const handleActionButtonPress = () => {
    Vibration.cancel();
    if (currentSet > numberOfSets && typeof nextExercise === "undefined") {
      dispatch(workoutActions.end());
      navigation.navigate("WorkoutSummary", {
        workoutId: route.params.workoutId,
      });
      return;
    }
    if (!isPlaying && currentSet <= numberOfSets) return play();

    if (currentSet > numberOfSets && hasNext) return onNextExercise();
  };

  const onTimerCompleted = (time: number) => {
    setCurrentSet((set) => set + 1);
    dispatch(workoutActions.saveSetTime(time));
    toggle();
  };

  const [ex, setEx] = useState<Exercise | undefined>(undefined); // shit workaround, TO DO: forwardRef?? or leave it as it is

  const currentExerciseIndex = workout.exercises.findIndex((ex) => ex.exerciseId === route.params.exerciseId);

  const nextButtonProps = {
    isPending: !isFinished,
    hasNext: hasNext,
    onNext: () => onNextExercise(!isFinished),
  };

  return (
    <ScreenContainer style={{ padding: 0 }}>
      <Header
        navigation={navigation}
        text={`${currentExerciseIndex + 1} out of ${workout.exercises.length}`}
        nextButtonProps={nextButtonProps}
      />
      <WorkoutOverview exercise={exercise} nextExercise={nextExercise} />

      <Timers
        currentSet={currentSet}
        isPlaying={isPlaying}
        numberOfReps={numberOfReps}
        numberOfSets={numberOfSets}
        onTimerCompleted={onTimerCompleted}
        restTime={workout.options.rest}
      />

      <ActionTab onAddButtonPress={() => setEx(exercise)} onMainButtonPress={handleActionButtonPress} text={buttonText} />

      <ExerciseProgressSheet selectedExercise={ex} onClearSelectedExercise={() => setEx(undefined)} workoutId={workout.workoutId} />
    </ScreenContainer>
  );
}

interface TimersProps {
  currentSet: number;
  numberOfSets: number;
  numberOfReps: number;
  isPlaying: boolean;
  onTimerCompleted: (time: number) => void;
  restTime: number;
}

const Timers = memo((props: TimersProps) => (
  <View style={{ flex: 2 }}>
    {props.isPlaying ? (
      <TimeKeeper
        text={`${props.numberOfReps}x reps`}
        pausedOnStart={false}
        headLineText={`Set ${props.currentSet} out of ${props.numberOfSets}`}
        onCompleted={props.onTimerCompleted}
      />
    ) : (
      <View style={{ alignItems: "center" }}>
        <ClockTimer
          text="tap to pause"
          textSize={25}
          onCompleted={() => {
            Vibration.vibrate([100, 400, 100, 400], true);
          }}
          initialSecondsLeft={props.restTime}
          circleRadius={150}
          circleStroke={150 / 6}
        />
      </View>
    )}
  </View>
));

const WorkoutOverview = memo((props: Partial<{ exercise: Exercise; nextExercise: Exercise }>) => (
  <View style={styles.controlsContainer}>
    <Animated.Text entering={FadeInDown.delay(50)} style={styles.exerciseTitle}>
      {props.exercise?.title}
    </Animated.Text>

    <Animated.View entering={FadeInDown.delay(100)} style={{ flexDirection: "row", alignItems: "center" }}>
      <NextExercise title={props.nextExercise?.title} />
      <Animated.Text entering={FadeInDown.delay(125)} style={{ marginHorizontal: 10, color: Colors.text_dark }}>
        is next exercise
      </Animated.Text>
    </Animated.View>

    <Animated.Text entering={FadeInDown.delay(150)} style={{ color: "gray", fontSize: 16, marginTop: 10 }}>
      {props.exercise?.description} {props.exercise?.description}
    </Animated.Text>
  </View>
));

const ActionTab = (props: { onMainButtonPress: Function; text: string; onAddButtonPress: Function }) => (
  <View style={styles.buttonsContainer}>
    {props.text !== "Workout running" && (
      <Button
        onPress={() => props.onMainButtonPress()}
        type="contained"
        color="ternary"
        style={styles.tabButton}
        fontStyle={{ color: Colors.foreground, fontSize: 17, letterSpacing: 0.5 }}
      >
        {props.text}
      </Button>
    )}

    <Ripple onPress={() => props.onAddButtonPress()} style={styles.addIcon}>
      <AntDesign name="plus" color={Colors.foreground} size={30} />
    </Ripple>
  </View>
);

export default memo(PendingWorkout);
