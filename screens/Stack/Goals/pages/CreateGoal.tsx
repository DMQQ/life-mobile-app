import Button from "@/components/ui/Button/Button";
import Header from "@/components/ui/Header/Header";
import ScreenContainer from "@/components/ui/ScreenContainer";
import ValidatedInput from "@/components/ui/ValidatedInput";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Formik, FormikProps } from "formik";
import { FlatList, ScrollView, Text, View, StyleSheet, ViewStyle, TextStyle } from "react-native";
import Colors from "@/constants/Colors";
import { useGoal } from "../hooks/hooks";
import Layout from "@/constants/Layout";
import Ripple from "react-native-material-ripple";
import RangeSlider from "@/components/ui/RangePicker";
import { useState } from "react";
import * as yup from "yup";

// Type definitions
interface FormValues {
  name: string;
  icon: string;
  description: string;
  min: number;
  target: number;
  unit: string;
}

interface CreateGoalProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
}

interface MultiplierOption {
  label: string;
  value: number;
}

interface UnitCategory {
  label: string;
  value: UnitCategoryKey | "all";
}

type UnitCategoryKey = "time" | "reading" | "weight" | "distance" | "exercise" | "volume" | "food" | "medicine";

type UnitMap = {
  [key in UnitCategoryKey]: string[];
};

// Validation schema
const validationSchema = yup.object().shape({
  name: yup.string().required("Goal name is required"),
  icon: yup.string().required("Icon is required"),
  description: yup.string().required("Description is required"),
  min: yup.number().required("Min is required"),
  target: yup.number().required("Target is required"),
  unit: yup.string().required("Unit is required"),
});

const initialValues: FormValues = {
  name: "",
  icon: "",
  description: "",
  min: 0,
  target: 50,
  unit: "",
};

// Common units for goals categorized for better browsing
const UNITS: UnitMap = {
  time: ["Hours", "Minutes", "Days", "Weeks", "Months", "Years"],
  reading: ["Pages", "Books", "Chapters"],
  weight: ["Kilograms", "Pounds"],
  distance: ["Meters", "Kilometers", "Miles", "Steps"],
  exercise: ["Reps", "Sets", "Calories"],
  volume: ["Liters", "Gallons", "Ounces", "Cups", "Glasses", "Bottles"],
  food: ["Packets", "Servings", "Portions", "Plates", "Bowls", "Slices", "Pieces"],
  medicine: ["Doses", "Tablets", "Capsules", "Pills", "Applications"],
};

// Flatten categories for display
const ALL_UNITS: string[] = Object.values(UNITS).flat();

