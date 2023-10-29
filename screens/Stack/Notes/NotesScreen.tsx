import { Text, ToastAndroid, View } from "react-native";
import ScreenContainer from "../../../components/ui/ScreenContainer";
import SearchBar from "../../../components/SearchBar/SearchBar";
import Note from "./components/Note";
import { useLayoutEffect, useEffect, useState } from "react";
import { ScreenProps } from "../../../types";

import * as LocalAuthentication from "expo-local-authentication";
import Colors from "../../../constants/Colors";
import Button from "../../../components/ui/Button/Button";
import Layout from "../../../constants/Layout";
import { useAppSelector } from "../../../utils/redux";

export default function NotesScreen({ navigation }: ScreenProps<any>) {
  useLayoutEffect(() => {
    navigation.setOptions({
      header: (props) => <SearchBar onSubmitEditing={() => {}} />,
    });
  }, []);

  const notes = useAppSelector((a) => a.notes);

  return (
    <ScreenContainer scroll>
      {notes.notes.map((n) => (
        <Note
          key={n.id}
          noteId={n.id.toString()}
          secure={n.secure}
          tasks={[]}
          title={n.content.split("\n")[0]}
          text={n.content}
        />
      ))}
    </ScreenContainer>
  );
}
