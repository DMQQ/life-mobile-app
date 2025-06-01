import { gql, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";

export interface ExpensePrediction {
  description: string;
  amount: number;
  category: string;
  type: string;
  shop?: string;
  locationId?: string;
  confidence: number;
}

export default function usePredictExpense(input: [string, number], onPrediction: (data: ExpensePrediction) => void) {
  const [debouncedInput, setDebouncedInput] = useState<string>("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (input && input[0].length >= 3) {
        setDebouncedInput(input[0]);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [input]);

  const { data } = useQuery(
    gql`
      query PredictExpense($input: String!, $amount: Float) {
        predictExpense(input: $input, amount: $amount) {
          description
          amount
          category
          type
          shop
          locationId
          confidence
        }
      }
    `,
    {
      variables: {
        input: debouncedInput,
        // amount: input?.[1] ?? 0,
      },
      skip: !debouncedInput,
      fetchPolicy: "cache-and-network",
      notifyOnNetworkStatusChange: true,
    }
  );

  useEffect(() => {
    if (data?.predictExpense && data?.predictExpense) {
      onPrediction(data.predictExpense);
    }
  }, [data?.predictExpense, onPrediction]);

  return (data?.predictExpense || null) as ExpensePrediction | null;
}
