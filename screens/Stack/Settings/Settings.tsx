import Button from "../../../components/ui/Button/Button";
import ScreenContainer from "../../../components/ui/ScreenContainer";
import { Pressable, Text, View } from "react-native";

import { secondary_candidates } from "../../../constants/Colors";
import Ripple from "react-native-material-ripple";
import Color from "color";

const SettingsTile = (props: {
  label: string;
  onPress: Function;
  state: string;
}) => (
  <View style={{ padding: 10 }}>
    <Text style={{ color: "#fff", fontSize: 50, fontWeight: "bold" }}>
      {props.label}
    </Text>

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
  return (
    <ScreenContainer>
      <SettingsTile label="Color theme" onPress={() => {}} state="NotPressed" />
    </ScreenContainer>
  );
}
