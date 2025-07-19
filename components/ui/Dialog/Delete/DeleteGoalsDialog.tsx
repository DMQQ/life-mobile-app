import { GET_GOALS } from "@/features/goals/hooks/hooks"
import { gql, useMutation } from "@apollo/client"
import DeleteDialog, { DeleteDialogProps } from "./DeleteDialog"

export default function DeleteGoalsGroupDialog(props: Omit<DeleteDialogProps, "remove">) {
    const [removeGroup, { error, data }] = useMutation(
        gql`
            mutation DeleteGoalsCategory($id: ID!) {
                deleteGoals(id: $id) {
                    isDeleted
                }
            }
        `,
        {
            refetchQueries: [
                {
                    query: GET_GOALS,
                },
            ],
        },
    )

    return (
        <DeleteDialog
            {...props}
            remove={() =>
                removeGroup({
                    variables: { id: props?.item?.id! },
                })
            }
        />
    )
}
