import moment from "moment";
import { Keyboard, ScrollView, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from "react-native";
import Colors, { secondary_candidates } from "../../../../constants/Colors";
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
import { useNavigation } from "@react-navigation/native";
import Button from "@/components/ui/Button/Button";
import Color from "color";
import Input from "@/components/ui/TextInput/TextInput";

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
  const [isSubscription, setIsSubscription] = useState(false);

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
        isSubscription: isSubscription,
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

  const isValid = (type === "income" ? true : category !== "none") && name !== "" && amount !== "" && type !== null && amount != "0";

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
          <View style={{ position: "absolute", top: 15, left: 15, zIndex: 100 }}>
            <IconButton onPress={() => navigation.goBack()} icon={<AntDesign name="close" size={24} color="rgba(255,255,255,0.7)" />} />
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
                <Text style={{ color: "rgba(255,255,255,0.7)", fontWeight: "600", fontSize: 13, textAlign: "center" }}>
                  {capitalize(type || "")} of {amount}zł will be scheduled for {"\n"} {moment(date).format("DD MMMM YYYY")}
                </Text>
              </View>
            )}
          </View>

          <View style={{ marginTop: 20, flex: 1, gap: 15, maxHeight: Layout.screen.height / 1.85 - 5 }}>
            <View
              style={{
                borderRadius: 35,
                flex: 1,
              }}
            >
              {!changeView && (
                <Animated.View entering={FadeIn} style={{ gap: 5 }}>
                  <View style={{ flexDirection: "row", width: "100%", alignItems: "center" }}>
                    <Input
                      containerStyle={{ borderRadius: 25 }}
                      placeholder="Expense name"
                      style={styles.input}
                      placeholderTextColor={"gray"}
                      value={name}
                      onChangeText={setName}
                      right={
                        <Ripple
                          onPress={handleSubmit}
                          style={{
                            paddingHorizontal: 15,
                            paddingVertical: 5,
                            borderRadius: 7.5,
                            backgroundColor: isValid ? Colors.secondary : Colors.primary_lighter,
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          <AntDesign name="save" size={20} color="#fff" />
                          <Text style={{ color: "#fff" }}>Save</Text>
                        </Ripple>
                      }
                    />
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ flexDirection: "row" }}
                    contentContainerStyle={{ gap: 15 }}
                  >
                    <Ripple
                      onPress={() => setType((p) => (p === "expense" ? "income" : "expense"))}
                      style={{
                        padding: 5,
                        paddingHorizontal: 15,
                        backgroundColor: Colors.primary_lighter,
                        borderRadius: 10,
                        flexDirection: "row",
                        gap: 5,
                        paddingLeft: 30,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <View style={{ position: "absolute", left: 10, top: 2.5 }}>
                        {type == null ? (
                          <>
                            <Entypo name="chevron-up" color="rgba(255,255,255,0.7)" size={15} style={{ transform: [{ translateY: 3 }] }} />
                            <Entypo
                              name="chevron-down"
                              color="rgba(255,255,255,0.7)"
                              size={15}
                              style={{ transform: [{ translateY: -5 }] }}
                            />
                          </>
                        ) : type === "expense" ? (
                          <AntDesign name="arrowdown" size={15} color={Colors.error} style={{ transform: [{ translateY: 7 }] }} />
                        ) : type === "income" ? (
                          <AntDesign name="arrowup" size={15} color={Colors.secondary} style={{ transform: [{ translateY: 7 }] }} />
                        ) : (
                          <Entypo name="back-in-time" size={15} color="rgba(255,255,255,0.7)" style={{ transform: [{ translateY: 7 }] }} />
                        )}
                      </View>

                      <Text
                        numberOfLines={1}
                        style={{
                          color:
                            type == null
                              ? "rgba(255,255,255,0.7)"
                              : type === "expense"
                              ? Colors.error
                              : type === "income"
                              ? Colors.secondary
                              : Colors.secondary_light_2,
                          fontSize: 14,
                        }}
                      >
                        {type == null ? "Select type" : type === "expense" ? "Expense" : type === "income" ? "Income" : "Refunded"}
                      </Text>
                    </Ripple>
                    <Ripple
                      onPress={() => setDate(null)}
                      style={{
                        padding: 7.5,
                        justifyContent: "center",
                        backgroundColor: Colors.primary_lighter,
                        borderRadius: 10,
                        flex: 1,
                        alignItems: "center",
                        width: (Layout.screen.width - 30 - 30) / 3,
                      }}
                    >
                      <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>{date ?? moment().format("YYYY-MM-DD")}</Text>
                    </Ripple>

                    <Ripple
                      onPress={() => setChangeView((p) => !p)}
                      style={{
                        padding: 7.5,
                        paddingHorizontal: 15,
                        backgroundColor: category === "none" ? Colors.primary_light : lowOpacity(Icons[category].backgroundColor, 0.2),
                        borderRadius: 10,
                        justifyContent: "center",
                        alignItems: "center",
                        flexDirection: "row",
                        gap: 15,
                        minWidth: (Layout.screen.width - 30 - 30) / 3,
                        flex: 1,
                      }}
                    >
                      {Icons[category].icon}
                      <Text
                        style={{
                          color:
                            category === "none" ? "rgba(255,255,255,0.7)" : Color(Icons[category]?.backgroundColor).lighten(0.25).hex(),
                          fontSize: 15,
                        }}
                      >
                        {category === "none" ? "Select category" : category}
                      </Text>
                    </Ripple>
                    {!params?.isEditing && (
                      <Ripple
                        onPress={() => setIsSubscription((p) => !p)}
                        style={{
                          padding: 7.5,
                          paddingHorizontal: 15,
                          backgroundColor: isSubscription ? secondary_candidates[3] : Colors.primary_lighter,
                          borderRadius: 10,
                          justifyContent: "center",
                          alignItems: "center",
                          flexDirection: "row",
                          gap: 15,
                          minWidth: (Layout.screen.width - 30 - 30) / 3,
                          flex: 1,
                        }}
                      >
                        <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>Subscription</Text>
                      </Ripple>
                    )}
                  </ScrollView>
                </Animated.View>
              )}

              {changeView && (
                <CategorySelector
                  dismiss={() => {
                    setChangeView(false);
                    setCategory("none");
                  }}
                  current={category}
                  onPress={(item) => {
                    setCategory(item as keyof typeof Icons);
                    setChangeView(false);
                  }}
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
        style={{ flex: 1, gap: 15, borderRadius: 35, marginTop: 30 }}
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

const CategorySelector = (props: { current: string; onPress: (item: string) => void; dismiss: VoidFunction }) => {
  const data = Object.entries(Icons);

  const [query, setQuery] = useState("");

  return (
    <Animated.FlatList
      ListHeaderComponent={<Input placeholder="Search for category" value={query} onChangeText={setQuery} style={{ padding: 15 }} />}
      layout={LinearTransition}
      entering={FadeInDown}
      style={{ width: "100%", height: Layout.screen.height / 2.25 }}
      data={data.filter((item) => item[0].toLowerCase().includes(query.toLowerCase()))}
      keyExtractor={(item) => item[0]}
      stickyHeaderIndices={[0]}
      renderItem={({ item }) => (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            borderBottomWidth: 0.5,
            borderBottomColor: "rgba(255,255,255,0.15)",
            ...((item[0] === props.current && { backgroundColor: Colors.primary_light }) || {}),
            paddingRight: 15,
          }}
        >
          <Ripple
            onPress={() => props.onPress(item[0])}
            style={{
              paddingVertical: 15,
              paddingHorizontal: 5.5,
              flexDirection: "row",
              gap: 15,
              alignItems: "center",
              flex: 1,
            }}
          >
            <View
              style={{
                padding: 10,
                borderRadius: 100,
                backgroundColor: lowOpacity(item[1].backgroundColor, 0.25),
                width: 40,
                height: 40,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {item[1].icon}
            </View>

            <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 18, textTransform: "capitalize", fontWeight: "600" }}>{item[0]}</Text>
          </Ripple>

          {item[0] === props.current && (
            <IconButton onPress={props.dismiss} icon={<AntDesign name="close" color={"rgba(255,255,255,0.7)"} size={24} />} />
          )}
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, gap: 15 },
  input: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 18,
    borderColor: Colors.secondary,
    flex: 1,
    width: Layout.screen.width - 30,
    borderRadius: 100,
  },
});
