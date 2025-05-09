import { navigationRef } from "@/navigation";
import { useEffect } from "react";
import * as Linking from "expo-linking";

export default function useDeeplinking() {
  useEffect(() => {
    const handleDeepLink = async ({ url }: { url: string }) => {
      if (!url) return;

      setTimeout(() => {
        if (url.includes("wallet/create-expense")) {
          navigationRef.current?.navigate<any>({
            name: "WalletScreens",
            params: {
              expenseId: null,
            },
          });
        } else if (url.includes("wallet/expense/id/")) {
          const expenseId = url.split("/").pop();

          navigationRef.current?.navigate<any>("WalletScreens", {
            screen: "Wallet",
            params: { expenseId },
          });
        } else if (url.includes("timeline/id/")) {
          const timelineId = url.split("/").pop();

          navigationRef.current?.navigate("TimelineScreens", {
            timelineId,
          });
        } else if (url.includes("timeline")) {
          navigationRef.current?.navigate("TimelineScreens", {
            screen: "",
          });
        }
      }, 300);
    };

    const subscription = Linking.addEventListener("url", handleDeepLink);

    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const linking = {
    prefixes: ["mylife://", "https://life.dmqq.dev"],
    config: {
      screens: {
        WalletScreens: "wallet",
        TimelineScreens: "timeline",
        Root: "home",
        GoalsScreens: "goals",
        NotesScreens: "notes",
        Settings: "settings",
      },
    },
  };

  return linking;
}
