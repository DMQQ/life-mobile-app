import { gql, useQuery } from "@apollo/client";
import { useWalletContext } from "../components/WalletContext";
import { useState } from "react";

interface ICategory {
  category: string;

  percentage: number;

  total: number;

  count: string;
}
export default function useGetLegendData(startDate?: string, endDate?: string) {
  const { filters } = useWalletContext();
  const [detailed, setDetailed] = useState<"general" | "detailed">("general");
  const r = useQuery<{ statisticsLegend: ICategory[] }>(
    gql`
      query StatisticsLegend($startDate: String!, $endDate: String!, $detailed: String!) {
        statisticsLegend(startDate: $startDate, endDate: $endDate, displayMode: $detailed) {
          category
          count
          total
          percentage
        }
      }
    `,
    {
      variables: { startDate: startDate ?? filters.date.from, endDate: endDate ?? filters.date.to, detailed },
      returnPartialData: true,
      fetchPolicy: "cache-and-network",
    }
  );

  function toggleMode() {
    setDetailed((p) => (p === "general" ? "detailed" : "general"));
  }

  return { ...r, toggleMode, detailed };
}
