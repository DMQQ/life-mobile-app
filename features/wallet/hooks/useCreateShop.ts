import { gql, useMutation } from "@apollo/client"

const CREATE_SHOP = gql`
    mutation CreateShop($input: CreateShopInput!) {
        createShop(input: $input) {
            id
            name
            image
            osmId
            location { id name latitude longitude }
        }
    }
`

export default function useCreateShop() {
    return useMutation(CREATE_SHOP, { refetchQueries: ["GetShops"] })
}
