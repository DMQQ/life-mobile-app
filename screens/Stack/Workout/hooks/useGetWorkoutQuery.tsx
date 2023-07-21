import { gql, useQuery } from "@apollo/client";
import { useAppSelector } from "../../../../utils/redux";

const GetWorkoutQuery = gql`
  query GetWorkout($id: ID!) {
    workout(id: $id) {
      workoutId
      title
      description
      type
      difficulty

      exercises {
        exerciseId
        title
        description
        difficulty
        muscleGroup
        equipment
        image
      }
    }
  }
`;

export default function useGetWorkoutQuery(workoutId: string) {
  const token = useAppSelector((st) => st.user.token);
  //const dispatch = useDispatch();

  return useQuery(GetWorkoutQuery, {
    variables: {
      id: workoutId,
    },
    context: {
      headers: {
        authentication: token,
      },
    },
  });
}
