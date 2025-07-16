import { GET_GROUPS } from "@/features/flashcards/hooks"
import { gql, useMutation } from "@apollo/client"
import DeleteDialog, { DeleteDialogProps } from "./DeleteDialog"

export default function DeleteFlashCardGroupDialog(props: DeleteDialogProps) {
    const [removeGroup, { error, data }] = useMutation(
        gql`
            mutation DeleteFlashCardGroup($groupId: String!) {
                removeflashCardGroup(groupId: $groupId) {
                    isDeleted
                }
            }
        `,
        {
            refetchQueries: [
                {
                    query: GET_GROUPS,
                },
            ],
        },
    )

    return (
        <DeleteDialog
            {...props}
            remove={() =>
                removeGroup({
                    variables: { groupId: props?.item?.id },
                })
            }
        />
    )
}
