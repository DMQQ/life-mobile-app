import { gql, useApolloClient, useMutation } from "@apollo/client";
import { Platform, ToastAndroid } from "react-native";

const CREATE_EXPENSE = gql`
  mutation CreateExpense(
    $amount: Float!
    $description: String!
    $type: String!
    $category: String!
    $date: String!
    $schedule: Boolean
    $isSubscription: Boolean
  ) {
    createExpense(
      amount: $amount
      description: $description
      type: $type
      category: $category
      date: $date
      schedule: $schedule
      isSubscription: $isSubscription
    ) {
      id
      amount
      description
      date
      type
      category
      balanceBeforeInteraction
      schedule

      subscription {
        id
        isActive
        nextBillingDate
        dateStart
      }
      subexpenses {
        id
        description
        amount
        category
      }
    }
  }
`;

export default function useCreateActivity(props: { onCompleted?: () => void }) {
  const client = useApolloClient();
  const [createExpense, { data, loading, error, called, reset }] = useMutation(CREATE_EXPENSE, {
    onCompleted(data) {
      props.onCompleted?.();

      console.log("data", data);

      if (data.createExpense.schedule === false) {
        client?.refetchQueries({
          include: ["GetWallet"],
        });
      } else if (Platform.OS === "android") {
        ToastAndroid.show("Expense has been scheduled", ToastAndroid.SHORT);
      }
    },
    onError: (er) => JSON.stringify(er, null, 2),
  });

  return { createExpense, data, loading, error, called, reset };
}
