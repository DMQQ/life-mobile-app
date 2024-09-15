import { gql, useApolloClient, useMutation } from "@apollo/client";

const CREATE_EXPENSE = gql`
  mutation CreateExpense($amount: Float!, $description: String!, $type: String!, $category: String!, $date: String!, $schedule: Boolean) {
    createExpense(amount: $amount, description: $description, type: $type, category: $category, date: $date, schedule: $schedule) {
      id
      amount
      description
      date
      type
      category
      balanceBeforeInteraction
      schedule
    }
  }
`;

export default function useCreateActivity(props: { onCompleted?: () => void }) {
  const client = useApolloClient();
  const [createExpense, { data, loading, error, called, reset }] = useMutation(CREATE_EXPENSE, {
    onError(err) {
      console.log("useCreateActivity ERROR");
      console.log(JSON.stringify(err, null, 2));
    },
    onCompleted(data) {
      props.onCompleted?.();

      if (data.createExpense.schedule === false) {
        client?.refetchQueries({
          include: ["GetWallet"],
        });
      }
    },
  });

  return { createExpense, data, loading, error, called, reset };
}
