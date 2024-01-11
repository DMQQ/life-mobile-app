import Button from "@/components/ui/Button/Button";
import Colors from "@/constants/Colors";
import Color from "color";
import { View } from "react-native";
import useDeleteActivity from "../hooks/useDeleteActivity";
import { WalletElement } from "./WalletItem";

const SheetActionButtons = (props: {
  selectedExpense: WalletElement | undefined;
  onCompleted: Function;
}) => {
  const { deleteActivity } = useDeleteActivity();

  const onRemove = async () => {
    if (typeof props.selectedExpense?.id !== "undefined")
      await deleteActivity({
        variables: {
          id: props.selectedExpense?.id,
        },

        onCompleted() {
          props.onCompleted();
        },
      });
  };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 20,
      }}
    >
      <Button
        type="contained"
        fontStyle={{ color: Colors.secondary, textTransform: "none" }}
        style={{
          backgroundColor: Color(Colors.secondary).alpha(0.15).string(),
          flexDirection: "row-reverse",
          flex: 1,
          marginLeft: 10,
          borderRadius: 5,
        }}
      >
        Edit
      </Button>

      <Button
        onPress={onRemove}
        type="contained"
        fontStyle={{
          color: Colors.error,
          textTransform: "none",
        }}
        style={{
          backgroundColor: Color(Colors.error).alpha(0.15).string(),
          flex: 1,
          flexDirection: "row-reverse",
          borderRadius: 5,
        }}
      >
        Remove
      </Button>
    </View>
  );
};

export default SheetActionButtons;
