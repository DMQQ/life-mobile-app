import { FlatList, Pressable, View } from "react-native";

import SearchBar from "../../../../components/SearchBar/SearchBar";
import Note from "../components/Note";
import { useEffect, useRef, useState } from "react";
import { ScreenProps } from "../../../../types";

import Layout from "../../../../constants/Layout";
import { useAppSelector } from "../../../../utils/redux";
import { TextInput } from "react-native-gesture-handler";
import ScreenContainer from "@/components/ui/ScreenContainer";

export default function NotesScreen({ navigation }: ScreenProps<any>) {
  const notes = useAppSelector((a) => a.notes);
  const textInputRef = useRef<TextInput | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleDismiss = () => {
    setIsFocused(false);
    textInputRef.current?.blur();
  };

  useEffect(() => {
    const unsub = navigation.addListener("focus", () => {
      handleDismiss();
    });

    return unsub;
  }, [navigation]);

  return (
    <ScreenContainer>
      <SearchBar
        textInputRef={textInputRef}
        isFocused={isFocused}
        setIsFocused={setIsFocused}
      />

      <FlatList
        contentContainerStyle={{ padding: 15 }}
        data={notes.notes}
        keyExtractor={(i) => i.id.toString()}
        renderItem={({ item: n }) => (
          <Note
            noteId={n.id.toString()}
            tasks={[]}
            title={n.content.split("\n")[0]}
            text={n.content}
            {...n}
          />
        )}
      />

      {isFocused && (
        <Pressable
          onPress={handleDismiss}
          style={{
            position: "absolute",
            ...Layout.screen,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 15,
          }}
        />
      )}
    </ScreenContainer>
  );
}
