import { gql, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";

interface Prediction {
  category: string;
  confidence: number;
}
export default function usePredictCategory(input: string, amount?: number) {
  const wallet = useQuery(
    gql`
      query {
        wallet {
          id
          expenses(take: 200, skip: 0) {
            id
            description
            category
          }
        }
      }
    `,
    {
      onError: (error) => {
        console.log(JSON.stringify(error, null, 2));
      },
    }
  );

  const [output, setOutput] = useState<Prediction[]>([]);

  const similarityFn = (s1: string, s2: string): number => {
    if (s1 === s2) return 1.0;
    if (s1.length === 0 || s2.length === 0) return 0.0;

    const maxLength = Math.max(s1.length, s2.length);

    const lenS1 = s1.length;
    const lenS2 = s2.length;
    const matrix: number[][] = [];

    for (let i = 0; i <= lenS1; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= lenS2; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= lenS1; i++) {
      for (let j = 1; j <= lenS2; j++) {
        const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
      }
    }

    const distance = matrix[lenS1][lenS2];

    return 1 - distance / maxLength;
  };

  const onPredictCategory = () => {
    const predictions = [] as Prediction[];

    wallet.data?.wallet.expenses.forEach((expense: any) => {
      const similarity = similarityFn(input, expense.description);
      if (similarity > 0.5) {
        const prediction = predictions.find((p) => p.category === expense.category);
        if (prediction) {
          prediction.confidence += similarity;
        } else {
          predictions.push({ category: expense.category, confidence: similarity });
        }
      }
    });

    return predictions;
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!input) return;
      const predictions = onPredictCategory();
      setOutput(predictions);
    }, 500);

    return () => {
      clearTimeout(timeout);
    };
  }, [input, amount]);

  return output;
}
