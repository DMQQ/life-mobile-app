import React from "react";
import ScreenContainer from "../../../../components/ui/ScreenContainer";
import { Formik } from "formik";
import { gql, useMutation } from "@apollo/client";
import useUser from "../../../../utils/hooks/useUser";
import ExercisesSelect from "../../../../components/ExercisesSelectDropdown/ExercisesSelect";
import Button from "../../../../components/ui/Button/Button";
import Colors from "../../../../constants/Colors";
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
import { Text, View } from "react-native";

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
                label="Name"
                showLabel
                formik={f}
                name="name"
                placeholder="Workout's name"
              />

              <ValidatedInput
                label="Short description"
                numberOfLines={3}
                textAlignVertical="top"
                showLabel
                formik={f}
                name="description"
                placeholder="Workout's description"
              />

              <ValidatedInput.Label
                error={!!f.errors.difficulty && f.touched.difficulty}
                text="Set Difficulty"
              />

              <SegmentedButtons
                isError={!!f.errors.difficulty && f.touched.difficulty}
                buttons={["Beginner", "Intermediate", "Advanced"].map(
                  (text) => ({
                    text,
                    value: text,
                  })
                )}
                buttonTextStyle={{ fontWeight: "400", fontSize: 16 }}
                buttonStyle={{ height: 40, margin: 10, borderRadius: 5 }}
                containerStyle={{ borderRadius: 5 }}
                onChange={(value) => f.setFieldValue("difficulty", value)}
                value={f.values.difficulty}
              />

              <ValidatedInput.Label error={false} text="Choose exercises" />

              <ExercisesSelect
                setSelected={(sel) => f.setFieldValue("exercises", sel) as any}
              />

              <ValidatedInput.Label error={false} text="Choose workout type" />

              <Select
                options={EXERCISE_TYPES as string[]}
                selected={[f.values.type]}
                setSelected={(sel) => f.setFieldValue("type", sel[0])}
                multiSelect={false}
                renderDefaultItem
                maxSelectHeight={200}
                closeOnSelect
                placeholderText="Type"
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
