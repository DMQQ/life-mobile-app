import { Formik } from "formik";
import ScreenContainer from "../../../components/ui/ScreenContainer";
import Input from "../../../components/ui/TextInput/TextInput";
import { View, Text } from "react-native";

import ValidatedInput from "../../../components/ui/ValidatedInput";
import Button from "../../../components/ui/Button/Button";
import Ripple from "react-native-material-ripple";
import Colors from "../../../constants/Colors";
import useCreateActivity from "./hooks/useCreateActivity";

import * as yup from "yup";
import SegmentedButtons from "../../../components/ui/SegmentedButtons";
import Color from "color";

const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  amount: yup.number().positive().required("Amount is required"),
  type: yup.string().required("Type is required"),
});

export default function CreateActivity({ navigation }: any) {
  const { createExpense } = useCreateActivity();

  return <ScreenContainer></ScreenContainer>;
}
