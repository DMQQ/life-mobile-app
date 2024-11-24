import moment from "moment";
import { FlatList, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import Colors from "../../../../constants/Colors";
import { useState } from "react";
import Ripple from "react-native-material-ripple";
import Layout from "@/constants/Layout";
import { Icons } from "../components/Wallet/WalletItem";
import Color from "color";
import Button from "@/components/ui/Button/Button";
import { AntDesign, FontAwesome5 } from "@expo/vector-icons";
import lowOpacity from "@/utils/functions/lowOpacity";
import Animated, { FadeIn, FadeInUp, FadeOutUp, LinearTransition } from "react-native-reanimated";
import useCreateActivity from "../hooks/useCreateActivity";

export default function CreateExpenseModal({ navigation }: any) {
  const { createExpense, reset } = useCreateActivity({
    onCompleted() {
      navigation.goBack();
    },
  });

  const [amount, setAmount] = useState<string>("");

  const handleAmountChange = (value: string) => {
    return setAmount(() => {
      if (value === "C") {
        return amount.slice(0, -1);
      }
      return amount + value;
    });
  };

  const [changeView, setChangeView] = useState(false);

  const [category, setCategory] = useState<keyof typeof Icons>("none");
  const [name, setName] = useState("");

  const isValid = category !== "none" && name !== "" && amount !== "";

  const [type, setType] = useState<"expense" | "income">("expense");

  const handleSubmit = async () => {
    await createExpense({
      variables: {
        amount: +amount,
        description: name,
        type: type,
        category: category,
        date: moment().format("YYYY-MM-DD"),
        schedule: false,
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={{ width: "100%", justifyContent: "center", alignItems: "center" }}>
        <View style={{ width: 80, height: 5, backgroundColor: Colors.secondary, borderRadius: 100 }} />
      </View>

      <View style={{ flexDirection: "row", gap: 15, justifyContent: "space-between" }}>
        <Ripple style={{ padding: 7.5, paddingHorizontal: 22.5, backgroundColor: Colors.primary_lighter, borderRadius: 100 }}>
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 14 }}>{moment().format("YYYY-MM-DD")}</Text>
        </Ripple>

        <Ripple style={{ padding: 5, paddingHorizontal: 15, backgroundColor: Colors.primary_lighter, borderRadius: 100 }}>
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 14 }}>Today</Text>
        </Ripple>
      </View>
      <View
        style={{
          height: 250,
          justifyContent: "space-between",
          width: "100%",
          alignItems: "center",
          flexDirection: "row",
          paddingHorizontal: 15,
        }}
      >
        <Ripple
          onPress={() => setType("expense")}
          style={{ backgroundColor: type === "expense" ? "red" : Colors.primary_lighter, padding: 15, borderRadius: 100 }}
        >
          <AntDesign name="arrowdown" size={24} color={type === "expense" ? "#fff" : "red"} />
        </Ripple>
        <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 80 }}>${amount || 0}</Text>

        <Ripple
          onPress={() => setType("income")}
          style={{ backgroundColor: type === "income" ? "lightgreen" : Colors.primary_lighter, padding: 15, borderRadius: 100 }}
        >
          <AntDesign name="arrowup" size={24} color={type === "income" ? "#fff" : "lightgreen"} />
        </Ripple>
      </View>

      <View style={{ marginTop: 20, flex: 1, gap: 15 }}>
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
          <View
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
              keyboardType="numeric"
            />

            {isValid && (
              <Ripple
                onPress={() => handleSubmit()}
                style={{
                  padding: 15,
                  backgroundColor: lowOpacity(Icons["health"].backgroundColor, 0.25),
                  borderRadius: 100,
                }}
              >
                <FontAwesome5 name="save" size={23} color="#fff" />
              </Ripple>
            )}
          </View>

          {changeView && (
            <Animated.FlatList
              layout={LinearTransition}
              entering={FadeInUp}
              exiting={FadeOutUp}
              style={{ marginTop: 20, width: "100%", height: Layout.screen.height / 2.25 }}
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
              entering={FadeInUp.delay(100)}
              exiting={FadeOutUp}
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
                        <FontAwesome5 name="backspace" size={24} color="#FFF" />
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
