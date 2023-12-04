import ErrorMessageModal from "../../../components/Forms/ErrorMessageModal";
import LoginForm from "../../../components/Forms/LoginForm";
import Modal from "../../../components/ui/Modal";
import ScreenContainer from "../../../components/ui/ScreenContainer";
import Colors from "../../../constants/Colors";
import useAuthForm from "../../../utils/hooks/useAuthForm";

import { ActivityIndicator } from "react-native";

export default function Login() {
  const { validationSchema, onSubmit, state } = useAuthForm("login");

  return (
    <ScreenContainer>
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
      />

      <LoginForm onSubmit={onSubmit} validationSchema={validationSchema} />
    </ScreenContainer>
  );
}
