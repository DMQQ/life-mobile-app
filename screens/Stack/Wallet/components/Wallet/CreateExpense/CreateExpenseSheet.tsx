import { FormikHelpers, FormikProps, useFormik } from "formik";
import { View, StyleSheet } from "react-native";
import Button from "@/components/ui/Button/Button";
import useCreateActivity from "../../../hooks/useCreateActivity";
import * as yup from "yup";
import SegmentedButtons from "@/components/ui/SegmentedButtons";
import BottomSheet, {
  BottomSheetGorhom,
} from "@/components/ui/BottomSheet/BottomSheet";
import { forwardRef, useState } from "react";
import { useBottomSheet } from "@gorhom/bottom-sheet";
import Colors from "@/constants/Colors";
import Layout from "@/constants/Layout";
import Ripple from "react-native-material-ripple";
import Animated from "react-native-reanimated";
import { AntDesign } from "@expo/vector-icons";
import moment from "moment";
import ChooseDate from "./ChooseDate";
import FormFields from "./FormFields";
import { useIsFocused } from "@react-navigation/native";

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
  date: moment().add(2, "hours").toISOString(),
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

  const onSubmit = async (
    values: typeof initialValues,
    { resetForm }: FormikHelpers<typeof initialValues>
  ) => {
    try {
      await createExpense({
        variables: {
          amount: +values.amount,
          description: values.name,
          type: values.type,
          category: values.category,
          date: values.date,
        },
      });

      (ref as any).current?.forceClose();

      resetForm();

      reset();
    } catch (error) {}
  };

  const f = useFormik({
    validationSchema: schema,
    onSubmit: onSubmit,
    initialValues: initialValues,
  });

  const isFocused = useIsFocused();

  if (!isFocused) return null;

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

const Form = ({ formik: f }: FormProps) => {
  const { snapToIndex } = useBottomSheet();
  const [showCalendar, setShowCalendar] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      <Animated.View
        style={[
          {
            flex: 1,
          },
        ]}
      >
        <View style={{ paddingHorizontal: 15, width: Layout.screen.width }}>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <SegmentedButtons
              buttons={SegmentVariants}
              onChange={(value) => f.setFieldValue("type", value)}
              value={f.values.type}
              containerStyle={{
                borderRadius: 12.5,
                width: Layout.screen.width - 30 - 10 - 50,
              }}
              buttonStyle={{ height: 45, borderRadius: 10, padding: 5 }}
              buttonTextStyle={{ fontSize: 14 }}
            />
            <Ripple
              onPress={() => {
                setShowCalendar((prev) => !prev);
              }}
              style={[
                {
                  backgroundColor: showCalendar
                    ? Colors.secondary
                    : Colors.primary_light,
                },
                styles.calendarButton,
              ]}
            >
              <AntDesign name="calendar" color={"#fff"} size={18} />
            </Ripple>
          </View>

          {showCalendar ? (
            <ChooseDate
              date={moment(f.values.date).format("YYYY-MM-DD")}
              onDismissCalendar={() => setShowCalendar(false)}
              setDateField={(date) => {
                f.setFieldValue(
                  "date",
                  moment(date).add(2, "hours").toISOString()
                );
                console.log(moment(date).toISOString());
              }}
            />
          ) : (
            <>
              <FormFields
                onFocusChange={(focused) => {
                  snapToIndex(focused ? 1 : 0);
                }}
                f={f}
              />

              <Button
                disabled={!(f.isValid && f.dirty)}
                fontStyle={{ fontSize: 16 }}
                onPress={() => {
                  f.handleSubmit();
                }}
                style={{
                  marginTop: 20,
                }}
              >
                Create expense
              </Button>
            </>
          )}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  calendarButton: {
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginBottom: 10,
    width: 50,
  },
});

export default AddExpenseBottomSheet;
