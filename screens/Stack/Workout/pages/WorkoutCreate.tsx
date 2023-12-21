import React from "react";
import ScreenContainer from "../../../../components/ui/ScreenContainer";
import { Formik } from "formik";
import { gql, useMutation } from "@apollo/client";
import useUser from "../../../../utils/hooks/useUser";
import ExercisesSelect from "../../../../components/ExercisesSelectDropdown/ExercisesSelect";
import Button from "../../../../components/ui/Button/Button";
import Colors from "../../../../constants/Colors";

import TextInput from "../../../../components/ui/TextInput/TextInput";
import Color from "color";
import { WorkoutScreenProps } from "../types";
import SegmentedButtons from "../../../../components/ui/SegmentedButtons";
import Select from "../../../../components/ui/Select/Select";
import ValidatedInput from "../../../../components/ui/ValidatedInput";

const CREATE_WORKOUT = gql`
  mutation CreateWorkout(
    $name: String!
    $exercises: [ID!]
    $description: String!
    $type: String!
    $difficulty: String!
  ) {
    createWorkout(
      input: {
        title: $name
        description: $description
        type: $type
        difficulty: $difficulty
        exercises: $exercises
      }
    ) {
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

function useCreateWorkout(
  onCompleted?: (data: unknown) => void,
  onError?: (err: unknown) => void
) {
  const { token } = useUser();
  return useMutation(CREATE_WORKOUT, {
    context: {
      headers: {
        authentication: token,
      },
    },

    refetchQueries: ["GetWorkouts"],

    // update(cache, { data: { createWorkout } }: any) {
    //   cache.modify({
    //     fields: {
    //       workouts(workouts = []) {
    //         const workoutRef = cache.writeFragment({
    //           data: createWorkout,
    //           fragment: CREATE_WORKOUT_FRAGMENT,
    //         });

    //         console.log(createWorkout);

    //         return [workoutRef, ...workouts];
    //       },
    //     },
    //   });
    // },

    onCompleted,
    onError,
  });
}

import * as yup from "yup";
import { View } from "react-native";

const validationSchema = yup.object().shape({
  exercises: yup.array().min(1).required("Add at least 1 exercise"),
  name: yup.string().required("Workout's name is required"),
  difficulty: yup.string().required(),
  type: yup.string().required(),
  description: yup.string().min(10, "Must be at least 15char").required(),
});

const EXERCISE_TYPES = [
  "Cardio",
  "Strength",
  "Flexibility",
  "PushPullLegs",
  "FullBodyWorkout",
  "Split",
  "Other",
] as string[];

export default function WorkoutCreate({
  navigation,
}: WorkoutScreenProps<"WorkoutCreate">) {
  const [createWorkout, state] = useCreateWorkout(
    ({ createWorkout }: any) => {
      navigation.navigate("Workout", {
        workoutId: createWorkout?.workoutId,
      });
    },

    (err: any) => console.log(JSON.stringify(err, null, 2)) // onError
  );

  const onSubmit = async (props: any) => {
    console.log(props);
    await createWorkout({
      variables: props,
    });
  };

  return (
    <ScreenContainer>
      <Formik
        validationSchema={validationSchema}
        onSubmit={onSubmit}
        initialValues={{
          name: "",
          exercises: [],
          difficulty: "",
          type: "",
          description: "",
        }}
      >
        {(f) => (
          <View style={{ flex: 1, justifyContent: "space-between" }}>
            <View>
              <ValidatedInput
                formik={f}
                name="name"
                placeholder="Workout's name"
              />

              <ValidatedInput
                formik={f}
                name="description"
                placeholder="Workout's description"
              />

              <SegmentedButtons
                //isError={!!f.errors.difficulty && f.touched.difficulty}
                buttons={["Beginner", "Intermediate", "Advanced"].map(
                  (text) => ({
                    text,
                    value: text,
                  })
                )}
                onChange={(value) => f.setFieldValue("difficulty", value)}
                value={f.values.difficulty}
              />

              <ExercisesSelect
                setSelected={(sel) => f.setFieldValue("exercises", sel) as any}
              />

              <Select
                containerStyle={{ marginTop: 10 }}
                options={EXERCISE_TYPES as string[]}
                selected={[f.values.type]}
                setSelected={(sel) => f.setFieldValue("type", sel[0])}
                multiSelect={false}
                renderDefaultItem
                maxSelectHeight={300}
                closeOnSelect
              />
            </View>

            <Button
              onPress={() => f.handleSubmit()}
              disabled={!(f.isValid && f.dirty)}
              size="xl"
              fontStyle={{ color: "#000" }}
              style={{
                backgroundColor: !(f.isValid && f.dirty)
                  ? Color(Colors.secondary).alpha(0.5).string()
                  : Colors.secondary,
                marginTop: 15,
                borderRadius: 100,
              }}
            >
              Create workout
            </Button>
          </View>
        )}
      </Formik>
    </ScreenContainer>
  );
}
