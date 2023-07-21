import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect } from "react";
import { BackHandler } from "react-native";

export default function useGoBackOnBackPress(routeName?: string, params?: any) {
  const navigation = useNavigation<any>();
  const route = useRoute();

  useEffect(() => {
    const event = BackHandler.addEventListener("hardwareBackPress", () => {
      if (navigation.canGoBack()) {
        if (!!routeName || !!(routeName && params)) {
          navigation.navigate(routeName, params);
        } else {
          navigation.goBack();
        }

        return true;
      }
      return false;
    });

    return () => event.remove();
  }, [navigation, route]);

  return null;
}
