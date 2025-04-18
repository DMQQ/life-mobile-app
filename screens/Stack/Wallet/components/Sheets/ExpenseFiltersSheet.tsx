import BottomSheet, { BottomSheetGorhom } from "@/components/ui/BottomSheet/BottomSheet";
import Select from "@/components/ui/Select/Select";
import Input from "@/components/ui/TextInput/TextInput";
import Layout from "@/constants/Layout";
import { forwardRef, useEffect, useState } from "react";
import { Text, View } from "react-native";
import { Icons } from "../Wallet/WalletItem";
import { useWalletContext, type Action, type Filters } from "../../components/WalletContext";
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
import { useNavigation } from "@react-navigation/native";
import useGetWallet from "../../hooks/useGetWallet";
import Header from "@/components/ui/Header/Header";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";

interface ExpenseFiltersProps {
  filters: Filters;
  dispatch: (action: Action) => void;
}

export default function ExpenseFiltersSheet() {
  const { filters, dispatch } = useWalletContext();
  return <Forms filters={filters} dispatch={dispatch} />;
}

const Forms = (props: ExpenseFiltersProps) => {
  // const { close } = useBottomSheet();

  const onFocus = () => {
    // animatedIndex.value > 0 ? collapse() : expand();
  };

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

  return (
    <ScrollView style={{ flex: 1, height: Layout.screen.height, paddingTop: 15 }}>
      <Header
        goBack
        backIcon={<AntDesign name="close" size={24} color="white" />}
        buttons={[
          {
            icon: <MaterialCommunityIcons size={24} name="trash-can-outline" color={"#fff"} />,
            onPress: () => {
              props.dispatch({ type: "RESET" });
              navigation.goBack();
            },
          },
        ]}
      />
      <View style={{ flex: 1, paddingHorizontal: 15, marginTop: 15 }}>
        <Input
          value={localQuery}
          onChangeText={setLocalQuery}
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

        <ChooseDateRange dispatch={props.dispatch} filters={props.filters} />

        <Input.Label text="Description" error={false} labelStyle={{ marginTop: 15 }} />

        <SegmentedButtons
          containerStyle={{
            marginTop: 5,
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

        <Input.Label text="Category" error={false} labelStyle={{ marginBottom: 10 }} />

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
      </View>
    </ScrollView>
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
          style={{ flex: 1, borderWidth: 2, borderColor: Color(Colors.primary).lighten(0.5).hex(), borderRadius: 10 }}
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
