import ValidatedInput from "@/components/ui/ValidatedInput";
import { Formik } from "formik";
import { View } from "react-native";
import { useState } from "react";
import IconButton from "@/components/ui/IconButton/IconButton";
import Button from "@/components/ui/Button/Button";
import Input from "@/components/ui/TextInput/TextInput";
import { useNavigation } from "@react-navigation/native";
import ChangeButton from "./ChangeButton";

interface LoginFormProps {
  validationSchema: any;

  onSubmit(values: { email: string; password: string }): void;
}

export default function LoginForm({ validationSchema, onSubmit }: LoginFormProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <Formik
      validateOnChange
      onSubmit={onSubmit}
      validationSchema={validationSchema}
      initialValues={{
        email: "",
        password: "",
      }}
    >
      {(f) => (
        <View>
          <ValidatedInput
            label="Email"
            showLabel
            left={(props) => <Input.Icon {...props} name="mail" />}
            placeholder="email"
            name="email"
            formik={f}
            testID="email-input"
            autoCapitalize="none"
          />
          <ValidatedInput
            showLabel
            label="Password"
            left={(props) => <Input.Icon {...props} name="lock" />}
            right={(props) => (
              <IconButton
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                icon={<Input.Icon {...props} name={isPasswordVisible ? "eyeo" : "eye"} />}
              />
            )}
            placeholder="********"
            name="password"
            // secureTextEntry={!isPasswordVisible}
            formik={f}
            testID="password-input"
            autoCapitalize="none"
          />

          <Button
            testID={"login-button"}
            disabled={!(f.isValid && f.dirty)}
            onPress={() => f.handleSubmit()}
            fontStyle={{ fontSize: 16 }}
            type="contained"
            color="ternary"
            style={{ marginTop: 10 }}
          >
            LOGIN
          </Button>

          <ChangeButton displayText="Or sign up instead" navigateTo="Register" />
        </View>
      )}
    </Formik>
  );
}
