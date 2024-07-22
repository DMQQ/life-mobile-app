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
  });
});
