import { graphql } from "@/gql/gql"
import { useMutation, useQuery } from "@apollo/client"

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

const GET_CORRECTION_MAPS = graphql(`
    query CorrectionMaps {
        correctionMaps {
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
        }
    }
`)

const CREATE_CORRECTION_MAP = graphql(`
    mutation CreateCorrectionMap($input: CreateCorrectionMapDto!) {
        createCorrectionMap(input: $input) {
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
        }
    }
`)

const UPDATE_CORRECTION_MAP = graphql(`
    mutation UpdateCorrectionMap($id: ID!, $input: UpdateCorrectionMapDto!) {
        updateCorrectionMap(id: $id, input: $input) {
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
        }
    }
`)

const DELETE_CORRECTION_MAP = graphql(`
    mutation DeleteCorrectionMap($id: ID!) {
        deleteCorrectionMap(id: $id)
    }
`)

export function useCorrectionMaps() {
    const { data, loading, refetch } = useQuery(GET_CORRECTION_MAPS)

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
        maps: (data?.correctionMaps ?? []) as CorrectionMap[],
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
