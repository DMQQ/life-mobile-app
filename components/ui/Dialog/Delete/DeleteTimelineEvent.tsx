import useRemoveTimelineMutation from "@/features/timeline/hooks/mutation/useRemoveTimelineMutation"
import DeleteDialog, { DeleteDialogProps } from "./DeleteDialog"
import { useNavigation } from "@react-navigation/native"

export default function DeleteTimelineEvent({
    shouldNavigateBack = true,
    ...props
}: Omit<DeleteDialogProps, "remove" | "children"> & {
    item: { id: string; date: string; name: string } | undefined

    shouldNavigateBack?: boolean
}) {
    const navgiation = useNavigation()
    const { remove } = useRemoveTimelineMutation(props.item || { id: "", date: "", name: "" }, () => {
        props.onDismiss()
        if (shouldNavigateBack) navgiation.goBack()
    })

    return <DeleteDialog {...props} remove={remove} />
}
