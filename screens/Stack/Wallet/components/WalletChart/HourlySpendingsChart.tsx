import { gql, useQuery } from "@apollo/client";
import { View } from "react-native";

export default function HourlySpendingsChart() {
  const {} = useQuery(gql`
    query GetHours {
      hourlySpendingsHeatMap
    }
  `);
  return <View></View>;
}