export default function CreateGoal({ navigation }: CreateGoalProps): JSX.Element {
  const { createGoals } = useGoal();
  const [multiplier, setMultiplier] = useState<number>(1);
  const [unitCategory, setUnitCategory] = useState<UnitCategoryKey | "all">("all");

  const onSubmit = (values: FormValues): void => {
    createGoals({
      variables: {
        input: {
          name: values.name,
          icon: values.icon,
          description: values.description,
          min: +values.min * multiplier,
          max: +values.target * multiplier,
          target: +values.target,
          unit: values.unit === "None" ? "" : values.unit,
        },
      },
      onCompleted: () => navigation.goBack(),
    });
  };

  const getMultiplierOptions = (): MultiplierOption[] => {
    return [
      { label: "x1", value: 1 },
      { label: "x10", value: 10 },
      { label: "x100", value: 100 },
    ];
  };

  const getUnitCategories = (): UnitCategory[] => {
    return [
      { label: "All", value: "all" },
      { label: "Time", value: "time" },
      { label: "Reading", value: "reading" },
      { label: "Weight", value: "weight" },
      { label: "Distance", value: "distance" },
      { label: "Exercise", value: "exercise" },
      { label: "Volume", value: "volume" },
      { label: "Food", value: "food" },
      { label: "Medicine", value: "medicine" },
    ];
  };

  const getFilteredUnits = (): string[] => {
    return unitCategory === "all" ? ALL_UNITS : UNITS[unitCategory] || [];
  };

  return (
    <ScreenContainer style={styles.container}>
      <Header goBack title="Create New Goal" />
      <Formik<FormValues> validationSchema={validationSchema} onSubmit={onSubmit} initialValues={initialValues}>
        {(f: FormikProps<FormValues>) => (
          <>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
              {/* Icon Selector */}
              <View style={styles.iconSelectorContainer}>
                <Ripple
                  style={[styles.iconButton, f.values.icon ? styles.iconButtonSelected : {}]}
                  onPress={() =>
                    navigation.navigate("IconPicker", {
                      onSelectIcon: (icon) => {
                        f.setFieldValue("icon", icon);
                      },
                      selectedIcon: f.values.icon,
                    })
                  }
                >
                  <MaterialCommunityIcons name={f.values.icon || "plus-circle-outline"} size={90} color={Colors.secondary} />
                </Ripple>
                <Text style={styles.iconHelperText}>{f.values.icon ? "Tap to change icon" : "Tap to choose an icon for your goal"}</Text>
              </View>

              {/* Goal Details */}
              <View style={styles.section}>
                <ValidatedInput
                  showLabel
                  label="Goal Name"
                  name="name"
                  placeholder="What do you want to achieve?"
                  formik={f}
                  containerStyle={styles.inputContainer}
                />

                <ValidatedInput
                  showLabel
                  label="Description"
                  name="description"
                  placeholder="Add some details about your goal"
                  formik={f}
                  multiline
                  numberOfLines={3}
                  containerStyle={styles.inputContainer}
                />
              </View>

              {/* Goal Range */}
              <View style={styles.section}>
                <View style={styles.rangeHeader}>
                  <View>
                    <Text style={styles.rangeValueText}>
                      {f.values.min * multiplier} <Text style={{ fontSize: 13 }}>(MIN)</Text> - {f.values.target * multiplier}{" "}
                      <Text style={{ fontSize: 13 }}>(DESIRED)</Text>
                      {f.values.unit !== "None" && <Text style={styles.subText}> {f.values.unit}</Text>}
                    </Text>
                  </View>

                  <View style={styles.multiplierContainer}>
                    {getMultiplierOptions().map((option: MultiplierOption) => (
                      <Ripple
                        key={option.value.toString()}
                        style={[styles.multiplierButton, multiplier === option.value && styles.multiplierButtonActive]}
                        onPress={() => setMultiplier(option.value)}
                      >
                        <Text style={[styles.multiplierText, multiplier === option.value && styles.multiplierTextActive]}>
                          {option.label}
                        </Text>
                      </Ripple>
                    ))}
                  </View>
                </View>

                <View style={styles.sliderContainer}>
                  <RangeSlider
                    range={[0, 100]}
                    defaultValues={[f.values.min, f.values.target]}
                    onChange={(values) => {
                      console.log(values);
                      f.setFieldValue("min", values[0]);
                      f.setFieldValue("target", values[1]);
                    }}
                    barHeight={20}
                    handleSize={30}
                    barStyle={styles.sliderBar}
                    fillStyle={styles.sliderFill}
                    handleStyle={styles.sliderHandle}
                  />
                </View>
              </View>

              {/* Units Selection */}
              <View style={styles.section}>
                {/* Unit Categories */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScrollView}>
                  {getUnitCategories().map((category: UnitCategory) => (
                    <Ripple
                      key={category.value}
                      style={[styles.categoryButton, unitCategory === category.value && styles.categoryButtonActive]}
                      onPress={() => setUnitCategory(category.value as UnitCategoryKey | "all")}
                    >
                      <Text style={[styles.categoryText, unitCategory === category.value && styles.categoryTextActive]}>
                        {category.label}
                      </Text>
                    </Ripple>
                  ))}
                </ScrollView>

                {/* Units */}
                <FlatList<string>
                  keyExtractor={(item: string) => item}
                  data={["None", ...getFilteredUnits()]}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.unitsList}
                  renderItem={({ item }: { item: string }) => (
                    <Ripple
                      onPress={() => f.setFieldValue("unit", item)}
                      style={[styles.unitButton, f.values.unit === item && styles.unitButtonActive]}
                    >
                      <Text style={[styles.unitText, f.values.unit === item && styles.unitTextActive]}>{item}</Text>
                    </Ripple>
                  )}
                />
              </View>

              {/* Spacer for bottom button */}
              <View style={styles.bottomSpacer} />
            </ScrollView>
            <View style={styles.buttonContainer}>
              <Button onPress={() => f.handleSubmit()} style={styles.createButton}>
                Create Goal
              </Button>
            </View>
          </>
        )}
      </Formik>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 0,
    backgroundColor: Colors.primary,
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 15,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  iconSelectorContainer: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
  },
  iconButton: {
    width: 150,
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.primary_lighter,
    borderRadius: 75,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.1)",
  },
  iconButtonSelected: {
    borderColor: Colors.secondary,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  iconHelperText: {
    color: "rgba(255,255,255,0.7)",
    marginTop: 10,
  },
  section: {
    marginBottom: 25,
    backgroundColor: Colors.primary_lighter,
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 18,
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 15,
  },
  rangeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  rangeValueText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
  },
  subText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 16,
  },
  multiplierContainer: {
    flexDirection: "row",
  },
  multiplierButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginLeft: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  multiplierButtonActive: {
    backgroundColor: Colors.secondary,
  },
  multiplierText: {
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
  },
  multiplierTextActive: {
    color: "#FFFFFF",
  },
  sliderContainer: {
    marginTop: 10,
  },
  sliderBar: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 10,
  },
  sliderFill: {
    backgroundColor: Colors.secondary,
  },
  sliderHandle: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: Colors.secondary,
  },
  categoryScrollView: {
    marginBottom: 15,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  categoryButtonActive: {
    backgroundColor: Colors.secondary,
  },
  categoryText: {
    color: "rgba(255,255,255,0.8)",
  },
  categoryTextActive: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  unitsList: {
    paddingVertical: 5,
  },
  unitButton: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 12,
    marginRight: 10,
  },
  unitButtonActive: {
    borderColor: Colors.secondary,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  unitText: {
    color: "rgba(255,255,255,0.8)",
  },
  unitTextActive: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  bottomSpacer: {
    height: 60,
  },
  buttonContainer: {
    padding: 15,
    backgroundColor: Colors.primary,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  createButton: {
    width: "100%",
    borderRadius: 30,
  },
});
