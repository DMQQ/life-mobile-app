import { gql, useMutation } from "@apollo/client";

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
