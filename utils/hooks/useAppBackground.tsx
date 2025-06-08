import { useEffect } from "react";
import { AppState } from "react-native";

export default function useAppBackground({ onBackground, onForeground }: { onBackground?: () => void; onForeground?: () => void }) {
  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "background") {
        if (onBackground) {
          onBackground();
        }
      } else if (nextAppState === "active") {
        if (onForeground) {
          onForeground();
        }
      }
    });

    return () => {
      sub.remove;
    };
  }, []);
}
