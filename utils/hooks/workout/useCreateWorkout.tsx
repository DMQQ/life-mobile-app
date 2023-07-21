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
  const { token } = useUser();
  return useMutation(CREATE_WORKOUT, {
    context: {
      headers: {
        authorization: token,
        authentication: token,
        token,
      },
    },
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
