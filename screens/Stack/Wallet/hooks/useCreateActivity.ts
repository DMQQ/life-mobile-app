import { gql, useMutation } from "@apollo/client";
import { GET_WALLET } from "./useGetWallet";
import { Wallet } from "../../../../types";

const CREATE_EXPENSE = gql`
  mutation CreateExpense(
    $amount: Float!
    $description: String!
    $type: String!
    $category: String!
    $date: String!
  ) {
    createExpense(
      amount: $amount
      description: $description
      type: $type
      category: $category
      date: $date
    ) {
      id
      amount
      description
      date
      type
      category
      balanceBeforeInteraction
    }
  }
`;

export default function useCreateActivity(props: { onCompleted?: () => void }) {
  const [createExpense, { data, loading, error, called, reset }] = useMutation(
    CREATE_EXPENSE,
    {
      refetchQueries: [{ query: GET_WALLET }],
      // update(cache, { data }) {
      //   cache.modify({
      //     fields: {
      //       wallet() {
      //         const wallet = cache.readQuery({
      //           query: GET_WALLET,
      //         }) as { wallet: Wallet };

      //         const walletCopy = {
      //           ...wallet.wallet,
      //           expenses: [data.createExpense, ...wallet.wallet.expenses],
      //         };

      //         if (data.createExpense.type === "expense") {
      //           walletCopy.balance =
      //             walletCopy.balance - data.createExpense.amount;
      //         } else {
      //           walletCopy.balance =
      //             walletCopy.balance + data.createExpense.amount;
      //         }

      //         walletCopy.expenses = walletCopy.expenses.sort(
      //           (a, b) =>
      //             new Date(b.date).getTime() - new Date(a.date).getTime()
      //         );

      //         cache.writeQuery({
      //           query: GET_WALLET,
      //           data: { wallet: walletCopy },
      //         });

      //         return walletCopy;
      //       },
      //     },
      //   });
      // },

      onError(err) {
        console.log("useCreateActivity ERROR");
        console.log(JSON.stringify(err, null, 2));
      },

      onCompleted() {
        props.onCompleted?.();
      },
    }
  );

  return { createExpense, data, loading, error, called, reset };
}
