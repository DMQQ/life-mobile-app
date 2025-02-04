import Button from "@/components/ui/Button/Button";
import Header from "@/components/ui/Header/Header";
import ScreenContainer from "@/components/ui/ScreenContainer";
import ValidatedInput from "@/components/ui/ValidatedInput";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { Formik } from "formik";
import { FlatList, ScrollView, Text, View } from "react-native";
import Colors from "@/constants/Colors";
import { useGoal } from "../hooks/hooks";
import Layout from "@/constants/Layout";
import Color from "color";
import Ripple from "react-native-material-ripple";
import lowOpacity from "@/utils/functions/lowOpacity";
import RangeSlider from "@/components/ui/RangePicker";
import { useState } from "react";

import * as yup from "yup";

const validationSchema = yup.object().shape({
  name: yup.string().required("Goal name is required"),
  icon: yup.string().required("Icon is required"),
  description: yup.string().required("Description is required"),
  min: yup.number().required("Min is required"),
  target: yup.number().required("Target is required"),
  unit: yup.string().required("Unit is required"),
});

const initialValues = {
  name: "",
  icon: "",
  description: "",

  min: 0,
  target: 50,

  unit: "",
};

export default function CreateGoal({ navigation }: any) {
  const { createGoals } = useGoal();

  const [multiplier, setMultiplier] = useState(1);

  const onSubmit = (values: typeof initialValues) => {
    createGoals({
      variables: {
        input: {
          name: values.name,
          icon: values.icon,
          description: values.description,
          min: +values.min * multiplier,
          max: +values.target * multiplier,
          target: +values.target,
          unit: values.unit,
        },
      },
      onCompleted: () => navigation.goBack(),
    });
  };

  return (
    <ScreenContainer style={{ padding: 0 }}>
      <Header goBack />
      <Formik validationSchema={validationSchema} onSubmit={onSubmit} initialValues={initialValues}>
        {(f) => (
          <>
            <ScrollView
              style={{ flex: 1, padding: 15 }}
              contentContainerStyle={{
                justifyContent: "space-between",
                flexGrow: 1,
                paddingBottom: 30,
              }}
            >
              <View>
                <View
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 15,
                  }}
                >
                  <Ripple
                    style={{
                      padding: 20,
                      borderRadius: 100,
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: Colors.primary_lighter,
                      marginBottom: 20,
                      width: 130,
                      height: 130,
                    }}
                    onPress={() =>
                      navigation.navigate("IconPicker", {
                        onSelectIcon: (icon: string) => {
                          f.setFieldValue("icon", icon);
                        },
                        selectedIcon: f.values.icon,
                      })
                    }
                  >
                    <MaterialCommunityIcons name={(f.values.icon as any) || "close"} size={90} color={Colors.secondary} />
                  </Ripple>
                  <Text style={{ color: Colors.secondary_light_2, marginTop: 15 }}>
                    {f.values.icon ? "Tap to change icon" : "Tap to choose an icon for your goal"}
                  </Text>
                </View>

                <ValidatedInput showLabel label="Goal Name" name="name" placeholder="Enter goal name" formik={f} />

                <ValidatedInput showLabel label="Description" name="description" placeholder="Enter description" formik={f} />

                <View style={{ width: Layout.screen.width - 30, marginVertical: 15 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <View style={{ flexDirection: "row" }}>
                      <Text style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}>Set your goal range: </Text>
                      <Text style={{ color: Colors.secondary_light_2, fontSize: 16, padding: 2 }}>
                        {f.values.min * multiplier} - {f.values.target * multiplier}
                      </Text>
                    </View>
                    <Ripple onPress={() => setMultiplier(10)}>
                      <Text style={{ color: "#fff" }}>x10</Text>
                    </Ripple>
                  </View>
                  <View style={{ marginTop: 15 }}>
                    <RangeSlider
                      range={[0, 100]} // min and max values
                      defaultValues={[20, 80]} // initial positions
                      onChange={(values) => {
                        f.setFieldValue("min", values[0]);
                        f.setFieldValue("target", values[1]);
                      }}
                      barHeight={30}
                      handleSize={30}
                      barStyle={{ backgroundColor: Color(Colors.primary).lighten(1.5).hex() }}
                      fillStyle={{ backgroundColor: Colors.secondary }}
                      handleStyle={{ backgroundColor: Colors.secondary_light_2 }}
                    />
                  </View>
                </View>

                <Text
                  style={{
                    color: "#fff",
                    marginTop: 15,
                    marginBottom: 10,
                    fontWeight: "500",
                    fontSize: 16,
                  }}
                >
                  Choose the unit of measurement for your goal.
                </Text>
                <FlatList
                  keyExtractor={(item) => item}
                  //prettier-ignore
                  data={[
                 'Hours','Minutes','Pages','Books','Chapters','Days','Weeks','Months','Years','Kilograms','Pounds','Meters','Kilometers','Miles','Reps','Sets','Calories','Liters','Gallons','Ounces','Cups','Glasses','Bottles','Packets','Bags','Boxes','Containers','Plates','Bowls','Slices','Pieces','Servings','Portions','Doses','Tablets','Capsules','Pills','Injections','Drops','Sprays','Puffs','Inhalations','Applications','Patches','Suppositories','Insert'
                ]}
                  horizontal
                  renderItem={({ item }) => (
                    <Ripple
                      onPress={() => f.setFieldValue("unit", item)}
                      style={{
                        borderRadius: 10,
                        borderWidth: 1,
                        padding: 15,
                        gap: 15,
                        marginRight: 10,

                        ...(f.values.unit === item
                          ? {
                              borderColor: lowOpacity(Colors.secondary, 0.7),
                              backgroundColor: lowOpacity(Colors.secondary, 0.15),
                            }
                          : { borderColor: Color(Colors.primary_lighter).lighten(1).hex(), backgroundColor: Colors.primary_lighter }),
                      }}
                    >
                      <Text style={{ color: "#fff" }}>{item}</Text>
                    </Ripple>
                  )}
                />
              </View>
            </ScrollView>
            <View style={{ padding: 15 }}>
              <Button onPress={() => f.handleSubmit()} style={{ width: "100%", borderRadius: 100, padding: 17.5 }}>
                Create Goal
              </Button>
            </View>
          </>
        )}
      </Formik>
    </ScreenContainer>
  );
}
