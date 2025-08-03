import useRemoveTimelineMutation from "@/features/timeline/hooks/mutation/useRemoveTimelineMutation"
import DeleteDialog, { DeleteDialogProps } from "./DeleteDialog"

export default function DeleteTimelineEvent(
    props: Omit<DeleteDialogProps, "remove" | "children"> & {
        item: { id: string; date: string; name: string } | undefined
    },
) {
    const { remove } = useRemoveTimelineMutation(props.item || { id: "", date: "", name: "" })

    return <DeleteDialog {...props} remove={remove} />
}
