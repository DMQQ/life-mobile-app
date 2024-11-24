import moment from "moment";
import { FlatList, Keyboard, ScrollView, StyleSheet, Text, TextInput, Touchable, TouchableWithoutFeedback, View } from "react-native";
import Colors from "../../../../constants/Colors";
import { useState } from "react";
import Ripple from "react-native-material-ripple";
import Layout from "@/constants/Layout";
import { Icons } from "../components/Wallet/WalletItem";
import Color from "color";
import Button from "@/components/ui/Button/Button";
import { AntDesign, Entypo, FontAwesome5 } from "@expo/vector-icons";
import lowOpacity from "@/utils/functions/lowOpacity";
import Animated, { FadeIn, FadeInDown, FadeInUp, FadeOutDown, FadeOutUp, LinearTransition } from "react-native-reanimated";
import useCreateActivity from "../hooks/useCreateActivity";
import DateTimePicker from "react-native-modal-datetime-picker";
import { useEditExpense } from "./CreateActivity";

export default function CreateExpenseModal({ navigation, route: { params } }: any) {
  const { createExpense, reset } = useCreateActivity({
    onCompleted() {
      navigation.goBack();
    },
  });

  const editExpense = useEditExpense();

  const [amount, setAmount] = useState<string>(params?.amount.toString() || "0");
  const [date, setDate] = useState<null | string>(params?.date ? moment(params.date).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD"));
  const [changeView, setChangeView] = useState(false);
  const [category, setCategory] = useState<keyof typeof Icons>(params.category || "none");
  const [name, setName] = useState(params?.description || "");
  const [type, setType] = useState<"expense" | "income">(params?.type || "expense");

  const handleSubmit = async () => {
    if (params?.isEditing) {
      await editExpense({
        variables: {
          amount: +amount,
          description: name,
          type: type,
          category: category,
          expenseId: params.id,
          date: date,
        },
      }).catch((e) => console.log(e));

      navigation.goBack();

      return;
    }
    await createExpense({
      variables: {
        amount: +amount,
        description: name,
        type: type,
        category: category,
        date: date ?? moment().format("YYYY-MM-DD"),
        schedule: false,
      },
    });
  };

  const handleAmountChange = (value: string) => {
    return setAmount((prev) => {
      if (value === "C") {
        const val = prev.toString().slice(0, -1);

        return val.length === 0 ? "0" : val;
      }
      if (prev.length === 1 && prev === "0" && value !== ".") {
        return value;
      }
      if (prev.includes(".") && value === ".") {
        return prev;
      }
      if (prev.length === 0 && value === ".") {
        return "0.";
      }
      return prev + value;
    });
  };

  const isValid = category !== "none" && name !== "" && amount !== "";

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <>
        <View style={styles.container}>
          <View style={{ width: "100%", justifyContent: "center", alignItems: "center" }}>
            <View style={{ width: 80, height: 5, backgroundColor: Colors.secondary, borderRadius: 100 }} />
          </View>

          <View style={{ flexDirection: "row", gap: 15, justifyContent: "space-between" }}>
            <Ripple
              onPress={() => setDate(null)}
              style={{ padding: 7.5, paddingHorizontal: 22.5, backgroundColor: Colors.primary_lighter, borderRadius: 100 }}
            >
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 14 }}>{date ?? moment().format("YYYY-MM-DD")}</Text>
            </Ripple>

            <Ripple
              onPress={() => setType((p) => (p === "expense" ? "income" : "expense"))}
              style={{
                padding: 5,
                paddingHorizontal: 15,
                backgroundColor: Colors.primary_lighter,
                borderRadius: 100,
                flexDirection: "row",
                gap: 5,
                paddingLeft: 30,
              }}
            >
              <View style={{ position: "absolute", left: 10, top: 2.5 }}>
                <Entypo name="chevron-up" color="#fff" size={15} />
                <Entypo name="chevron-down" color="#fff" size={15} style={{ transform: [{ translateY: -8 }] }} />
              </View>
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 14 }}>{type === "expense" ? "Expense" : "Income"}</Text>
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
            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 80 }}>
              {amount}
              <Text style={{ fontSize: 20 }}>zł</Text>
            </Text>
          </View>

          <View style={{ marginTop: 20, flex: 1, gap: 15, maxHeight: Layout.screen.height / 2 - 5 }}>
            <View
              style={{
                borderWidth: 1,
                borderColor: Colors.primary_lighter,
                borderRadius: 35,
                backgroundColor: Colors.primary_lighter,
                padding: 10,
                flex: 1,
              }}
            >
              {!changeView && (
                <Animated.View
                  entering={FadeIn}
                  exiting={FadeOutUp}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    height: 55,
                  }}
                >
                  <Ripple
                    onPress={() => setChangeView((p) => !p)}
                    style={{
                      padding: 15,
                      backgroundColor: lowOpacity(Icons[category].backgroundColor, 0.25),
                      borderRadius: 100,
                    }}
                  >
                    {Icons[category].icon}
                  </Ripple>

                  <TextInput
                    placeholder="Expense name"
                    style={styles.input}
                    placeholderTextColor={"gray"}
                    value={name}
                    onChangeText={setName}
                  />

                  {isValid && (
                    <Ripple
                      onPress={() => handleSubmit()}
                      style={{
                        padding: 15,
                        paddingHorizontal: 20,
                        backgroundColor: Colors.secondary,
                        borderRadius: 35,
                        flexDirection: "row",
                        gap: 10,
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ fontWeight: "600", color: "#fff", fontSize: 16 }}>{params?.isEditing ? "Save" : "Create"}</Text>
                    </Ripple>
                  )}
                </Animated.View>
              )}

              {changeView && (
                <Animated.FlatList
                  layout={LinearTransition}
                  entering={FadeInDown}
                  exiting={FadeOutDown}
                  style={{ width: "100%", height: Layout.screen.height / 2.25 }}
                  data={Object.entries(Icons)}
                  keyExtractor={(item) => item[0]}
                  renderItem={({ item }) => (
                    <Ripple
                      onPress={() => {
                        setCategory(item[0] as keyof typeof Icons);
                        setChangeView(false);
                      }}
                      style={{
                        paddingVertical: 15,
                        paddingHorizontal: 5.5,
                        flexDirection: "row",
                        gap: 15,
                        borderBottomWidth: 0.5,
                        borderBottomColor: "rgba(255,255,255,0.15)",
                        alignItems: "center",
                      }}
                    >
                      <View style={{ padding: 10, borderRadius: 100, backgroundColor: lowOpacity(item[1].backgroundColor, 0.25) }}>
                        {item[1].icon}
                      </View>

                      <Text style={{ color: "#fff", fontSize: 18, textTransform: "capitalize", fontWeight: "600" }}>{item[0]}</Text>
                    </Ripple>
                  )}
                />
              )}
              {!changeView && (
                <Animated.View
                  layout={LinearTransition}
                  entering={FadeInDown}
                  exiting={FadeOutDown}
                  style={{ flex: 1, gap: 15, borderRadius: 35, marginTop: 15 }}
                >
                  {[
                    [1, 2, 3],
                    [4, 5, 6],
                    [7, 8, 9],
                    [".", 0, "C"],
                  ].map((row, index, array) => (
                    <View style={{ flexDirection: "row", gap: 15 }} key={row.toString()}>
                      {row.map((num) => (
                        <Ripple
                          rippleCentered
                          rippleColor={Colors.secondary}
                          onPress={() => handleAmountChange(num.toString())}
                          key={num}
                          style={{
                            width: "30%",
                            height: 75,
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          {num === "C" ? (
                            <Entypo name="chevron-left" size={40} color="#fff" />
                          ) : (
                            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 24 }}>{num}</Text>
                          )}
                        </Ripple>
                      ))}
                    </View>
                  ))}
                </Animated.View>
              )}
            </View>
          </View>
        </View>

        <DateTimePicker
          isVisible={date == null}
          onConfirm={(date) => {
            setDate(moment(date).format("YYYY-MM-DD"));
          }}
          onCancel={() => setDate(moment().format("YYYY-MM-DD"))}
        />
      </>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, gap: 15 },
  input: {
    padding: 13,
    color: "#fff",
    fontSize: 18,
    borderColor: Colors.primary_lighter,
    flex: 1,
  },
});
