import { FormikHelpers, FormikProps, useFormik } from "formik";
import Input from "../../../../../components/ui/TextInput/TextInput";
import {
  View,
  TextStyle,
  StyleProp,
  StyleSheet,
  useAnimatedValue,
} from "react-native";
import ValidatedInput from "../../../../../components/ui/ValidatedInput";
import Button from "../../../../../components/ui/Button/Button";
import useCreateActivity from "../../hooks/useCreateActivity";
import * as yup from "yup";
import SegmentedButtons from "../../../../../components/ui/SegmentedButtons";
import BottomSheet, {
  BottomSheetGorhom,
} from "@/components/ui/BottomSheet/BottomSheet";
import { forwardRef, useEffect, useState } from "react";
import Select from "../../../../../components/ui/Select/Select";
import { Text } from "react-native";
import { Icons } from "./WalletItem";
import { useBottomSheet } from "@gorhom/bottom-sheet";
import Colors from "@/constants/Colors";
import Layout from "@/constants/Layout";
import { Calendar } from "react-native-calendars";
import Ripple from "react-native-material-ripple";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";

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
  date: new Date().toISOString().split("T")[0],
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
                setShowCalendar(!showCalendar);
              }}
              style={{
                backgroundColor: showCalendar
                  ? Colors.secondary
                  : Colors.primary_light,
                padding: 10,
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 10,
                marginBottom: 10,
                width: 50,
              }}
            >
              <AntDesign name="calendar" color={"#fff"} size={18} />
            </Ripple>
          </View>

          {showCalendar ? (
            <>
              <View>
                <Calendar
                  current={f.values.date}
                  onDayPress={(day) => {
                    f.setFieldValue("date", day.dateString);
                  }}
                  markedDates={{
                    [f.values.date]: {
                      selected: true,
                      selectedColor: Colors.secondary,
                    },
                  }}
                  theme={styles.calendar}
                  style={{ borderRadius: 10, marginTop: 10 }}
                />
              </View>
            </>
          ) : (
            <>
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
                    <Input.Icon
                      Icon="Ionicons"
                      name="cash-outline"
                      {...props}
                    />
                  )}
                  keyboardType="numeric"
                  formik={f}
                />

                <Text style={label}>Category</Text>
                <Select
                  placeholderText="Choose category or create your own"
                  onFocusChange={(focused) => {
                    snapToIndex(focused ? 1 : 0);
                  }}
                  selected={[f.values.category]}
                  setSelected={([selected]) =>
                    f.setFieldValue("category", selected)
                  }
                  options={Object.keys(Icons)}
                  transparentOverlay
                  closeOnSelect
                  maxSelectHeight={250}
                  containerStyle={{ borderRadius: 10 }}
                />
              </View>

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
            </>
          )}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  calendar: {
    backgroundColor: Colors.primary_light,
    calendarBackground: Colors.primary_light,
    dayTextColor: "#fff",
    textDisabledColor: "#5e5e5e",
    monthTextColor: Colors.secondary,
    textMonthFontSize: 20,
    textMonthFontWeight: "bold",
    selectedDayBackgroundColor: Colors.secondary,
    arrowColor: Colors.secondary,
    borderRadius: 15,
  },
});

export default AddExpenseBottomSheet;
