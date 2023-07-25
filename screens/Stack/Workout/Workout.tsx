import { useEffect, useState, useRef, forwardRef } from "react";
import ScreenContainer from "../../../components/ui/ScreenContainer";
import ExerciseList from "../../../components/Exercise/ExerciseList/ExerciseList";
import { View, Text, ScrollView } from "react-native";
import Button from "../../../components/ui/Button/Button";
import { WorkoutScreenProps } from "./types";
import ExerciseProgressSheet from "./components/ExerciseProgressSheet";
import { Exercise } from "../../../types";
import { useDispatch } from "react-redux";
import { workoutActions } from "../../../utils/redux/workout/workout";
import Color from "color";
import Colors from "../../../constants/Colors";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  TouchableOpacity,
} from "@gorhom/bottom-sheet";
import { useGetAllExercises } from "./components/ExerciseList";
import useAddExerciseToWorkout from "./hooks/useAddExerciseToWorkout";
import Animated, { FadeInDown } from "react-native-reanimated";
import useGetWorkoutQuery from "./hooks/useGetWorkoutQuery";
import { useAppSelector } from "../../../utils/redux";

export default function Workout({
  navigation,
  route,
}: WorkoutScreenProps<"Workout">) {
  const { data } = useGetWorkoutQuery(route.params.workoutId);
  const dispatch = useDispatch();

  const [selectedExercise, setSelectedExercise] = useState<
    Exercise | undefined
  >(undefined);

  const sheetRef = useRef<BottomSheet | null>(null);
  const exercises = (data?.workout?.exercises || []) as Exercise[];

  const workout = useAppSelector((s) => s.workout);

  const canContinueWithOldExercise =
    workout.isWorkoutPending && workout.workoutId === data?.workout?.workoutId;

  const onStartWorkout = () => {
    if (exercises.length === 0) return;
    dispatch(
      workoutActions.start({
        exercises: exercises,
        workoutId: route.params.workoutId,
        title: data?.workout?.title,
        description: data?.workout?.description,
      })
    );

    navigation.navigate("PendingWorkout", {
      workoutId: route.params.workoutId,
      delayTimerStart: 1000,
      exerciseId: canContinueWithOldExercise
        ? workout.exercises[workout.activeExerciseIndex].exerciseId
        : exercises[0].exerciseId,
    });
  };

  useEffect(() => {
    navigation.setOptions({
      headerTitle: data?.workout?.title,
      headerTitleAlign: "center",
    });
  }, [data?.workout]);

  const estimatedDurationTime = () => {
    let seconds = 0;

    for (const exercise of (data?.workout?.exercises || []) as Exercise[]) {
      seconds += (exercise?.sets || 4) * 40;
      seconds += (exercise?.sets || 4) * 60 * 2; // rest time in secs
    }

    return Math.floor(seconds / 60).toString();
  };

  return (
    <ScreenContainer>
      <ExerciseList
        onExerciseTilePress={(exercise) => setSelectedExercise(exercise)}
        exercises={data?.workout.exercises}
        ListHeaderComponent={
          <View
            style={{
              backgroundColor: Color(Colors.primary).lighten(0.5).hex(),
              marginBottom: 10,
              padding: 10,
              borderRadius: 10,
            }}
          >
            <Text
              style={{
                color: Colors.text_light,
                fontSize: 25,
                fontWeight: "bold",
              }}
            >
              Workout name
            </Text>

            <Text style={{ color: Colors.text_dark }}>
              <Text style={{ fontWeight: "bold", fontSize: 17 }}>600</Text>{" "}
              people used this workout
            </Text>
            <Text style={{ color: Colors.text_dark }}>
              Estimated duration of {estimatedDurationTime()}
              min with 2min rest
            </Text>

            <Text style={{ color: Colors.text_dark }}>
              Workout made by Papi, more Papi's workouts
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginTop: 10 }}
            >
              {[0, 1, 2].map((id) => (
                <View
                  style={{
                    backgroundColor: Colors.primary_light,
                    width: 120,
                    height: 60,
                    borderRadius: 10,
                    marginRight: 10,
                  }}
                  key={id}
                />
              ))}
            </ScrollView>
          </View>
        }
        ListFooterComponent={
          <Animated.View
            entering={FadeInDown.delay(data?.workout?.exercises.length * 75)}
          >
            <AppendExercise onPress={() => sheetRef.current?.expand()} />
          </Animated.View>
        }
      />

      <Button
        type="contained"
        color="ternary"
        fontStyle={{ color: "#000", fontSize: 18 }}
        style={{ paddingVertical: 15, borderRadius: 100 }}
        onPress={onStartWorkout}
      >
        {canContinueWithOldExercise
          ? `resume workout on (${workout.activeExerciseIndex + 1}) exercise`
          : "Start workout"}
      </Button>

      <ExerciseProgressSheet
        workoutId={route.params.workoutId}
        onClearSelectedExercise={() => setSelectedExercise(undefined)}
        selectedExercise={selectedExercise}
      />

      <ExerciseBottomSheet
        exercises={exercises}
        workoutId={route.params.workoutId}
        ref={sheetRef}
      />
    </ScreenContainer>
  );
}

const AppendExercise = (props: { onPress: Function }) => (
  <View style={{ width: "100%" }}>
    <Button
      onPress={() => props.onPress()}
      fontStyle={{ color: Colors.secondary, fontSize: 15 }}
      style={{
        backgroundColor: Color(Colors.secondary).alpha(0.1).string(),
        borderRadius: 100,
        paddingVertical: 15,
      }}
    >
      add exercise
    </Button>
  </View>
);

interface ExerciseActionTileProps {
  exercises: Exercise[];
  item: Exercise;
  addExercise: () => Promise<unknown>;
}

const ExerciseBottomSheet = forwardRef<
  BottomSheet,
  { workoutId: string; exercises: Exercise[] }
>(({ workoutId, exercises }, sheetRef) => {
  const { data: allExercisesList } = useGetAllExercises();
  const { add: addExercise } = useAddExerciseToWorkout();

  return (
    <BottomSheet
      index={-1}
      backgroundStyle={{
        backgroundColor: Colors.primary,
      }}
      handleIndicatorStyle={{
        backgroundColor: Colors.secondary,
      }}
      ref={sheetRef}
      snapPoints={["80%"]}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
        />
      )}
    >
      <BottomSheetFlatList
        data={allExercisesList?.exercises as Exercise[]}
        keyExtractor={(element) => element.exerciseId}
        renderItem={({ item }) => (
          <ExerciseActionTile
            exercises={exercises}
            item={item}
            addExercise={() => addExercise(workoutId, item.exerciseId)}
          />
        )}
      />
    </BottomSheet>
  );
});

const ExerciseActionTile = ({
  exercises,
  item,
  addExercise,
}: ExerciseActionTileProps) => {
  const isIn =
    exercises.findIndex((e) => e.exerciseId === item.exerciseId) >= 0;
  return (
    <TouchableOpacity
      // onLongPress={} remove exercise
      onPress={() => addExercise()}
      disabled={isIn}
      style={{
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
      }}
    >
      <View style={{ flex: 3 }}>
        <Text style={{ color: "#fff", fontSize: 20 }}>{item.title}</Text>
        <Text style={{ color: "#ffffff84", fontSize: 15 }} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        {isIn && <Text style={{ color: Colors.secondary }}>IN WORKOUT</Text>}
      </View>
    </TouchableOpacity>
  );
};
