import BottomSheet, { BottomSheetGorhom } from "@/components/ui/BottomSheet/BottomSheet";
import Select from "@/components/ui/Select/Select";
import Input from "@/components/ui/TextInput/TextInput";
import Layout from "@/constants/Layout";
import { forwardRef, useState } from "react";
import { Text, View } from "react-native";
import { Icons } from "../Wallet/WalletItem";
import type { Action, Filters } from "../../hooks/useGetWallet";
import Button from "@/components/ui/Button/Button";
import { useBottomSheet } from "@gorhom/bottom-sheet";
import SegmentedButtons from "@/components/ui/SegmentedButtons";
import DateTimePicker from "react-native-modal-datetime-picker";
import { formatDate } from "@/utils/functions/parseDate";
import moment from "moment";
import CategorySelect from "../Wallet/CategorySelect";
import { ScrollView } from "react-native-gesture-handler";
import Color from "color";
import Colors from "@/constants/Colors";

interface ExpenseFiltersProps {
  filters: Filters;
  dispatch: (action: Action) => void;
}

const HelperText = ({ text, marginTop = 2.5 }: { text: string; marginTop?: number }) => (
  <Text
    style={{
      color: "gray",
      marginTop,
      fontSize: 12,
      paddingBottom: 5,
      borderBottomWidth: 1,
      borderBottomColor: "rgba(255,255,255,0.2)",
    }}
  >
    {text.trim()}
  </Text>
);

export default forwardRef<BottomSheetGorhom, ExpenseFiltersProps>((props, ref) => {
  return (
    <BottomSheet snapPoints={["95%"]} ref={ref}>
      <Forms {...props} />
    </BottomSheet>
  );
});

const Forms = (props: ExpenseFiltersProps) => {
  const { close } = useBottomSheet();

  const onFocus = () => {
    // animatedIndex.value > 0 ? collapse() : expand();
  };

  const onQueryTextChange = (text: string) => {
    props.dispatch({ type: "SET_QUERY", payload: text });
  };

  return (
    <ScrollView style={{ flex: 1, paddingHorizontal: 15, marginTop: 10, height: Layout.screen.height }}>
      <Input
        value={props?.filters?.query}
        onChangeText={onQueryTextChange}
        placeholder="Search for a transaction"
        onFocus={() => onFocus()}
        placeholderTextColor="gray"
      />

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
          label="Amount Min"
          value={props.filters.amount.min.toString()}
          placeholder="From"
          containerStyle={{ flex: 1 }}
          onFocus={() => onFocus()}
          right={<Text style={{ color: "#fff" }}>zł</Text>}
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
          right={<Text style={{ color: "#fff" }}>zł</Text>}
          keyboardAppearance="dark"
          keyboardType="numeric"
          name="amount.to"
          label="Amount Max"
          value={props.filters.amount.max.toString()}
          placeholder="to"
          containerStyle={{ flex: 1 }}
          style={{ textAlign: "center" }}
          onFocus={() => onFocus()}
          onChangeText={(text) =>
            props.dispatch({
              type: "SET_AMOUNT_MAX",
              payload: Number.isNaN(parseInt(text)) ? 0 : parseInt(text),
            })
          }
        />
      </View>
      <HelperText
        text="Leaving the amount fields empty will ignore them, setting only one will
        filter by that amount only."
      />

      <ChooseDateRange dispatch={props.dispatch} filters={props.filters} />

      <HelperText
        text=" Leaving the amount fields empty will ignore them, setting only one will
        filter by that amount only."
      />

      <SegmentedButtons
        containerStyle={{
          marginTop: 15,
          borderRadius: 12.5,
          width: Layout.screen.width - 30,
        }}
        buttonStyle={{ height: 45, borderRadius: 10, padding: 5 }}
        buttonTextStyle={{ fontSize: 14 }}
        buttons={[
          { text: "All", value: "all" },
          { text: "Income", value: "income" },
          { text: "Expense", value: "expense" },
        ]}
        value={props.filters.type || "all"}
        onChange={(value) => {
          if (value === "all") {
            props.dispatch({ type: "SET_TYPE", payload: undefined });
            return;
          }
          props.dispatch({ type: "SET_TYPE", payload: value });
        }}
      />
      <HelperText marginTop={0} text="Select the type of transactions you want to see" />

      <CategorySelect
        maxSelectHeight={250}
        multiSelect
        closeOnSelect={false}
        onFocusChange={() => onFocus()}
        selected={props?.filters?.category || []}
        setSelected={(selected) => {
          props.dispatch({ type: "SET_CATEGORY", payload: selected });
        }}
        isActive={(category) => props.filters.category.includes(category)}
      />

      <HelperText
        text="Select the categories you want to see, leaving it empty will show all,
        you can select multiple categories"
      />

      <Button onPress={() => close()} fontStyle={{ fontSize: 16 }} style={{ marginTop: 20 }}>
        Close Filters
      </Button>
    </ScrollView>
  );
};

const ChooseDateRange = (props: { filters: Filters; dispatch: (action: Action) => void }) => {
  const [datePicker, setDatePicker] = useState<"from" | "to" | "">("");

  return (
    <View style={{ marginTop: 15, marginBottom: 10 }}>
      <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>Date range</Text>
      <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
        <Button
          onPress={() => setDatePicker("from")}
          style={{ flex: 1, borderWidth: 2, borderColor: Color(Colors.primary).lighten(2).hex(), borderRadius: 10 }}
          color="secondary"
          fontStyle={{
            fontSize: 16,
            color: !!props.filters.date.from ? "white" : "gray",
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
          style={{ flex: 1, borderWidth: 2, borderColor: Color(Colors.primary).lighten(2).hex(), borderRadius: 10 }}
          color="secondary"
          fontStyle={{
            fontSize: 16,
            color: !!props.filters.date.to ? "white" : "gray",
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
