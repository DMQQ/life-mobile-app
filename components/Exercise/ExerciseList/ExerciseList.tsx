import { FlatList, FlatListProps } from "react-native";
import { Exercise } from "../../../types";
import ExerciseTile from "../ExerciseTile/ExerciseTile";

interface ExerciseListProps
  extends Pick<FlatListProps<Exercise>, "ListFooterComponent">,
    Pick<FlatListProps<Exercise>, "ListHeaderComponent"> {
  exercises: Exercise[];
}

export default function ExerciseList({
  exercises,
  ListFooterComponent,
  ListHeaderComponent,
  onExerciseTilePress,
}: ExerciseListProps & {
  onExerciseTilePress: (exercise: Exercise) => void;
}) {
  return (
    <FlatList
      ListFooterComponent={ListFooterComponent}
      ListHeaderComponent={ListHeaderComponent}
      data={exercises}
      keyExtractor={(item) => item.exerciseId}
      renderItem={({ item, index }) => (
        <ExerciseTile
          tileIndex={index}
          onPress={() => onExerciseTilePress(item)}
          {...item}
        />
      )}
    />
  );
}
