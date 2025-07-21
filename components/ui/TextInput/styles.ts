import { StyleSheet } from "react-native";
import Colors from "/Users/dmq/Desktop/projects/life/life-mobile-app/constants/Colors";

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-start",
    marginBottom: 10,
    justifyContent: "center",
  },
  input: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    fontSize: 18,
    borderRadius: 5,
    color: Colors.foreground,
    flex: 1,
    textDecorationLine: "none",
    minHeight: 50,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
    padding: 5,
  },
});

export default styles;
