import { FlatList, Text, View } from "react-native";
import Button from "../../../components/ui/Button/Button";
import ScreenContainer from "../../../components/ui/ScreenContainer";

import useUser from "@/utils/hooks/useUser";
import Colors, { CustomThemeOptions } from "../../../constants/Colors";
import Header from "@/components/ui/Header/Header";
import { useApolloClient } from "@apollo/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ripple from "react-native-material-ripple";

import { reloadAppAsync } from "expo";
import { useEffect, useState } from "react";

import * as SecureStore from "expo-secure-store";

export default function Settings() {
  const { removeUser, user } = useUser();
  const client = useApolloClient();

  const handleSignout = async () => {
    await removeUser();

    await client.clearStore();

    let keys = await AsyncStorage.getAllKeys();
    keys = keys.filter((key) => !key.startsWith("FlashCard_"));
    await AsyncStorage.multiRemove(keys);
  };

  const setCustomTheme = async (schema: { primary: string; secondary: string }) => {
    await SecureStore.setItemAsync("color_scheme_primary", schema.primary);
    await SecureStore.setItemAsync("color_scheme_secondary", schema.secondary);

    await reloadAppAsync();
  };

  const [primary, setPrimary] = useState<string | null>(null);
  const [secondary, setSecondary] = useState<string | null>(null);

  return (
    <ScreenContainer style={{ padding: 0 }}>
      <Header buttons={[]} title="Settings" titleAnimatedStyle={{}} goBack />
      <View style={{ flex: 1, padding: 15 }}>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: "#fff",
              fontSize: 25,
              fontWeight: "bold",
            }}
          >
            Signed as
          </Text>
          <Text
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: 20,
              fontWeight: "bold",
            }}
          >
            {user?.email}
          </Text>

          <View style={{ marginTop: 25 }}>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "600" }}>Custom color theme!</Text>

            <Text>Primary</Text>
            <FlatList
              horizontal
              data={CustomThemeOptions.primary}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Ripple
                  onPress={() => setPrimary(item)}
                  style={{
                    backgroundColor: item,
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    margin: 5,
                    borderWidth: primary === item ? 2 : 0,
                    borderColor: "white",
                  }}
                />
              )}
            />

            <Text>Secondary</Text>
            <FlatList
              horizontal
              data={CustomThemeOptions.secondary}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Ripple
                  onPress={() => setSecondary(item)}
                  style={{
                    backgroundColor: item,
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    margin: 5,
                    borderWidth: secondary === item ? 2 : 0,
                    borderColor: "white",
                  }}
                />
              )}
            />
          </View>
          <Button
            style={{ marginTop: 20 }}
            onPress={() => {
              if (primary && secondary) {
                setCustomTheme({ primary, secondary });
              }
            }}
            disabled={!primary || !secondary}
          >
            Apply Custom Theme
          </Button>
        </View>

        <Button fontStyle={{ fontSize: 16 }} onPress={handleSignout} style={{ backgroundColor: Colors.error }}>
          Signout 👋
        </Button>
      </View>
    </ScreenContainer>
  );
}
