import { Text, View } from "react-native";
import ScreenContainer from "../../../../components/ui/ScreenContainer";
import Colors from "../../../../constants/Colors";
import { useAppSelector } from "../../../../utils/redux";
import { useEffect } from "react";
import Ripple from "react-native-material-ripple";
import { AntDesign } from "@expo/vector-icons";
import Animated from "react-native-reanimated";

export default function NoteScreen({ route, navigation }: any) {
  const { notes } = useAppSelector((s) => s.notes);

  const note = notes.find((n) => n.id === +route.params?.noteId);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Ripple
          style={{ padding: 15 }}
          onPress={() =>
            navigation.navigate("NoteCreate", {
              mode: "edit",
              noteId: note?.id,
            })
          }
        >
          <AntDesign name="edit" color={"#fff"} size={24} />
        </Ripple>
      ),
    });
  }, []);

  return (
    <ScreenContainer scroll>
      <Animated.View style={{ width: "100%" }} sharedTransitionTag="title">
        <Text
          style={{
            color: Colors.secondary,
            fontSize: 50,
            fontWeight: "bold",
          }}
        >
          {note?.content.split("\n")[0]}
        </Text>
      </Animated.View>

      <Text
        style={{
          color: "#ffffff7b",
          marginBottom: 5,
          fontSize: 20,
        }}
      >
        {note?.content}
      </Text>
    </ScreenContainer>
  );
}
