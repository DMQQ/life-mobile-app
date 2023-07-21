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

export default function NotesScreen({ navigation }: ScreenProps<any>) {
  useLayoutEffect(() => {
    navigation.setOptions({
      header: (props) => <SearchBar onSubmitEditing={() => {}} />,
    });
  }, []);
 
  //const [isAuth, setIsAuth] = useState(false);

  return (
    <ScreenContainer scroll>
      {["1a", "2a", "3a", "4a", "5a", "6a"].map((id) => (
        <Note
          key={id}
          noteId={id}
          secure
          tasks={[]}
          title={`Test title id: ${id}`}
          text="Lorem ipsum dolor sit amet consectetur, adipisicing elit. Et excepturi harum iusto labore, itaque illum fuga animi quos aperiam facilis minus nulla cum dolores eos enim possimus rem inventore doloremque!"
        />
      ))}
    </ScreenContainer>
  );
}
