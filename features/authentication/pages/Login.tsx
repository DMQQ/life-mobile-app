import ErrorMessageModal from "../components/ErrorMessageModal";
import LoginForm from "../components/LoginForm";
import Modal from "@/components/ui/Modal";
import ScreenContainer from "@/components/ui/ScreenContainer";
import Colors from "@/constants/Colors";
import useAuthForm from "../hooks/useAuthForm";

import { ActivityIndicator, View } from "react-native";

export default function Login() {
  const { validationSchema, onSubmit, state, savedCredentials } = useAuthForm("login");

  return (
    <View style={{ flex: 1, padding: 15 }}>
      <Modal isVisible={state.loading && state.called}>
        <ActivityIndicator size={"large"} color={Colors.secondary} />
      </Modal>

      <ErrorMessageModal
        errorMessage={state.error?.message || "Error logging in"}
        isError={!!state.error && state.called}
        typeOfError="Login Error"
        onDismiss={() => {
          state.reset();
        }}
        onRetry={() => onSubmit(savedCredentials)}
      />

      <LoginForm onSubmit={onSubmit} validationSchema={validationSchema} />
    </View>
  );
}
