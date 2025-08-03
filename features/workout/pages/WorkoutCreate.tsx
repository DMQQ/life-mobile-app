import React from "react";
import ScreenContainer from "@/components/ui/ScreenContainer";
import { Formik } from "formik";
import { gql, useMutation } from "@apollo/client";
import ExercisesSelect from "@/components/ExercisesSelectDropdown/ExercisesSelect";
import Button from "@/components/ui/Button/Button";
import Colors from "@/constants/Colors";
import { WorkoutScreenProps } from "../types";
import SegmentedButtons from "@/components/ui/SegmentedButtons";
import Select from "@/components/ui/Select/Select";
import ValidatedInput from "@/components/ui/ValidatedInput";

const CREATE_WORKOUT = gql`
  mutation CreateWorkout($name: String!, $exercises: [ID!], $description: String!, $type: String!, $difficulty: String!) {
    createWorkout(input: { title: $name, description: $description, type: $type, difficulty: $difficulty, exercises: $exercises }) {
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

function useCreateWorkout(onCompleted?: (data: unknown) => void, onError?: (err: unknown) => void) {
  return useMutation(CREATE_WORKOUT, {
    update(cache, { data: { createWorkout } }: any) {
      cache.modify({
        fields: {
          workouts(workouts = []) {
            const workouts_updated = [createWorkout, ...workouts];

            cache.writeQuery({
              query: GetWorkoutsQuery,
              data: { workous: workouts_updated },
              overwrite: true,
            });

            return workouts_updated;
          },
        },
      });
    },

    onCompleted,
    onError,
  });
}

import * as yup from "yup";
import { Text, View } from "react-native";
import { GetWorkoutsQuery } from "../hooks/useGetWorkouts";
import Ripple from "react-native-material-ripple";

const validationSchema = yup.object().shape({
  exercises: yup.array().min(1).required("Add at least 1 exercise"),
  name: yup.string().required("Workout's name is required"),
  difficulty: yup.string().required(),
  type: yup.string().required(),
  description: yup.string().min(10, "Must be at least 15char").required(),
});

const EXERCISE_TYPES = ["Cardio", "Strength", "Flexibility", "PushPullLegs", "FullBodyWorkout", "Split", "Other"] as string[];

export default function WorkoutCreate({ navigation }: WorkoutScreenProps<"WorkoutCreate">) {
  const [createWorkout, state] = useCreateWorkout(
    ({ createWorkout }: any) => {
      navigation.navigate("Workout", {
        workoutId: createWorkout?.workoutId,
      });
    },

    (err: any) => console.log(JSON.stringify(err, null, 2)) // onError
  );

  const onSubmit = async (props: any) => {
    await createWorkout({
      variables: props,
    });
  };

  const onHandleContribute = () => {
    navigation.navigate("Exercise", {
      exerciseId: "",
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
              <ValidatedInput label="Name" showLabel formik={f} name="name" placeholder="Workout's name" />

              <ValidatedInput
                label="Short description"
                numberOfLines={4}
                textAlignVertical="top"
                showLabel
                formik={f}
                name="description"
                placeholder="Workout's description"
              />

              <ValidatedInput.Label error={(!!f.errors.difficulty && f.touched.difficulty) || false} text="Set Difficulty" />

              <SegmentedButtons
                isError={!!f.errors.difficulty && f.touched.difficulty}
                buttons={["Beginner", "Intermediate", "Advanced"].map((text) => ({
                  text,
                  value: text,
                }))}
                buttonTextStyle={{ fontWeight: "400", fontSize: 16 }}
                buttonStyle={{ height: 40, margin: 10, borderRadius: 5 }}
                containerStyle={{ borderRadius: 5 }}
                onChange={(value) => f.setFieldValue("difficulty", value)}
                value={f.values.difficulty}
              />

              <ValidatedInput.Label error={false} text="Choose exercises" />

              <ExercisesSelect setSelected={(sel) => f.setFieldValue("exercises", sel) as any} />
              <Ripple style={{ padding: 5, marginBottom: 10 }} onPress={onHandleContribute}>
                <Text
                  style={{
                    color: Colors.secondary,
                    textDecorationLine: "underline",
                  }}
                >
                  Contribute to creating exercises
                </Text>
              </Ripple>

              <ValidatedInput.Label error={false} text="Choose workout type" />

              <Select
                options={EXERCISE_TYPES as string[]}
                selected={[f.values.type]}
                setSelected={(sel) => f.setFieldValue("type", sel[0])}
                multiSelect={false}
                renderDefaultItem
                maxSelectHeight={200}
                closeOnSelect
                anchor="top"
                placeholderText="Type"
              />
            </View>

            <Button
              type={!(f.isValid && f.dirty) ? "outlined" : "contained"}
              onPress={() => f.handleSubmit()}
              disabled={!(f.isValid && f.dirty)}
              size="xl"
              fontStyle={{
                color: !(f.isValid && f.dirty) ? Colors.secondary : Colors.foreground,
              }}
              style={{
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
