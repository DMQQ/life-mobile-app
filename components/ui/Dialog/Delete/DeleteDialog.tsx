import Colors from "@/constants/Colors"
import lowOpacity from "@/utils/functions/lowOpacity"
import { AntDesign } from "@expo/vector-icons"
import Haptics from "react-native-haptic-feedback"
import Dialog from "../Dialog"

export interface DeleteDialogProps {
    onDismiss: () => void
    isVisible: boolean
    children?: React.ReactNode

    remove: () => Promise<any>

    item?: {
        id: string
        name: string
    }
}
export default function DeleteDialog(props: DeleteDialogProps) {
    return (
        <Dialog
            icon={<AntDesign name="delete" size={20} color={Colors.error} />}
            iconBackground
            iconBackgroundSize={40}
            iconBackgroundColor={lowOpacity(Colors.error, 0.2)}
            isVisible={!!props.isVisible}
            onDismiss={props.onDismiss}
            title="Confirm deletion"
            buttons={[
                {
                    children: "Cancel",
                    onPress: props.onDismiss,
                    style: { marginRight: 10 },
                },
                {
                    children: "Delete",
                    fontStyle: { color: Colors.error },
                    style: {
                        backgroundColor: lowOpacity(Colors.error, 0.2),
                        borderRadius: 10,
                        padding: 7.5,
                        paddingHorizontal: 15,
                    },
                    onPress: async () => {
                        if (!props.item?.id) return

                        Haptics.trigger("impactLight")

                        await props.remove()

                        props.onDismiss()
                    },
                },
            ]}
            description={`Are you sure you want to delete ${props.item?.name}? This action cannot be undone.`}
        >
            {props.children}
        </Dialog>
    )
}
