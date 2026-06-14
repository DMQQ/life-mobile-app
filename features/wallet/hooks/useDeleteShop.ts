import { gql, useMutation } from "@apollo/client"

const DELETE_SHOP = gql`
    mutation DeleteShop($id: ID!) {
        deleteShop(id: $id)
    }
`

export default function useDeleteShop() {
    return useMutation(DELETE_SHOP, { refetchQueries: ["GetShops"] })
}
