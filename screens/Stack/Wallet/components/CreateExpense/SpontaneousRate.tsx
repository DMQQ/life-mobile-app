import { View, Text, StyleSheet } from "react-native";
import Ripple from "react-native-material-ripple";
import Colors from "@/constants/Colors";
import Animated, { FadeIn } from "react-native-reanimated";
import lowOpacity from "@/utils/functions/lowOpacity";
import Feedback from "react-native-haptic-feedback";

const spontaneousOptions = [
  {
    label: "Budgeted for",
    value: 0,
    icon: "📅",
  },
  {
    label: "Planned purchase",
    value: 20,
    icon: "📝",
  },
  {
    label: "Sale opportunity",
    value: 40,
    icon: "🏷️",
  },
  {
    label: "Quick decision",
    value: 60,
    icon: "⏱️",
  },
  {
    label: "Spontaneous treat",
    value: 80,
    icon: "🍦",
  },
  {
    label: "Complete impulse",
    value: 100,
    icon: "🛍️",
  },
];

// Utility function for getting color based on spontaneity rate
export const getRateColor = (rate) => {
  if (rate <= 20) return "#66E875"; // Green for planned
  if (rate <= 60) return "#FFA726"; // Orange for middle range
  return "#F07070"; // Red for impulsive
};

// Standalone SpontaneousRate chip component for the scrollview
export const SpontaneousRateChip = ({ value, onPress }) => {
  // Find the selected option for display
  const selectedOption = spontaneousOptions.find((option) => option.value === value) || spontaneousOptions[0];
  const color = getRateColor(value);

  return (
    <Ripple
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: value === 0 ? Colors.primary_lighter : `${color}30`, // Add 30 (hex) for transparency
        },
      ]}
    >
      <Text style={{ fontSize: 15 }}>{selectedOption.icon}</Text>
      <Text
        style={{
          color: value === 0 ? "rgba(255,255,255,0.7)" : color,
          fontSize: 14,
        }}
      >
        Spontaneous
      </Text>
    </Ripple>
  );
};

// Full SpontaneousRate selector for the changeView area
export const SpontaneousRateSelector = ({ value, setValue, dismiss }) => {
  return (
    <Animated.View entering={FadeIn} style={styles.selectorContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Spontaneous Rate</Text>
        <Text style={styles.subtitle}>How planned was this purchase?</Text>
      </View>

      <View style={styles.optionsGrid}>
        {spontaneousOptions.map((option) => (
          <Ripple
            key={option.value}
            style={[
              styles.optionButton,
              {
                backgroundColor: option.value === value ? lowOpacity(getRateColor(option.value), 0.25) : Colors.primary_lighter,
              },
            ]}
            onPress={() => {
              Feedback.trigger("impactLight");
              setValue(option.value);
              setTimeout(() => dismiss(), 300);
            }}
          >
            <Text style={styles.optionIcon}>{option.icon}</Text>
            <Text
              style={[
                styles.optionLabel,
                {
                  color: option.value === value ? getRateColor(option.value) : "rgba(255,255,255,0.9)",
                },
              ]}
            >
              {option.label}
            </Text>
            <View
              style={[
                styles.rateIndicator,
                {
                  backgroundColor: getRateColor(option.value),
                  opacity: option.value === value ? 1 : 0.3,
                },
              ]}
            >
              <Text style={styles.rateValue}>{option.value}%</Text>
            </View>
          </Ripple>
        ))}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  chip: {
    padding: 7.5,
    paddingHorizontal: 15,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 15,
    flex: 1,
  },
  selectorContainer: {
    flex: 1,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.7)",
  },
  optionsGrid: {
    flex: 1,
    gap: 15,
  },
  optionButton: {
    flexDirection: "row",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  optionIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
  },
  rateIndicator: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  rateValue: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  cancelButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  cancelButtonText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 16,
    fontWeight: "600",
  },
});
