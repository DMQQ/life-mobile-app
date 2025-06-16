import React, { useMemo, useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { useQuery, gql } from "@apollo/client";
import moment from "moment";
import Ripple from "react-native-material-ripple";
import { AntDesign, MaterialIcons, Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { MenuView } from "@react-native-menu/menu";
import DateTimePicker from "react-native-modal-datetime-picker";
import Animated, { FadeInDown, FadeIn, FadeOut } from "react-native-reanimated";
import Colors from "@/constants/Colors";
import Layout from "@/constants/Layout";
import { AnimatedNumber } from "@/components";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ZeroExpenseStreak {
  start: string;
  end: string;
  length: number;
}

interface ZeroExpenseDays {
  days: string[];
  avg: number;
  streak: ZeroExpenseStreak[];
  saved: number;
}

const GET_ZERO_SPENDINGS = gql`
  query GetZeroSpendings($startDate: String!, $endDate: String!) {
    statisticsZeroExpenseDays(startDate: $startDate, endDate: $endDate) {
      days
      avg
      streak {
        start
        end
        length
      }
      saved
    }
  }
`;

const AnimatedItem = ({
  label,
  value,
  icon,
  formatType = "currency",
  width,
  index,
}: {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  formatType?: "currency" | "percentage" | "number" | "days";
  width?: number;
  index: number;
}) => {
  const numericValue = typeof value === "string" ? parseFloat(value.replace(/[^0-9.-]/g, "")) || 0 : value;

  const getFormatValue = () => {
    switch (formatType) {
      case "currency":
        return (val: number) => `${val.toFixed(2)}zł`;
      case "percentage":
        return (val: number) => `${val.toFixed(1)}%`;
      case "days":
        return (val: number) => `${Math.round(val)} days`;
      case "number":
      default:
        return (val: number) => Math.round(val).toString();
    }
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 75)}>
      <Ripple style={[styles.item, { width: width || (Layout.screen.width - 30 - 10) / 2 }]}>
        <Animated.View entering={FadeIn.delay((index + 1) * 85)}>{icon}</Animated.View>
        <View>
          {typeof value === "string" && isNaN(numericValue) ? (
            <Text style={styles.itemValue}>{value}</Text>
          ) : (
            <AnimatedNumber
              style={styles.itemValue}
              value={numericValue}
              step={formatType === "currency" ? numericValue / 25 : 1}
              formatValue={getFormatValue()}
            />
          )}
          <Text style={styles.itemLabel}>{label}</Text>
        </View>
      </Ripple>
    </Animated.View>
  );
};

const StreakTile = ({
  streak,
  isLongest = false,
  onPress,
  index,
}: {
  streak: ZeroExpenseStreak;
  isLongest?: boolean;
  onPress?: () => void;
  index: number;
}) => {
  const colors = [
    { bg: Colors.secondary, accent: Colors.secondary_light_1 },
    { bg: "#FF6B6B", accent: "#FF8E8E" },
    { bg: "#4ECDC4", accent: "#6FDED7" },
    { bg: "#45B7D1", accent: "#68C5D9" },
    { bg: "#96CEB4", accent: "#A8D4C0" },
    { bg: "#FFEAA7", accent: "#FFF0C4" },
    { bg: "#DDA0DD", accent: "#E6B3E6" },
    { bg: "#FFB347", accent: "#FFC56B" },
  ];

  const colorSet = isLongest ? { bg: "#FFD700", accent: "#FFE55C" } : colors[index % colors.length];

  return (
    <Ripple onPress={onPress} style={[styles.streakTileHorizontal, { backgroundColor: colorSet.bg }]}>
      <View style={styles.streakContentRow}>
        {isLongest && (
          <View style={styles.crownIcon}>
            <Text style={styles.crownEmoji}>👑</Text>
          </View>
        )}
        <View style={styles.streakMainContent}>
          <Text style={[styles.streakLengthHorizontal, { color: isLongest ? "#000" : "#fff" }]}>{streak.length} days</Text>
          <Text style={[styles.streakDateHorizontal, { color: isLongest ? "#555" : "rgba(255,255,255,0.9)" }]}>
            {moment(streak.start).format("MMM D")} - {moment(streak.end).format("MMM D")}
          </Text>
        </View>
      </View>
    </Ripple>
  );
};

