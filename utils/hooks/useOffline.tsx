import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { useNetInfo } from "@react-native-community/netinfo";

export default function useOffline<T>(key?: string) {
  const [data, setData] = useState<T>();

  const isOnline = useNetInfo().isConnected;

  const save = async (key: string, value: T) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  };

  const get = async (key: string) => {
    try {
      const value = await AsyncStorage.getItem(key);
      setData(value ? JSON.parse(value) : null);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (key && !isOnline) get(key);
  }, [key]);

  return { data, save, get, isOffline: !isOnline };
}
