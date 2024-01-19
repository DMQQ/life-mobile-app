import { gql, useMutation } from "@apollo/client";
import useUser from "../useUser";

const CREATE_WORKOUT = gql`
  mutation CreateWorkout($name: String!, $exercises: [String!]!) {
    createWorkout(name: $name, exercises: $exercises) {
      id
      name
      date
      userId
      exercises {
        id
        name
        description
        image
        muscleGroup
      }
    }
  }
`;

const useCreateWorkout = () => {
  return useMutation(CREATE_WORKOUT, {
    update(cache, { data: { createWorkout } }) {
      cache.modify({
        fields: {
          workouts(existingWorkouts = []) {
            return [createWorkout, ...existingWorkouts];
          },
        },
      });
    },
  });
};

export default useCreateWorkout;
