import { AntDesign, Feather } from "@expo/vector-icons";
import { Platform, StyleSheet, View } from "react-native";
import Ripple from "react-native-material-ripple";
import { NativeStackHeaderProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/Colors";
import Text from "@/components/ui/Text/Text";

const styles = StyleSheet.create({
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },

  eventTitle: {
    color: Colors.foreground,
    marginRight: 2.5,
  },
});

export default function TimelineCreateHeader(
  props: NativeStackHeaderProps & {
    selectedDate: string;
    onToggleOptions: () => void;
    handleChangeDate: (...rest: any) => void;
  }
) {
  return (
    <View style={[styles.header]}>
      <Ripple style={{ padding: 10 }} onPress={props.navigation.goBack}>
        <AntDesign name="arrowleft" color={Colors.foreground} size={23} />
      </Ripple>

      {props.selectedDate.split(";").length === 1 && (
        <Ripple onPress={props.handleChangeDate}>
          <Text variant="subheading" style={styles.eventTitle}>{props.selectedDate}</Text>
        </Ripple>
      )}
      <Ripple style={{ padding: 10 }} onPress={props.onToggleOptions}>
        <Feather name="trash" color={Colors.foreground} size={20} />
      </Ripple>
    </View>
  );
}
