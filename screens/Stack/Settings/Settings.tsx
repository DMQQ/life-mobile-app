import Button from "../../../components/ui/Button/Button";
import ScreenContainer from "../../../components/ui/ScreenContainer";
import { Pressable, Text, View } from "react-native";

import Colors, { secondary_candidates } from "../../../constants/Colors";
import Ripple from "react-native-material-ripple";
import Color from "color";
import useUser from "@/utils/hooks/useUser";

const SettingsTile = (props: {
  label: string;
  onPress: Function;
  state: string;
}) => (
  <View>
    <View style={{ flexDirection: "row", padding: 10 }}>
      {secondary_candidates.map((color) => (
        <Ripple
          key={color}
          style={{
            width: 40,
            height: 40,
            marginRight: 10,
            borderRadius: 5,
            backgroundColor: color,
          }}
        />
      ))}
    </View>
  </View>
);

export default function Settings() {
  const { removeUser, user } = useUser();

  return (
    <ScreenContainer>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: "#fff",
            fontSize: 25,
            fontWeight: "bold",
          }}
        >
          Signed as
        </Text>
        <Text
          style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: 20,
            fontWeight: "bold",
          }}
        >
          {user?.email}
        </Text>
      </View>

      <Button
        fontStyle={{ fontSize: 16 }}
        onPress={() => removeUser()}
        style={{ backgroundColor: Colors.error }}
      >
        Signout 👋
      </Button>
    </ScreenContainer>
  );
}
