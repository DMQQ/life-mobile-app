import BottomSheet, {
  BottomSheetGorhom,
} from "@/components/ui/BottomSheet/BottomSheet";
import Select from "@/components/ui/Select/Select";
import Input from "@/components/ui/TextInput/TextInput";
import Layout from "@/constants/Layout";
import { forwardRef, useRef } from "react";
import { Text, View } from "react-native";
import { Icons } from "../Wallet/WalletItem";
import type { Action, Filters } from "../../hooks/useGetWallet";
import Button from "@/components/ui/Button/Button";
import { useBottomSheet } from "@gorhom/bottom-sheet";
import SegmentedButtons from "@/components/ui/SegmentedButtons";

interface ExpenseFiltersProps {
  filters: Filters;
  dispatch: (action: Action) => void;
}

const HelperText = ({
  text,
  marginTop = 2.5,
}: {
  text: string;
  marginTop?: number;
}) => (
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

export default forwardRef<BottomSheetGorhom, ExpenseFiltersProps>(
  (props, ref) => {
    return (
      <BottomSheet
        onChange={(index) => {
          //  index < 0 && Keyboard.dismiss();
        }}
        snapPoints={["15%", "30%", "50%", "65%", "95%"]}
        ref={ref}
      >
        <Forms {...props} />
      </BottomSheet>
    );
  }
);

const Forms = (props: ExpenseFiltersProps) => {
  const { close } = useBottomSheet();

  const onFocus = () => {
    // animatedIndex.value > 0 ? collapse() : expand();
  };

  const onQueryTextChange = (text: string) => {
    props.dispatch({ type: "SET_QUERY", payload: text });
  };

  return (
    <View style={{ flex: 1, paddingHorizontal: 15, marginTop: 10 }}>
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
          width: "100%",
          gap: 10,
        }}
      >
        <Input
          keyboardAppearance="dark"
          keyboardType="numeric"
          name="amount.from"
          label="Amount Min"
          value={props.filters.amount.min.toString()}
          placeholder="From"
          style={{ width: (Layout.screen.width - 30) / 2 - 5 }}
          onFocus={() => onFocus()}
          onChangeText={(text) =>
            props.dispatch({
              type: "SET_AMOUNT_MIN",
              payload: Number.isNaN(parseInt(text)) ? 0 : parseInt(text),
            })
          }
        />
        <Input
          keyboardAppearance="dark"
          keyboardType="numeric"
          name="amount.to"
          label="Amount Max"
          value={props.filters.amount.max.toString()}
          placeholder="to"
          style={{ width: (Layout.screen.width - 30) / 2 - 5 }}
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

      <View
        style={{
          flexDirection: "row",
          width: "100%",
          gap: 10,
          marginTop: 15,
        }}
      >
        <Input
          name="date.from"
          label="Date Min"
          value={props.filters.date.from}
          placeholder="From"
          style={{ width: (Layout.screen.width - 30) / 2 - 5 }}
          onFocus={() => onFocus()}
          onChangeText={(text) =>
            props.dispatch({ type: "SET_DATE_MIN", payload: text })
          }
        />
        <Input
          name="date.to"
          label="Date Max"
          value={props.filters.date.to}
          placeholder="To"
          style={{ width: (Layout.screen.width - 30) / 2 - 5 }}
          onFocus={() => onFocus()}
          onChangeText={(text) =>
            props.dispatch({ type: "SET_DATE_MAX", payload: text })
          }
        />
      </View>

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
      <HelperText
        marginTop={0}
        text="Select the type of transactions you want to see"
      />

      <Select
        anchor="top"
        placeholderText="Choose category"
        onFocusChange={() => onFocus()}
        selected={props?.filters?.category || []}
        multiSelect
        setSelected={(selected) => {
          props.dispatch({ type: "SET_CATEGORY", payload: selected });
        }}
        options={Object.keys(Icons)}
        transparentOverlay
        closeOnSelect={false}
        maxSelectHeight={300}
        containerStyle={{ borderRadius: 10, marginTop: 15 }}
        keyExtractor={(item) => item}
      />

      <HelperText
        text="Select the categories you want to see, leaving it empty will show all,
        you can select multiple categories"
      />

      <Button
        onPress={() => close()}
        fontStyle={{ fontSize: 16 }}
        style={{ marginTop: 20 }}
      >
        Close Filters
      </Button>
    </View>
  );
};
