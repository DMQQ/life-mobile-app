import { Formik } from "formik";
import Input from "../../../../components/ui/TextInput/TextInput";
import { View, Text, Keyboard } from "react-native";

import ValidatedInput from "../../../../components/ui/ValidatedInput";
import Button from "../../../../components/ui/Button/Button";

import Colors from "../../../../constants/Colors";
import useCreateActivity from "../hooks/useCreateActivity";

import * as yup from "yup";
import SegmentedButtons from "../../../../components/ui/SegmentedButtons";
import Color from "color";
import BottomSheet, {
  BottomSheetBackdrop,
  useBottomSheet,
} from "@gorhom/bottom-sheet";
import { forwardRef, useEffect, useState } from "react";

const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  amount: yup.number().positive().required("Amount is required"),
  type: yup.string().required("Type is required"),
});

const SegmentVariants = [
  {
    text: "income",
    value: "income",
  },
  {
    text: "expense",
    value: "expense",
  },
];

const AddExpenseBottomSheet = forwardRef<
  BottomSheet,
  { onCompleted: Function }
>((props, ref) => {
  const { createExpense, reset } = useCreateActivity({
    onCompleted() {
      props.onCompleted();
    },
  });

  const onSubmit = async (values: any, { resetForm }: any) => {
    await createExpense({
      variables: {
        amount: +values.amount,
        description: values.name,
        type: values.type,
      },
    });

    (ref as any).current?.forceClose();

    resetForm();

    reset();
  };

  return (
    <BottomSheet
      index={-1}
      ref={ref}
      onClose={() => {
        Keyboard.dismiss();
      }}
      handleIndicatorStyle={{
        backgroundColor: Colors.secondary,
      }}
      backgroundStyle={{
        backgroundColor: Colors.primary,
      }}
      enablePanDownToClose
      snapPoints={["50%", "80%"]}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          {...props}
        />
      )}
    >
      <Form onSubmit={onSubmit} />
    </BottomSheet>
  );
});

interface FormProps {
  onSubmit: (...val: any) => Promise<any>;
  onSetFormHeight?: (n: number) => void;
}

const Form = (props: FormProps) => {
  const { expand } = useBottomSheet();

  return (
    <Formik
      validationSchema={schema}
      onSubmit={props.onSubmit}
      initialValues={{
        name: "",
        amount: "",
        type: "",
      }}
    >
      {(f) => (
        <View style={{ padding: 10 }}>
          <SegmentedButtons
            buttons={SegmentVariants}
            onChange={(value) => f.setFieldValue("type", value)}
            value={f.values.type}
          />

          <ValidatedInput
            placeholder="Expense name"
            name="name"
            left={(props) => (
              <Input.Icon Icon="AntDesign" name="wallet" {...props} />
            )}
            formik={f}
            onFocus={() => expand()}
          />

          <ValidatedInput
            placeholder="Amount [zł]"
            name="amount"
            left={(props) => (
              <Input.Icon Icon="Ionicons" name="cash-outline" {...props} />
            )}
            keyboardType="numeric"
            formik={f}
            onFocus={() => expand()}
          />

          <Button
            disabled={!(f.isValid && f.dirty)}
            type="contained"
            color="primary"
            onPress={() => {
              f.handleSubmit();
            }}
            style={{
              marginTop: 20,
              paddingVertical: 15,
              backgroundColor: !(f.isValid && f.dirty)
                ? Color(Colors.secondary).alpha(0.2).string()
                : Colors.secondary,
            }}
          >
            Create
          </Button>
        </View>
      )}
    </Formik>
  );
};

export default AddExpenseBottomSheet;
