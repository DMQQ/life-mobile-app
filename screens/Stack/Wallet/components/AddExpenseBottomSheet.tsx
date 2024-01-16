import { Formik } from "formik";
import Input from "../../../../components/ui/TextInput/TextInput";
import { View, Keyboard, TextStyle, StyleProp } from "react-native";

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
import { forwardRef, useCallback, useEffect } from "react";
import Select from "../../../../components/ui/Select/Select";
import Layout from "@/constants/Layout";
import { Text } from "react-native";
import { Icons } from "./WalletItem";

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
        category: values.category,
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
      snapPoints={["70%", "95%"]}
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

const label = {
  color: "#fff",
  fontSize: 16,
  fontWeight: "bold",
  padding: 5,
} as StyleProp<TextStyle>;

const Form = (props: FormProps) => {
  const { snapToIndex, animatedIndex } = useBottomSheet();

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
              style={{
                width: Layout.screen.width - 30,
              }}
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
              style={{
                width: Layout.screen.width - 30,
              }}
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
            Create expense
          </Button>
        </View>
      )}
    </Formik>
  );
};

export default AddExpenseBottomSheet;
