import { gql, useMutation, useQuery } from "@apollo/client"
import { GET_WALLET } from "./useGetWallet"

const SUB_ACCOUNTS_QUERY = gql`
    query SubAccounts {
        wallet {
            subAccounts {
                id
                name
                description
                color
                icon
                balance
                isDefault

                income
                expense
            }
        }
    }
`

const CREATE_SUB_ACCOUNT = gql`
    mutation CreateSubAccount($input: CreateSubAccountInput!) {
        createSubAccount(input: $input) {
            id
            name
            balance
        }
    }
`

const UPDATE_SUB_ACCOUNT = gql`
    mutation UpdateSubAccount($id: ID!, $input: UpdateSubAccountInput!) {
        updateSubAccount(id: $id, input: $input) {
            id
            name
            balance
        }
    }
`

const DELETE_SUB_ACCOUNT = gql`
    mutation DeleteSubAccount($id: ID!) {
        deleteSubAccount(id: $id)
    }
`

interface SubAccountsQueryResult {
    wallet: {
        subAccounts: {
            id: string
            name: string
            description: string | null
            color: string
            icon: string
            balance: number
            isDefault: boolean

            income: number

            expense: number
        }[]
    }
}

export function useSubAccounts() {
    return useQuery<SubAccountsQueryResult>(SUB_ACCOUNTS_QUERY, {
        fetchPolicy: "cache-first",
    })
}

export function useCreateSubAccount(onCompleted?: () => void) {
    return useMutation(CREATE_SUB_ACCOUNT, {
        onCompleted,
        refetchQueries: [{ query: SUB_ACCOUNTS_QUERY }, { query: GET_WALLET }],
    })
}

export function useUpdateSubAccount(onCompleted?: () => void) {
    return useMutation(UPDATE_SUB_ACCOUNT, {
        onCompleted,
        refetchQueries: [{ query: SUB_ACCOUNTS_QUERY }, { query: GET_WALLET }],
    })
}

export function useDeleteSubAccount(onCompleted?: () => void) {
    return useMutation(DELETE_SUB_ACCOUNT, {
        onCompleted,
        refetchQueries: [{ query: SUB_ACCOUNTS_QUERY }],
    })
}

const TRANSFER_BETWEEN_SUB_ACCOUNTS = gql`
    mutation TransferBetweenSubAccounts($input: TransferBetweenSubAccountsInput!) {
        transferBetweenSubAccounts(input: $input) {
            from
            to
        }
    }
`

export function useTransferBetweenSubAccounts(onCompleted?: () => void) {
    return useMutation(TRANSFER_BETWEEN_SUB_ACCOUNTS, {
        onCompleted,
        refetchQueries: [{ query: SUB_ACCOUNTS_QUERY }, { query: GET_WALLET }],
    })
}
