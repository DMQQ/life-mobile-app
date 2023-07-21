import ValidatedInput from "../../ui/ValidatedInput";
import { Formik } from "formik";
import { View } from "react-native";
import * as Icons from "@expo/vector-icons";
import { useState } from "react";
import Colors from "../../../constants/Colors";
import IconButton from "../../ui/IconButton/IconButton";
import Button from "../../ui/Button/Button";
import { Theme } from "../../../utils/context/ThemeContext";
import Input from "../../ui/TextInput/TextInput";

interface LoginFormProps {
  validationSchema: any;

  onSubmit(values: { email: string; password: string }): void;
}

export default function LoginForm({
  validationSchema,
  onSubmit,
}: LoginFormProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <Formik
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
            left={(props) => <Input.Icon {...props} name="mail" />}
            placeholder="email"
            name="email"
            formik={f}
          />
          <ValidatedInput
            left={(props) => <Input.Icon {...props} name="lock" />}
            right={(props) => (
              <IconButton
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                icon={
                  <Input.Icon
                    {...props}
                    name={isPasswordVisible ? "eyeo" : "eye"}
                  />
                }
              />
            )}
            placeholder="********"
            name="password"
            secureTextEntry={!isPasswordVisible}
            formik={f}
          />

          <Button
            disabled={!(f.isValid && f.dirty)}
            onPress={() => f.handleSubmit()}
            size="xl"
            type="contained"
            color="primary"
            style={{ marginTop: 10 }}
          >
            LOGIN
          </Button>
        </View>
      )}
    </Formik>
  );
}
