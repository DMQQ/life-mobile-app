import Button from "@/components/ui/Button/Button";
import Colors from "@/constants/Colors";
import Layout from "@/constants/Layout";
import { useNavigation } from "@react-navigation/native";
import Color from "color";
import { View } from "react-native";

export default function ChangeButton(props: {
  navigateTo: string;
  displayText: string;
}) {
  const navigation = useNavigation<any>();

  return (
    <View style={{ alignItems: "center" }}>
      <View
        style={{
          width: Layout.screen.width / 1.25,
          height: 1,
          backgroundColor: Colors.primary_light,
          marginTop: 20,
        }}
      />

      <Button
        onPress={() => navigation.navigate(props.navigateTo)}
        variant="text"
        fontStyle={{
          fontSize: 15,
          color: Color(Colors.primary_lighter).lighten(0.25).hex(),
          textDecorationLine: "underline",
          fontWeight: "bold",
        }}
      >
        {props.displayText}
      </Button>
    </View>
  );
}
