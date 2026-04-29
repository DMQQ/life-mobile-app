import { CodegenConfig } from "@graphql-codegen/cli"
import Url from "./constants/Url"

const config: CodegenConfig = {
    schema: Url.API + "/graphql",

    documents: [
        "./**/*.tsx",
        "./**/*.ts",
        "!./utils/hooks/workout/**",
        "!./utils/schemas/GET_WORKOUT.ts",
        "!./utils/schemas/GET_WORKOUTS.ts",
        "!./features/workout/**",
        "!./features/timeline/hooks/mutation/useCompleteTimeline.ts",
        "!./features/timeline/hooks/mutation/useEditTimeline.ts",
        "!./features/timeline/hooks/query/useGetTimeLineQuery.ts",
        "!./features/timeline/hooks/query/useGetTimelineById.ts",
        "!./features/goals/hooks/hooks.ts",
        "!./utils/hooks/useActivityServer.ts",
    ],

    generates: {
        "./gql/": {
            preset: "client",
            plugins: [],
        },
    },
}

export default config
