import { FlatList, Text } from "react-native";
import ScreenContainer from "@/components/ui/ScreenContainer";
import { useAppSelector } from "@/utils/redux";
import Colors from "@/constants/Colors";
import ExerciseTile from "@/components/Exercise/ExerciseTile/ExerciseTile";
import Button from "@/components/ui/Button/Button";
import Color from "color";
import { useMemo, memo } from "react";
import { useDispatch } from "react-redux";
import { workoutActions } from "@/utils/redux/workout/workout";
import { WorkoutScreenProps, WorkoutStackParamList } from "../types";

export default function WorkoutSummary({ navigation }: WorkoutScreenProps<"WorkoutSummary">) {
  const workout = useAppSelector((s) => s.workout);
  const dispatch = useDispatch();

  const endWorkout = () => {
    dispatch(workoutActions.endAndClear());
    navigation.navigate("Workout", { workoutId: workout.workoutId });
  };

  const handleRunSkipped = () => {
    dispatch(workoutActions.runSkipped());
    navigation.navigate("PendingWorkout", {
      exerciseId: workout.skipped_exercises[0].exerciseId,
      workoutId: workout.workoutId,
      delayTimerStart: 0,
    });
  };

  const RunSkippedButton = memo(() => (
    <Button
      onPress={() => handleRunSkipped()}
      fontStyle={{
        color: Colors.foreground,
        fontSize: 15,
      }}
      style={{
        backgroundColor: Color(Colors.secondary).alpha(0.75).string(),
      }}
    >
      run skipped exercises
    </Button>
  ));

  return (
    <ScreenContainer>
      <Text
        style={{
          fontSize: 40,
          fontWeight: "bold",
          letterSpacing: 1,
          color: Colors.secondary,
        }}
      >
        Workout Summary
      </Text>
      <Text>Total time</Text>

      <Text>Max Record</Text>
      <FlatList
        ListHeaderComponent={
          <Text
            style={{
              color: Colors.text_light,
              fontSize: 20,
              fontWeight: "bold",
              padding: 10,
            }}
          >
            Skipped exercises
          </Text>
        }
        ListFooterComponent={RunSkippedButton}
        data={workout.skipped_exercises}
        keyExtractor={(ex) => ex.exerciseId}
        renderItem={({ item, index }) => <ExerciseTile {...item} tileIndex={index} onPress={() => {}} />}
      />
      <Button borderRadius="full" variant="ternary" type="contained" size="xl" onPress={endWorkout}>
        End
      </Button>
    </ScreenContainer>
  );
}
