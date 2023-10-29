import NotesScreen from "./NotesScreen";
import NoteScreen from "./Note";
import CreateNoteScreen from "./CreateNote";
import { createSharedElementStackNavigator } from "react-navigation-shared-element";
import Colors from "../../../constants/Colors";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loadNotes, notesActions } from "../../../utils/redux/notes/notes";

const SharedStack = createSharedElementStackNavigator();

export default function NotesScreens() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadNotes() as any);
  }, []);

  return (
    <SharedStack.Navigator initialRouteName="Notes">
      <SharedStack.Screen name="Notes" component={NotesScreen} />
      <SharedStack.Screen
        initialParams={{ noteId: "", title: "" }}
        name="Note"
        component={NoteScreen}
        options={{ headerStyle: { backgroundColor: Colors.primary } }}
        sharedElements={({ params }, opt) => [
          {
            id: `note.title.${params.noteId}`,
            animation: "fade",
          },
          {
            id: `note.desc.${params.noteId}`,
            animation: "fade",
          },
        ]}
      />
      <SharedStack.Screen name="NoteCreate" component={CreateNoteScreen} />
    </SharedStack.Navigator>
  );
}
