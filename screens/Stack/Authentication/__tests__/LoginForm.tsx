import "@testing-library/jest-dom";
import {
  act,
  fireEvent,
  render,
  waitFor,
  screen,
} from "@testing-library/react-native";
import LoginForm from "../components/LoginForm";
import { validationSchema } from "../hooks/useAuthForm";

jest.mock("@react-navigation/native", () => ({
  useNavigation: jest.fn(),
}));

jest.mock("@expo/vector-icons");

describe("LoginForm", () => {
  it("should render correctly", async () => {
    const onSubmit = jest.fn();
    render(
      <LoginForm
        validationSchema={validationSchema("login")}
        onSubmit={onSubmit}
      />
    );
    expect(screen.getByText("Email")).toBeTruthy();
    expect(screen.getByText("Password")).toBeTruthy();

    await act(async () => {
      fireEvent.changeText(screen.getByTestId("email-input"), "test@gmail.com");
      fireEvent.changeText(screen.getByTestId("password-input"), "123456");

      const email = await screen.findByTestId("email-input");

      expect(email.props.value).toBe("test@gmail.com");

      const password = await screen.findByTestId("password-input");

      expect(password.props.value).toBe("123456");

      fireEvent.press(screen.getByTestId("login-button"));

      const button = await screen.findByTestId("login-button");
      fireEvent.press(button);

      expect(button.props.accessibilityState.disabled).toBe(false);

      expect(onSubmit).toHaveBeenCalled();
    });
  });
});
