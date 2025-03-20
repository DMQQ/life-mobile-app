import Button from "@/components/ui/Button/Button";
import Header from "@/components/ui/Header/Header";
import ScreenContainer from "@/components/ui/ScreenContainer";
import ValidatedInput from "@/components/ui/ValidatedInput";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Formik, FormikProps } from "formik";
import { FlatList, ScrollView, Text, View, StyleSheet, ViewStyle, TextStyle, TextInput } from "react-native";
import Colors from "@/constants/Colors";
import { useGoal } from "../hooks/hooks";
import Layout from "@/constants/Layout";
import Ripple from "react-native-material-ripple";
import RangeSlider from "@/components/ui/RangePicker";
import { useState, useEffect } from "react";
import * as yup from "yup";
import RangePickers from "../components/RangePicker";

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
  icon: string;
  subcategories?: SubcategoryItem[];
}

interface SubcategoryItem {
  label: string;
  value: string;
}

interface RangePreset {
  min: number;
  target: number;
  max: number;
  suggestedMultiplier: number;
}

type UnitCategoryKey =
  | "time"
  | "reading"
  | "weight"
  | "distance"
  | "exercise"
  | "volume"
  | "food"
  | "medicine"
  | "mood"
  | "productivity"
  | "finance"
  | "habits";

type UnitMap = {
  [key in UnitCategoryKey]: {
    [subcategory: string]: string[];
  };
};

