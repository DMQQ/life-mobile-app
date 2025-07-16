import Colors, { secondary_candidates } from "@/constants/Colors"
import { useNavigation } from "@react-navigation/native"
import { useMemo } from "react"
import { Text, View } from "react-native"
import Ripple from "react-native-material-ripple"
import GoalActivityGrid from "./StatGrid" // Assuming this imports the GitHubActivityGrid component

interface GoalCategoryProps {
    id: string
    name: string
    icon: string
    description: string
    onPress?: () => void
    entries?: {
        id: string
        value: number
        date: string
    }[]
    target: number
    min: number
    max: number
    index: number
    length?: number

    onLongPress?: () => void
}

export const GoalCategory = ({ name, icon, description, entries = [], onPress, ...rest }: GoalCategoryProps) => {
    const navigation = useNavigation<any>()

    const contributionData = useMemo(() => {
        return entries.map((entry) => ({
            date: entry.date,
            count: entry.value,
        }))
    }, [entries])

    return (
        <Ripple
            onLongPress={rest.onLongPress}
            onPress={() => {
                navigation.navigate("Goal", { id: rest.id })
            }}
            style={{
                padding: 20,
                backgroundColor: Colors.primary_lighter,
                borderRadius: 15,
                marginVertical: 7.5,
                ...(rest.index === (rest.length || 0) - 1 && { marginBottom: 40 }),
            }}
        >
            <View style={{ pointerEvents: "box-none" }}>
                <GoalActivityGrid
                    contributionData={contributionData}
                    primaryColor={secondary_candidates[rest?.index % secondary_candidates.length]}
                    goalThreshold={rest.target}
                />
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
                <View>
                    <Text style={{ color: "#fff", marginTop: 15 }}>{name}</Text>
                    <Text style={{ color: "#fff" }}>{description}</Text>
                </View>
            </View>
        </Ripple>
    )
}

export default GoalCategory
