import BottomSheet, {
  BottomSheetGorhom,
} from "@/components/ui/BottomSheet/BottomSheet";
import Select from "@/components/ui/Select/Select";
import Input from "@/components/ui/TextInput/TextInput";
import Layout from "@/constants/Layout";
import { forwardRef } from "react";
import { KeyboardAvoidingView, Text, View } from "react-native";
import { Icons } from "../Wallet/WalletItem";
import type { Action, Filters } from "../../hooks/useGetWallet";
import Button from "@/components/ui/Button/Button";
import { useBottomSheet } from "@gorhom/bottom-sheet";

interface ExpenseFiltersProps {
  filters: Filters;
  dispatch: (action: Action) => void;
}

export default forwardRef<BottomSheetGorhom, ExpenseFiltersProps>(
  (props, ref) => {
    return (
      <BottomSheet snapPoints={["60%", "75%"]} ref={ref}>
        <Forms {...props} />
      </BottomSheet>
    );
  }
);

const Forms = (props: ExpenseFiltersProps) => {
  const { expand, animatedIndex, snapToIndex, collapse, close } =
    useBottomSheet();

  const onFocus = () => {
    animatedIndex.value > 0 ? collapse() : expand();
  };

  const onQueryTextChange = (text: string) => {
    props.dispatch({ type: "SET_QUERY", payload: text });
  };

  return (
    <KeyboardAvoidingView
      behavior="position"
      style={{ flex: 1, paddingHorizontal: 15, marginTop: 10 }}
    >
      <Input
        value={props?.filters?.query}
        onChangeText={onQueryTextChange}
        placeholder="Search for a transaction"
        onFocus={() => onFocus(1)}
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
          name="date.from"
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
          name="date.to"
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
      <Text style={{ color: "gray" }}>
        Leaving the amount fields empty will ignore them, setting only one will
        filter by that amount only.
      </Text>

      <Select
        placeholderText="Choose category or create your own"
        onFocusChange={() => onFocus()}
        selected={props?.filters?.category || []}
        multiSelect
        setSelected={(selected) => {}}
        options={Object.keys(Icons)}
        transparentOverlay
        closeOnSelect
        maxSelectHeight={200}
        containerStyle={{ borderRadius: 10, marginTop: 15 }}
        keyExtractor={(item) => item}
      />

      <Button
        onPress={() => close()}
        fontStyle={{ fontSize: 16 }}
        style={{ marginTop: 20 }}
      >
        Apply filters!
      </Button>
    </KeyboardAvoidingView>
  );
};
