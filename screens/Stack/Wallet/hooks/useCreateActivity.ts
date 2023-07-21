import { gql, useMutation } from "@apollo/client";
import useUser from "../../../../utils/hooks/useUser";
import { GET_WALLET } from "./useGetWallet";
import { Wallet } from "../../../../types";

const CREATE_EXPENSE = gql`
  mutation CreateExpense(
    $amount: Float!
    $description: String!
    $type: String!
  ) {
    createExpense(amount: $amount, description: $description, type: $type) {
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
  const usr = useUser();

  const [createExpense, { data, loading, error, called, reset }] = useMutation(
    CREATE_EXPENSE,
    {
      context: {
        headers: {
          authorization: usr.token,
        },
      },
      update(cache, { data }) {
        cache.modify({
          fields: {
            wallet() {
              const wallet = cache.readQuery({
                query: GET_WALLET,
              }) as { wallet: Wallet };

              const walletCopy = {
                ...wallet.wallet,
                expenses: [...wallet.wallet.expenses],
              };

              walletCopy.expenses = [
                data.createExpense,
                ...walletCopy.expenses,
              ];

              if (data.createExpense.type === "expense") {
                walletCopy.balance =
                  walletCopy.balance - data.createExpense.amount;
              } else {
                walletCopy.balance =
                  walletCopy.balance + data.createExpense.amount;
              }

              cache.writeQuery({
                query: GET_WALLET,
                data: { wallet: walletCopy },
              });

              return walletCopy;
            },
          },
        });
      },

      onError(err) {
        console.log(JSON.stringify(err, null, 2));
      },

      onCompleted() {
        props.onCompleted?.();
      },
    }
  );

  return { createExpense, data, loading, error, called, reset };
}
