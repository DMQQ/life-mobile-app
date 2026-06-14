import { gql, useMutation } from "@apollo/client"

const UPDATE_SHOP = gql`
    mutation UpdateShop($id: ID!, $input: UpdateShopInput!) {
        updateShop(id: $id, input: $input) {
            id
            name
            image
            osmId
        }
    }
`

export default function useUpdateShop() {
    return useMutation(UPDATE_SHOP, { refetchQueries: ["GetShops"] })
}
