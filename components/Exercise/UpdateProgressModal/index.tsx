import { Text, View, Animated, Keyboard } from "react-native";
import Modal from "react-native-modal";
import Layout from "../../../constants/Layout";
import { Formik } from "formik";
import ValidatedInput from "../../ui/ValidatedInput";
import Colors from "../../../constants/Colors";
import Button from "../../ui/Button/Button";
import * as yup from "yup";
import useKeyboard from "../../../utils/hooks/useKeyboard";

import { useEffect, useRef } from "react";
import Input, { RenderComponentProps } from "../../ui/TextInput/TextInput";
import useUpdateProgress from "./useUpdateProgress";

interface UpdateProgressModalProps {
  exerciseId: string;
  onDismiss: () => void;
  isVisible: boolean;

  workoutId: string;
}

const initialState = {
  sets: "",
  reps: "",
  weight: "",
};

const padding = 10;

const validationSchema = yup.object().shape({
  sets: yup.number().positive().integer().required(),
  reps: yup.number().positive().integer().required(),
  weight: yup.number().positive().required(),
});

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export default function UpdateProgressModal({
  exerciseId,
  workoutId,
  ...rest
}: UpdateProgressModalProps) {
  const { onSubmit } = useUpdateProgress({ exerciseId, workoutId, ...rest });

  const keyboard = useKeyboard();

  const keyboardAnimatedValue = useRef(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(keyboardAnimatedValue.current, {
      toValue: keyboard ? -100 : 0,
      duration: 100,
      useNativeDriver: true,
    }).start();
  }, [keyboard]);

  return (
    <Modal
      backdropOpacity={0.9}
      onBackdropPress={rest.onDismiss}
      avoidKeyboard
      // statusBarTranslucent
      deviceHeight={Layout.screen.height}
      useNativeDriver
      hideModalContentWhileAnimating
      animationIn="slideInUp"
      animationOut="slideOutDown"
      onBackButtonPress={rest.onDismiss}
      deviceWidth={Layout.screen.width}
      {...rest}
    >
      <Animated.View
        style={[
          {
            backgroundColor: Colors.primary,
            padding,
            borderRadius: 5,
            position: "relative",
          },
          { transform: [{ translateY: keyboardAnimatedValue.current }] },
        ]}
      >
        <Text
          style={{
            color: Colors.foreground,
            fontSize: 30,
            fontWeight: "bold",
            marginBottom: 20,
          }}
        >
          Save workout progress
        </Text>
        <Formik
          validationSchema={validationSchema}
          onSubmit={onSubmit}
          initialValues={initialState}
        >
          {(f) => {
            const color = (p: RenderComponentProps) =>
              p.isError
                ? Colors.error
                : p.isFocused
                ? Colors.secondary
                : Colors.primary_lighter;

            return (
              <>
                {Object.keys(initialState).map((key) => (
                  <ValidatedInput
                    right={(props) => (
                      <Input.Icon
                        name="numeric"
                        Icon="MaterialCommunityIcons"
                        {...props}
                      />
                    )}
                    left={(props) => (
                      <Text
                        style={{
                          color: color(props),
                          fontSize: 18,
                        }}
                      >
                        {capitalize(key)}:
                      </Text>
                    )}
                    keyboardAppearance="dark"
                    keyboardType="numeric"
                    key={key}
                    formik={f}
                    name={key}
                    style={{ width: Layout.screen.width * 0.9 - padding * 2 }}
                  />
                ))}
                <Button
                  disabled={!(f.isValid && f.dirty)}
                  style={{ marginTop: 20 }}
                  type="contained"
                  color="primary"
                  onPress={() => f.handleSubmit()}
                >
                  add
                </Button>
              </>
            );
          }}
        </Formik>
      </Animated.View>
    </Modal>
  );
}
