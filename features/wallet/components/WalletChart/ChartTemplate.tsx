import { AntDesign } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/Colors";
import lowOpacity from "@/utils/functions/lowOpacity";
import Color from "color";
import moment from "moment";
import DateTimePicker from "react-native-modal-datetime-picker";
import Ripple from "react-native-material-ripple";
import { MenuView } from "@react-native-menu/menu";
import { Button } from "@/components";
import Layout from "@/constants/Layout";

export type Types = "total" | "avg" | "median" | "count";

interface ChartTemplatePropsWithTypes {
  children: (dt: { dateRange: [string, string]; type: Types }) => React.ReactNode;
  title: string;
  description: string;
  types: Types[];

  initialStartDate?: string;

  initialEndDate?: string;
}

type ChartTemplateProps = ChartTemplatePropsWithTypes;

const blueText = Color(Colors.primary).lighten(10).string();

export default function ChartTemplate({ children, title, description, types, initialStartDate, initialEndDate }: ChartTemplateProps) {
  const [type, setType] = React.useState<Types>(types ? types[0] : "total");
  const [dateRange, setDateRange] = React.useState<[string, string]>([
    initialStartDate ?? moment().subtract(1, "months").format("YYYY-MM-DD"),
    initialEndDate ?? moment().format("YYYY-MM-DD"),
  ]);
  const [showStartDatePicker, setShowStartDatePicker] = React.useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = React.useState(false);

  const handleStartDateConfirm = (date: Date) => {
    const formattedDate = moment(date).format("YYYY-MM-DD");
    setDateRange([formattedDate, dateRange[1]]);
    setShowStartDatePicker(false);
  };

  const handleEndDateConfirm = (date: Date) => {
    const formattedDate = moment(date).format("YYYY-MM-DD");
    setDateRange([dateRange[0], formattedDate]);
    setShowEndDatePicker(false);
  };

  return (
    <View style={styles.container}>
      <View style={{ marginBottom: 15 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
          <Text style={{ color: "#fff", fontSize: 20, fontWeight: 600, marginBottom: 5 }}>{title}</Text>

          <MenuView
            onPressAction={(ev) => {
              if (ev.nativeEvent.event === "1") {
                setShowStartDatePicker(true);
              } else if (ev.nativeEvent.event === "2") {
                setShowEndDatePicker(true);
              }
            }}
            title="Select date range"
            themeVariant="dark"
            style={{
              backgroundColor: Colors.primary,
            }}
            actions={[
              {
                id: "1",
                title: "Date start",
                state: "off",
                subtitle: moment(dateRange[0]).format("DD MMMM YYYY"),
                image: "calendar",
              },
              {
                id: "2",
                title: "Date end",
                state: "off",
                subtitle: moment(dateRange[1]).format("DD MMMM YYYY"),
                image: "calendar",
              },
            ]}
          >
            <Ripple style={styles.dateToggleButton}>
              <AntDesign name="clockcircleo" size={20} color="#fff" />
              <Text style={{ color: "#fff", fontSize: 12, textAlign: "center", fontWeight: "600" }}>
                {moment(dateRange[0]).format("DD.MM")} - {moment(dateRange[1]).format("DD.MM")}
              </Text>
            </Ripple>
          </MenuView>
        </View>

        <Text style={{ color: "rgba(255,255,255,0.6)" }}>{description}</Text>
      </View>
      {types && types.length > 0 && (
        <ScrollView
          style={{ marginBottom: 15, width: "100%", backgroundColor: Colors.primary }}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {types.map((item) => (
            <Button
              variant="text"
              key={item}
              onPress={() => setType(item)}
              style={[
                styles.button,
                {
                  borderWidth: 0.5,
                  borderColor: Colors.primary,
                  ...(item === type && {
                    backgroundColor: lowOpacity(Colors.secondary, 0.15),
                    borderWidth: 0.5,
                    borderColor: lowOpacity(Colors.secondary, 0.5),
                  }),
                  width: Math.max(item.length * 15, (Layout.screen.width - 30 - 5 * (types.length - 2)) / types.length),
                  marginRight: 5,
                },
              ]}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: type === item ? Colors.secondary : blueText,
                }}
              >
                {item}
              </Text>
            </Button>
          ))}
        </ScrollView>
      )}

      <View>{children?.({ dateRange, type: type })}</View>

      <DateTimePicker
        isVisible={showStartDatePicker}
        mode="date"
        onConfirm={handleStartDateConfirm}
        onCancel={() => setShowStartDatePicker(false)}
        date={moment(dateRange[0]).toDate()}
        maximumDate={moment(dateRange[1]).toDate()}
      />

      <DateTimePicker
        isVisible={showEndDatePicker}
        mode="date"
        onConfirm={handleEndDateConfirm}
        onCancel={() => setShowEndDatePicker(false)}
        date={moment(dateRange[1]).toDate()}
        minimumDate={moment(dateRange[0]).toDate()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, marginBottom: 50 },
  dateRangeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    backgroundColor: Colors.primary_lighter,
    borderRadius: 10,
  },
  dateButton: {
    backgroundColor: lowOpacity(Colors.primary, 0.3),
    borderWidth: 1,
    borderColor: lowOpacity(Colors.primary, 0.5),
    borderRadius: 7.5,
    padding: 10,
    width: "48%",
    alignItems: "center",
  },
  dateButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  selectedMonthsInfo: {
    backgroundColor: Color(Colors.primary).lighten(0.3).string(),
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  selectedMonthsText: {
    color: "#fff",
    fontSize: 12,
    textAlign: "center",
  },

  dateToggleButton: {
    backgroundColor: Colors.secondary,
    padding: 4,
    paddingHorizontal: 8,
    flexDirection: "row",
    borderRadius: 100,
    alignItems: "center",
    gap: 6,
  },
  button: { padding: 10, paddingHorizontal: 15, borderRadius: 7.5, backgroundColor: Colors.primary_light },
});
