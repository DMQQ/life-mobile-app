import moment from "moment";
import { Keyboard, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from "react-native";
import Colors from "../../../../constants/Colors";
import { memo, useCallback, useRef, useState } from "react";
import Ripple from "react-native-material-ripple";
import Layout from "@/constants/Layout";
import { Icons } from "../components/Wallet/WalletItem";
import { AntDesign, Entypo } from "@expo/vector-icons";
import lowOpacity from "@/utils/functions/lowOpacity";
import Animated, {
  FadeIn,
  FadeInDown,
  LinearTransition,
  useSharedValue,
  withSequence,
  withSpring,
  useAnimatedStyle,
  cancelAnimation,
  withTiming,
} from "react-native-reanimated";
import useCreateActivity from "../hooks/useCreateActivity";
import DateTimePicker from "react-native-modal-datetime-picker";
import { useEditExpense } from "./CreateActivity";
import IconButton from "@/components/ui/IconButton/IconButton";
import { parse } from "@babel/core";
import { useNavigation } from "@react-navigation/native";

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export default function CreateExpenseModal({ navigation, route: { params } }: any) {
  const { createExpense } = useCreateActivity({
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
  const [type, setType] = useState<"expense" | "income" | null>(params?.type || null);

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

    if (params?.isEditing) {
      await editExpense({
        variables: {
          amount: parseAmount(amount),
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
        amount: parseAmount(amount),
        description: name,
        type: type,
        category: category,
        date: date ?? moment().format("YYYY-MM-DD"),
        schedule: moment(date).isAfter(moment()),
      },
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

  const isValid = (type === "income" ? true : category !== "none") && name !== "" && amount !== "" && type !== null;

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

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={{ flex: 1 }}>
        <View style={styles.container}>
          <View style={{ flexDirection: "row", gap: 15, justifyContent: "space-between" }}>
            <View style={{ flexDirection: "row", gap: 15, justifyContent: "space-between" }}>
              <IconButton onPress={() => navigation.goBack()} icon={<AntDesign name="close" size={24} color="#fff" />} />

              <Ripple
                onPress={() => setDate(null)}
                style={{ padding: 7.5, paddingHorizontal: 22.5, backgroundColor: Colors.primary_lighter, borderRadius: 100 }}
              >
                <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 14 }}>{date ?? moment().format("YYYY-MM-DD")}</Text>
              </Ripple>
            </View>

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
                alignItems: "center",
              }}
            >
              <View style={{ position: "absolute", left: 10, top: 2.5 }}>
                {type == null ? (
                  <>
                    <Entypo name="chevron-up" color="#fff" size={15} style={{ transform: [{ translateY: 3 }] }} />
                    <Entypo name="chevron-down" color="#fff" size={15} style={{ transform: [{ translateY: -5 }] }} />
                  </>
                ) : type === "expense" ? (
                  <AntDesign name="arrowdown" size={15} color={Colors.error} style={{ transform: [{ translateY: 7 }] }} />
                ) : (
                  <AntDesign name="arrowup" size={15} color={Colors.secondary} style={{ transform: [{ translateY: 7 }] }} />
                )}
              </View>

              <Text
                style={{
                  color: type == null ? "#fff" : type === "expense" ? Colors.error : Colors.secondary,
                  fontWeight: "bold",
                  fontSize: 14,
                }}
              >
                {type == null ? "Select type" : type === "expense" ? "Expense" : "Income"}
              </Text>
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
            <Animated.Text style={[{ color: "#fff", fontWeight: "bold" }, animatedAmount]}>
              {amount}
              <Text style={{ fontSize: 20 }}>zł</Text>
            </Animated.Text>

            {moment(date).isAfter(moment()) && type && amount != "0" && (
              <View style={{ position: "absolute", justifyContent: "center", alignItems: "center", bottom: -15 }}>
                <Text style={{ color: "#fff", fontWeight: "600", fontSize: 13, textAlign: "center" }}>
                  {capitalize(type || "")} of {amount}zł will be scheduled for {"\n"} {moment(date).format("DD MMMM YYYY")}
                </Text>
              </View>
            )}
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
                  // exiting={FadeOutUp}
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
                      width: 50,
                      height: 50,
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
                  // exiting={FadeOutDown}
                  style={{ width: "100%", height: Layout.screen.height / 2.25 }}
                  data={Object.entries(Icons)}
                  keyExtractor={(item) => item[0]}
                  renderItem={({ item }) => (
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        borderBottomWidth: 0.5,
                        borderBottomColor: "rgba(255,255,255,0.15)",
                        ...((item[0] === category && { backgroundColor: Colors.primary_light }) || {}),
                        paddingRight: 15,
                      }}
                    >
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

                          alignItems: "center",
                          flex: 1,
                        }}
                      >
                        <View style={{ padding: 10, borderRadius: 100, backgroundColor: lowOpacity(item[1].backgroundColor, 0.25) }}>
                          {item[1].icon}
                        </View>

                        <Text style={{ color: "#fff", fontSize: 18, textTransform: "capitalize", fontWeight: "600" }}>{item[0]}</Text>
                      </Ripple>

                      {item[0] === category && (
                        <IconButton
                          onPress={() => {
                            setCategory("none");
                            setChangeView(false);
                          }}
                          icon={<AntDesign name="close" color={"#fff"} size={24} />}
                        />
                      )}
                    </View>
                  )}
                />
              )}
              {!changeView && <NumbersPad rotateBackButton={amount === "0"} handleAmountChange={handleAmountChange} />}
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
      </View>
    </TouchableWithoutFeedback>
  );
}

const NumbersPad = memo(
  ({ handleAmountChange, rotateBackButton }: { handleAmountChange: (val: string) => void; rotateBackButton: boolean }) => {
    const navigation = useNavigation();

    return (
      <Animated.View
        entering={FadeInDown}
        // exiting={FadeOutDown}
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
          interval.current = setInterval(() => {
            onPress();
          }, 50);
        }}
        onPressOut={() => {
          clearInterval(interval.current!);
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
  container: { flex: 1, padding: 15, gap: 15 },
  input: {
    padding: 13,
    color: "#fff",
    fontSize: 18,
    borderColor: Colors.primary_lighter,
    flex: 1,
  },
});
