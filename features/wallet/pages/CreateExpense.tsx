import moment from "moment";
import { ActivityIndicator, Alert, Keyboard, ScrollView, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from "react-native";
import Colors, { secondary_candidates } from "@/constants/Colors";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import Ripple from "react-native-material-ripple";
import Layout from "@/constants/Layout";
import WalletItem, { Icons } from "../components/Wallet/WalletItem";
import { AntDesign, Entypo, Ionicons } from "@expo/vector-icons";
import lowOpacity from "@/utils/functions/lowOpacity";
import Animated, {
  FadeIn,
  LinearTransition,
  useSharedValue,
  withSpring,
  useAnimatedStyle,
  cancelAnimation,
  withTiming,
  FadeOut,
} from "react-native-reanimated";
import useCreateActivity from "../hooks/useCreateActivity";
import DateTimePicker from "react-native-modal-datetime-picker";
import { useEditExpense } from "./CreateActivity";
import IconButton from "@/components/ui/IconButton/IconButton";
import Color from "color";
import Input from "@/components/ui/TextInput/TextInput";
import usePredictCategory from "../hooks/usePredictCategory";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import NumbersPad from "../components/CreateExpense/NumberPad";
import CategorySelector from "../components/CreateExpense/CategorySelector";
import { FlatList } from "react-native-gesture-handler";
import { gql, useApolloClient, useMutation } from "@apollo/client";
import Feedback from "react-native-haptic-feedback";
import Button from "@/components/ui/Button/Button";
import { SpontaneousRateChip, SpontaneousRateSelector } from "../components/CreateExpense/SpontaneousRate";

interface SubExpense {
  id: string;
  description: string;
  amount: number;

  category: keyof typeof Icons;
}

const useUploadSubExpense = (onCompleted: () => void) => {
  return useMutation(
    gql`
      mutation UploadSubExpense($expenseId: ID!, $input: [CreateSubExpenseDto!]!) {
        addMultipleSubExpenses(expenseId: $expenseId, inputs: $input) {
          id
          description
          amount
          category
        }
      }
    `,
    { onCompleted, onError: (e) => console.log(JSON.stringify(e, null, 2)) }
  );
};

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export default function CreateExpenseModal({ navigation, route: { params } }: any) {
  const { createExpense, loading } = useCreateActivity({
    onCompleted() {},
  });
  const client = useApolloClient();

  const editExpense = useEditExpense();

  const [amount, setAmount] = useState<string>(params?.amount.toString() || "0");
  const [date, setDate] = useState<null | string>(params?.date ? moment(params.date).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD"));
  const [changeView, setChangeView] = useState(false);
  const [category, setCategory] = useState<keyof typeof Icons>(params.category || "none");
  const [name, setName] = useState(params?.description || "");
  const [type, setType] = useState<"expense" | "income" | null>(params?.type || null);
  const [isSubscription, setIsSubscription] = useState(false);

  const [spontaneousRate, setSpontaneousRate] = useState(params?.spontaneousRate || 0);

  const [isSubExpenseMode, setIsSubExpenseMode] = useState(false);

  const [SubExpenses, setSubExpenses] = useState<SubExpense[]>([]);

  const transformX = useSharedValue(0);

  const isAnimating = useSharedValue(false);

  const [uploadSubexpenses, state] = useUploadSubExpense(() => {});

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
    if (isSubExpenseMode) {
      handleAddSubexpense();

      return;
    }

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

    if (!isValid) {
      shake();
      return;
    }

    if (params?.isEditing) {
      await editExpense({
        variables: {
          amount: parseAmount(amount),
          description: name,
          type: type,
          category: category,
          expenseId: params.id,
          date: date,
          spontaneousRate,
        },
      }).catch((e) => console.log(e));

      if (SubExpenses.length > 0) {
        await uploadSubexpenses({
          variables: {
            expenseId: params.id,
            input: SubExpenses.map((item) => ({
              description: item.description,
              amount: item.amount,
              category: item.category,
            })),
          },
        });
      }

      try {
        await client?.refetchQueries({
          include: ["GetWallet", "Limits"],
        });

        console.log("Refetched queries successfully");
      } catch (error) {
        console.log("Error refetching queries:", error);
      }

      navigation.goBack();

      return;
    }

    const { data, errors } = await createExpense({
      variables: {
        amount: parseAmount(amount),
        description: name,
        type: type,
        category: category,
        date: date ?? moment().format("YYYY-MM-DD"),
        schedule: moment(date).isAfter(moment()),
        isSubscription: isSubscription,
        spontaneousRate: spontaneousRate,
      },
    });

    const id = data.createExpense.id;

    if (SubExpenses.length > 0) {
      await uploadSubexpenses({
        variables: {
          expenseId: id,
          input: SubExpenses.map((item) => ({
            description: item.description,
            amount: item.amount,
            category: item.category,
          })),
        },
      });
    }

    await client?.refetchQueries({
      include: ["GetWallet", "Limits"],
    });

    navigation.goBack();
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

  const isValid = type !== null && name !== "" && amount !== "" && type !== null && amount !== "0" && date !== null;

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

  const [categoryPrediction] = usePredictCategory(name, +amount);

  useEffect(() => {
    if (categoryPrediction) {
      setCategory(categoryPrediction.category as keyof typeof Icons);
      setType("expense");
    }
  }, [categoryPrediction]);

  useEffect(() => {
    if (type === "income") setCategory("income");
    else if (type === "expense" && category === "income") setCategory("none");
    {
    }
  }, [type, category]);

  const handleAddSubexpense = () => {
    if (amount === "0") {
      shake();
      return;
    }

    setSubExpenses((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        description: name,
        amount: +amount,
        category: category,
      },
    ]);
    setAmount("0");
    setName("");
  };

  const subexpenseSheetRef = useRef<BottomSheet>(null);

  const renderBackdrop = useCallback((props: any) => <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />, []);

  const calculateSubExpensesTotal = () => {
    return SubExpenses.reduce((acc, item) => acc + item.amount, 0);
  };

  const [isInputFocused, setIsInputFocused] = useState(false);

  const [regularModeState, setRegularModeState] = useState({
    amount: params?.amount?.toString() || "0",
    date: params?.date ? moment(params.date).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD"),
    category: params?.category || "none",
    name: params?.description || "",
    type: params?.type || null,
  });

  const handleToggleSubExpenseMode = () => {
    setType("expense");
    if (!isSubExpenseMode) {
      setRegularModeState({
        amount: amount === "0" ? calculateSubExpensesTotal().toString() : amount,
        date: date as any,
        category,
        name,
        type,
      });

      setAmount("0");
      setName("");
      setIsSubExpenseMode(true);
    } else {
      if (params?.isEditing) {
        restorePreviousState();
      } else {
        setAmount(regularModeState.amount);
        setDate(regularModeState.date);
        setCategory(regularModeState.category);
        setName(regularModeState.name);
        setType(regularModeState.type);
      }
      setIsSubExpenseMode(false);
    }
  };

  const restorePreviousState = () => {
    setAmount(params?.amount.toString() || "0");
    setDate(params?.date ? moment(params.date).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD"));
    setChangeView(false);
    setCategory(params.category || "none");
    setName(params?.description || "");
    setType(params?.type || null);
  };

  useEffect(() => {
    if (params?.isEditing) {
      restorePreviousState();

      setRegularModeState({
        amount: params?.amount?.toString() || "0",
        date: params?.date ? moment(params.date).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD"),
        category: params?.category || "none",
        name: params?.description || "",
        type: params?.type || null,
      });
    }
  }, [params]);

  const [spontaneousView, setSpontaneousView] = useState(false);

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={{ flex: 1 }}>
        <View style={styles.container}>
          <IconButton
            style={{ position: "absolute", top: 15, left: 15, zIndex: 100 }}
            onPress={() => navigation.goBack()}
            icon={<AntDesign name="close" size={24} color="rgba(255,255,255,0.7)" />}
          />

          <View style={styles.amountContainer}>
            <View>
              <Animated.Text style={[{ color: "#fff", fontWeight: "bold" }, animatedAmount]}>
                {amount}
                <Text style={{ fontSize: 20 }}>zł</Text>
              </Animated.Text>

              {SubExpenses.length > 0 && (
                <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, textAlign: "center" }}>
                  {SubExpenses.length} sub expenses for {calculateSubExpensesTotal()}zł
                </Text>
              )}
            </View>

            {moment(date).isAfter(moment()) && type && amount != "0" && (
              <View style={styles.scheduledContainer}>
                <Text style={styles.scheduledText}>
                  {capitalize(type || "")} of {amount}zł will be scheduled for {"\n"} {moment(date).format("DD MMMM YYYY")}
                </Text>
              </View>
            )}
          </View>

          <View style={{ marginTop: 20, flex: 1, gap: 15, maxHeight: Layout.screen.height / 1.75 - 5 }}>
            <View
              style={{
                borderRadius: 35,
                flex: 1,
              }}
            >
              {!changeView && !spontaneousView && (
                <Animated.View entering={FadeIn} style={{ gap: 5 }}>
                  <View style={{ flexDirection: "row", width: "100%", alignItems: "center" }}>
                    <Input
                      containerStyle={{
                        borderRadius: 25,
                        backgroundColor: isInputFocused ? Color(Colors.primary_light).lighten(0.25).hex() : Colors.primary_light,
                        borderColor: isInputFocused ? Color(Colors.primary).lighten(2.5).hex() : Colors.primary_lighter,
                      }}
                      placeholder={isSubExpenseMode ? "Add sub-expense" : "What are you spending on?"}
                      style={styles.input}
                      placeholderTextColor={"rgba(255,255,255,0.3)"}
                      value={name}
                      onChangeText={setName}
                      onBlur={() => setIsInputFocused(false)}
                      onFocus={() => setIsInputFocused(true)}
                      left={
                        <IconButton
                          onLongPress={() => {
                            Feedback.trigger("impactLight");
                            subexpenseSheetRef.current?.expand();
                          }}
                          icon={
                            isSubExpenseMode ? (
                              <Text style={{ width: 18, height: 18, textAlign: "center", color: "#fff", fontWeight: "900" }}>
                                {SubExpenses.length}
                              </Text>
                            ) : (
                              <AntDesign name="switcher" size={18} color="rgba(255,255,255,0.7)" />
                            )
                          }
                          onPress={handleToggleSubExpenseMode}
                          style={{
                            backgroundColor: !isSubExpenseMode ? Colors.primary : Colors.secondary,
                            padding: 10,
                          }}
                        />
                      }
                      right={
                        <Ripple
                          onPress={handleSubmit}
                          style={[styles.save, !isValid && { backgroundColor: lowOpacity(styles.save.backgroundColor, 0.2) }]}
                          disabled={!isValid}
                        >
                          {loading ? (
                            <ActivityIndicator size={14} color="#fff" />
                          ) : (
                            <AntDesign name="save" size={20} color={isValid ? "#fff" : lowOpacity(Colors.secondary_light_1, 0.5)} />
                          )}
                          <Text
                            style={{
                              color: isValid ? "#fff" : lowOpacity(Colors.secondary_light_1, 0.5),
                              fontSize: 14,
                              fontWeight: "500",
                              lineHeight: 20,
                            }}
                          >
                            {isSubExpenseMode ? "Add" : params?.isEditing ? "Edit" : "Done"}
                          </Text>
                        </Ripple>
                      }
                    />
                  </View>
                  <Animated.ScrollView
                    layout={LinearTransition}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ flexDirection: "row" }}
                    contentContainerStyle={{ gap: 10 }}
                  >
                    <Ripple
                      onPress={() => setType((p) => (p === "expense" ? "income" : "expense"))}
                      style={[
                        styles.chip,
                        {
                          backgroundColor:
                            type == null
                              ? Colors.primary_lighter
                              : lowOpacity(
                                  type === "expense"
                                    ? Colors.error
                                    : type === "income"
                                    ? Colors.secondary_light_1
                                    : Colors.secondary_light_2,
                                  0.2
                                ),
                          gap: 10,
                        },
                      ]}
                    >
                      <View>
                        {type == null ? (
                          <View style={{ height: 15, transform: [{ translateY: -6.5 }] }}>
                            <Entypo name="chevron-up" color="rgba(255,255,255,0.7)" size={15} style={{ transform: [{ translateY: 3 }] }} />
                            <Entypo
                              name="chevron-down"
                              color="rgba(255,255,255,0.7)"
                              size={15}
                              style={{ transform: [{ translateY: -5 }] }}
                            />
                          </View>
                        ) : type === "expense" ? (
                          <AntDesign name="arrowdown" size={15} color={Color(Colors.error).lighten(0.2).string()} />
                        ) : type === "income" ? (
                          <AntDesign name="arrowup" size={15} color={Color(Colors.secondary_light_1).lighten(0.2).string()} />
                        ) : (
                          <Entypo name="back-in-time" size={15} color="rgba(255,255,255,0.7)" />
                        )}
                      </View>

                      <Text
                        numberOfLines={1}
                        style={{
                          color: Color(
                            type == null
                              ? "rgba(255,255,255,0.7)"
                              : type === "expense"
                              ? Colors.error
                              : type === "income"
                              ? Colors.secondary_light_1
                              : Colors.secondary_light_2
                          )
                            .lighten(0.2)
                            .string(),
                          fontSize: 14,
                        }}
                      >
                        {type == null ? "Select type" : type === "expense" ? "Expense" : type === "income" ? "Income" : "Refunded"}
                      </Text>
                    </Ripple>

                    <Ripple onPress={() => setDate(null)} style={[styles.chip, { backgroundColor: Colors.primary_lighter }]}>
                      <AntDesign name="calendar" size={15} color="rgba(255,255,255,0.7)" />
                      <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>{date ?? moment().format("YYYY-MM-DD")}</Text>
                    </Ripple>

                    <Ripple
                      onPress={() => setChangeView((p) => !p)}
                      style={[
                        styles.chip,
                        { backgroundColor: category === "none" ? Colors.primary_light : lowOpacity(Icons[category]?.backgroundColor, 0.2) },
                      ]}
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
                    <SpontaneousRateChip
                      value={spontaneousRate}
                      onPress={() => {
                        setChangeView(false);
                        setSpontaneousView(true);
                      }}
                    />
                  </Animated.ScrollView>
                </Animated.View>
              )}

              {changeView && !spontaneousView && (
                <CategorySelector
                  dismiss={() => {
                    setChangeView(false);
                    setCategory("none");
                  }}
                  current={category}
                  onPress={(item) => {
                    setIsSubscription(item === "subscription");

                    setCategory(item as keyof typeof Icons);
                    setChangeView(false);
                  }}
                />
              )}

              {spontaneousView && (
                <SpontaneousRateSelector value={spontaneousRate} setValue={setSpontaneousRate} dismiss={() => setSpontaneousView(false)} />
              )}

              {!changeView && !spontaneousView && (
                <NumbersPad rotateBackButton={amount === "0" && SubExpenses.length === 0} handleAmountChange={handleAmountChange} />
              )}
            </View>
          </View>
        </View>

        <BottomSheet
          ref={subexpenseSheetRef}
          index={-1}
          snapPoints={[Layout.screen.height / 1.6]}
          enablePanDownToClose
          backdropComponent={renderBackdrop}
          backgroundStyle={{ backgroundColor: Colors.primary }}
          handleIndicatorStyle={{ backgroundColor: Colors.secondary }}
        >
          <View style={{ flex: 1, padding: 15 }}>
            <FlatList
              data={SubExpenses}
              showsHorizontalScrollIndicator={false}
              ListEmptyComponent={
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      height: Layout.screen.height / 1.6 - 130,
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "rgba(255,255,255,0.7)",
                        fontSize: 18,
                        textAlign: "center",
                        padding: 15,
                      }}
                    >
                      No subexpenses added yet.{"\n"}Press the button below to add one.
                    </Text>
                  </View>

                  <Button
                    onPress={() => {
                      subexpenseSheetRef.current?.close();
                      setIsSubExpenseMode(true);
                    }}
                    style={{
                      borderRadius: 100,
                    }}
                  >
                    Add Subexpense
                  </Button>
                </View>
              }
              renderItem={({ item }) => (
                <WalletItem
                  handlePress={() => {
                    Alert.alert("Delete", "Are you sure you want to delete this subexpense?", [
                      {
                        text: "Cancel",
                        style: "cancel",
                      },
                      {
                        text: "Delete",
                        onPress: () => {
                          setSubExpenses((prev) => prev.filter((i) => i.id !== item.id));
                        },
                      },
                    ]);
                  }}
                  {...({
                    ...item,
                    amount: item.amount.toString(),
                    date: moment(date).format("YYYY-MM-DD"),
                    type: "expense",
                    category: item.category,
                  } as any)}
                  files={[]}
                  subexpenses={[]}
                  containerStyle={{ backgroundColor: Colors.primary_lighter }}
                />
              )}
            />
          </View>
        </BottomSheet>

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
  numberPadNumberButton: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  categoryButton: {
    paddingVertical: 15,
    paddingHorizontal: 5.5,
    flexDirection: "row",
    gap: 15,
    alignItems: "center",
    flex: 1,
  },

  chip: {
    padding: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 15,
    minWidth: (Layout.screen.width - 30 - 30) / 3,
    flex: 1,
  },

  amountContainer: {
    height: 250,
    justifyContent: "center",
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 15,
  },

  scheduledContainer: { position: "absolute", justifyContent: "center", alignItems: "center", bottom: -15 },

  scheduledText: { color: "rgba(255,255,255,0.7)", fontWeight: "600", fontSize: 13, textAlign: "center" },

  save: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: Colors.secondary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7.5,
  },
});
