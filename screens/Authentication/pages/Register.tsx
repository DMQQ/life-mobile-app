import ScreenContainer from "@/components/ui/ScreenContainer";
import Colors from "@/constants/Colors";
import RegisterForm from "../components/RegisterForm";
import useAuthForm from "../hooks/useAuthForm";
import Modal from "@/components/ui/Modal";

import { ActivityIndicator } from "react-native";
import ErrorMessageModal from "@/screens/Authentication/components/ErrorMessageModal";

export default function Register() {
  const { onSubmit, validationSchema, state, savedCredentials } = useAuthForm("register");

  function clear() {
    state.reset();
  }

  return (
    <ScreenContainer>
      <Modal isVisible={state.loading}>
        <ActivityIndicator size="large" color={"purple"} />
      </Modal>

      <ErrorMessageModal
        errorMessage={state.error?.message || "Something went wrong"}
        isError={!!state.error && state.called}
        onDismiss={() => state.reset()}
        typeOfError="Creating account failed"
        onRetry={() => onSubmit(savedCredentials)}
      />

      <RegisterForm onSubmit={onSubmit} validationSchema={validationSchema} />
    </ScreenContainer>
  );
}
