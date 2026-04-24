import { CodegenConfig } from "@graphql-codegen/cli"
import Url from "./constants/Url"

const config: CodegenConfig = {
    schema: Url.API + "/graphql",

    documents: ["./**/*.tsx", "./**/*.ts"],

    generates: {
        "./@types/": {
            preset: "client",
            plugins: [],
        },
    },
}

export default config
