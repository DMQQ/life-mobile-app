import Input from "@/components/ui/TextInput/TextInput";
import Layout from "@/constants/Layout";
import { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";
import { useWalletContext, type Action, type Filters } from "../components/WalletContext";
import Button from "@/components/ui/Button/Button";
import DateTimePicker from "react-native-modal-datetime-picker";
import { formatDate } from "@/utils/functions/parseDate";
import CategorySelect from "../components/CreateExpense/CategorySelect";
import { ScrollView } from "react-native-gesture-handler";
import Color from "color";
import Colors from "@/constants/Colors";
import { useNavigation } from "@react-navigation/native";
import Header from "@/components/ui/Header/Header";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { CategoryUtils } from "../components/Expense/ExpenseIcon";
import { AnimatedSelector } from "@/components";
import dayjs from "dayjs";
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";

interface ExpenseFiltersProps {
  filters: Filters;
  dispatch: (action: Action) => void;
}

export default function ExpenseFiltersSheet() {
  const { filters, dispatch } = useWalletContext();
  return <Forms filters={filters} dispatch={dispatch} />;
}

const Forms = (props: ExpenseFiltersProps) => {
  const onQueryTextChange = (text: string) => {
    props.dispatch({ type: "SET_QUERY", payload: text });
  };

  const navigation = useNavigation();

  const [localQuery, setLocalQuery] = useState<string>(props.filters.query || "");

  useEffect(() => {
    if (localQuery !== props.filters.query) {
      let timeout = setTimeout(() => {
        onQueryTextChange(localQuery);
      }, 500);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [localQuery]);

  const quickDates = useMemo(() => [{ label: "Today", value: [dayjs().format("YYYY-MM-DD")] }], []);

  const scrollY = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (ev) => {
      scrollY.value = ev.contentOffset.y;
    },
  });

  return (
    <View style={{ flex: 1 }}>
      <Header
        containerStyle={{
          height: 60,
          paddingTop: 15,
        }}
        initialHeight={60}
        scrollY={scrollY}
        goBack
        backIcon={<AntDesign name="close" size={24} color={Colors.foreground} />}
        buttons={[
          {
            icon: <MaterialCommunityIcons size={24} name="trash-can-outline" color={Colors.foreground} />,
            onPress: () => {
              props.dispatch({ type: "RESET" });
              navigation.goBack();
            },
          },
        ]}
      />
      <Animated.ScrollView
        keyboardDismissMode={"on-drag"}
        onScroll={onScroll}
        style={{
          flex: 1,
          padding: 15,
          paddingTop: 90,
        }}
      >
        <Input value={localQuery} onChangeText={setLocalQuery} placeholder="Search for a transaction" placeholderTextColor="gray" />

        <View
          style={{
            flexDirection: "row",
            gap: 10,
            alignItems: "center",
          }}
        >
          <Input
            keyboardAppearance="dark"
            keyboardType="numeric"
            name="amount.from"
            label="Min spent"
            value={props.filters.amount.min.toString()}
            placeholder="From"
            containerStyle={{ flex: 1 }}
            right={<Text style={{ color: Colors.foreground }}>zł</Text>}
            style={{ textAlign: "center" }}
            onChangeText={(text) =>
              props.dispatch({
                type: "SET_AMOUNT_MIN",
                payload: Number.isNaN(parseInt(text)) ? 0 : parseInt(text),
              })
            }
          />
          <Text
            style={{
              color: "gray",
              fontSize: 16,
              alignSelf: "center",
              marginHorizontal: 10,
              marginTop: 15,
            }}
          >
            to
          </Text>
          <Input
            right={<Text style={{ color: Colors.foreground }}>zł</Text>}
            keyboardAppearance="dark"
            keyboardType="numeric"
            name="amount.to"
            label="Max spent"
            value={props.filters.amount.max.toString()}
            placeholder="to"
            containerStyle={{ flex: 1 }}
            style={{ textAlign: "center" }}
            onChangeText={(text) =>
              props.dispatch({
                type: "SET_AMOUNT_MAX",
                payload: Number.isNaN(parseInt(text)) ? 0 : parseInt(text),
              })
            }
          />
        </View>

        <ChooseDateRange dispatch={props.dispatch} filters={props.filters} />

        <Input.Label text="Type" error={false} labelStyle={{ marginTop: 15 }} />

        <AnimatedSelector
          items={["all", "income", "expense", "refunded"] as string[]}
          onItemSelect={(value: any) => {
            if (value === "all") {
              props.dispatch({ type: "SET_TYPE", payload: undefined });
              return;
            }
            props.dispatch({ type: "SET_TYPE", payload: value });
          }}
          containerStyle={{ backgroundColor: Colors.primary, marginTop: 5, marginBottom: 15 }}
          selectedItem={props.filters.type || "all"}
          scale={1}
        />

        <Input.Label text="Category" error={false} labelStyle={{ marginBottom: 10 }} />

        <CategorySelect
          maxSelectHeight={250}
          multiSelect
          closeOnSelect={false}
          selected={Array.isArray(props?.filters?.category) ? props?.filters?.category : [props?.filters?.category]}
          setSelected={(selected) => {
            props.dispatch({ type: "SET_CATEGORY", payload: selected.map(CategoryUtils.getCategoryParent) });
          }}
          isActive={(category) => props.filters.category.includes(category)}
        />
        {/* Query for top 5 categories and list here as buttons */}
      </Animated.ScrollView>
      <View style={{ padding: 15, paddingBottom: 30 }}>
        <Button
          variant="primary"
          type="contained"
          onPress={() => navigation.goBack()}
          style={{
            borderRadius: 100,
          }}
        >
          Close Filters
        </Button>
      </View>
    </View>
  );
};

const ChooseDateRange = (props: { filters: Filters; dispatch: (action: Action) => void }) => {
  const [datePicker, setDatePicker] = useState<"from" | "to" | "">("");

  return (
    <View style={{ marginTop: 15 }}>
      <Input.Label text="Date range" error={false} />
      <View style={{ flexDirection: "row", gap: 10, marginTop: 5 }}>
        <Button
          onPress={() => setDatePicker("from")}
          style={{ flex: 1, borderWidth: 2, borderColor: Color(Colors.primary).lighten(0.5).hex(), borderRadius: 10 }}
          color="secondary"
          fontStyle={{
            fontSize: 16,
            color: !!props.filters.date.from ? Colors.foreground : "gray",
          }}
        >
          {props.filters.date.from || "Date start"}
        </Button>
        <Text
          style={{
            color: "gray",
            fontSize: 16,
            alignSelf: "center",
            marginHorizontal: 10,
          }}
        >
          to
        </Text>
        <Button
          onPress={() => setDatePicker("to")}
          style={{ flex: 1, borderWidth: 2, borderColor: Color(Colors.primary).lighten(0.5).hex(), borderRadius: 10 }}
          color="secondary"
          fontStyle={{
            fontSize: 16,
            color: !!props.filters.date.to ? Colors.foreground : "gray",
          }}
        >
          {props.filters.date.to || "Date end"}
        </Button>
      </View>

      <DateTimePicker
        isVisible={!!datePicker}
        onCancel={() => setDatePicker("")}
        onConfirm={(date) => {
          props.dispatch({
            type: datePicker === "from" ? "SET_DATE_MIN" : "SET_DATE_MAX",
            payload: formatDate(date),
          });
          setDatePicker("");
        }}
      />
    </View>
  );
};
