import * as Notifications from "expo-notifications";
import { Platform, ToastAndroid } from "react-native";
import useUser from "./useUser";
import { gql, useMutation } from "@apollo/client";
import Constants from "expo-constants";

const NOTIFICATION_KEY = "FitnessApp:notifications";

export default function useNotifications() {
  async function registerForPushNotificationsAsync() {
    let token;

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
      projectId: Constants?.expoConfig?.extra?.eas?.projectId as string,
    });

    // console.log(
    //   JSON.stringify(await Notifications.getDevicePushTokenAsync(), null, 2)
    // );

    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    return token.data;
  }

  const usr = useUser();

  const [create] = useMutation(
    gql`
      mutation createNotification($token: String!) {
        setNotificationsToken(token: $token)
      }
    `
  );

  async function sendTokenToServer() {
    let token: string | undefined;
    try {
      token = await registerForPushNotificationsAsync();

      if (token) await create({ variables: { token } });

      // ToastAndroid.show("Token: " + token, ToastAndroid.SHORT);
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
