import { gql, useMutation } from "@apollo/client";

const EDIT_BALANCE = gql`
  mutation EditBalance($amount: Int, $paycheck: Float, $paycheckDate: String) {
    editWalletBalance(amount: $amount, paycheck: $paycheck, paycheckDate: $paycheckDate) {
      id
      balance
      income
      paycheckDate
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
