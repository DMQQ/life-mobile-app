import { gql, useMutation } from "@apollo/client";
import { WalletElement } from "../components/Wallet/WalletItem";

export const REFUND_EXPENSE = gql`
  mutation refundExpense($expenseId: ID!) {
    refundExpense(expenseId: $expenseId) {
      id
      type
    }
  }
`;

export default function useRefund(onCompleted?: (data: { refundExpense: { id: string; type: string } }) => void) {
  return useMutation(REFUND_EXPENSE, {
    refetchQueries: ["GetWallet"],
    onCompleted,
  });
}
