import { gql, useMutation } from "@apollo/client";
import useUser from "../../../../utils/hooks/useUser";

const CREATE_EXERCISE_MUTATION = gql`
  mutation CreateExercise(
    $title: String!
    $description: String!
    $difficulty: String!
    $muscleGroup: String!
    $equipment: String!
  ) {
    createExercise(
      input: {
        title: $title
        description: $description
        difficulty: $difficulty
        muscleGroup: $muscleGroup
        equipment: $equipment
      }
    ) {
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

export default function useCreateExercise() {
  const usr = useUser();

  const [create, state] = useMutation(CREATE_EXERCISE_MUTATION, {
    update(cache, { data: { createExercise } }) {
      cache.modify({
        fields: {
          exercises(existingExercises = []) {
            const newExerciseRef = cache.writeFragment({
              data: createExercise,
              fragment: gql`
                fragment NewExercise on Exercise {
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
              `,
            });
            return [...existingExercises, newExerciseRef];
          },
        },
      });
    },
  });

  const createExercise = async (props: any) =>
    create({
      variables: props,
    });

  return { createExercise, state };
}
