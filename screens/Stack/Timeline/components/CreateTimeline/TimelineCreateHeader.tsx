import { AntDesign } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import Ripple from "react-native-material-ripple";
import { NativeStackHeaderProps } from "@react-navigation/native-stack";

const styles = StyleSheet.create({
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },

  eventTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginRight: 2.5,
  },
});

export default function TimelineCreateHeader(
  props: NativeStackHeaderProps & {
    selectedDate: string;
    onToggleOptions: () => void;
    handleChangeDate: () => void;
  }
) {
  return (
    <View style={styles.header}>
      <Ripple style={{ padding: 10 }} onPress={props.navigation.goBack}>
        <AntDesign name="arrowleft" color="#fff" size={23} />
      </Ripple>

      {props.selectedDate.split(";").length === 1 && (
        <Ripple onPress={props.handleChangeDate}>
          <Text style={styles.eventTitle}>{props.selectedDate}</Text>
        </Ripple>
      )}
      <Ripple style={{ padding: 10 }} onPress={props.onToggleOptions}>
        <AntDesign name="setting" color={"#fff"} size={23} />
      </Ripple>
    </View>
  );
}
