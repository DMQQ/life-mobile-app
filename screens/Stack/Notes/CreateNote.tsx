import { View, TextInput } from "react-native";
import ScreenContainer from "../../../components/ui/ScreenContainer";
import { useState } from "react";
import Button from "../../../components/ui/Button/Button";
import { useDispatch } from "react-redux";
import { notesActions } from "../../../utils/redux/notes/notes";

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

export default function CreateNoteScreen({ navigation }: any) {
  const [note, setNote] = useState("");
  const dispatch = useDispatch();

  async function handleCreateNote() {
    if (note.trim().length === 0) return;
    dispatch(notesActions.createNote(note));
    navigation.goBack();
  }

  return (
    <ScreenContainer style={{ padding: 0 }}>
      <View style={{ flex: 1 }}>
        <NoteForm note={note} setNote={setNote} />
      </View>
      <Button size="xl" style={{ margin: 10 }} onPress={handleCreateNote}>
        Save
      </Button>
    </ScreenContainer>
  );
}
