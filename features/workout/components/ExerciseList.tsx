import { gql, useQuery } from "@apollo/client";
import { View, FlatList } from "react-native";
import ExerciseTile from "./ExerciseTile";

const GET_EXERCISES_QUERY = gql`
  query GetExercises {
    exercises {
      exerciseId
      title
      description
      difficulty
      muscleGroup
      equipment
      image
      tips {
        tipId
        text
        image
      }
    }
  }
`;

export const useGetAllExercises = () => {
  return useQuery(GET_EXERCISES_QUERY, {});
};

export default function ExerciseList() {
  const { data } = useGetAllExercises();

  return (
    <FlatList data={data?.exercises || []} keyExtractor={(item) => item.exerciseId} renderItem={({ item }) => <ExerciseTile {...item} />} />
  );
}
