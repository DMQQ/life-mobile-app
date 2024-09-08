import { gql, useQuery } from "@apollo/client";

export interface WalletStatisticsResponse {
  statistics: {
    total: number;
    average: number;
    max: number;
    min: number;
    count: number;
    theMostCommonCategory: string;
    theLeastCommonCategory: string;
    lastBalance: number;
    income: number;
    expense: number;
  };
}

export default function useGetStatistics(range: [any, any]) {
  const query = useQuery<WalletStatisticsResponse>(
    gql`
      query WalletStatistics($range: [String!]!) {
        statistics: getStatistics(range: $range) {
          ...Stats
        }
      }

      fragment Stats on WalletStatisticsRange {
        total
        average
        max
        min
        count
        theMostCommonCategory
        theLeastCommonCategory
        lastBalance
        income
        expense
      }
    `,
    { variables: { range } }
  );

  return query;
}
