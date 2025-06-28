import moment from "moment";
import { Keyboard, StyleSheet, Text, View, TouchableWithoutFeedback } from "react-native";
import Colors from "@/constants/Colors";
import { memo, useCallback, useRef, useState } from "react";
import Ripple from "react-native-material-ripple";
import Layout from "@/constants/Layout";
import { AntDesign, Entypo, MaterialCommunityIcons } from "@expo/vector-icons";
import lowOpacity from "@/utils/functions/lowOpacity";
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  withSequence,
  withSpring,
  useAnimatedStyle,
  cancelAnimation,
  withTiming,
} from "react-native-reanimated";
import IconButton from "@/components/ui/IconButton/IconButton";
import Button from "@/components/ui/Button/Button";
import { useGoal } from "../hooks/hooks";
import Color from "color";
import DateTimePicker from "react-native-modal-datetime-picker";

// Types
interface QuickAction {
  label: string;
  value: number;
}

type QuickActionsMap = {
  [key: string]: QuickAction[];
};

interface AddGoalEntryProps {
  route: {
    params: {
      id: string;
    };
  };
  navigation: {
    goBack: () => void;
    navigate: (screen: string, params?: any) => void;
  };
}

interface Goal {
  id: string;
  name: string;
  icon: string;
  unit: string;
  min: number;
  max: number;
  target: number;
  description?: string;
}

