import { View, TextInput, Text } from "react-native";
import ScreenContainer from "../../../../components/ui/ScreenContainer";
import { useLayoutEffect, useState } from "react";
import Button from "../../../../components/ui/Button/Button";
import { useDispatch } from "react-redux";
import { notesActions } from "../../../../utils/redux/notes/notes";
import Ripple from "react-native-material-ripple";
import { AntDesign } from "@expo/vector-icons";
import Colors from "../../../../constants/Colors";
import { useAppSelector } from "../../../../utils/redux";

const NoteForm = (props: { note: string; setNote: any }) => {
  return (
    <TextInput
      numberOfLines={100}
      multiline
      value={props.note}
      textAlign="left"
      onChangeText={props.setNote}
      style={{
        color: "#fff",
        fontSize: 18,
        textAlignVertical: "top",
        padding: 10,
      }}
    />
  );
};

export default function CreateNoteScreen({ navigation, route }: any) {
  const { mode, noteId } = route.params;
  const { notes } = useAppSelector((s) => s.notes);
  const existingNote = notes.find((n) => n.id === noteId);
  const [note, setNote] = useState(existingNote?.content || "");
  const dispatch = useDispatch();

  const [secure, setSecure] = useState(existingNote?.secure || false);

  async function handleCreateNote() {
    if (note.trim().length === 0 || existingNote?.content === note) return;

    if (typeof mode !== "undefined" && mode === "edit") {
      console.log("edit note");

      dispatch(
        notesActions.editNote({
          noteId: noteId,
          content: note,
          secure: secure,
        })
      );
    } else dispatch(notesActions.createNote({ content: note, secure }));
    navigation.goBack();
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Ripple
          style={{ padding: 10, flexDirection: "row", alignItems: "center" }}
          onPress={() => setSecure((s) => !s)}
        >
          {secure && (
            <Text
              style={{
                color: Colors.secondary,
                fontWeight: "bold",
                fontSize: 17,
                marginRight: 5,
              }}
            >
              Secured
            </Text>
          )}

          <AntDesign
            name={secure ? "lock" : "unlock"}
            color={Colors.secondary}
            size={24}
          />
        </Ripple>
      ),
    });
  }, [secure]);

  return (
    <ScreenContainer>
      <View style={{ flex: 1 }}>
        <NoteForm note={note} setNote={setNote} />
      </View>
      <Button size="xl" style={{ margin: 10 }} onPress={handleCreateNote}>
        Save
      </Button>
    </ScreenContainer>
  );
}
