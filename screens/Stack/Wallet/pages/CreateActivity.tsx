import { Formik } from "formik";
import ScreenContainer from "../../../../components/ui/ScreenContainer";
import Input from "../../../../components/ui/TextInput/TextInput";
import { View, Text } from "react-native";
import ValidatedInput from "../../../../components/ui/ValidatedInput";
import Button from "../../../../components/ui/Button/Button";
import Colors from "../../../../constants/Colors";
import * as yup from "yup";
import SegmentedButtons from "../../../../components/ui/SegmentedButtons";
import Color from "color";
import Select from "@/components/ui/Select/Select";
import Layout from "@/constants/Layout";
import { Icons } from "../components/WalletItem";
import useUser from "@/utils/hooks/useUser";
import { gql, useMutation } from "@apollo/client";

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

const useEditExpense = () => {
  const user = useUser();

  const [editExpense, { error }] = useMutation(
    gql`
      mutation EditExpense(
        $amount: Float!
        $description: String!
        $type: String!
        $category: String!
        $expenseId: ID!
      ) {
        editExpense(
          amount: $amount
          description: $description
          type: $type
          category: $category
          expenseId: $expenseId
        ) {
          id
        }
      }
    `,
    {
      refetchQueries: ["GetWallet"],

      onError(err) {
        console.log(JSON.stringify(err, null, 2));
      },
    }
  );

  return editExpense;
};

export default function CreateActivity({ navigation, route: { params } }: any) {
  const editExpense = useEditExpense();

  const onSubmit = async (values: any, { resetForm }: any) => {
    await editExpense({
      variables: {
        amount: Number(values.amount),
        description: values.name,
        type: values.type,
        category: values.category,
        expenseId: params.edit.id,
      },
    });

    resetForm();

    navigation.goBack();
  };

  return (
    <ScreenContainer style={{ paddingHorizontal: 15, paddingVertical: 0 }}>
      <Text
        style={{
          color: "#fff",
          fontSize: 35,
          marginBottom: 15,
          fontWeight: "bold",
        }}
      >
        Edit expense
      </Text>

      <Formik
        validationSchema={schema}
        onSubmit={onSubmit}
        enableReinitialize
        initialValues={{
          name: params.edit.description,
          amount: params.edit.amount,
          type: params.edit.type,
          category: params.edit.category,
        }}
      >
        {(f) => (
          <View style={{ flex: 1, paddingBottom: 25 }}>
            <View style={{ flex: 1 }}>
              <SegmentedButtons
                buttonStyle={{
                  height: 45,
                }}
                buttonTextStyle={{
                  fontSize: 16,
                  fontWeight: "400",
                }}
                buttons={SegmentVariants}
                onChange={(value) => f.setFieldValue("type", value)} // property cant be changed in edit mode
                value={f.values.type}
              />

              <ValidatedInput
                showLabel
                label="Purchase's name"
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
                showLabel
                label="Amount (zł)"
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

              <Text
                style={{
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: "bold",
                  padding: 5,
                }}
              >
                Category
              </Text>
              <Select
                placeholderText="Choose category or create your own"
                selected={[f.values.category]}
                setSelected={([selected]) =>
                  f.setFieldValue("category", selected)
                }
                options={Object.keys(Icons)}
                transparentOverlay
                closeOnSelect
                maxSelectHeight={250}
              />
            </View>

            <Button
              disabled={!(f.isValid && f.dirty)}
              type="contained"
              color="primary"
              onPress={() => {
                f.handleSubmit();
              }}
              fontStyle={{ fontSize: 15 }}
              style={{
                marginTop: 20,
                paddingVertical: 15,
                backgroundColor: !(f.isValid && f.dirty)
                  ? Color(Colors.secondary).alpha(0.2).string()
                  : Colors.secondary,
              }}
            >
              Save changes
            </Button>
          </View>
        )}
      </Formik>
    </ScreenContainer>
  );
}
