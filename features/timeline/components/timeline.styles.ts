import { StyleSheet } from "react-native";
import Colors from "@/constants/Colors";
import Color from "color";

const iconColor = Color(Colors.primary).lighten(4.5).hex();

export default StyleSheet.create({
  dayHeader: {
    color: "#ffffffda",
    fontSize: 17,
    fontWeight: "bold",
    marginLeft: 15,
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
    color: "rgba(255,255,255,0.7)",
    fontSize: 17,
    marginTop: 5,
  },
  itemTimeLeft: {
    color: Colors.secondary_light_1,
    fontSize: 15,
  },

  eventTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginRight: 2.5,
  },
  pickerStyle: {
    backgroundColor: Colors.primary_lighter,
    borderWidth: 2,
    borderColor: Colors.primary_light,
  },
  rowReverse: {
    flexDirection: "row-reverse",
    justifyContent: "space-around",
  },
  submitButton: {
    backgroundColor: Colors.secondary,
    flexDirection: "row-reverse",
    flex: 1,
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
    paddingVertical: 10,
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

    paddingHorizontal: 10,

    // backgroundColor: Color(Colors.primary).lighten(0.35).string(),
  },
  status: {
    color: Colors.primary,
    fontWeight: "600",
  },

  floatingContainer: {
    position: "absolute",
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 20,
    right: 10,
    top: 200,
  },
  floatingButton: {
    padding: 10,
    flexDirection: "row",
    backgroundColor: Colors.primary_lighter,
    borderRadius: 10,
    paddingHorizontal: 15,
  },

  floatingText: {
    color: iconColor,
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },

  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative",
    marginTop: 15,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
    paddingHorizontal: 25,
  },

  toggleButton: {
    padding: 7.5,
    gap: 5,
    flexDirection: "row",
    backgroundColor: Colors.primary_lighter,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});
