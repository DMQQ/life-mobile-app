import Button from "../../../components/ui/Button/Button";
import ScreenContainer from "../../../components/ui/ScreenContainer";
import { Text, View } from "react-native";

const SettingsTile = (props: {
  label: string;
  onPress: Function;
  state: string;
}) => (
  <View style={{ padding: 10 }}>
    <Text style={{ color: "#fff" }}>{props.label}</Text>
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <Button>Change</Button>
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
