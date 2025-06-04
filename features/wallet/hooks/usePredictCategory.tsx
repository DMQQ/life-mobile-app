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
  const [prediction, setPrediction] = useState<ExpensePrediction | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (input && input[0].length >= 3) {
        setDebouncedInput(input[0]);
      } else {
        setDebouncedInput("");
      }
    }, 750);

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
      },
      skip: !debouncedInput,
      fetchPolicy: "cache-and-network",
      notifyOnNetworkStatusChange: true,

      onCompleted() {
        console.log("fetch completed");
      },
    }
  );

  useEffect(() => {
    if (debouncedInput.length < 3) {
      setPrediction(null);
    }
  }, [debouncedInput]);

  useEffect(() => {
    if (data?.predictExpense && data?.predictExpense) {
      onPrediction(data.predictExpense);
      setPrediction(data.predictExpense);
    }
  }, [data?.predictExpense, onPrediction]);

  return prediction;
}
