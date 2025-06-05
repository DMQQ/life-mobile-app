import { useMemo, useState } from "react";
import { View, Text } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import Layout from "@/constants/Layout";
import Colors, { secondary_candidates } from "@/constants/Colors";
import Color from "color";
import { gql, useQuery } from "@apollo/client";
import { AntDesign } from "@expo/vector-icons";
import moment from "moment";
import DateTimePicker from "react-native-modal-datetime-picker";
import Ripple from "react-native-material-ripple";
import { MenuView } from "@react-native-menu/menu";

function WeeklyComparisonChart() {
  const [dateRange, setDateRange] = useState<[string, string]>([
    moment().subtract(1, "months").startOf("month").format("YYYY-MM-DD"),
    moment().format("YYYY-MM-DD"),
  ]);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const query = useQuery(
    gql`
      query WeeklyComparison($startDate: String!, $endDate: String!) {
        statisticsDailySpendings(startDate: $startDate, endDate: $endDate) {
          total
          date
          day
        }
      }
    `,
    {
      variables: {
        startDate: dateRange[0],
        endDate: dateRange[1],
      },
    }
  );

  const data = query?.data?.statisticsDailySpendings || [];

  const { thisWeekData, lastWeekData } = useMemo(() => {
    const processedData = data.map((item: any) => {
      const timestamp = parseInt(item.date);
      const date = new Date(timestamp);
      const dayOfWeek = date.getDay();
      const midDate = moment(dateRange[0]).add(moment(dateRange[1]).diff(moment(dateRange[0])) / 2, "milliseconds");
      const isFirstHalf = moment(date).isBefore(midDate);

      return {
        ...item,
        actualDayOfWeek: dayOfWeek,
        isFirstHalf,
        dateObj: date,
      };
    });

    const firstHalfData = processedData.filter((d) => d.isFirstHalf);
    const secondHalfData = processedData.filter((d) => !d.isFirstHalf);

    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const createWeekData = (weekData: any[]) => {
      const dayTotals = new Array(7).fill(0);
      const dayCounts = new Array(7).fill(0);

      weekData.forEach((expense: any) => {
        const dayOfWeek = expense.actualDayOfWeek;
        if (dayOfWeek >= 0 && dayOfWeek <= 6 && expense.total > 0) {
          dayTotals[dayOfWeek] += expense.total;
          dayCounts[dayOfWeek]++;
        }
      });

      return dayTotals.map((total, index) => ({
        value: dayCounts[index] > 0 ? Math.round(total / dayCounts[index]) : 0,
        label: dayLabels[index],
      }));
    };

    const firstFormatted = createWeekData(firstHalfData);
    const secondFormatted = createWeekData(secondHalfData);

    return {
      thisWeekData: secondFormatted,
      lastWeekData: firstFormatted,
    };
  }, [data, dateRange]);

  const thisWeekTotal = thisWeekData.reduce((sum: number, d: any) => sum + d.value, 0);
  const lastWeekTotal = lastWeekData.reduce((sum: number, d: any) => sum + d.value, 0);
  const weekDifference = thisWeekTotal - lastWeekTotal;

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
    <View style={{ marginVertical: 16 }}>
      <View style={{ flex: 1, width: Layout.screen.width - 30 }}>
        <LineChart
          width={Layout.screen.width}
          height={160}
          data={thisWeekData}
          data2={lastWeekData}
          color1={secondary_candidates[1]}
          color2={secondary_candidates[3]}
          thickness1={2.8}
          thickness2={2.8}
          dataPointsRadius1={4.5}
          dataPointsRadius2={4.5}
          dataPointsColor1={secondary_candidates[1]}
          dataPointsColor2={secondary_candidates[3]}
          startFillColor1={secondary_candidates[1]}
          endFillColor1={Color(secondary_candidates[1]).alpha(0.1).string()}
          startOpacity1={0.4}
          endOpacity1={0.1}
          startFillColor2={secondary_candidates[3]}
          endFillColor2={Color(secondary_candidates[3]).alpha(0.1).string()}
          startOpacity2={0.3}
          endOpacity2={0.05}
          areaChart1
          areaChart2
          noOfSections={3}
          yAxisTextStyle={{ color: "#fff", fontSize: 11, opacity: 0.6 }}
          xAxisLabelTextStyle={{ color: "#fff", fontSize: 10, opacity: 0.8 }}
          rulesColor={Color(Colors.primary).lighten(1.2).alpha(0.3).string()}
          yAxisThickness={0}
          xAxisThickness={0}
          initialSpacing={30}
          spacing={Layout.screen.width / 8}
          isAnimated
          curved
          showDataPointOnFocus
          showStripOnFocus
          stripColor={Color(secondary_candidates[2]).alpha(0.5).string()}
          maxValue={Math.max(...thisWeekData.map((d) => d.value), ...lastWeekData.map((d) => d.value)) * 1.15}
        />
      </View>

      <View
        style={{
          backgroundColor: Color(Colors.primary).lighten(0.5).string(),
          borderRadius: 12,
          padding: 16,
          marginTop: 16,
          gap: 16,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ flex: 1, alignItems: "center" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <View style={{ width: 8, height: 3, backgroundColor: secondary_candidates[1], borderRadius: 1.5 }} />
              <Text style={{ fontSize: 12, color: "#fff", opacity: 0.7 }}>Recent period</Text>
            </View>
            <Text style={{ fontSize: 18, fontWeight: "600", color: secondary_candidates[1] }}>{Math.round(thisWeekTotal / 7)}zł</Text>
            <Text style={{ fontSize: 10, color: "#fff", opacity: 0.5 }}>daily average</Text>
          </View>

          <View style={{ flex: 1, alignItems: "center" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <View style={{ width: 8, height: 3, backgroundColor: secondary_candidates[3], borderRadius: 1.5 }} />
              <Text style={{ fontSize: 12, color: "#fff", opacity: 0.7 }}>Previous period</Text>
            </View>
            <Text style={{ fontSize: 18, fontWeight: "600", color: secondary_candidates[3] }}>{Math.round(lastWeekTotal / 7)}zł</Text>
            <Text style={{ fontSize: 10, color: "#fff", opacity: 0.5 }}>daily average</Text>
          </View>
        </View>

        <View
          style={{
            alignItems: "center",
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: Color(Colors.primary).lighten(1).alpha(0.2).string(),
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: weekDifference >= 0 ? "#FF8A80" : "#4ECDC4",
              }}
            >
              {weekDifference >= 0 ? "+" : ""}
              {weekDifference}zł
            </Text>
            <Text style={{ fontSize: 12, color: "#fff", opacity: 0.6 }}>{weekDifference >= 0 ? "increase" : "decrease"} vs previous</Text>
          </View>

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
            <Ripple
              style={{
                backgroundColor: Color(Colors.secondary).alpha(0.2).string(),
                borderWidth: 1,
                borderColor: Color(Colors.secondary).alpha(0.3).string(),
                paddingHorizontal: 16,
                paddingVertical: 8,
                flexDirection: "row",
                borderRadius: 8,
                alignItems: "center",
                gap: 8,
              }}
            >
              <AntDesign name="clockcircleo" size={16} color={Colors.secondary} />
              <Text style={{ color: Colors.secondary, fontSize: 12, fontWeight: "600" }}>
                {moment(dateRange[0]).format("MMM DD")} - {moment(dateRange[1]).format("MMM DD, YYYY")}
              </Text>
            </Ripple>
          </MenuView>
        </View>
      </View>

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

export default WeeklyComparisonChart;
