import { Formik } from "formik";
import { View } from "react-native";

import { useState } from "react";
import ValidatedInput from "../../../../components/ui/ValidatedInput";
import Button from "../../../../components/ui/Button/Button";
import Input from "../../../../components/ui/TextInput/TextInput";
import Layout from "@/constants/Layout";
import Colors from "@/constants/Colors";
import Color from "color";
import { useNavigation } from "@react-navigation/native";
import ChangeButton from "./ChangeButton";

interface RegisterFormProps {
  validationSchema: any;

  onSubmit(values: { email: string; password: string }): void;
}

export default function RegisterForm({
  onSubmit,
  validationSchema,
}: RegisterFormProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const navigation = useNavigation<any>();

  return (
    <Formik
      onSubmit={onSubmit}
      validationSchema={validationSchema}
      initialValues={{
        email: "",
        password: "",
        confirm_password: "",
      }}
    >
      {(f) => (
        <View>
          <ValidatedInput
            label="Email"
            showLabel
            left={(props) => <Input.Icon name="user" {...props} />}
            placeholder="eg john.doe@gmail.com"
            name="email"
            formik={f}
          />
          <ValidatedInput
            showLabel
            label="Password"
            left={(props) => <Input.Icon name="lock" {...props} />}
            right={(props) => (
              <Input.Icon
                onPress={() => setIsPasswordVisible((prev) => !prev)}
                Icon="Feather"
                name={isPasswordVisible ? "eye-off" : "eye"}
                {...props}
              />
            )}
            placeholder="*******"
            name="password"
            formik={f}
            secureTextEntry={!isPasswordVisible}
          />
          <ValidatedInput
            showLabel
            label="Repeat password"
            left={(props) => <Input.Icon name="lock" {...props} />}
            right={(props) => (
              <Input.Icon
                onPress={() => setIsPasswordVisible((prev) => !prev)}
                Icon="Feather"
                name={isPasswordVisible ? "eye-off" : "eye"}
                {...props}
              />
            )}
            placeholder="*******"
            name="confirm_password"
            formik={f}
            secureTextEntry={!isPasswordVisible}
          />

          <Button
            disabled={!(f.isValid && f.dirty)}
            onPress={() => f.handleSubmit()}
            size="xl"
            type="contained"
            color="ternary"
            style={{ marginTop: 10, borderRadius: 100 }}
          >
            Register now
          </Button>

          <ChangeButton displayText="Or login instead" navigateTo="Login" />
        </View>
      )}
    </Formik>
  );
}
