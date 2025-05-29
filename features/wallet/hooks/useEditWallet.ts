import { gql, useMutation } from "@apollo/client";

const EDIT_BALANCE = gql`
  mutation EditBalance($balance: Int!) {
    editWalletBalance(amount: $balance) {
      id
      balance
    }
  }
`;

export default function useEditWallet(onCompleted: () => void) {
  const [editBalance, { data, loading, error }] = useMutation(EDIT_BALANCE, {
    onCompleted,

    onError: (error) => {
      console.error(error);
    },
  });

  return { editBalance, data, loading, error };
}
