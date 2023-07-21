import { StyleSheet } from "react-native";
import Colors from "../../../../constants/Colors";
import Color from "color";
import Layout from "../../../../constants/Layout";

export default StyleSheet.create({
  dayHeader: {
    color: Colors.secondary,
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 10,
  },
  eventsLeft: {
    color: Colors.primary_lighter,
    fontSize: 17,
    marginLeft: 10,
  },
  itemContainer: {
    marginVertical: 7.5,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  itemContainerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  itemTitle: {
    color: Colors.secondary,
    fontWeight: "bold",
    fontSize: 20,
  },
  itemDescription: {
    color: Colors.primary_lighter,
    fontSize: 17,
    marginTop: 5,
  },
  itemTimeLeft: { color: Colors.secondary, fontSize: 17 },

  eventTitle: {
    color: Colors.secondary,
    fontWeight: "bold",
    fontSize: 25,
  },
  pickerStyle: {
    backgroundColor: Color(Colors.primary).lighten(0.5).string(),
    borderWidth: 2,
    borderColor: Colors.primary_light,
  },
  rowReverse: {
    flexDirection: "row-reverse",
    justifyContent: "space-around",
  },
  submitButton: {
    marginTop: 15,
    paddingVertical: 15,
    backgroundColor: Colors.secondary,
    flexDirection: "row-reverse",

    position: "absolute",
    bottom: 10,
    left: 10,
    width: Layout.screen.width - 20,
  },
  button: {
    margin: 5,
    marginHorizontal: 7.5,
    backgroundColor: Colors.secondary,
    borderRadius: 50,
    paddingVertical: 15,
    marginBottom: 10,
    marginTop: 20,
  },

  listHeadingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary_light,
    marginBottom: 15,
  },
  listHeadingText: {
    fontWeight: "bold",
    paddingHorizontal: 5,
    color: Colors.secondary,
    fontSize: 25,
    marginLeft: 5,
  },
  listHeading: {
    borderRadius: 5,
    margin: 10,
    padding: 5,
    marginVertical: 15,
    backgroundColor: Color(Colors.primary).lighten(0.35).string(),
  },
});