export default function ZeroExpenseStats() {
  const [dateRange, setDateRange] = useState<[string, string]>([
    moment().subtract(3, "weeks").format("YYYY-MM-DD"),
    moment().format("YYYY-MM-DD"),
  ]);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const {
    data: zeroSpendings,
    loading,
    error,
  } = useQuery(GET_ZERO_SPENDINGS, {
    variables: { startDate: dateRange[0], endDate: dateRange[1] },
    onError: (error) => console.error("Zero spendings query error:", error),
  });

  const data: ZeroExpenseDays | null = zeroSpendings?.statisticsZeroExpenseDays;

  const longestStreak = useMemo(() => {
    if (!data?.streak?.length) return null;
    return data.streak.reduce((longest, current) => (current.length > longest.length ? current : longest));
  }, [data?.streak]);

  const currentStreak = useMemo(() => {
    if (!data?.streak?.length) return null;
    const today = moment().format("YYYY-MM-DD");
    return data.streak.find((s) => moment(s.end).format("YYYY-MM-DD") === today);
  }, [data?.streak]);

  const totalDays = moment(dateRange[1]).diff(moment(dateRange[0]), "days") + 1;
  const successRate = data ? (data.days.length / totalDays) * 100 : 0;

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

  if (loading) {
    return (
      <Animated.View entering={FadeIn} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.secondary} />
      </Animated.View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Unable to load zero expense data</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Zero Expense Analytics</Text>
            <Text style={styles.headerSubtitle}>
              {moment(dateRange[0]).format("MMM D")} - {moment(dateRange[1]).format("MMM D, YYYY")}
            </Text>
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
            <Ripple style={styles.dateToggleButton}>
              <AntDesign name="clockcircleo" size={16} color="#fff" />
              <Text style={styles.dateToggleText}>
                {moment(dateRange[0]).format("DD.MM")} - {moment(dateRange[1]).format("DD.MM")}
              </Text>
            </Ripple>
          </MenuView>
        </View>

        {/* Current Streak Alert */}
        {currentStreak && (
          <View style={styles.currentStreakAlert}>
            <Text style={styles.currentStreakText}>🔥 Current streak: {currentStreak.length} days!</Text>
            <Text style={styles.currentStreakSubtext}>Started {moment(currentStreak.start).format("MMM D, YYYY")}</Text>
          </View>
        )}

        {/* Animated Stats Grid */}
        <View style={styles.statsGrid}>
          <AnimatedItem
            label="Zero expense days"
            value={data.days.length}
            icon={<MaterialIcons name="event-available" size={25} color={Colors.secondary} />}
            formatType="number"
            index={0}
          />
          <AnimatedItem
            label="Success rate"
            value={successRate}
            icon={<Ionicons name="trending-up" size={25} color="lightgreen" />}
            formatType="percentage"
            index={1}
          />
          <AnimatedItem
            label="Money saved"
            value={data.saved}
            icon={<FontAwesome5 name="piggy-bank" size={25} color="lightgreen" />}
            formatType="currency"
            index={2}
          />
          <AnimatedItem
            label="Avg saved/day"
            value={data.avg}
            icon={<MaterialIcons name="attach-money" size={25} color={Colors.warning} />}
            formatType="currency"
            index={3}
          />
          <AnimatedItem
            label="Longest streak"
            value={longestStreak?.length || 0}
            icon={<Ionicons name="flame" size={25} color={Colors.warning} />}
            formatType="days"
            index={4}
          />
          <AnimatedItem
            label="Total streaks"
            value={data.streak.length}
            icon={<Ionicons name="flame" size={25} color={Colors.error} />}
            formatType="number"
            index={5}
          />
        </View>

        {/* Streak History */}
        <Animated.View entering={FadeInDown.delay(75 * 6 + 50)} style={styles.streaksSection}>
          <Text style={styles.sectionTitle}>Streak History</Text>
          {data.streak.length === 0 ? (
            <View style={styles.noStreaksContainer}>
              <Text style={styles.noStreaksIcon}>🎯</Text>
              <Text style={styles.noStreaksText}>No streaks recorded yet. Start your first streak today!</Text>
              <Text style={styles.noStreaksSubtext}>A streak starts when you have consecutive days without expenses</Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.streaksScrollView}
              contentContainerStyle={styles.streaksScrollContent}
            >
              {[...data.streak]
                .sort((a, b) => b.length - a.length)
                .slice(0, 8)
                .map((s, index) => (
                  <StreakTile
                    key={`${s.start}-${s.end}`}
                    streak={s}
                    isLongest={index === 0}
                    index={index}
                    onPress={() => console.log("Streak details:", s)}
                  />
                ))}
            </ScrollView>
          )}
        </Animated.View>
      </ScrollView>

      {/* Date Pickers */}
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
  container: {
    backgroundColor: Colors.primary,
    width: Layout.screen.width - 30,
    marginTop: 25,
  },
  loadingContainer: {
    backgroundColor: Colors.primary,
    padding: 40,
    borderRadius: 15,
    alignItems: "center",
    height: 587,
  },
  loadingText: {
    color: Colors.text_light,
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: Colors.primary_light,
    padding: 40,
    borderRadius: 15,
    alignItems: "center",
  },
  errorText: {
    color: Colors.error,
    fontSize: 16,
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  headerTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  headerSubtitle: {
    color: "gray",
    marginTop: 5,
    fontSize: 13,
  },
  dateToggleButton: {
    backgroundColor: Colors.secondary,
    padding: 4,
    paddingHorizontal: 8,
    flexDirection: "row",
    borderRadius: 100,
    alignItems: "center",
    gap: 4,
  },
  dateToggleText: {
    color: "#fff",
    fontSize: 11,
    textAlign: "center",
    fontWeight: "600",
  },
  currentStreakAlert: {
    backgroundColor: Colors.secondary,
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
    alignItems: "center",
  },
  currentStreakText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  currentStreakSubtext: {
    color: "#fff",
    fontSize: 12,
    opacity: 0.8,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 25,
  },
  item: {
    marginTop: 5,
    flexDirection: "row",
    gap: 15,
    padding: 25,
    backgroundColor: Colors.primary_light,
    borderRadius: 15,
  },
  itemValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  itemLabel: {
    color: "grey",
    fontSize: 12,
    marginTop: 2,
  },
  sectionTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 15,
  },
  streaksSection: {
    marginBottom: 0,
  },
  streaksScrollView: {
    marginHorizontal: -15,
    paddingHorizontal: 15,
  },
  streaksScrollContent: {
    paddingRight: 15,
  },
  noStreaksContainer: {
    backgroundColor: Colors.primary_light,
    padding: 30,
    borderRadius: 15,
    alignItems: "center",
  },
  noStreaksIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  noStreaksText: {
    color: Colors.text_light,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  noStreaksSubtext: {
    color: Colors.text_dark,
    textAlign: "center",
    fontSize: 12,
  },
  streakTileHorizontal: {
    width: 180,
    height: 80,
    padding: 16,
    borderRadius: 15,
    marginRight: 12,
    position: "relative",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  streakContentRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  crownIcon: {
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  crownEmoji: {
    fontSize: 20,
  },
  streakMainContent: {
    flex: 1,
    justifyContent: "center",
  },
  streakLengthHorizontal: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 2,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  streakDateHorizontal: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "500",
  },
  streakProgressHorizontal: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
});