// Quick actions map
const quickActions: QuickActionsMap = {
  target: [{ label: "1 goal", value: 1 }],
  dumbbell: [
    { label: "30 mins", value: 30 },
    { label: "1 hour", value: 60 },
    { label: "100 reps", value: 100 },
  ],
  run: [
    { label: "2km", value: 2 },
    { label: "5km", value: 5 },
    { label: "10km", value: 10 },
  ],
  bike: [
    { label: "5km", value: 5 },
    { label: "10km", value: 10 },
    { label: "20km", value: 20 },
  ],
  meditation: [
    { label: "10 min", value: 10 },
    { label: "20 min", value: 20 },
    { label: "30 min", value: 30 },
  ],
  "food-apple": [
    { label: "Snack", value: 200 },
    { label: "Meal", value: 600 },
    { label: "Day", value: 2000 },
  ],
  water: [
    { label: "Cup", value: 250 },
    { label: "500ml", value: 500 },
    { label: "1L", value: 1000 },
  ],
  "book-open-page-variant": [
    { label: "10 pages", value: 10 },
    { label: "Chapter", value: 25 },
    { label: "Hour", value: 60 },
  ],
  brain: [
    { label: "15 min", value: 15 },
    { label: "30 min", value: 30 },
    { label: "1 hour", value: 60 },
  ],
  cash: [
    { label: "$10", value: 10 },
    { label: "$50", value: 50 },
    { label: "$100", value: 100 },
  ],
  "heart-pulse": [
    { label: "15 min", value: 15 },
    { label: "30 min", value: 30 },
    { label: "60 min", value: 60 },
  ],
  "bed-clock": [
    { label: "7h", value: 7 },
    { label: "8h", value: 8 },
    { label: "9h", value: 9 },
  ],
  "language-javascript": [
    { label: "30 min", value: 30 },
    { label: "1h", value: 60 },
    { label: "Problem", value: 1 },
  ],
  "code-tags": [
    { label: "Bug fix", value: 1 },
    { label: "Feature", value: 1 },
    { label: "Hour", value: 60 },
  ],
  music: [
    { label: "15 min", value: 15 },
    { label: "30 min", value: 30 },
    { label: "Song", value: 1 },
  ],
  coffee: [
    { label: "Cup", value: 1 },
    { label: "ml", value: 200 },
  ],
  "smoking-off": [
    { label: "Day", value: 1 },
    { label: "Week", value: 7 },
  ],
  weight: [
    { label: "-0.5kg", value: -0.5 },
    { label: "-1kg", value: -1 },
  ],
  yoga: [
    { label: "15 min", value: 15 },
    { label: "30 min", value: 30 },
    { label: "1h", value: 60 },
  ],
  pill: [
    { label: "Dose", value: 1 },
    { label: "Day", value: 1 },
  ],
  // New mood tracking with emoji
  emoticon: [
    { label: "😢 (1)", value: 1 },
    { label: "😐 (3)", value: 3 },
    { label: "😊 (5)", value: 5 },
  ],
  "emoticon-happy": [
    { label: "😔 (2)", value: 2 },
    { label: "😊 (4)", value: 4 },
    { label: "😁 (5)", value: 5 },
  ],
  "emoticon-sad": [
    { label: "😭 (1)", value: 1 },
    { label: "😢 (2)", value: 2 },
    { label: "😔 (3)", value: 3 },
  ],
  "weather-sunny": [
    { label: "🌧️ (1)", value: 1 },
    { label: "⛅ (3)", value: 3 },
    { label: "☀️ (5)", value: 5 },
  ],
  "stress-level": [
    { label: "😌 Low", value: 1 },
    { label: "😐 Medium", value: 3 },
    { label: "😫 High", value: 5 },
  ],
  "energy-level": [
    { label: "😴 Low", value: 1 },
    { label: "😐 Medium", value: 3 },
    { label: "⚡ High", value: 5 },
  ],
  // Productivity
  "check-circle": [
    { label: "Task", value: 1 },
    { label: "Project", value: 1 },
    { label: "3 tasks", value: 3 },
  ],
  timer: [
    { label: "Pomodoro", value: 1 },
    { label: "Hours", value: 1 },
    { label: "Sessions", value: 1 },
  ],
  "hammer-wrench": [
    { label: "Task", value: 1 },
    { label: "Hours", value: 1 },
    { label: "Project", value: 1 },
  ],
  // Health
  "food-fork-drink": [
    { label: "Meal", value: 1 },
    { label: "Calories", value: 500 },
    { label: "Snack", value: 1 },
  ],
  beer: [
    { label: "Drink", value: 1 },
    { label: "Day", value: 1 },
    { label: "Week", value: 7 },
  ],
  steps: [
    { label: "1,000", value: 1000 },
    { label: "5,000", value: 5000 },
    { label: "10,000", value: 10000 },
  ],
  // Finances
  bank: [
    { label: "$10", value: 10 },
    { label: "$100", value: 100 },
    { label: "$1000", value: 1000 },
  ],
  "currency-usd": [
    { label: "Expense", value: -1 },
    { label: "Income", value: 1 },
    { label: "Saving", value: 1 },
  ],
  // Habits
  calendar: [
    { label: "Day", value: 1 },
    { label: "Week", value: 7 },
    { label: "Month", value: 30 },
  ],
  "calendar-check": [
    { label: "Streak", value: 1 },
    { label: "Week", value: 7 },
    { label: "Month", value: 30 },
  ],
  // Learning
  school: [
    { label: "Lesson", value: 1 },
    { label: "Hour", value: 1 },
    { label: "Chapter", value: 1 },
  ],
  video: [
    { label: "Video", value: 1 },
    { label: "Course", value: 1 },
    { label: "Hour", value: 1 },
  ],
  pencil: [
    { label: "Page", value: 1 },
    { label: "Chapter", value: 1 },
    { label: "Essay", value: 1 },
  ],
  // Miscellaneous
  flask: [
    { label: "Experiment", value: 1 },
    { label: "Project", value: 1 },
    { label: "Hour", value: 1 },
  ],
  gamepad: [
    { label: "Hour", value: 1 },
    { label: "Game", value: 1 },
    { label: "Level", value: 1 },
  ],
  phone: [
    { label: "Call", value: 1 },
    { label: "Minutes", value: 15 },
    { label: "Hour", value: 60 },
  ],
  account: [
    { label: "Meeting", value: 1 },
    { label: "Hour", value: 1 },
    { label: "Person", value: 1 },
  ],
  home: [
    { label: "Chore", value: 1 },
    { label: "Task", value: 1 },
    { label: "Hour", value: 1 },
  ],
  car: [
    { label: "Trip", value: 1 },
    { label: "Mile/km", value: 10 },
    { label: "Hour", value: 1 },
  ],
};

