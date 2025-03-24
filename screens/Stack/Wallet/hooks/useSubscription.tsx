import { gql, useMutation } from "@apollo/client";

export default function useSubscription() {
  const [cancelSubscription, cancelSubscriptionState] = useMutation(
    gql`
      mutation cancelSubscription($subscriptionId: ID!) {
        cancelSubscription(subscriptionId: $subscriptionId) {
          id
          amount
          date
          description
          type
          category
          balanceBeforeInteraction
          note
          subscription {
            id
            isActive
            nextBillingDate
            dateStart
          }
        }
      }
    `,
    { refetchQueries: ["GetWallet"] }
  );

  const [createSubscription, createSubscriptionState] = useMutation(
    gql`
      mutation createSubscription($expenseId: ID!) {
        createSubscription(expenseId: $expenseId) {
          id
          amount
          date
          description
          type
          category
          balanceBeforeInteraction
          note
          subscription {
            id
            isActive
            nextBillingDate
            dateStart
          }
        }
      }
    `,
    { refetchQueries: ["GetWallet"] }
  );

  return {
    cancelSubscription,
    cancelSubscriptionState,
    createSubscription,
    createSubscriptionState,
  };
}
