import { AntDesign, Feather } from "@expo/vector-icons";
import { Platform, StyleSheet, Text, View } from "react-native";
import Ripple from "react-native-material-ripple";
import { NativeStackHeaderProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  const safeareas = useSafeAreaInsets()
  return (
    <View style={[styles.header,{
       marginTop: Platform.OS === "ios" ? safeareas.top : 0,
    }]}>
      <Ripple style={{ padding: 10 }} onPress={props.navigation.goBack}>
        <AntDesign name="arrowleft" color="#fff" size={23} />
      </Ripple>

      {props.selectedDate.split(";").length === 1 && (
        <Ripple onPress={props.handleChangeDate}>
          <Text style={styles.eventTitle}>{props.selectedDate}</Text>
        </Ripple>
      )}
      <Ripple style={{ padding: 10 }} onPress={props.onToggleOptions}>
        <Feather name="trash" color={"#fff"} size={20} />
      </Ripple>
    </View>
  );
}
