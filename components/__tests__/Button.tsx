import "@testing-library/jest-dom";
import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import Button from "../ui/Button/Button";
import Colors from "@/constants/Colors";

describe("Button", () => {
  it("should render correctly", () => {
    const { getByText } = render(<Button>Hello</Button>);

    expect(getByText("Hello")).toBeTruthy();
  });

  it("should render correctly with primary variant", async () => {
    const onPress = jest.fn();

    const { getByTestId } = render(
      <Button variant="primary" onPress={onPress}>
        Hello
      </Button>
    );

    await waitFor(() => {
      fireEvent.press(getByTestId("Button"));

      expect(onPress).toHaveBeenCalled();
    });
  });
});
