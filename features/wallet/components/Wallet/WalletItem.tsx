import { View, Text, StyleSheet, StyleProp, ViewStyle } from "react-native";
import moment from "moment";
import Colors, { secondary_candidates } from "@/constants/Colors";
import Ripple from "react-native-material-ripple";
import Animated, { AnimatedStyle, FadeIn, FadeOut, LinearTransition } from "react-native-reanimated";
import { CategoryIcon, CategoryUtils, Icons } from "../ExpenseIcon";
import { Expense } from "@/types";
import { useState } from "react";
import Feedback from "react-native-haptic-feedback";

export interface WalletElement extends Expense {
  description: string;
  amount: number;
  type: string;
  date: string;
  id: string;

  balanceBeforeInteraction: number;

  category: keyof typeof Icons;

  note?: string;
}

export { Icons } from "../ExpenseIcon";

export { CategoryIcon } from "../ExpenseIcon";

interface WalletItemProps extends WalletElement {}

const styles = StyleSheet.create({
  expense_item: {
    height: 65,
    borderRadius: 15,
    padding: 10,
    flexDirection: "row",
    backgroundColor: Colors.primary_lighter,
  },
  title: {
    color: "#fff",
    fontSize: 15,
    marginLeft: 10,
    fontWeight: "bold",
    marginBottom: 5,
  },
  icon_container: {
    padding: 7.5,
    justifyContent: "center",
  },
  date: {
    color: "#9f9f9f",
    fontSize: 10,
    marginLeft: 10,
    lineHeight: 15,
  },
  price_container: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  price: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  button: {
    padding: 5,
    paddingHorizontal: 7.5,
    backgroundColor: Colors.primary_light,
  },
  buttonText: {
    color: Colors.secondary,
    fontSize: 20,
    fontWeight: "bold",
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 100,
    height: 40,
    width: 40,
  },
  expanded: {
    padding: 15,
    borderRadius: 15,
    paddingTop: 20,
  },
});

export function parseDateToText(date: string) {
  const providedDate = moment(date);

  const today = moment();
  const yesterday = moment().subtract(1, "days");

  if (providedDate.isSame(today, "day")) {
    return "Today";
  }
  if (providedDate.isSame(yesterday, "day")) {
    return "Yesterday";
  }
  return providedDate.format("YYYY-MM-DD");
}

export default function WalletItem(
  item: WalletItemProps & {
    handlePress: Function;
    animatedStyle: AnimatedStyle;
    index: number;
    containerStyle?: StyleProp<ViewStyle>;
    subExpenseStyle?: StyleProp<ViewStyle> & Record<string, any>;
    onLongPress?: () => void;
  }
) {
  const price = item?.type === "expense" ? (item.amount * -1).toFixed(2) : (item.type === "refunded" ? "" : "+") + item.amount?.toFixed(2);

  const isBalanceEdit = item?.description?.includes("Balance edited") || item?.amount === 0;

  const [isExpanded, setIsExpanded] = useState(false);

  if (!item) {
    return null;
  }

  return (
    <Animated.View
      style={[
        {
          marginBottom: 15,
          position: "relative",
          backgroundColor: Colors.primary_lighter,
          borderRadius: 15,
        },
        item.animatedStyle,
      ]}
      layout={LinearTransition}
    >
      <Ripple
        onLongPress={async () => {
          Feedback.trigger("impactLight");
          if (item.onLongPress) {
            item.onLongPress();
          }
          setIsExpanded(!isExpanded);
        }}
        disabled={isBalanceEdit}
        style={[styles.expense_item, item.containerStyle]}
        onPress={() => item.handlePress()}
      >
        <CategoryIcon type={item.type as "income" | "expense" | "refunded"} category={isBalanceEdit ? "edit" : item.category} />

        <View style={{ height: "100%", justifyContent: "center", flex: 3 }}>
          <Text style={styles.title} numberOfLines={1}>
            {item.description}
          </Text>
          <View style={{ flexDirection: "row" }}>
            <Text style={styles.date}>
              {parseDateToText(item.date)}
              {(item.category || item.subscription?.isActive) && " / "}
              {CategoryUtils.getCategoryName(item.category)}
              {item.category && item.subscription?.isActive && " / "}
              {item.subscription?.isActive ? <Text style={{ color: secondary_candidates[0] }}>Subscription</Text> : ""}
              {item.files && item.files.length > 0 && (
                <>
                  {" / "}

                  <Text style={{ color: secondary_candidates[1] }}>
                    {item.files.length} {item.files.length > 1 ? "files" : "file"}
                  </Text>
                </>
              )}
              {item.subexpenses && item.subexpenses?.length > 0 && (
                <>
                  {" / "}
                  <Text style={{ color: secondary_candidates[2] }}>
                    {item.subexpenses?.length} {item.subexpenses?.length > 1 ? "sub" : "subs"}
                  </Text>
                </>
              )}
            </Text>
          </View>
        </View>
        {!isBalanceEdit && (
          <View style={[styles.price_container, { flexDirection: "row" }]}>
            <Text
              style={[
                styles.price,
                {
                  marginRight: 10,
                  width: "100%",
                  textAlign: "right",
                  color: item.type === "refunded" ? Colors.secondary_light_2 : item.type === "expense" ? "#F07070" : "#66E875",
                  ...(item.type === "refunded" ? { textDecorationLine: "line-through" } : {}),
                },
              ]}
            >
              {price}
              <Text style={{ fontSize: 14 }}>zł</Text>
            </Text>
          </View>
        )}
      </Ripple>

      {isExpanded && item.subexpenses?.length > 0 && (
        <Animated.View layout={LinearTransition} style={styles.expanded}>
          {item.subexpenses.map((subexpense, index) => (
            <Animated.View
              key={subexpense.id}
              entering={FadeIn.delay(index * 50)}
              exiting={FadeOut.delay(Math.min((item.subexpenses.length - index) * 50, 200))}
            >
              <WalletItem
                key={index}
                {...item}
                {...(subexpense as any)}
                files={[]}
                subscription={undefined}
                subexpenses={[]}
                type="expense"
                handlePress={() => {}}
                animatedStyle={{ marginBottom: 5 }}
                index={index}
                containerStyle={{ marginBottom: 0, ...((item.subExpenseStyle as any) || {}) }}
              />
            </Animated.View>
          ))}
        </Animated.View>
      )}
    </Animated.View>
  );
}
