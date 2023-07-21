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
  const usr = useUser();

  const { data, loading, error } = useQuery(GET_WALLET, {
    context: {
      headers: {
        authentication: usr.token,
      },
    },
  });
  return { data, loading, error };
}
