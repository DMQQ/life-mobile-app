import * as Notifications from "expo-notifications";
import { Platform, ToastAndroid } from "react-native";
import useUser from "./useUser";
import { gql, useMutation } from "@apollo/client";

const NOTIFICATION_KEY = "FitnessApp:notifications";

export default function useNotifications() {
  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    token = await Notifications.getExpoPushTokenAsync({
      projectId: require("../../app.json")?.expo?.extra?.eas?.projectId,
    });

    return token.data;
  }

  const usr = useUser();

  const [create] = useMutation(
    gql`
      mutation createNotification($token: String!) {
        setNotificationsToken(token: $token)
      }
    `,
    {
      context: {
        headers: {
          authentication: usr.token,
        },
      },
    }
  );

  async function sendTokenToServer() {
    let token: string | undefined;
    try {
      token = await registerForPushNotificationsAsync();

      if (token) await create({ variables: { token } });

      ToastAndroid.show("Token: " + token, ToastAndroid.SHORT);
    } catch (error) {
      ToastAndroid.show(
        "Notifcations disabled: Couln't upload token \n" + token,
        ToastAndroid.SHORT
      );
    }
  }

  return {
    getNotifiToken: registerForPushNotificationsAsync,
    sendTokenToServer,
  };
}
