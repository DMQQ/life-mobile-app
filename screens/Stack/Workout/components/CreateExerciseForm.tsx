import { View, Text, StyleSheet, StyleProp, ViewStyle } from "react-native";
import * as Yup from "yup";
import { Formik } from "formik";

import Button from "../../../../components/ui/Button/Button";
import ValidatedInput from "../../../../components/ui/ValidatedInput/index";
import SegmentedButtons from "../../../../components/ui/SegmentedButtons";
import Colors from "../../../../constants/Colors";
import useCreateExercise from "../hooks/useCreateExercise";

const validationSchema = Yup.object().shape({
  title: Yup.string().required().label("Name"),
  description: Yup.string().required().label("Description"),
  difficulty: Yup.string()
    .is(["easy", "medium", "hard"])
    .required()
    .label("Difficulty"),
  equipment: Yup.string().required().label("Equipment"),
  muscleGroup: Yup.string().required().label("Muscle Group"),
});

const initialValues = {
  title: "",
  description: "",
  difficulty: "",
  equipment: "",
  muscleGroup: "",
};

const SegmentButtonList = [
  {
    text: "Easy",
    value: "easy",
  },
  {
    text: "Medium",
    value: "medium",
  },
  {
    text: "Hard",
    value: "hard",
  },
];

export default function CreateExerciseForm(
  props: Partial<{
    navigation: any;
    isLoading: boolean;
    isError: boolean;
    errors: string[];
    onSubmit: (values: typeof initialValues) => Promise<any>;
  }>
) {
  const { createExercise } = useCreateExercise(props.navigation.goBack);

  return (
    <View style={{ flex: 1 }}>
      <Formik
        validationSchema={validationSchema}
        onSubmit={createExercise}
        initialValues={initialValues}
      >
        {(formik) => (
          <>
            <View style={{ flex: 1 }}>
              <ValidatedInput
                showLabel
                label="Exercise name"
                formik={formik}
                name="title"
                placeholder="What's the name of your exercise?"
              />
              <ValidatedInput
                showLabel
                label="Exercise description"
                formik={formik}
                name="description"
                placeholder="Describe your exercise "
                multiline
                numberOfLines={formik.values.description.split("\n").length}
              />

              <ValidatedInput.Label error={false} text="Exercise difficulty" />
              <SegmentedButtons
                buttonTextStyle={{
                  fontWeight: "400",
                }}
                buttonStyle={{
                  margin: 5,
                  height: 40,
                }}
                containerStyle={{
                  padding: 5,
                  borderRadius: 15,
                }}
                value={formik.values.difficulty}
                onChange={(value) => formik.handleChange("difficulty")(value)}
                buttons={SegmentButtonList}
              />

              <ValidatedInput
                showLabel
                label="Equipment (Separate with & or comma)"
                formik={formik}
                name="equipment"
                placeholder="What equipment do you need "
              />
              <ValidatedInput
                showLabel
                label="Muscle target (Separate with & or comma)"
                formik={formik}
                name="muscleGroup"
                placeholder="What is the muscle group this exc target"
              />
            </View>

            <Button
              size="xl"
              onPress={() => formik.handleSubmit()}
              disabled={!(formik.isValid && formik.dirty)}
              type={
                !(formik.isValid && formik.dirty) ? "outlined" : "contained"
              }
              color="primary"
            >
              Save and Share
            </Button>
          </>
        )}
      </Formik>
    </View>
  );
}
