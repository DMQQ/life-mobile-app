import Button from "@/components/ui/Button/Button";
import Colors from "@/constants/Colors";
import { View } from "react-native";
import useDeleteActivity from "../../hooks/useDeleteActivity";
import { WalletElement } from "./WalletItem";
import { useNavigation } from "@react-navigation/native";
import lowOpacity from "@/utils/functions/lowOpacity";

const SheetActionButtons = (props: { selectedExpense: WalletElement | undefined; onCompleted: Function }) => {
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
          backgroundColor: lowOpacity(Colors.error, 10),
        }}
      >
        Remove
      </Button>

      <Button
        onPress={() =>
          // navigation.navigate("CreateActivity", {
          //   edit: props.selectedExpense,
          // })

          navigation.navigate("CreateExpense", {
            ...props.selectedExpense,
            isEditing: true,
          })
        }
        type="contained"
        style={{
          backgroundColor: lowOpacity(Colors.secondary, 30),
        }}
        fontStyle={{ fontSize: 16, color: Colors.secondary_light_2 }}
      >
        Edit
      </Button>
    </View>
  );
};

export default SheetActionButtons;
