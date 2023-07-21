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
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { forwardRef, useEffect } from "react";

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
  const { createExpense, called, reset } = useCreateActivity({
    onCompleted() {
      props.onCompleted();
    },
  });

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        if (!called) (ref as any)?.current?.snapToIndex(2);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        if (!called) (ref as any)?.current?.snapToIndex(1);
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const onSubmit = async (values: any, { resetForm }: any) => {
    Keyboard.dismiss();

    await createExpense({
      variables: {
        amount: +values.amount,
        description: values.name,
        type: values.type,
      },
    });

    resetForm();

    reset();

    (ref as any).current?.snapToIndex(0);
  };

  return (
    <BottomSheet
      ref={ref}
      handleIndicatorStyle={{
        backgroundColor: Colors.secondary,
      }}
      backgroundStyle={{
        backgroundColor: Colors.primary,
      }}
      enablePanDownToClose
      snapPoints={["1%", "45%", "70%"]}
      backdropComponent={(props) => <BottomSheetBackdrop {...props} />}
    >
      <Formik
        validationSchema={schema}
        onSubmit={onSubmit}
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
            />

            <ValidatedInput
              placeholder="Amount [zł]"
              name="amount"
              left={(props) => (
                <Input.Icon Icon="Ionicons" name="cash-outline" {...props} />
              )}
              keyboardType="numeric"
              formik={f}
            />

            <Button
              disabled={!(f.isValid && f.dirty)}
              type="contained"
              color="primary"
              onPress={() => {
                Keyboard.dismiss();
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
    </BottomSheet>
  );
});

export default AddExpenseBottomSheet;
