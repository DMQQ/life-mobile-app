import {gql, useMutation} from "@apollo/client";

export const useUploadSubExpense = (onCompleted: () => void) => {
    return useMutation(
        gql`
      mutation UploadSubExpense($expenseId: ID!, $input: [CreateSubExpenseDto!]!) {
        addMultipleSubExpenses(expenseId: $expenseId, inputs: $input) {
          id
          description
          amount
          category
        }
      }
    `,
        {onCompleted, onError: (e) => console.log(JSON.stringify(e, null, 2))}
    );
};