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
    <>
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
            maxSelectHeight={Layout.screen.height * 0.35}
            containerStyle={{ borderRadius: 10 }}
            keyExtractor={(item) => item}
            renderDefaultItem={false}
            renderItem={(item) => (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderBottomWidth: 0.5,
                  borderBottomColor: Color(Colors.primary).lighten(4).hex(),
                  padding: 5,
                  backgroundColor: f.values.category === item.item ? lowOpacity(Colors.secondary, 0.2) : Colors.primary_lighter,
                }}
              >
                <CategoryIcon type="expense" category={item.item} clear />
                <Text style={{ color: "#fff", fontSize: 16, marginLeft: 10, fontWeight: "bold" }}>{item.item}</Text>
                {f.values.category === item.item && (
                  <MaterialCommunityIcons name="check" size={25} color={Colors.secondary} style={{ position: "absolute", right: 25 }} />
                )}
              </View>
            )}
          />
        </>
      )}
    </>
  );
};

export default memo(FormFields);
