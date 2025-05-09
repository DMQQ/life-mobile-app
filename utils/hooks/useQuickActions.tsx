import { RootStackParamList } from "@/types";
import { NavigationContainerRef } from "@react-navigation/native";
import * as QuickActions from "expo-quick-actions";
import moment from "moment";
import { useEffect } from "react";
import { Platform } from "react-native";

export default function useQuickActions(navigationRef: React.RefObject<NavigationContainerRef<RootStackParamList>>) {
  const setupQuickActions = () => {
    const initial = QuickActions.initial;

    if (initial) {
      handleQuickAction(initial);
    }

    const listener = QuickActions.addListener(handleQuickAction);

    QuickActions.setItems([
      {
        title: "Wallet",
        subtitle: "Create expense or income",
        icon: Platform.OS === "ios" ? "symbol:plus.circle" : undefined,
        id: "0",
      },
      {
        title: "Timeline",
        subtitle: "Create a new entry",
        icon: Platform.OS === "ios" ? "symbol:plus.circle" : undefined,
        id: "1",
      },
      {
        title: "Goals",
        subtitle: "Create a new goal",
        icon: Platform.OS === "ios" ? "symbol:plus.circle" : undefined,
        id: "2",
      },
    ]);

    return listener;
  };

  const handleQuickAction = (action: QuickActions.Action) => {
    setTimeout(() => {
      if (!action || !navigationRef.current) return;

      switch (action?.id) {
        case "0":
          navigationRef.current?.navigate<any>({
            name: "WalletScreens",
            params: {
              expenseId: null,
            },
          });
          break;
        case "1":
          navigationRef.current.navigate({
            name: "TimelineScreens",
            params: {
              selectedDate: moment(new Date()).format("YYYY-MM-DD"),
            },
          });
          break;
        case "2":
          navigationRef.current.navigate<any>({
            name: "GoalsScreens",
            params: {
              selectedDate: moment(new Date()).format("YYYY-MM-DD"),
            },
          });
          break;
        default:
          break;
      }
    }, 300);
  };

  useEffect(() => {
    const listener = setupQuickActions();

    return () => listener.remove();
  }, []);
}
