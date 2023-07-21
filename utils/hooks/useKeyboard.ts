import { useState, useEffect } from "react";

import { Keyboard } from "react-native";

export default function useKeyboard() {
  const [keyboardStatus, setKeyboardStatus] = useState<boolean>();

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardStatus(true);
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardStatus(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return keyboardStatus;
}
