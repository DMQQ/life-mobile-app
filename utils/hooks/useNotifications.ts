import * as Notifications from "expo-notifications";
import { Platform, ToastAndroid } from "react-native";
import { gql, useMutation } from "@apollo/client";
import Constants from "expo-constants";
import { useEffect, useRef, useState } from "react";
import { NavigationContainerRef } from "@react-navigation/native";
import { RootStackParamList } from "@/types";

const CREATE_NOTIFICATION = gql`
  mutation createNotification($token: String!) {
    setNotificationsToken(token: $token)
  }
`;

export default function useNotifications(navigationRef: React.RefObject<NavigationContainerRef<RootStackParamList>>) {
  const [notificationToken, setNotificationToken] = useState<string | null>(null);
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();
  const lastNotification = Notifications.useLastNotificationResponse();
  const [createNotificationToken] = useMutation(CREATE_NOTIFICATION);

  // Register push notifications and retrieve the token
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

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.warn("Push notification permission not granted");
      return null;
    }

    token = await Notifications.getExpoPushTokenAsync({
      projectId: Constants?.expoConfig?.extra?.eas?.projectId || "5596a83c-661a-4477-806f-ee4c8a125f7e",
    });

    return token.data;
  }

  // Send token to server
  async function sendTokenToServer() {
    try {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        await createNotificationToken({ variables: { token } });
        setNotificationToken(token);
      }
    } catch (error) {
      ToastAndroid.show("Notifications disabled: Couldn't upload token", ToastAndroid.SHORT);
      console.error("Failed to send notification token", error);
    }
  }

  // Handle incoming notifications
  useEffect(() => {
    notificationListener.current = Notifications.addNotificationReceivedListener((notification: any) => {
      console.log("Notification received:", notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const { eventId } = response.notification.request.content.data;
      if (eventId) {
        navigationRef.current?.navigate("TimelineScreens", {
          screen: "TimelineDetails",
          params: { timelineId: eventId },
        });
      }
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, [navigationRef]);

  // Handle deep linking from last notification
  useEffect(() => {
    if (
      lastNotification?.notification?.request?.content?.data?.eventId &&
      lastNotification?.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER
    ) {
      const { eventId } = lastNotification.notification.request.content.data;
      navigationRef.current?.navigate("TimelineScreens", {
        screen: "TimelineDetails",
        params: { timelineId: eventId },
      });
    }
  }, [lastNotification, navigationRef]);

  return {
    getNotificationToken: registerForPushNotificationsAsync,
    sendTokenToServer,
    notificationToken,
  };
}
