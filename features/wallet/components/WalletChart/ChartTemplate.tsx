import { AntDesign } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/Colors";
import moment from "moment";
import DateTimePicker from "react-native-modal-datetime-picker";
import Ripple from "react-native-material-ripple";
import { MenuView } from "@react-native-menu/menu";
import { AnimatedSelector } from "@/components";
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
        <View style={{ marginBottom: 15 }}>
          <AnimatedSelector
            items={types}
            selectedItem={type}
            onItemSelect={setType}
            hapticFeedback
            containerStyle={{
              backgroundColor: Colors.primary,
            }}
            scale={1}
          />
        </View>
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
  dateToggleButton: {
    backgroundColor: Colors.secondary,
    padding: 4,
    paddingHorizontal: 8,
    flexDirection: "row",
    borderRadius: 100,
    alignItems: "center",
    gap: 6,
  },
});
