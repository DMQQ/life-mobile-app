import { gql, useMutation } from "@apollo/client";
import useUser from "../../../../utils/hooks/useUser";

const EDIT_BALANCE = gql`
  mutation EditBalance($balance: Int!) {
    editWalletBalance(amount: $balance) {
      id
      balance
    }
  }
`;

export default function useEditWallet(onCompleted: () => void) {
  const usr = useUser();

  const [editBalance, { data, loading, error }] = useMutation(EDIT_BALANCE, {
    context: {
      headers: {
        authentication: usr.token,
      },
    },
    onCompleted,
  });

  return { editBalance, data, loading, error };
}
