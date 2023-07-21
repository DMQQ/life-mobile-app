import { Text, View } from "react-native";
import ScreenContainer from "../../../components/ui/ScreenContainer";
import { SharedElement } from "react-navigation-shared-element";
import { ScreenProps } from "../../../types";
import Colors from "../../../constants/Colors";
import Button from "../../../components/ui/Button/Button";

export default function NoteScreen({ route }: ScreenProps<"DEFAULT">) {
  return (
    <ScreenContainer>
      <SharedElement id={`note.title.${route.params?.noteId as string}`}>
        <View style={{ width: "100%" }}>
          <Text
            style={{
              color: Colors.secondary,
              fontSize: 50,
              fontWeight: "bold",
            }}
          >
            Note title
          </Text>
        </View>
      </SharedElement>

      <SharedElement id={`note.desc.${route.params?.noteId as string}`}>
        <Text
          style={{ color: "#ffffff7b", marginBottom: 5, fontSize: 20 }}
          numberOfLines={4}
        >
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Vitae velit,
          quidem commodi ex nam nesciunt nulla corrupti temporibus inventore
          iusto aspernatur quia rem dolores fuga, repellat earum officia, (See
          more)
        </Text>
      </SharedElement>
    </ScreenContainer>
  );
}
