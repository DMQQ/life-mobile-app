import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";

interface ValuePickerProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}

const ValuePicker = ({ label, value, min, max, step, onChange }: ValuePickerProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value.toString());

  const increment = () => {
    if (value + step <= max) {
      onChange(value + step);
    }
  };

  const decrement = () => {
    if (value - step >= min) {
      onChange(value - step);
    }
  };

  // Calculate step sizes for faster value changes
  const bigStep = Math.max(step * 5, Math.floor((max - min) / 20));

  const incrementBig = () => {
    const newValue = Math.min(max, value + bigStep);
    onChange(newValue);
  };

  const decrementBig = () => {
    const newValue = Math.max(min, value - bigStep);
    onChange(newValue);
  };

  const handleInputChange = (text: string) => {
    setInputValue(text);
  };

  const handleInputBlur = () => {
    let newValue = parseInt(inputValue);

    if (isNaN(newValue)) {
      // Reset to previous value if input is not a number
      setInputValue(value.toString());
      setIsEditing(false);
      return;
    }

    // Clamp value between min and max
    newValue = Math.max(min, Math.min(max, newValue));

    // Update the value
    onChange(newValue);
    setInputValue(newValue.toString());
    setIsEditing(false);
  };

  const handleValueContainerPress = () => {
    setIsEditing(true);
  };

  return (
    <View style={styles.pickerContainer}>
      <Text style={styles.pickerLabel}>{label}</Text>
      <View style={styles.pickerControls}>
        <TouchableOpacity style={[styles.pickerButton, styles.pickerButtonBig]} onPress={decrementBig} disabled={value <= min}>
          <MaterialCommunityIcons
            name="chevron-double-left"
            size={24}
            color={value <= min ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.9)"}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.pickerButton} onPress={decrement} disabled={value <= min}>
          <MaterialCommunityIcons name="chevron-left" size={24} color={value <= min ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.9)"} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.valueContainer} onPress={handleValueContainerPress} activeOpacity={0.7}>
          {isEditing ? (
            <TextInput
              style={styles.valueInput}
              value={inputValue}
              onChangeText={handleInputChange}
              onBlur={handleInputBlur}
              keyboardType="numeric"
              selectTextOnFocus
              autoFocus
              maxLength={String(max).length}
            />
          ) : (
            <Text style={styles.valueText}>{value}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.pickerButton} onPress={increment} disabled={value >= max}>
          <MaterialCommunityIcons name="chevron-right" size={24} color={value >= max ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.9)"} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.pickerButton, styles.pickerButtonBig]} onPress={incrementBig} disabled={value >= max}>
          <MaterialCommunityIcons
            name="chevron-double-right"
            size={24}
            color={value >= max ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.9)"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const RangePickers = ({
  minValue,
  targetValue,
  onTargetChange,
  max = 100,
  step = 1,
  unit = "",
}: {
  minValue: number;
  targetValue: number;
  onMinChange: (value: number) => void;
  onTargetChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}) => {
  return (
    <View style={styles.container}>
      <ValuePicker label={`Target Goal ${unit}`} value={targetValue} min={minValue} max={max} step={step} onChange={onTargetChange} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  pickerContainer: {
    marginBottom: 15,
    width: "100%",
  },
  pickerLabel: {
    color: "rgba(255,255,255,0.7)",
    marginBottom: 8,
    fontSize: 14,
  },
  pickerControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.primary_light,
    borderRadius: 10,
    overflow: "hidden",
    height: 50,
  },
  pickerButton: {
    height: "100%",
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  pickerButtonBig: {
    backgroundColor: Colors.primary_lighter,
  },
  valueContainer: {
    paddingHorizontal: 15,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.secondary,
    minWidth: 60,
  },
  valueText: {
    color: Colors.foreground,
    fontWeight: "bold",
    fontSize: 18,
  },
  valueInput: {
    color: Colors.foreground,
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
    width: "100%",
    height: "100%",
    padding: 0,
    minWidth: 30,
  },
});

export default RangePickers;
