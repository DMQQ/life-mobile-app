import { useEffect, useState, useRef, forwardRef, useCallback } from "react";
import ScreenContainer from "@/components/ui/ScreenContainer";
import ExerciseList from "@/components/Exercise/ExerciseList/ExerciseList";
import { View, Text, ScrollView, StyleSheet, FlatList } from "react-native";
import Button from "@/components/ui/Button/Button";
import { WorkoutScreenProps } from "../types";
import ExerciseProgressSheet from "../components/ExerciseProgressSheet";
import { Exercise } from "@/types";
import { useDispatch } from "react-redux";
import { workoutActions } from "@/utils/redux/workout/workout";
import Color from "color";
import Colors from "@/constants/Colors";
import BottomSheet, { BottomSheetBackdrop, BottomSheetFlatList, TouchableOpacity } from "@gorhom/bottom-sheet";
import { useGetAllExercises } from "../components/ExerciseList";
import useAddExerciseToWorkout from "../hooks/useAddExerciseToWorkout";
import useGetWorkoutQuery from "../hooks/useGetWorkoutQuery";
import { useAppSelector } from "@/utils/redux";
import Input from "@/components/ui/TextInput/TextInput";
import { AntDesign } from "@expo/vector-icons";

const styles = StyleSheet.create({
  pendingText: {
    color: Colors.secondary,
    fontWeight: "bold",
    fontSize: 12,
    marginLeft: 5,
    letterSpacing: 1,
    lineHeight: 25,
  },
  titleText: {
    color: Colors.secondary,
    fontSize: 35,
    fontWeight: "bold",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 5,
  },
  container: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
  },
  listInfoText: {
    color: Colors.secondary,
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
  },
});

export default function Workout({ navigation, route }: WorkoutScreenProps<"Workout">) {
  const { data } = useGetWorkoutQuery(route.params.workoutId);
  const dispatch = useDispatch();

  const [selectedExercise, setSelectedExercise] = useState<Exercise | undefined>(undefined);

  const sheetRef = useRef<BottomSheet | null>(null);
  const exercises = (data?.workout?.exercises || []) as Exercise[];

  const workout = useAppSelector((s) => s.workout);

  const canContinueWithOldExercise = workout.isWorkoutPending && workout.workoutId === data?.workout?.workoutId;

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
      delayTimerStart: 0,
      exerciseId: canContinueWithOldExercise ? workout.exercises[workout.activeExerciseIndex].exerciseId : exercises[0].exerciseId,
    });
  };

  useEffect(() => {
    navigation.setOptions({
      headerTitle: data?.workout?.title,
      headerTitleAlign: "center",
    });
  }, [data?.workout]);

  const ExerciseHeader = useCallback(
    () => (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.titleText}>{data?.workout?.title}</Text>

          {workout.workoutId === route.params.workoutId && workout.isWorkoutPending && <Text style={styles.pendingText}>PENDING</Text>}
        </View>

        <Text style={{ color: Colors.text_dark }}>{data?.workout?.description}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
          {[0, 1, 2].map((id) => (
            <View
              style={{
                backgroundColor: Colors.primary_lighter,
                width: 120,
                height: 60,
                borderRadius: 10,
                marginRight: 10,
              }}
              key={id}
            />
          ))}
        </ScrollView>
        <Text style={styles.listInfoText}>All Exercises ({data?.workout?.exercises?.length})</Text>
      </View>
    ),
    [data?.workout, workout.isWorkoutPending, workout.workoutId]
  );

  const workoutText = canContinueWithOldExercise ? `Resume on (${workout.activeExerciseIndex + 1}) exercise` : "Start workout";

  return (
    <ScreenContainer>
      <View style={{ flex: 1 }}>
        <ExerciseList
          ListHeaderComponent={ExerciseHeader}
          onExerciseTilePress={(exercise) => setSelectedExercise(exercise)}
          exercises={data?.workout.exercises}
        />
      </View>

      <View
        style={{
          flexDirection: "row",
          paddingTop: 5,
        }}
      >
        <Button
          type="contained"
          color="ternary"
          fontStyle={{ color: "#000", fontSize: 18 }}
          style={{
            borderRadius: 100,
            flex: 1,
            marginRight: 5,
            padding: 15,
          }}
          onPress={onStartWorkout}
        >
          {workoutText}
        </Button>
        <AppendExercise onPress={() => sheetRef.current?.expand()} />
      </View>

      <ExerciseProgressSheet
        workoutId={route.params.workoutId}
        onClearSelectedExercise={() => setSelectedExercise(undefined)}
        selectedExercise={selectedExercise}
      />

      <ExerciseBottomSheet exercises={exercises} workoutId={route.params.workoutId} ref={sheetRef} />
    </ScreenContainer>
  );
}

const AppendExercise = (props: { onPress: Function }) => (
  <Button
    onPress={() => props.onPress()}
    fontStyle={{ color: Colors.secondary, fontSize: 15 }}
    style={{
      backgroundColor: Color(Colors.secondary).alpha(0.1).string(),
      borderRadius: 100,
      width: 55,
    }}
  >
    <AntDesign name="plus" color={Colors.secondary} size={25} />
  </Button>
);

interface ExerciseActionTileProps {
  exercises: Exercise[];
  item: Exercise;
  addExercise: () => Promise<unknown>;
}

const ExerciseBottomSheet = forwardRef<BottomSheet, { workoutId: string; exercises: Exercise[] }>(({ workoutId, exercises }, sheetRef) => {
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
      backdropComponent={(props) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />}
    >
      <BottomSheetFlatList
        ListHeaderComponentStyle={{ paddingHorizontal: 10 }}
        ListHeaderComponent={<Input value="Search" />}
        data={allExercisesList?.exercises as Exercise[]}
        keyExtractor={(element) => element.exerciseId}
        renderItem={({ item }) => (
          <ExerciseActionTile exercises={exercises} item={item} addExercise={() => addExercise(workoutId, item.exerciseId)} />
        )}
      />
    </BottomSheet>
  );
});

const ExerciseActionTile = ({ exercises, item, addExercise }: ExerciseActionTileProps) => {
  const isIn = exercises.findIndex((e) => e.exerciseId === item.exerciseId) >= 0;
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
        <Text style={{ color: Colors.foreground, fontSize: 20 }}>{item.title}</Text>
        <Text style={{ color: "#ffffff84", fontSize: 15 }} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
      <View style={{ flex: 1 }}>{isIn && <Text style={{ color: Colors.secondary }}>IN WORKOUT</Text>}</View>
    </TouchableOpacity>
  );
};
