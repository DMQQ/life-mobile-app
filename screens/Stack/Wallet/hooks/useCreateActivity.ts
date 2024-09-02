import { gql, useMutation } from "@apollo/client";

const CREATE_EXPENSE = gql`
  mutation CreateExpense($amount: Float!, $description: String!, $type: String!, $category: String!, $date: String!) {
    createExpense(amount: $amount, description: $description, type: $type, category: $category, date: $date) {
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
  const [createExpense, { data, loading, error, called, reset }] = useMutation(CREATE_EXPENSE, {
    refetchQueries: ["GetWallet"],
    onError(err) {
      console.log("useCreateActivity ERROR");
      console.log(JSON.stringify(err, null, 2));
    },

    onCompleted() {
      props.onCompleted?.();
    },
  });

  return { createExpense, data, loading, error, called, reset };
}
