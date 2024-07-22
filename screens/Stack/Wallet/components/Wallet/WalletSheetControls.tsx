import Button from "@/components/ui/Button/Button";
import Colors from "@/constants/Colors";
import Color from "color";
import { View } from "react-native";
import useDeleteActivity from "../../hooks/useDeleteActivity";
import { WalletElement } from "./WalletItem";
import { useNavigation } from "@react-navigation/native";

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

  const navigation = useNavigation<any>();

  return (
    <View
      style={{
        marginBottom: 20,
        gap: 15,
      }}
    >
      <Button
        onPress={onRemove}
        type="contained"
        fontStyle={{
          color: Colors.error,
          fontSize: 16,
        }}
        style={{
          backgroundColor: Color(Colors.error).alpha(0.025).string(),
        }}
      >
        Remove
      </Button>

      <Button
        onPress={() =>
          navigation.navigate("CreateActivity", {
            edit: props.selectedExpense,
          })
        }
        type="contained"
        fontStyle={{ fontSize: 16 }}
      >
        Edit
      </Button>
    </View>
  );
};

export default SheetActionButtons;
