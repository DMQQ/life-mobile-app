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
  BottomSheetBackdropProps,
  useBottomSheet,
} from "@gorhom/bottom-sheet";
import { forwardRef, useCallback, useEffect, useState } from "react";
import Select from "../../../../components/ui/Select/Select";

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

  const backdropComponent = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        {...props}
      />
    ),
    []
  );

  return (
    <BottomSheet
      index={-1}
      ref={ref}
      onChange={(index) => index === -1 && Keyboard.dismiss()}
      handleIndicatorStyle={{
        backgroundColor: Colors.secondary,
        margin: 5,
        width: 40,
      }}
      backgroundStyle={{
        backgroundColor: Colors.primary,
      }}
      enablePanDownToClose
      snapPoints={["65%", "80%"]}
      backdropComponent={backdropComponent}
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
  const { expand, snapToIndex } = useBottomSheet();

  return (
    <Formik
      validationSchema={schema}
      onSubmit={props.onSubmit}
      initialValues={{
        name: "",
        amount: "",
        type: "",
        category: "",
      }}
    >
      {(f) => (
        <View style={{ padding: 10 }}>
          <SegmentedButtons
            buttons={SegmentVariants}
            onChange={(value) => f.setFieldValue("type", value)}
            value={f.values.type}
          />

          <View style={{ marginTop: 15 }}>
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
          </View>

          <Select
            onFocusChange={(focused) => {
              snapToIndex(focused ? 1 : 0);
            }}
            selected={[f.values.category]}
            setSelected={([selected]) => f.setFieldValue("category", selected)}
            options={["Food", "Transport", "Debt", "Night out"]}
            transparentOverlay
            closeOnSelect
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
