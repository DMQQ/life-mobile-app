import { gql, useMutation } from "@apollo/client"

const SET_SHOP_IMAGE = gql`
    mutation SetShopImage($shopId: ID!, $imageUrl: String!) {
        setShopImage(shopId: $shopId, imageUrl: $imageUrl) {
            id
            name
            image
        }
    }
`

export type ShopImageResult = { id: string; name: string; image?: string | null }

export default function useSetShopImage() {
    return useMutation<
        { setShopImage: ShopImageResult },
        { shopId: string; imageUrl: string }
    >(SET_SHOP_IMAGE)
}
