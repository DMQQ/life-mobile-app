import { FlatList, Text } from "react-native";
import ScreenContainer from "../../../components/ui/ScreenContainer";
import { useAppSelector } from "../../../utils/redux";
import Colors from "../../../constants/Colors";
import ExerciseTile from "../../../components/Exercise/ExerciseTile/ExerciseTile";
import Button from "../../../components/ui/Button/Button";
import Color from "color";

export default function WorkoutSummary() {
  const workout = useAppSelector((s) => s.workout);
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
        ListFooterComponent={
          <Button
            type="contained"
            size="md"
            borderRadius="full"
            fontStyle={{
              color: "#000",
            }}
            style={{
              backgroundColor: Color(Colors.secondary).alpha(0.75).string(),
            }}
          >
            Run skipped exercises
          </Button>
        }
        data={workout.skipped_exercises}
        keyExtractor={(ex) => ex.exerciseId}
        renderItem={({ item, index }) => (
          <ExerciseTile {...item} tileIndex={index} onPress={() => {}} />
        )}
      />
      <Button borderRadius="full" variant="ternary" type="contained" size="xl">
        End
      </Button>
    </ScreenContainer>
  );
}
