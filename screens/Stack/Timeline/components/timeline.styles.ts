import { StyleSheet } from "react-native";
import Colors from "../../../../constants/Colors";
import Color from "color";
import Layout from "../../../../constants/Layout";

export default StyleSheet.create({
  dayHeader: {
    color: "#ffffffda",
    fontSize: 17,
    fontWeight: "bold",
    marginLeft: 10,
  },
  eventsLeft: {
    color: Colors.secondary,
    fontSize: 17,
    marginLeft: 10,
  },
  itemContainer: {
    marginVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
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
    fontSize: 22,
  },
  itemDescription: {
    color: "gray",
    fontSize: 17,
    marginTop: 5,
  },
  itemTimeLeft: { color: Colors.secondary, fontSize: 17 },

  eventTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
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
    paddingVertical: 15,
    backgroundColor: Colors.secondary,
    flexDirection: "row-reverse",
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary_light,
    marginVertical: 15,
  },
  listHeadingText: {
    fontWeight: "bold",
    paddingHorizontal: 5,
    color: "#ffffffda",
    fontSize: 22,
    marginLeft: 5,
  },
  listHeading: {
    borderRadius: 5,

    padding: 10,
    marginVertical: 15,
    // backgroundColor: Color(Colors.primary).lighten(0.35).string(),
  },
  status: {
    color: Colors.primary,
    fontWeight: "600",

    backgroundColor: Colors.secondary,
    padding: 2.5,
    paddingHorizontal: 10,
    borderRadius: 100,
    fontSize: 13,
  },
});
