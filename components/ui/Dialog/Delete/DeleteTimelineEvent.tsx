import useRemoveTimelineMutation from "@/features/timeline/hooks/mutation/useRemoveTimelineMutation"
import DeleteDialog, { DeleteDialogProps } from "./DeleteDialog"

export default function DeleteTimelineEvent(props: Omit<DeleteDialogProps, "remove" | "children">) {
    const { remove } = useRemoveTimelineMutation({ id: props.item?.id! as string })

    return <DeleteDialog {...props} remove={remove} />
}
