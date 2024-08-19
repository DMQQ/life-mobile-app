import * as Notifications from "expo-notifications";
import { Platform, ToastAndroid } from "react-native";
import { gql, useMutation } from "@apollo/client";
import Constants from "expo-constants";
import { useEffect, useRef, useState } from "react";
import { NavigationContainerRef } from "@react-navigation/native";
import { RootStackParamList } from "@/types";

const NOTIFICATION_KEY = "FitnessApp:notifications";

export default function useNotifications(
  navigationRef: React.RefObject<NavigationContainerRef<RootStackParamList>>
) {
  const [notificationToken, setNotificationToken] = useState<string | null>(
    null
  );
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
      // alert("Failed to get push token for push notification!");
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

  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  const lastNotification = Notifications.useLastNotificationResponse();

  useEffect(() => {
    if (
      lastNotification?.notification?.request?.content?.data?.eventId &&
      lastNotification?.actionIdentifier ===
        Notifications.DEFAULT_ACTION_IDENTIFIER
    ) {
      navigationRef.current?.navigate("TimelineScreens", {
        screen: "TimelineDetails",
        params: {
          timelineId:
            lastNotification?.notification?.request?.content?.data?.eventId,
        },
      });
    }
  }, [lastNotification?.notification]);

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      if (token) setNotificationToken(token);
    });
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification: any) => {
        Notifications.addNotificationResponseReceivedListener((response) => {
          const request = response.notification.request as any;

          navigationRef.current?.navigate("TimelineScreens", {
            screen: "TimelineDetails",
            params: { timelineId: request.content.data.eventId },
          });
        });
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((e) => {});

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

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
