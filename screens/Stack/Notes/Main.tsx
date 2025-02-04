import NotesScreen from "./pages/NotesScreen";
import NoteScreen from "./pages/Note";
import CreateNoteScreen from "./pages/CreateNote";
import Colors from "../../../constants/Colors";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loadNotes } from "../../../utils/redux/notes/notes";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CreateFlashCardGroup from "./pages/CreateFlashCardGroup";
import CreateFlashCards from "./pages/CreateFlashCards";
import FlashCardScreen from "./pages/FlashCard";
import SwipeFlashCardsScreen from "./pages/SwipeFlashCards";

const SharedStack = createNativeStackNavigator();

export default function NotesScreens() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadNotes() as any);
  }, []);

  return (
    <SharedStack.Navigator
      initialRouteName="Notes"
      screenOptions={{
        animation: "default",
      }}
    >
      <SharedStack.Screen
        options={{
          headerShown: false,
          presentation: "modal",
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
          presentation: "modal",
        }}
      />
      <SharedStack.Screen
        options={{
          title: "Create note",
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTitleAlign: "center",
          presentation: "modal",
        }}
        initialParams={{
          mode: "create",
          noteId: 0,
        }}
        name="NoteCreate"
        component={CreateNoteScreen}
      />

      <SharedStack.Screen
        name="CreateFlashCards"
        component={CreateFlashCards}
        options={{
          headerStyle: { backgroundColor: Colors.primary },
          presentation: "modal",
        }}
      />

      <SharedStack.Screen
        name="FlashCard"
        component={FlashCardScreen}
        options={{
          headerStyle: { backgroundColor: Colors.primary },
          headerShown: false,
        }}
      />

      <SharedStack.Screen
        name="SwipeFlashCards"
        component={SwipeFlashCardsScreen}
        options={{
          headerStyle: { backgroundColor: Colors.primary },
          headerShown: false,
          presentation: "fullScreenModal",
        }}
      />

      <SharedStack.Screen
        name="CreateFlashCardGroup"
        component={CreateFlashCardGroup}
        options={{
          headerStyle: { backgroundColor: Colors.primary },
          presentation: "modal",
        }}
      />
    </SharedStack.Navigator>
  );
}
