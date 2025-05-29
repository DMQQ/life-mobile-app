import Button from "@/components/ui/Button/Button";
import ValidatedInput from "@/components/ui/ValidatedInput";
import { useFormik } from "formik";
import { KeyboardAvoidingView, View } from "react-native";
import * as yup from "yup";

import { useGroups } from "../hooks";

const validationSchema = yup.object().shape({
  title: yup.string().required("Title is required"),
  description: yup.string().required("Description is required"),
});

export default function CreateFlashCards({ navigation }: any) {
  const { createGroup } = useGroups();
  const f = useFormik({
    initialValues: {
      title: "",
      description: "",
    },
    onSubmit: async (values) => {
      try {
        const group = await createGroup({
          name: values.title,
          description: values.description,
        });

        navigation.replace("CreateFlashCards", { groupId: group.id });
      } catch (error) {
        console.error(error);
        console.error(JSON.stringify(error, null, 2));
      }
    },

    validationSchema,
  });

  return (
    <KeyboardAvoidingView style={{ flex: 1, padding: 15, justifyContent: "space-between", paddingBottom: 45 }}>
      <View>
        <ValidatedInput showLabel name="title" label="Title of the flashCards" formik={f} error={!!f.errors.title && f.touched.title} />

        <ValidatedInput
          showLabel
          name="description"
          label="Description of the flashCards"
          formik={f}
          error={!!f.errors.description && f.touched.description}
        />
      </View>
      <Button disabled={!(f.isValid && f.dirty)} onPress={() => f.handleSubmit()}>
        Save
      </Button>
    </KeyboardAvoidingView>
  );
}
