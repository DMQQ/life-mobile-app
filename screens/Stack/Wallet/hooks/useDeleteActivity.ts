import { gql, useMutation } from "@apollo/client";
import useUser from "../../../../utils/hooks/useUser";

const DELETE_ACTIVITY = gql`
  mutation DeleteActivity($id: ID!) {
    deleteExpense(id: $id)
  }
`;

export default function useDeleteActivity() {
  const usr = useUser();

  const [deleteActivity, { data, loading, error }] = useMutation(
    DELETE_ACTIVITY,
    {
      refetchQueries: ["GetWallet"],

      onCompleted(data) {},
    }
  );

  return { deleteActivity, data, loading, error };
}
