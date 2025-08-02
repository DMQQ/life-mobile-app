import { DELETE_FLASHCARD, GET_FLASHCARDS } from "@/features/flashcards/hooks"
import { useMutation } from "@apollo/client"
import DeleteDialog, { DeleteDialogProps } from "./DeleteDialog"

export default function DeleteFlashCardDialog(props: Omit<DeleteDialogProps, "remove"> & { groupId?: string }) {
    const [deleteFlashCardMutation] = useMutation<any, { id: string }>(DELETE_FLASHCARD, {
        refetchQueries: [{ query: GET_FLASHCARDS, variables: { id: props?.groupId } }],
    })

    return (
        <DeleteDialog
            {...props}
            remove={() =>
                deleteFlashCardMutation({
                    variables: { id: props?.item?.id! },
                })
            }
        />
    )
}
