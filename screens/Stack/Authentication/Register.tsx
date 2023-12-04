import ScreenContainer from "../../../components/ui/ScreenContainer";
import Colors from "../../../constants/Colors";
import RegisterForm from "../../../components/Forms/RegisterForm";
import useAuthForm from "../../../utils/hooks/useAuthForm";
import Modal from "../../../components/ui/Modal";

import { ActivityIndicator } from "react-native";

export default function Register() {
  const { onSubmit, validationSchema, state } = useAuthForm("register");

  const error = state.error?.graphQLErrors[0]?.message;

  function clear() {
    state.reset();
  }

  return (
    <ScreenContainer>
      <Modal isVisible={state.loading}>
        <ActivityIndicator size="large" color={"purple"} />
      </Modal>
      <RegisterForm onSubmit={onSubmit} validationSchema={validationSchema} />
    </ScreenContainer>
  );
}
