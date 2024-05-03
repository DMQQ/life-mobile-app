import { FormikProps, useFormik } from "formik";
import Input from "../../../../components/ui/TextInput/TextInput";
import { View, TextStyle, StyleProp } from "react-native";
import ValidatedInput from "../../../../components/ui/ValidatedInput";
import Button from "../../../../components/ui/Button/Button";
import useCreateActivity from "../hooks/useCreateActivity";
import * as yup from "yup";
import SegmentedButtons from "../../../../components/ui/SegmentedButtons";
import BottomSheet, {
  BottomSheetGorhom,
} from "@/components/ui/BottomSheet/BottomSheet";
import { forwardRef } from "react";
import Select from "../../../../components/ui/Select/Select";
import { Text } from "react-native";
import { Icons } from "./WalletItem";
import { useBottomSheet } from "@gorhom/bottom-sheet";

const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  amount: yup.number().positive().required("Amount is required"),
  type: yup.string().required("Type is required"),
});

const SegmentVariants = [
  {
    text: "Income",
    value: "income",
  },
  {
    text: "Expense",
    value: "expense",
  },
];

const initialValues = {
  name: "",
  amount: "",
  type: "",
  category: "",
};

const AddExpenseBottomSheet = forwardRef<
  BottomSheetGorhom,
  { onCompleted: Function }
>((props, ref) => {
  const { createExpense, reset } = useCreateActivity({
    onCompleted() {
      props.onCompleted();
    },
  });

  const onSubmit = async (values: typeof initialValues, { resetForm }: any) => {
    await createExpense({
      variables: {
        amount: +values.amount,
        description: values.name,
        type: values.type,
        category: values.category,
      },
    });

    (ref as any).current?.forceClose();

    resetForm();

    reset();
  };

  const f = useFormik({
    validationSchema: schema,
    onSubmit: onSubmit,
    initialValues: initialValues,
  });

  return (
    <BottomSheet
      onChange={(index) => {
        index === -1 && f.resetForm();
      }}
      ref={ref}
      snapPoints={["70%", "95%"]}
    >
      <Form formik={f} />
    </BottomSheet>
  );
});

interface FormProps {
  formik: FormikProps<typeof initialValues>;
}

const label = {
  color: "#fff",
  fontSize: 16,
  fontWeight: "bold",
  padding: 5,
} as StyleProp<TextStyle>;

const Form = ({ formik: f }: FormProps) => {
  const { snapToIndex } = useBottomSheet();

  return (
    <View style={{ paddingHorizontal: 15 }}>
      <SegmentedButtons
        buttons={SegmentVariants}
        onChange={(value) => f.setFieldValue("type", value)}
        value={f.values.type}
        containerStyle={{ borderRadius: 12.5 }}
        buttonStyle={{ height: 45, margin: 10, borderRadius: 5 }}
      />

      <View>
        <ValidatedInput
          showLabel
          label="Purchase's name"
          placeholder="Like 'new phone', 'christmas gift'..."
          name="name"
          left={(props) => (
            <Input.Icon Icon="AntDesign" name="wallet" {...props} />
          )}
          formik={f}
        />

        <ValidatedInput
          showLabel
          label="Amount (zł)"
          placeholder="How much have you spent?"
          name="amount"
          left={(props) => (
            <Input.Icon Icon="Ionicons" name="cash-outline" {...props} />
          )}
          keyboardType="numeric"
          formik={f}
        />
      </View>

      <Text style={label}>Category</Text>
      <Select
        placeholderText="Choose category or create your own"
        onFocusChange={(focused) => {
          snapToIndex(focused ? 1 : 0);
        }}
        selected={[f.values.category]}
        setSelected={([selected]) => f.setFieldValue("category", selected)}
        options={Object.keys(Icons)}
        transparentOverlay
        closeOnSelect
        maxSelectHeight={250}
      />

      <Button
        disabled={!(f.isValid && f.dirty)}
        type={!(f.isValid && f.dirty) ? "outlined" : "contained"}
        color="primary"
        onPress={() => {
          f.handleSubmit();
        }}
        style={{
          marginTop: 20,
          paddingVertical: 15,
        }}
      >
        Create expense
      </Button>
    </View>
  );
};

export default AddExpenseBottomSheet;
