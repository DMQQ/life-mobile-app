import { gql } from "@apollo/client";

export const GET_WORKOUT = gql`
  query GetWorkout($id: String!) {
    workout(id: $id) {
      id
      date
      exercises {
        id
        name
        description
        image
        muscleGroup
        exercise_progress(paging: { skip: 0, limit: 5 }) {
          id
          sets
          reps
          weight
          date
        }
      }
    }
  }
`;
