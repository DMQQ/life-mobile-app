import { gql, useMutation, useQuery } from "@apollo/client"

export interface Goal {
    id: string
    goals: Goals[] // This is actually categories
}

export interface Goals {
    id: string
    name: string
    icon: string
    description: string
    stats: GoalStats[] // This is actually entries
}

export interface GoalStats {
    id: string
    value: number
    date: string
}

export const GET_USER_GOAL = gql`
    query GetUserGoal($dateRange: DateRangeInput) {
        userGoal(dateRange: $dateRange) {
            id
            categories {
                id
                name
                icon
                description
                min
                max
                target
                unit

                entries {
                    id
                    value
                    date
                }
            }
        }
    }
`

export const GET_GOALS = gql`
    query GetGoals {
        goals {
            id
            name
            icon
            description
            min
            max
            target
            unit
            entries {
                id
                value
                date
            }
        }
    }
`

export const CREATE_GOALS = gql`
    mutation CreateGoals($input: CreateGoalsInput!) {
        createGoals(input: $input) {
            id
            name
            icon
            description
        }
    }
`

export const UPDATE_GOALS = gql`
    mutation UpdateGoals($id: ID!, $input: UpdateGoalsInput!) {
        updateGoals(id: $id, input: $input) {
            id
            name
            icon
            description
        }
    }
`

export const DELETE_GOALS = gql`
    mutation DeleteGoals($id: ID!) {
        deleteGoals(id: $id)
    }
`

export const UPSERT_GOAL_STATS = gql`
    mutation UpsertGoalStats($goalsId: ID!, $value: Float!, $date: DateTime) {
        upsertGoalStats(goalsId: $goalsId, value: $value, date: $date) {
            id
            value
            date
        }
    }
`

export const useGoal = (dateRange?: { start: Date; end: Date }) => {
    const {
        data: goalData,
        loading: goalLoading,
        error: goalError,
    } = useQuery(GET_USER_GOAL, {
        variables: { dateRange },
    })

    const { data: goalsData, loading: goalsLoading, refetch: refetchGoals } = useQuery(GET_GOALS)

    const [createGoals] = useMutation(CREATE_GOALS, {
        refetchQueries: [GET_USER_GOAL, GET_GOALS],
        onError: (error) => {
            console.error(JSON.stringify(error, null, 2))
        },
        onCompleted: (data) => {
            console.log("Goal created:", data)
        },
    })

    const [updateGoals] = useMutation(UPDATE_GOALS, {
        refetchQueries: [GET_USER_GOAL, GET_GOALS],
    })

    const [deleteGoals] = useMutation(DELETE_GOALS, {
        refetchQueries: [GET_USER_GOAL, GET_GOALS],
    })

    const [upsertStats] = useMutation(UPSERT_GOAL_STATS, {
        refetchQueries: [GET_USER_GOAL, GET_GOALS],
    })

    return {
        goal: goalData?.userGoal,
        goals: goalsData?.goals,
        loading: goalLoading || goalsLoading,
        error: goalError,
        createGoals,
        updateGoals,
        deleteGoals,
        upsertStats,
        refetchGoals,
    }
}

export const useGetGoal = (id: string) => {
    return useQuery(
        gql`
            query GetGoal($id: ID!) {
                goal(id: $id) {
                    id
                    name
                    icon
                    description
                    min
                    max
                    target
                    unit
                    entries {
                        id
                        value
                        date
                    }
                }
            }
        `,
        { variables: { id } },
    )
}
