import "@testing-library/jest-dom";
import React from "react";
import {
  fireEvent,
  render,
  waitFor,
  screen,
} from "@testing-library/react-native";
import Button from "../ui/Button/Button";
import Colors from "@/constants/Colors";

describe("Button", () => {
  it("should render correctly", async () => {
    render(<Button>Hello</Button>);

    const element = await screen.findByText(/Hello/gi);

    expect(element).toBeTruthy();
  });

  it("should render correctly with primary variant", async () => {
    const onPress = jest.fn();

    render(
      <Button variant="primary" onPress={onPress}>
        Hello
      </Button>
    );

    const element = await screen.findByText(/Hello/gi);

    fireEvent.press(element);

    expect(onPress).toHaveBeenCalled();
  });
});
