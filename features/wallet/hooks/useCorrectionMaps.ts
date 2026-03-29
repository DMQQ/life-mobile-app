import { gql, useMutation, useQuery } from "@apollo/client"

export interface CorrectionMap {
    id: string
    matchShop: string | null
    matchDescription: string | null
    matchCategory: string | null
    matchAmountMin: number | null
    matchAmountMax: number | null
    overrideShop: string | null
    overrideCategory: string | null
    overrideDescription: string | null
    isActive: boolean
    createdAt: string
}

const CORRECTION_MAPS_FIELDS = `
    id
    matchShop
    matchDescription
    matchCategory
    matchAmountMin
    matchAmountMax
    overrideShop
    overrideCategory
    overrideDescription
    isActive
    createdAt
`

const GET_CORRECTION_MAPS = gql`
    query CorrectionMaps {
        correctionMaps {
            ${CORRECTION_MAPS_FIELDS}
        }
    }
`

const CREATE_CORRECTION_MAP = gql`
    mutation CreateCorrectionMap($input: CreateCorrectionMapDto!) {
        createCorrectionMap(input: $input) {
            ${CORRECTION_MAPS_FIELDS}
        }
    }
`

const UPDATE_CORRECTION_MAP = gql`
    mutation UpdateCorrectionMap($id: ID!, $input: UpdateCorrectionMapDto!) {
        updateCorrectionMap(id: $id, input: $input) {
            ${CORRECTION_MAPS_FIELDS}
        }
    }
`

const DELETE_CORRECTION_MAP = gql`
    mutation DeleteCorrectionMap($id: ID!) {
        deleteCorrectionMap(id: $id)
    }
`

export function useCorrectionMaps() {
    const { data, loading, refetch } = useQuery<{ correctionMaps: CorrectionMap[] }>(GET_CORRECTION_MAPS)

    const [createCorrectionMap, { loading: creating }] = useMutation(CREATE_CORRECTION_MAP, {
        refetchQueries: ["CorrectionMaps"],
    })

    const [updateCorrectionMap] = useMutation(UPDATE_CORRECTION_MAP, {
        refetchQueries: ["CorrectionMaps"],
    })

    const [deleteCorrectionMap] = useMutation(DELETE_CORRECTION_MAP, {
        refetchQueries: ["CorrectionMaps"],
    })

    return {
        maps: data?.correctionMaps ?? [],
        loading,
        creating,
        refetch,
        createCorrectionMap: (input: Omit<CorrectionMap, "id" | "isActive" | "createdAt">) =>
            createCorrectionMap({ variables: { input } }),
        updateCorrectionMap: (id: string, input: Partial<Omit<CorrectionMap, "id" | "createdAt">>) =>
            updateCorrectionMap({ variables: { id, input } }),
        deleteCorrectionMap: (id: string) => deleteCorrectionMap({ variables: { id } }),
        toggleActive: (map: CorrectionMap) =>
            updateCorrectionMap({ variables: { id: map.id, input: { isActive: !map.isActive } } }),
    }
}
