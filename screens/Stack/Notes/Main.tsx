import NotesScreen from "./pages/NotesScreen";
import NoteScreen from "./pages/Note";
import CreateNoteScreen from "./pages/CreateNote";
import { createSharedElementStackNavigator } from "react-navigation-shared-element";
import Colors from "../../../constants/Colors";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loadNotes } from "../../../utils/redux/notes/notes";

const SharedStack = createSharedElementStackNavigator();

export default function NotesScreens() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadNotes() as any);
  }, []);

  return (
    <SharedStack.Navigator initialRouteName="Notes">
      <SharedStack.Screen
        options={{
          headerShown: false,
        }}
        name="Notes"
        component={NotesScreen}
      />
      <SharedStack.Screen
        initialParams={{ noteId: "", title: "" }}
        name="Note"
        component={NoteScreen}
        options={{
          headerStyle: { backgroundColor: Colors.primary },
        }}
        sharedElements={({ params }, opt) => [
          {
            id: `note.title.${params.noteId}`,
            animation: "fade-in",
            resize: "clip",
          },
          {
            id: `note.desc.${params.noteId}`,
            animation: "fade",
          },
        ]}
      />
      <SharedStack.Screen
        options={{
          title: "Create note",
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTitleAlign: "center",
        }}
        initialParams={{
          mode: "create",
          noteId: 0,
        }}
        name="NoteCreate"
        component={CreateNoteScreen}
      />
    </SharedStack.Navigator>
  );
}
