import { Formik } from "formik";
import ScreenContainer from "../../../../components/ui/ScreenContainer";
import Input from "../../../../components/ui/TextInput/TextInput";
import { View, Text } from "react-native";

import ValidatedInput from "../../../../components/ui/ValidatedInput";
import Button from "../../../../components/ui/Button/Button";
import Ripple from "react-native-material-ripple";
import Colors from "../../../../constants/Colors";
import useCreateActivity from "../hooks/useCreateActivity";

import * as yup from "yup";
import SegmentedButtons from "../../../../components/ui/SegmentedButtons";
import Color from "color";
import Select from "@/components/ui/Select/Select";
import Layout from "@/constants/Layout";

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

export default function CreateActivity({ navigation }: any) {
  const { createExpense } = useCreateActivity({ onCompleted: () => {} });

  const onSubmit = async (values: any, { resetForm }: any) => {
    await createExpense({
      variables: {
        amount: +values.amount,
        description: values.name,
        type: values.type,
      },
    });
  };

  return (
    <ScreenContainer style={{ padding: 15 }}>
      <Text
        style={{
          color: "#fff",
          fontSize: 35,
          marginVertical: 20,
          fontWeight: "bold",
        }}
      >
        Create Expense
      </Text>

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
          <View style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
              <SegmentedButtons
                buttonStyle={{
                  height: 75,
                }}
                buttonTextStyle={{
                  fontSize: 18,
                }}
                buttons={SegmentVariants}
                onChange={(value) => f.setFieldValue("type", value)}
                value={f.values.type}
              />

              <ValidatedInput
                placeholder="Like 'shopping', 'new phone' ..."
                name="name"
                left={(props) => (
                  <Input.Icon Icon="AntDesign" name="wallet" {...props} />
                )}
                formik={f}
                style={{
                  width: Layout.screen.width - 30,
                }}
              />

              <ValidatedInput
                placeholder="How much you spent? "
                name="amount"
                left={(props) => (
                  <Input.Icon Icon="Ionicons" name="cash-outline" {...props} />
                )}
                keyboardType="numeric"
                formik={f}
                style={{
                  width: Layout.screen.width - 30,
                }}
              />

              <Select
                selected={["Food"]}
                setSelected={() => {}}
                options={["Food", "Transport", "Debt", "Night out"]}
                transparentOverlay
                closeOnSelect
              />
            </View>

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
    </ScreenContainer>
  );
}
