import Button from "@/components/ui/Button/Button";
import Header from "@/components/ui/Header/Header";
import ScreenContainer from "@/components/ui/ScreenContainer";
import ValidatedInput from "@/components/ui/ValidatedInput";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { Formik } from "formik";
import { Text, View } from "react-native";
import Colors from "@/constants/Colors";
import { useGoal } from "../hooks/hooks";
import RangeSliders from "@/components/ui/RangeSlider";
import Layout from "@/constants/Layout";

export default function CreateGoal({ navigation }: any) {
  const { createGoals } = useGoal();
  return (
    <ScreenContainer style={{ padding: 0 }}>
      <Header goBack />
      <Formik
        onSubmit={(values) => {
          console.log(values);
          createGoals({
            variables: {
              input: {
                name: values.name,
                icon: values.icon,
                description: values.description,
                min: +values.min,
                max: +values.max,
                target: +values.target,
                unit: values.unit,
              },
            },
            onCompleted: () => navigation.goBack(),
          });
        }}
        initialValues={{
          name: "",
          icon: "",
          description: "",

          min: 0,
          max: 100,
          target: 50,

          unit: "",
        }}
      >
        {(f) => (
          <View style={{ flex: 1, justifyContent: "space-between", padding: 15 }}>
            <View>
              <Text style={{ fontSize: 20, color: "#fff", fontWeight: "bold", marginBottom: 25 }}>
                Create a goal to track your progress!
              </Text>
              <ValidatedInput showLabel label="Goal Name" name="name" placeholder="Enter goal name" formik={f} />

              <ValidatedInput showLabel label="Description" name="description" placeholder="Enter description" formik={f} />

              <View style={{ flexDirection: "row", width: "100%", justifyContent: "space-between", marginTop: 15 }}>
                <ValidatedInput
                  showLabel
                  label="Min"
                  name="min"
                  placeholder="Enter min"
                  formik={f}
                  style={{ flex: 1, width: (Layout.screen.width - 30) / 3 - 10 }}
                />

                <ValidatedInput
                  showLabel
                  label="Max"
                  name="max"
                  placeholder="Enter max"
                  formik={f}
                  style={{ flex: 1, width: (Layout.screen.width - 30) / 3 - 10 }}
                />

                <ValidatedInput
                  showLabel
                  label="Target"
                  name="target"
                  placeholder="Enter target"
                  formik={f}
                  style={{ flex: 1, width: (Layout.screen.width - 30) / 3 - 10 }}
                />
              </View>

              <ValidatedInput showLabel label="Unit" name="unit" placeholder="Enter unit" formik={f} />

              <View style={{ flexDirection: "row", alignItems: "center", padding: 15, justifyContent: "center" }}>
                <View
                  style={{
                    backgroundColor: Colors.primary_lighter,
                    padding: 10,
                    borderRadius: 100,
                  }}
                >
                  <MaterialCommunityIcons name={f.values.icon || "account"} size={24} color={Colors.secondary} />
                </View>
                <Button
                  variant="text"
                  onPress={() =>
                    navigation.navigate("IconPicker", {
                      onSelectIcon: (icon: string) => {
                        f.setFieldValue("icon", icon);
                      },
                      selectedIcon: f.values.icon,
                    })
                  }
                >
                  Choose an icon for your goal
                </Button>
              </View>
            </View>

            <Button onPress={() => f.handleSubmit()}>Create Goal</Button>
          </View>
        )}
      </Formik>
    </ScreenContainer>
  );
}
