import { gql } from "@apollo/client";

export interface UpdateProgressVariables {
  exerciseId: string;
  sets: number;
  reps: number;
  weight: number;
}

export default gql`
  mutation AddExerciseProgress(
    $exerciseId: ID!
    $sets: Int!
    $reps: Int!
    $weight: Float!
  ) {
    createExerciseProgress(
      input: {
        exerciseId: $exerciseId
        sets: $sets
        reps: $reps
        weight: $weight
      }
    ) {
      exerciseProgressId
      sets
      reps
      weight
      date
    }
  }
`;
