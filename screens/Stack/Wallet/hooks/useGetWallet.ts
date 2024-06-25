import { gql, useQuery } from "@apollo/client";
import useUser from "../../../../utils/hooks/useUser";

export const GET_WALLET = gql`
  query GetWallet {
    wallet {
      id
      balance
      expenses {
        id
        amount
        date
        description
        type
        category
        balanceBeforeInteraction
      }
    }
  }
`;

export default function useGetWallet() {
  return useQuery(GET_WALLET, {});
}
