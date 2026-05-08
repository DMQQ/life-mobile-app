import useDeleteAllOccurrences from "@/features/timeline/hooks/mutation/useDeleteAllOccurrences"
import DeleteDialog, { DeleteDialogProps } from "./DeleteDialog"
import { useNavigation } from "@react-navigation/native"

export default function DeleteAllTimelineEvents({
    shouldNavigateBack = true,
    ...props
}: Omit<DeleteDialogProps, "remove" | "children"> & {
    item: { id: string; date: string; name: string } | undefined
    shouldNavigateBack?: boolean
}) {
    const navigation = useNavigation()
    const { remove } = useDeleteAllOccurrences(props.item || { id: "", date: "", name: "" }, () => {
        props.onDismiss()
        if (shouldNavigateBack) navigation.goBack()
    })

    return <DeleteDialog {...props} remove={remove} />
}
