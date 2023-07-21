import { gql } from "@apollo/client";

export const GET_WORKOUTS = gql`
  query GetWorkouts {
    workouts {
      id
      date
      userId
      name
      exercises {
        id
        name
        description
        image
        exercise_progress(paging: { skip: 0, limit: 5 }) {
          id
          reps
          sets
          weight
        }
      }
    }
  }
`;
