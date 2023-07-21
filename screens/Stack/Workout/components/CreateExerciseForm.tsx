import { View, Text, StyleSheet, StyleProp, ViewStyle } from "react-native";
import * as Yup from "yup";
import { Formik } from "formik";

import Button from "../../../../components/ui/Button/Button";
import Input from "../../../../components/ui/ValidatedInput/index";
import SegmentedButtons from "../../../../components/ui/SegmentedButtons";
import Colors from "../../../../constants/Colors";

const validationSchema = Yup.object().shape({
  name: Yup.string().required().label("Name"),
  description: Yup.string().required().label("Description"),
  difficulty: Yup.string()
    .is(["easy", "medium", "hard"])
    .required()
    .label("Difficulty"),
  equipment: Yup.string().required().label("Equipment"),
  muscleGroup: Yup.string().required().label("Muscle Group"),
});

const initialValues = {
  name: "",
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

export default function CreateExerciseForm(props: {
  isLoading: boolean;
  isError: boolean;
  errors: string[];
  onSubmit: (values: typeof initialValues) => Promise<any>;
}) {
  return (
    <View>
      <Formik
        validationSchema={validationSchema}
        onSubmit={() => {}}
        initialValues={initialValues}
      >
        {(formik) => (
          <>
            <Input
              formik={formik}
              name="name"
              placeholder="What's the name of your exercise?"
            />
            <Input
              formik={formik}
              name="description"
              placeholder="Describe your exercise "
              multiline
              numberOfLines={formik.values.description.split("\n").length}
            />

            <SegmentedButtons
              value={formik.values.difficulty}
              onChange={(value) => formik.handleChange("difficulty")(value)}
              buttons={SegmentButtonList}
            />

            <Input
              formik={formik}
              name="equipment"
              placeholder="What equipment do you need "
            />
            <Input
              formik={formik}
              name="muscleGroup"
              placeholder="What is the muscle group this exc target"
            />

            <Button
              onPress={() => formik.handleSubmit()}
              disabled={
                !(formik.isValid && formik.dirty && formik.isSubmitting)
              }
              type="contained"
              color="primary"
              style={{ backgroundColor: Colors.secondary, paddingVertical: 15 }}
            >
              Save and Share
            </Button>
          </>
        )}
      </Formik>
    </View>
  );
}
