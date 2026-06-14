import { gql, useQuery } from "@apollo/client"

const GET_SHOPS = gql`
    query GetShops($search: String) {
        shops(search: $search) {
            id
            name
            image
            osmId
            location { id name latitude longitude }
        }
    }
`

export type ShopItem = {
    id: string
    name: string
    image?: string | null
    osmId?: string | null
    location?: { id: string; name: string; latitude: number; longitude: number } | null
}

export default function useShops(search?: string) {
    return useQuery<{ shops: ShopItem[] }>(GET_SHOPS, {
        variables: { search: search || undefined },
    })
}
