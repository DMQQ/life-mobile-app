import Color from "color";
import {
  StyleSheet,
  View,
  Text,
  ToastAndroid,
  Alert,
  ViewStyle,
  StyleProp,
} from "react-native";
import Colors from "../../../../constants/Colors";
import Ripple from "react-native-material-ripple";
import { useNavigation } from "@react-navigation/core";
import { SharedElement } from "react-navigation-shared-element";
import * as LocalAuthentication from "expo-local-authentication";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { notesActions } from "../../../../utils/redux/notes/notes";
import { AntDesign } from "@expo/vector-icons";

const Gap = 20;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    padding: Gap,
    backgroundColor: Colors.primary_lighter,
    borderRadius: 15,
    marginTop: 15,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Gap,
  },

  title: {
    color: Colors.secondary,
    fontSize: 25,
    fontWeight: "bold",
  },
  tag: {
    backgroundColor: Colors.secondary,
    color: "#fff",
    paddingHorizontal: 10,
    padding: 5,
    borderRadius: 100,
    marginRight: 5,
  },
  bar: {
    width: "100%",
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
  tasks?: ITask[];
  noteId: string;
  pinned?: boolean;

  createdAt: string;
  updatedAt: string;
}

type NoteProps = INote & {
  hideContent?: boolean;
  containerStyles?: StyleProp<ViewStyle>;
};

export default function Note(props: NoteProps) {
  const navigation = useNavigation<any>();

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
      navigation.navigate("Note", {
        noteId: props.noteId,
      });

    if (props.secure && !isUnlocked) {
      authenticate(navigate);
      return;
    }

    navigate();
  };

  const dispatch = useDispatch();

  const removeNote = () => {
    Alert.alert("Remove", "Action cannot be reversed", [
      {
        onPress: () => dispatch(notesActions.removeNote(+props.noteId)),
        text: "Remove",
      },
      {
        onPress: () => null,
        text: "cancel",
      },
    ]);
  };

  const noteTitle =
    props.secure && !isUnlocked ? "SECURED NOTE" : props.title.slice(0, 30);

  return (
    <Ripple
      style={[styles.container, props.containerStyles]}
      onPress={onPress}
      onLongPress={removeNote}
    >
      <View style={styles.header}>
        <SharedElement id={`note.title.${props.noteId}`}>
          <Text style={styles.title}>{noteTitle}</Text>
        </SharedElement>

        <View style={{ flexDirection: "row" }}>
          <Text style={styles.tag}>{props.createdAt!}</Text>

          {props.pinned && (
            <AntDesign
              name="pushpin"
              color={"#fff"}
              size={20}
              style={styles.tag}
            />
          )}

          {props.secure && (
            <AntDesign
              name="lock1"
              color={"#fff"}
              size={20}
              style={[styles.tag, { marginLeft: 5 }]}
            />
          )}
        </View>
      </View>

      {!props.hideContent && (
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
              numberOfLines={3}
            >
              {props.text}
            </Text>
          )}
        </SharedElement>
      )}
    </Ripple>
  );
}
