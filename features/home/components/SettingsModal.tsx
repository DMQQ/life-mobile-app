import { FlatList, Text, View, StyleSheet, Modal, TouchableOpacity } from "react-native";
import Button from "@/components/ui/Button/Button";
import useUser from "@/utils/hooks/useUser";
import Colors, { CustomThemeOptions } from "@/constants/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ripple from "react-native-material-ripple";
import { reloadAppAsync } from "expo";
import { useState } from "react";
import * as SecureStore from "expo-secure-store";
import { BlurView } from "expo-blur";
import { ScrollView } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import Feedback from "react-native-haptic-feedback";

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  blurBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)", // Semi-transparent overlay
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    paddingTop: 60,
  },
  modalTitle: {
    color: Colors.text_light,
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 8,
  },
  settingsContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  content: {
    flex: 1,
    padding: 15,
  },
  profileSection: {
    flex: 1,
  },
  profileCard: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  profileContent: {
    padding: 20,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  signedAsText: {
    color: "#fff",
    fontSize: 25,
    fontWeight: "bold",
  },
  emailText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 5,
  },
  themeSection: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  themeSectionContent: {
    padding: 20,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  themeSectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
  },
  colorSectionTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginVertical: 15,
  },
  colorPicker: {
    marginBottom: 10,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 5,
  },
  selectedColorOption: {
    borderWidth: 3,
    borderColor: "white",
  },
  applyButtonContainer: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  applyButtonContent: {
    padding: 15,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  signoutButtonContainer: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 0, 0, 0.3)",
  },
  signoutButtonContent: {
    backgroundColor: "rgba(220, 53, 69, 0.2)",
    padding: 0,
  },
});

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function SettingsModal({ visible, onClose }: SettingsModalProps) {
  const { removeUser, user } = useUser();

  const handleSignout = async () => {
    await removeUser();

    let keys = await AsyncStorage.getAllKeys();
    keys = keys.filter((key) => !key.startsWith("color_scheme"));
    await AsyncStorage.multiRemove(keys);

    onClose();
  };

  const setCustomTheme = async (schema: { primary: string; secondary: string }) => {
    await SecureStore.setItemAsync("color_scheme_primary", schema.primary);
    await SecureStore.setItemAsync("color_scheme_secondary", schema.secondary);
    await reloadAppAsync();
  };

  const [primary, setPrimary] = useState<string | null>(null);
  const [secondary, setSecondary] = useState<string | null>(null);

  const handleClose = () => {
    Feedback.trigger("impactLight");
    onClose();
  };

  const handleApplyTheme = async () => {
    if (primary && secondary) {
      Feedback.trigger("impactMedium");
      await setCustomTheme({ primary, secondary });
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="overFullScreen" transparent={true} onRequestClose={handleClose}>
      <View style={styles.modalContainer}>
        <BlurView intensity={80} tint="dark" style={styles.blurBackground} />
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Settings</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <AntDesign name="close" size={24} color={Colors.text_light} />
            </TouchableOpacity>
          </View>

          <View style={styles.settingsContainer}>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              <View style={styles.profileSection}>
                {/* Profile Card */}
                <View style={styles.profileCard}>
                  <BlurView intensity={60} tint="dark">
                    <View style={styles.profileContent}>
                      <Text style={styles.signedAsText}>Signed as</Text>
                      <Text style={styles.emailText}>{user?.email}</Text>
                    </View>
                  </BlurView>
                </View>

                {/* Theme Customization Card */}
                <View style={styles.themeSection}>
                  <BlurView intensity={60} tint="dark">
                    <View style={styles.themeSectionContent}>
                      <Text style={styles.themeSectionTitle}>Custom color theme!</Text>

                      <Text style={styles.colorSectionTitle}>Primary</Text>
                      <View style={styles.colorPicker}>
                        <FlatList
                          horizontal
                          data={CustomThemeOptions.primary}
                          keyExtractor={(item) => item}
                          showsHorizontalScrollIndicator={false}
                          renderItem={({ item }) => (
                            <Ripple
                              onPress={() => {
                                Feedback.trigger("selection");
                                setPrimary(item);
                              }}
                              style={[styles.colorOption, { backgroundColor: item }, primary === item && styles.selectedColorOption]}
                            />
                          )}
                        />
                      </View>

                      <Text style={styles.colorSectionTitle}>Secondary</Text>
                      <View style={styles.colorPicker}>
                        <FlatList
                          horizontal
                          data={CustomThemeOptions.secondary}
                          keyExtractor={(item) => item}
                          showsHorizontalScrollIndicator={false}
                          renderItem={({ item }) => (
                            <Ripple
                              onPress={() => {
                                Feedback.trigger("selection");
                                setSecondary(item);
                              }}
                              style={[styles.colorOption, { backgroundColor: item }, secondary === item && styles.selectedColorOption]}
                            />
                          )}
                        />
                      </View>
                    </View>
                  </BlurView>
                </View>

                {/* Apply Theme Button Card */}
                <View style={styles.applyButtonContainer}>
                  <BlurView intensity={60} tint="dark">
                    <View style={styles.applyButtonContent}>
                      <Button onPress={handleApplyTheme} disabled={!primary || !secondary}>
                        Apply Custom Theme
                      </Button>
                    </View>
                  </BlurView>
                </View>

                {/* Signout Button Card */}
                <View style={styles.signoutButtonContainer}>
                  <BlurView intensity={60} tint="dark">
                    <View style={styles.signoutButtonContent}>
                      <Button
                        fontStyle={{ fontSize: 16 }}
                        onPress={handleSignout}
                        style={{
                          backgroundColor: "rgba(220, 53, 69, 0.8)",
                          margin: 15,
                        }}
                      >
                        Signout 👋
                      </Button>
                    </View>
                  </BlurView>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
}
