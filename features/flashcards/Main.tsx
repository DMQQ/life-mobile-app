import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import NotesScreen from "./pages/NotesScreen";
import CreateFlashCards from "./pages/CreateFlashCardGroup";
import FlashCardScreen from "./pages/FlashCard";
import SwipeFlashCardsScreen from "./pages/SwipeFlashCards";
import CreateFlashCardGroup from "./pages/CreateFlashCardGroup";
import Colors from "@/constants/Colors";

const SharedStack = createNativeStackNavigator();

export default function NotesScreens() {
  const dispatch = useDispatch();

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
