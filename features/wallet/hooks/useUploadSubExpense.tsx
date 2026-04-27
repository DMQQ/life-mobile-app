import {gql, useMutation} from "@apollo/client";

export const useUploadSubExpense = (onCompleted: () => void) => {
    return useMutation(
        gql`
      mutation UploadSubExpense($input: AddMultipleSubExpensesInput!) {
        addMultipleSubExpenses(input: $input) {
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