type UnitRangeMap = {
  [key: string]: RangePreset;
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

// Range presets for different unit types
const UNIT_RANGES: UnitRangeMap = {
  // Time ranges
  Hours: { min: 1, target: 4, max: 8, suggestedMultiplier: 1 },
  Minutes: { min: 15, target: 30, max: 60, suggestedMultiplier: 1 },
  Days: { min: 1, target: 4, max: 7, suggestedMultiplier: 1 },
  Weeks: { min: 1, target: 3, max: 4, suggestedMultiplier: 1 },
  Months: { min: 1, target: 6, max: 12, suggestedMultiplier: 1 },
  Years: { min: 1, target: 2, max: 5, suggestedMultiplier: 1 },

  // Reading ranges
  Pages: { min: 5, target: 20, max: 50, suggestedMultiplier: 1 },
  Books: { min: 1, target: 3, max: 12, suggestedMultiplier: 1 },
  Chapters: { min: 1, target: 5, max: 10, suggestedMultiplier: 1 },
  Articles: { min: 1, target: 5, max: 10, suggestedMultiplier: 1 },
  Blogs: { min: 1, target: 3, max: 7, suggestedMultiplier: 1 },

  // Weight ranges
  Kilograms: { min: 1, target: 5, max: 10, suggestedMultiplier: 1 },
  Pounds: { min: 2, target: 10, max: 20, suggestedMultiplier: 1 },
  Grams: { min: 100, target: 500, max: 1000, suggestedMultiplier: 1 },
  Ounces: { min: 5, target: 15, max: 30, suggestedMultiplier: 1 },

  // Distance ranges
  Meters: { min: 100, target: 500, max: 1000, suggestedMultiplier: 1 },
  Kilometers: { min: 1, target: 5, max: 10, suggestedMultiplier: 1 },
  Miles: { min: 1, target: 3, max: 10, suggestedMultiplier: 1 },
  Steps: { min: 1000, target: 7500, max: 10000, suggestedMultiplier: 1 },
  Floors: { min: 5, target: 15, max: 25, suggestedMultiplier: 1 },

  // Exercise ranges
  Reps: { min: 8, target: 12, max: 20, suggestedMultiplier: 1 },
  Sets: { min: 3, target: 4, max: 5, suggestedMultiplier: 1 },
  Calories: { min: 100, target: 300, max: 500, suggestedMultiplier: 1 },
  Workouts: { min: 1, target: 3, max: 5, suggestedMultiplier: 1 },
  Sessions: { min: 1, target: 3, max: 5, suggestedMultiplier: 1 },

  // Volume ranges
  Liters: { min: 1, target: 2, max: 3, suggestedMultiplier: 1 },
  Gallons: { min: 0.5, target: 1, max: 2, suggestedMultiplier: 1 },
  Cups: { min: 1, target: 6, max: 8, suggestedMultiplier: 1 },
  Glasses: { min: 1, target: 6, max: 8, suggestedMultiplier: 1 },
  Bottles: { min: 1, target: 2, max: 4, suggestedMultiplier: 1 },
  ML: { min: 250, target: 1000, max: 2000, suggestedMultiplier: 1 },

  // Food ranges
  Meals: { min: 2, target: 3, max: 5, suggestedMultiplier: 1 },
  Servings: { min: 1, target: 3, max: 5, suggestedMultiplier: 1 },
  Portions: { min: 1, target: 2, max: 3, suggestedMultiplier: 1 },
  Plates: { min: 1, target: 2, max: 3, suggestedMultiplier: 1 },
  Bowls: { min: 1, target: 2, max: 3, suggestedMultiplier: 1 },
  Slices: { min: 1, target: 2, max: 4, suggestedMultiplier: 1 },

  // Medicine ranges
  Doses: { min: 1, target: 2, max: 3, suggestedMultiplier: 1 },
  Tablets: { min: 1, target: 2, max: 3, suggestedMultiplier: 1 },
  Capsules: { min: 1, target: 2, max: 3, suggestedMultiplier: 1 },
  Pills: { min: 1, target: 2, max: 3, suggestedMultiplier: 1 },
  Applications: { min: 1, target: 2, max: 3, suggestedMultiplier: 1 },
  Injections: { min: 1, target: 1, max: 2, suggestedMultiplier: 1 },

  // Mood ranges
  "Rating (1-5)": { min: 3, target: 4, max: 5, suggestedMultiplier: 1 },
  "Rating (1-10)": { min: 6, target: 8, max: 10, suggestedMultiplier: 1 },
  Happiness: { min: 3, target: 4, max: 5, suggestedMultiplier: 1 },
  Satisfaction: { min: 3, target: 4, max: 5, suggestedMultiplier: 1 },
  Energy: { min: 3, target: 4, max: 5, suggestedMultiplier: 1 },
  "Stress Level": { min: 1, target: 2, max: 3, suggestedMultiplier: 1 }, // Lower is better
  "Anxiety Level": { min: 1, target: 2, max: 3, suggestedMultiplier: 1 }, // Lower is better
  "Focus Level": { min: 3, target: 4, max: 5, suggestedMultiplier: 1 },

  // Productivity ranges
  Tasks: { min: 3, target: 7, max: 10, suggestedMultiplier: 1 },
  Projects: { min: 1, target: 2, max: 3, suggestedMultiplier: 1 },
  Pomodoros: { min: 4, target: 8, max: 12, suggestedMultiplier: 1 },
  "Deep Work Sessions": { min: 1, target: 3, max: 5, suggestedMultiplier: 1 },
  "Focus Minutes": { min: 25, target: 90, max: 120, suggestedMultiplier: 1 },

  // Finance ranges
  Dollars: { min: 10, target: 50, max: 100, suggestedMultiplier: 10 },
  Euros: { min: 10, target: 50, max: 100, suggestedMultiplier: 10 },
  Savings: { min: 50, target: 200, max: 500, suggestedMultiplier: 10 },
  Investments: { min: 100, target: 500, max: 1000, suggestedMultiplier: 10 },
  Transactions: { min: 1, target: 3, max: 5, suggestedMultiplier: 1 },

  // Habit ranges
  Streaks: { min: 3, target: 7, max: 14, suggestedMultiplier: 1 },
  Completions: { min: 3, target: 15, max: 30, suggestedMultiplier: 1 },
  "Consistency Score": { min: 70, target: 85, max: 100, suggestedMultiplier: 1 },
  Attempts: { min: 5, target: 15, max: 30, suggestedMultiplier: 1 },
  "Success Rate": { min: 70, target: 85, max: 100, suggestedMultiplier: 1 },

  // Default fallback range
  None: { min: 0, target: 50, max: 100, suggestedMultiplier: 1 },
};

// Common units for goals categorized with subcategories
const UNITS: UnitMap = {
  time: {
    "Daily Tracking": ["Hours", "Minutes"],
    "Longer Periods": ["Days", "Weeks", "Months", "Years"],
  },
  reading: {
    "Book Reading": ["Pages", "Books", "Chapters"],
    "Online Content": ["Articles", "Blogs", "Posts"],
  },
  weight: {
    Metric: ["Kilograms", "Grams"],
    Imperial: ["Pounds", "Ounces"],
  },
  distance: {
    Walking: ["Steps", "Floors"],
    "Running/Biking": ["Meters", "Kilometers", "Miles"],
  },
  exercise: {
    Strength: ["Reps", "Sets"],
    Cardio: ["Calories", "Workouts", "Sessions"],
  },
  volume: {
    Drinks: ["Cups", "Glasses", "Bottles"],
    Measurement: ["Liters", "Gallons", "Ounces", "ML"],
  },
  food: {
    "Meal Tracking": ["Meals", "Servings", "Portions"],
    "Specific Items": ["Packets", "Plates", "Bowls", "Slices", "Pieces"],
  },
  medicine: {
    Oral: ["Tablets", "Capsules", "Pills"],
    "Other Types": ["Doses", "Applications", "Injections"],
  },
  mood: {
    "Overall Rating": ["Rating (1-5)", "Rating (1-10)"],
    "Specific Feelings": ["Happiness", "Satisfaction", "Energy"],
    "Negative States": ["Stress Level", "Anxiety Level"],
    "Work & Focus": ["Focus Level"],
  },
  productivity: {
    "Task Management": ["Tasks", "Projects", "Items"],
    "Time Techniques": ["Pomodoros", "Deep Work Sessions", "Focus Minutes"],
  },
  finance: {
    Currencies: ["Dollars", "Euros", "Pounds"],
    "Money Goals": ["Savings", "Investments", "Transactions"],
  },
  habits: {
    "Tracking Methods": ["Streaks", "Completions", "Consistency Score"],
    Performance: ["Attempts", "Success Rate"],
  },
};

// Create flattened units for search and display
const createFlattenedUnits = () => {
  const allUnits: string[] = [];
  Object.values(UNITS).forEach((categoryMap) => {
    Object.values(categoryMap).forEach((subcategoryUnits) => {
      allUnits.push(...subcategoryUnits);
    });
  });
  return allUnits;
};

const ALL_UNITS: string[] = createFlattenedUnits();

export default function CreateGoal({ navigation }: CreateGoalProps): JSX.Element {
  const { createGoals } = useGoal();
  const [multiplier, setMultiplier] = useState<number>(1);
  const [sliderRange, setSliderRange] = useState<[number, number]>([0, 100]);
  const [unitCategory, setUnitCategory] = useState<UnitCategoryKey | "all">("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredUnits, setFilteredUnits] = useState<string[]>(ALL_UNITS);

  // Update filtered units when category, subcategory, or search changes
  useEffect(() => {
    let baseUnits: string[] = [];

    if (unitCategory === "all") {
      baseUnits = ALL_UNITS;
    } else if (selectedSubcategory && UNITS[unitCategory][selectedSubcategory]) {
      baseUnits = UNITS[unitCategory][selectedSubcategory];
    } else {
      // Get all units in the category
      baseUnits = Object.values(UNITS[unitCategory]).flat();
    }

    if (searchQuery.trim() === "") {
      setFilteredUnits(baseUnits);
    } else {
      const query = searchQuery.toLowerCase().trim();
      setFilteredUnits(baseUnits.filter((unit) => unit.toLowerCase().includes(query)));
    }
  }, [unitCategory, selectedSubcategory, searchQuery]);

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
      { label: "All", value: "all", icon: "apps" },
      { label: "Time", value: "time", icon: "clock-outline" },
      { label: "Reading", value: "reading", icon: "book-open-page-variant" },
      { label: "Weight", value: "weight", icon: "weight" },
      { label: "Distance", value: "distance", icon: "map-marker-distance" },
      { label: "Exercise", value: "exercise", icon: "dumbbell" },
      { label: "Volume", value: "volume", icon: "cup-water" },
      { label: "Food", value: "food", icon: "food-apple" },
      { label: "Medicine", value: "medicine", icon: "pill" },
      { label: "Mood", value: "mood", icon: "emoticon-outline" },
      { label: "Productivity", value: "productivity", icon: "check-circle-outline" },
      { label: "Finance", value: "finance", icon: "cash" },
      { label: "Habits", value: "habits", icon: "habits" },
    ];
  };

  const getSubcategories = (): SubcategoryItem[] => {
    if (unitCategory === "all" || !UNITS[unitCategory]) {
      return [];
    }

    return Object.keys(UNITS[unitCategory]).map((key) => ({
      label: key,
      value: key,
    }));
  };

  const subcategories = getSubcategories();

  const handleCategoryPress = (category: UnitCategoryKey | "all") => {
    setUnitCategory(category);
    setSelectedSubcategory(null);
  };

  // Function to update range values based on selected unit
  const updateRangeValues = (unit: string, formik: FormikProps<FormValues>) => {
    if (unit === "") return;

    // Get preset range values for the unit or use default
    const preset = UNIT_RANGES[unit] || UNIT_RANGES["None"];

    // Set suggested multiplier
    setMultiplier(preset.suggestedMultiplier);

    // Update slider range based on unit type
    setSliderRange([0, preset.max * 2]);

    // Update formik values
    formik.setFieldValue("min", preset.min);
    formik.setFieldValue("target", preset.target);
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
                      Target: {f.values.target * multiplier}
                      {f.values.unit !== "None" && <Text style={styles.subText}> {f.values.unit}</Text>}
                    </Text>
                  </View>

                  {/* <View style={styles.multiplierContainer}>
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
                  </View> */}
                </View>

                <View style={{ marginTop: 15 }}>
                  <RangePickers
                    minValue={f.values.min}
                    targetValue={f.values.target}
                    onMinChange={(value) => f.setFieldValue("min", value)}
                    onTargetChange={(value) => f.setFieldValue("target", value)}
                    min={0}
                    max={sliderRange[1]}
                    step={1}
                    unit={f.values.unit}
                  />
                </View>

                {/* Range Suggestion */}
                {f.values.unit && (
                  <View style={styles.rangeSuggestion}>
                    <MaterialCommunityIcons name="lightbulb-outline" size={18} color={Colors.secondary} />
                    <Text style={styles.rangeSuggestionText}>
                      Suggested range for {f.values.unit}: {UNIT_RANGES[f.values.unit]?.min || 0} - {UNIT_RANGES[f.values.unit]?.max || 100}
                    </Text>
                  </View>
                )}
              </View>

              {/* Units Selection */}
              <View style={styles.section}>
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                  <MaterialCommunityIcons name="magnify" size={24} color="rgba(255,255,255,0.6)" style={styles.searchIcon} />
                  <TextInput
                    placeholder="Search units..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    style={styles.searchInput}
                  />
                  {searchQuery.length > 0 && (
                    <Ripple style={styles.clearButton} onPress={() => setSearchQuery("")}>
                      <MaterialCommunityIcons name="close-circle" size={20} color="rgba(255,255,255,0.6)" />
                    </Ripple>
                  )}
                </View>

                {/* Unit Categories */}
                <Text style={styles.categorySectionTitle}>Categories</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScrollView}>
                  {getUnitCategories().map((category: UnitCategory) => (
                    <Ripple
                      key={category.value}
                      style={[styles.categoryButton, unitCategory === category.value && styles.categoryButtonActive]}
                      onPress={() => handleCategoryPress(category.value)}
                    >
                      <MaterialCommunityIcons
                        name={category.icon}
                        size={20}
                        color={unitCategory === category.value ? "#FFFFFF" : "rgba(255,255,255,0.8)"}
                        style={styles.categoryIcon}
                      />
                      <Text style={[styles.categoryText, unitCategory === category.value && styles.categoryTextActive]}>
                        {category.label}
                      </Text>
                    </Ripple>
                  ))}
                </ScrollView>

                {/* Subcategories */}
                {subcategories.length > 0 && (
                  <>
                    <Text style={styles.categorySectionTitle}>Subcategories</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subcategoryScrollView}>
                      <Ripple
                        style={[styles.subcategoryButton, selectedSubcategory === null && styles.subcategoryButtonActive]}
                        onPress={() => setSelectedSubcategory(null)}
                      >
                        <Text style={[styles.subcategoryText, selectedSubcategory === null && styles.subcategoryTextActive]}>All</Text>
                      </Ripple>
                      {subcategories.map((subcat) => (
                        <Ripple
                          key={subcat.value}
                          style={[styles.subcategoryButton, selectedSubcategory === subcat.value && styles.subcategoryButtonActive]}
                          onPress={() => setSelectedSubcategory(subcat.value)}
                        >
                          <Text style={[styles.subcategoryText, selectedSubcategory === subcat.value && styles.subcategoryTextActive]}>
                            {subcat.label}
                          </Text>
                        </Ripple>
                      ))}
                    </ScrollView>
                  </>
                )}

                {/* Units */}
                {filteredUnits.length > 0 || searchQuery.length === 0 ? (
                  <>
                    <Text style={styles.categorySectionTitle}>Units</Text>
                    <FlatList<string>
                      keyExtractor={(item: string) => item}
                      data={["None", ...filteredUnits]}
                      style={styles.unitsFlatList}
                      numColumns={3}
                      contentContainerStyle={styles.unitsList}
                      renderItem={({ item }: { item: string }) => (
                        <Ripple
                          onPress={() => {
                            f.setFieldValue("unit", item);
                            updateRangeValues(item, f);
                          }}
                          style={[styles.unitButton, f.values.unit === item && styles.unitButtonActive]}
                        >
                          <Text style={[styles.unitText, f.values.unit === item && styles.unitTextActive]}>{item}</Text>
                        </Ripple>
                      )}
                    />
                  </>
                ) : (
                  <View style={styles.noResultsContainer}>
                    <MaterialCommunityIcons name="file-search-outline" size={40} color="rgba(255,255,255,0.5)" />
                    <Text style={styles.noResultsText}>No units found</Text>
                    <Text style={styles.noResultsSubText}>Try a different search term</Text>
                  </View>
                )}

                {/* Custom Unit Input */}
                <View style={styles.customUnitContainer}>
                  <Text style={styles.customUnitLabel}>Can't find what you need?</Text>
                  <TextInput
                    placeholder="Enter custom unit"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    style={styles.customUnitInput}
                    onSubmitEditing={(e) => {
                      const value = e.nativeEvent.text.trim();
                      if (value && value.length > 0) {
                        f.setFieldValue("unit", value);
                      }
                    }}
                  />
                  <Text style={styles.customUnitHelperText}>Press enter to use your custom unit</Text>
                </View>
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
  categorySectionTitle: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 10,
    marginTop: 5,
    opacity: 0.9,
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
  rangeSuggestion: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: Colors.secondary,
  },
  rangeSuggestionText: {
    color: "rgba(255,255,255,0.9)",
    marginLeft: 8,
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    color: "#FFFFFF",
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  clearButton: {
    padding: 5,
  },
  categoryScrollView: {
    marginBottom: 15,
  },
  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    flexDirection: "row",
    alignItems: "center",
  },
  categoryButtonActive: {
    backgroundColor: Colors.secondary,
  },
  categoryIcon: {
    marginRight: 6,
  },
  categoryText: {
    color: "rgba(255,255,255,0.8)",
  },
  categoryTextActive: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  subcategoryScrollView: {
    marginBottom: 15,
  },
  subcategoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  subcategoryButtonActive: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderColor: Colors.secondary,
  },
  subcategoryText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
  },
  subcategoryTextActive: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  unitsFlatList: {
    maxHeight: 240,
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
    margin: 5,
    flex: 1,
    alignItems: "center",
  },
  unitButtonActive: {
    borderColor: Colors.secondary,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  unitText: {
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
  },
  unitTextActive: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  noResultsContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  noResultsText: {
    color: "#FFFFFF",
    fontSize: 18,
    marginTop: 10,
  },
  noResultsSubText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    marginTop: 5,
  },
  customUnitContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  customUnitLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    marginBottom: 10,
  },
  customUnitInput: {
    marginBottom: 5,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 10,
    padding: 12,
    color: "#FFFFFF",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  customUnitHelperText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
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
