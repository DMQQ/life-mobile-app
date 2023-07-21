import Color from "color";
import { StyleSheet, View, Text, ToastAndroid } from "react-native";
import Colors from "../../../../constants/Colors";
import Ripple from "react-native-material-ripple";
import { useNavigation } from "@react-navigation/core";
import { SharedElement } from "react-navigation-shared-element";
import { BlurView } from "expo-blur"; // NOT WORKING

import * as LocalAuthentication from "expo-local-authentication";
import { useState } from "react";
import Skeleton from "../../../../components/SkeletonLoader/Skeleton";

const styles = StyleSheet.create({
  container: {
    width: "100%",
    padding: 5,
    paddingHorizontal: 10,
    backgroundColor: Color(Colors.primary).lighten(0.25).string(),
    borderRadius: 5,
    marginBottom: 5,
    marginTop: 5,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
  },

  title: {
    color: Colors.secondary,
    fontSize: 16,
    fontWeight: "bold",
  },
  tag: {
    backgroundColor: Colors.secondary,
    color: "#000",
    paddingHorizontal: 5,
    borderRadius: 5,
    marginRight: 5,
  },
  bar: {
    width: 350,
    height: 15,
    marginBottom: 5,
    backgroundColor: Colors.primary_light,
    borderRadius: 100,
  },
});

interface ITask {
  taskId: string;
  text: string;
  isDone: boolean;
  created_at: string;
}

interface INote {
  secure: boolean;
  title: string;
  text: string;
  tasks: ITask[];
  noteId: string;
}

type NoteProps = INote & {};

export default function Note(props: NoteProps) {
  const navigation = useNavigation();

  const [isUnlocked, setIsUnlocked] = useState(false);

  const authenticate = async (done: Function) => {
    const hasLocalAuth = await LocalAuthentication.hasHardwareAsync();

    if (!hasLocalAuth) return;

    const authResult = await LocalAuthentication.authenticateAsync({
      cancelLabel: "Cancel",
      promptMessage: "Authenticate to access this module",
      fallbackLabel: "Authentication failed",
    });

    if (authResult.success) {
      ToastAndroid.show("Access granted", ToastAndroid.SHORT);
      setIsUnlocked(true);
      done();
    }
  };

  const onPress = () => {
    const navigate = () =>
      navigation.navigate<any>("Note", {
        noteId: props.noteId,
      });

    if (props.secure && !isUnlocked) {
      authenticate(navigate);
      return;
    }

    navigate();
  };

  return (
    <Ripple style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <SharedElement id={`note.title.${props.noteId}`}>
          <View style={{ width: "100%" }}>
            <Text style={styles.title}>
              {props.secure && !isUnlocked ? "SECURED NOTE" : props.title}
            </Text>
          </View>
        </SharedElement>

        <View style={{ flexDirection: "row" }}>
          <Text style={styles.tag}>secure</Text>
          <Text style={styles.tag}>important</Text>
          <Text style={styles.tag}>life</Text>
        </View>
      </View>

      <SharedElement id={`note.desc.${props.noteId}`}>
        {props.secure && !isUnlocked ? (
          <View>
            <View style={styles.bar} />
            <View style={styles.bar} />
            <View style={styles.bar} />
          </View>
        ) : (
          <Text
            style={{
              color: "#ffffff7b",
            }}
            numberOfLines={4}
          >
            {props.text}
          </Text>
        )}
      </SharedElement>
    </Ripple>
  );
}