export default function AddGoalEntry({ route, navigation }: any) {
  const { id } = route.params;
  const { goals, upsertStats } = useGoal();
  const goal = goals.find((goal: Goal) => goal.id === id);
  const [amount, setAmount] = useState<string>("0");
  const [date, setDate] = useState<string>(moment().format("YYYY-MM-DD"));
  const [selectedQuickValue, setSelectedQuickValue] = useState<number | null>(null);

  const transformX = useSharedValue(0);
  const isAnimating = useSharedValue(false);

  const shake = () => {
    if (isAnimating.value) return;

    isAnimating.value = true;
    cancelAnimation(transformX);
    transformX.value = withSpring(15, { damping: 2, stiffness: 200, mass: 0.5 });

    setTimeout(() => {
      transformX.value = withSpring(-15, { damping: 2, stiffness: 200, mass: 0.5 });
      setTimeout(() => {
        transformX.value = withSpring(0, { damping: 2, stiffness: 200, mass: 0.5 }, (finished) => {
          if (finished) isAnimating.value = false;
        });
      }, 50);
    }, 50);
  };

  const handleSubmit = async () => {
    if (!goal || !amount || amount === "0") return;

    const parseAmount = (amount: string) => {
      if (amount.endsWith(".")) return +amount.slice(0, -1);

      if (amount.includes(".")) {
        const [int, dec] = amount.split(".");
        if (dec.length > 2) {
          return +int + +`0.${dec.slice(0, 2)}`;
        }
      }

      return +amount;
    };

    await upsertStats({
      variables: {
        goalsId: goal.id,
        value: parseAmount(amount),
        date: date,
      },
      refetchQueries: ["GetGoal"],
      onCompleted: () => navigation.goBack(),
      onError: (error) => console.error(JSON.stringify(error, null, 2)),
    });
  };

  const handleAmountChange = useCallback((value: string) => {
    return setAmount((prev) => {
      if (value === "C") {
        const val = prev.toString().slice(0, -1);
        return val.length === 0 ? "0" : val;
      }

      if (typeof +value === "number" && prev.includes(".") && prev.split(".")[1].length === 2) {
        shake();
        return prev;
      }

      if (prev.length === 1 && prev === "0" && value !== ".") {
        return value;
      }
      if (prev.includes(".") && value === ".") {
        shake();
        return prev;
      }
      if (prev.length === 0 && value === ".") {
        return "0.";
      }
      return prev + value;
    });
  }, []);

  const quickValues = goal?.icon ? quickActions[goal.icon] || [] : [];

  const handleQuickValuePress = (value: number) => {
    setAmount(value.toString());
    setSelectedQuickValue(value);
  };

  const scale = (n: number) => {
    "worklet";
    return Math.max(90 - n * 3.5, 35);
  };

  const animatedAmount = useAnimatedStyle(
    () => ({
      transform: [{ translateX: transformX.value }],
      fontSize: withTiming(scale(amount.length), { duration: 100 }),
    }),
    [amount]
  );

  const [showDatePicker, setShowDatePicker] = useState(false);

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={{ flex: 1 }}>
        <View style={styles.container}>
          <View style={{ justifyContent: "flex-end", flexDirection: "row" }}>
            <View style={{ position: "absolute", zIndex: 100, left: 0, top: 0 }}>
              <IconButton onPress={() => navigation.goBack()} icon={<AntDesign name="close" size={24} color="rgba(255,255,255,0.7)" />} />
            </View>

            <Ripple
              onPress={() => {
                setShowDatePicker((p) => !p);
              }}
              style={{
                padding: 10,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "500" }}>{date}</Text>
            </Ripple>
          </View>

          <View
            style={{
              height: 250,
              justifyContent: "center",
              width: "100%",
              alignItems: "center",
              flexDirection: "row",
              paddingHorizontal: 15,
            }}
          >
            {/* Goal icon and value display */}
            <View style={{ alignItems: "center" }}>
              <View style={{ flexDirection: "row", gap: 15, alignItems: "center" }}>
                <Animated.Text style={[{ color: "#fff", fontWeight: "bold" }, animatedAmount]}>
                  {amount}
                  <Text style={{ fontSize: 16, color: "rgba(255,255,255,0.7)" }}> {goal?.unit}</Text>
                </Animated.Text>
              </View>
              <View style={{ flexDirection: "row", gap: 5 }}>
                <MaterialCommunityIcons name={goal?.icon || "progress-check"} size={22.5} color={Colors.secondary} />

                <Text style={{ color: "rgba(255,255,255,0.7)", marginBottom: 15, fontSize: 18 }}>{goal?.name}</Text>
              </View>
            </View>
          </View>

          <View style={{ marginTop: 20, flex: 1, gap: 15, maxHeight: Layout.screen.height / 1.85 - 5 }}>
            <View
              style={{
                borderRadius: 35,
                flex: 1,
              }}
            >
              <Animated.View entering={FadeIn} style={{ gap: 10 }}>
                {/* Quick Values */}
                {quickValues.length > 0 && (
                  <View>
                    <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 16, marginBottom: 10, fontWeight: "500" }}>Quick Values</Text>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "flex-start" }}>
                        {quickValues.map((item, index) => (
                          <Ripple
                            key={`${item.label}-${index}`}
                            style={[styles.quickValueButton, selectedQuickValue === item.value && styles.quickValueButtonActive]}
                            onPress={() => handleQuickValuePress(item.value)}
                          >
                            <Text style={[styles.quickValueText, selectedQuickValue === item.value && styles.quickValueTextActive]}>
                              {item.label}
                            </Text>
                          </Ripple>
                        ))}
                      </View>
                      <Button
                        onPress={handleSubmit}
                        style={{
                          borderRadius: 10,
                          padding: 15,
                          paddingVertical: 5,
                          opacity: amount === "0" ? 0.5 : 1,
                        }}
                        disabled={amount === "0"}
                        fontStyle={{ fontSize: 14 }}
                      >
                        Save
                      </Button>
                    </View>
                  </View>
                )}
              </Animated.View>

              {/* Keypad */}
              <NumbersPad rotateBackButton={amount === "0"} handleAmountChange={handleAmountChange} navigation={navigation} />
            </View>
          </View>
        </View>
        <DateTimePicker
          isVisible={showDatePicker}
          mode="date"
          onConfirm={(date) => {
            setDate(moment(date).format("YYYY-MM-DD"));
            setShowDatePicker(false);
          }}
          onCancel={() => setShowDatePicker(false)}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

