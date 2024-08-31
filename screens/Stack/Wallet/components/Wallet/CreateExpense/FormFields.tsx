import Select from "@/components/ui/Select/Select";
import ValidatedInput from "@/components/ui/ValidatedInput";
import { Text, View } from "react-native";
import { Icons } from "../WalletItem";
import { FormikProps } from "formik";
import { memo } from "react";

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
  }>;
  onFocusChange: (focused: boolean) => void;
}) => {
  return (
    <>
      <ValidatedInput
        showLabel
        label="Purchase's name"
        placeholder="Like 'new phone', 'christmas gift'..."
        name="name"
        left={(props) => (
          <ValidatedInput.Icon Icon="AntDesign" name="wallet" {...props} />
        )}
        formik={f}
      />

      <ValidatedInput
        showLabel
        label="Amount (zł)"
        placeholder="How much have you spent?"
        name="amount"
        left={(props) => (
          <ValidatedInput.Icon Icon="Ionicons" name="cash-outline" {...props} />
        )}
        keyboardType="numeric"
        formik={f}
      />

      {f.values.type === "expense" && (
        <>
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
            placeholderText="Choose category"
            onFocusChange={onFocusChange}
            selected={[f.values.category]}
            setSelected={([selected]) => f.setFieldValue("category", selected)}
            options={Object.keys(Icons)}
            transparentOverlay
            closeOnSelect
            maxSelectHeight={360}
            containerStyle={{ borderRadius: 10 }}
            keyExtractor={(item) => item}
          />
        </>
      )}
    </>
  );
};

export default memo(FormFields);
