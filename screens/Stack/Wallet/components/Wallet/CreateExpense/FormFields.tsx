import Select from "@/components/ui/Select/Select";
import ValidatedInput from "@/components/ui/ValidatedInput";
import { Text, View } from "react-native";
import { CategoryIcon, Icons } from "../WalletItem";
import { FormikProps } from "formik";
import { memo } from "react";
import Colors from "@/constants/Colors";
import Color from "color";
import lowOpacity from "@/utils/functions/lowOpacity";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Layout from "@/constants/Layout";
import Animated, { FadeInDown, SlideInDown, SlideOutDown } from "react-native-reanimated";
import Button from "@/components/ui/Button/Button";
import CategorySelect from "../CategorySelect";

const FormFields = ({
  f,
  onFocusChange,
}: {
  f: FormikProps<{
    name: string;
    amount: string;
    type: string;
    category: string;
    date: string;
    schedule: boolean;
  }>;
  onFocusChange: (focused: boolean) => void;
}) => {
  return (
    <Animated.View entering={SlideInDown} exiting={SlideOutDown}>
      <ValidatedInput
        showLabel
        label="Purchase's name"
        placeholder="Like 'new phone', 'christmas gift'..."
        name="name"
        left={(props) => <ValidatedInput.Icon Icon="AntDesign" name="wallet" {...props} />}
        formik={f}
      />

      <ValidatedInput
        showLabel
        label="Amount (zł)"
        placeholder="How much have you spent?"
        name="amount"
        left={(props) => <ValidatedInput.Icon Icon="Ionicons" name="cash-outline" {...props} />}
        keyboardType="numeric"
        formik={f}
      />

      {f.values.type === "expense" && (
        <Animated.View entering={SlideInDown} exiting={SlideOutDown} style={{ zIndex: 1000 }}>
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

          <CategorySelect
            selected={[f.values.category]}
            onFocusChange={onFocusChange}
            setSelected={([selected]) => f.setFieldValue("category", selected)}
            isActive={(category) => f.values.category === category}
          />
        </Animated.View>
      )}
      {f.isValid && f.dirty && (
        <Animated.View entering={SlideInDown} exiting={SlideOutDown} style={{ marginTop: 10 }}>
          <Button
            disabled={!(f.isValid && f.dirty)}
            fontStyle={{ fontSize: 16 }}
            style={{ marginTop: 15 }}
            onPress={() => {
              f.handleSubmit();
            }}
          >
            Create expense
          </Button>
        </Animated.View>
      )}
    </Animated.View>
  );
};

export default memo(FormFields);