const NumbersPad = memo(
  ({
    handleAmountChange,
    rotateBackButton,
    navigation,
  }: {
    handleAmountChange: (val: string) => void;
    rotateBackButton: boolean;
    navigation: any;
  }) => {
    return (
      <Animated.View entering={FadeInDown} style={{ flex: 1, gap: 15, borderRadius: 35, justifyContent: "center" }}>
        {[
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9],
          [".", 0, "C"],
        ].map((row) => (
          <View style={{ flexDirection: "row", gap: 15 }} key={row.toString()}>
            {row.map((num) => (
              <NumpadNumber
                navigation={navigation}
                rotateBackButton={rotateBackButton}
                num={num}
                key={num.toString()}
                onPress={() => handleAmountChange(num.toString())}
              />
            ))}
          </View>
        ))}
      </Animated.View>
    );
  }
);

const AnimatedRipple = Animated.createAnimatedComponent(Ripple);

const NumpadNumber = (props: { onPress: VoidFunction; num: string | number; rotateBackButton: boolean; navigation: any }) => {
  const scale = useSharedValue(1);

  const onPress = () => {
    props.num === "C" && props.rotateBackButton ? props.navigation.goBack() : props.onPress();
    scale.value = withSequence(withSpring(1.5, { duration: 200 }), withSpring(1, { duration: 200 }));
  };

  const animatedScale = useAnimatedStyle(
    () => ({
      transform: [
        { scale: scale.value },
        {
          rotate: withTiming(props.num === "C" && props.rotateBackButton ? "-90deg" : "0deg", { duration: 150 }),
        },
      ],
    }),
    [props.rotateBackButton]
  );

  const interval = useRef<NodeJS.Timeout | null>(null);

  return (
    <View style={{ width: "30%", height: 75, overflow: "hidden", borderRadius: 100 }}>
      <AnimatedRipple
        rippleCentered
        rippleColor={Colors.secondary}
        rippleSize={50}
        onPress={onPress}
        onLongPress={() => {
          if (props.num !== "C") {
            interval.current = setInterval(() => {
              onPress();
            }, 50);
          }
        }}
        onPressOut={() => {
          if (interval.current) {
            clearInterval(interval.current!);
          }
        }}
        style={[
          {
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
          },
          animatedScale,
        ]}
      >
        {props.num === "C" ? (
          <Entypo name="chevron-left" size={40} color="#fff" />
        ) : (
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 24 }}>{props.num}</Text>
        )}
      </AnimatedRipple>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    gap: 15,
    backgroundColor: Colors.primary,
  },
  iconContainer: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.primary_lighter,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  quickValueButton: {
    backgroundColor: Colors.primary_lighter,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  quickValueButtonActive: {
    backgroundColor: lowOpacity(Colors.secondary, 0.3),
    borderColor: Colors.secondary,
  },
  quickValueText: {
    color: "rgba(255,255,255,0.9)",
    fontWeight: "500",
  },
  quickValueTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
