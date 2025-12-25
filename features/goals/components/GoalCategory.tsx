import { Card } from "@/components"
import Text from "@/components/ui/Text/Text"
import Colors, { secondary_candidates } from "@/constants/Colors"
import { Group } from "@/features/flashcards/hooks"
import { useNavigation } from "@react-navigation/native"
import { useMemo } from "react"
import { View } from "react-native"
import { FadeIn } from "react-native-reanimated"
import GoalActivityGrid from "./StatGrid"
import useDeleteGoals from "../hooks/useDeleteGoals"
import ContextMenu from "react-native-context-menu-view"

interface GoalCategoryProps extends Group {
    icon: string
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

    const { removeGroup } = useDeleteGoals()

    return (
        <ContextMenu
            previewBackgroundColor={"transparent"}
            actions={[
                {
                    title: "Delete Goal",
                    systemIcon: "trash",
                    destructive: true,
                },
            ]}
            onPress={(e) => {
                if (e.nativeEvent.name === "Delete Goal") {
                    removeGroup({ variables: { id: rest.id } })
                }
            }}
        >
            <Card
                animated
                ripple
                onLongPress={rest.onLongPress}
                onPress={() => {
                    navigation.navigate("Goal", { id: rest.id })
                }}
                style={{
                    marginVertical: 7.5,
                }}
                entering={FadeIn.delay((rest.index + 1) * 50)}
            >
                <View style={{ pointerEvents: "box-none" }}>
                    <GoalActivityGrid
                        contributionData={contributionData}
                        primaryColor={secondary_candidates[rest?.index % secondary_candidates.length]}
                        goalThreshold={rest.target}
                    />
                </View>
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "flex-end",
                        paddingBottom: 5,
                    }}
                >
                    <View>
                        <Text style={{ color: Colors.foreground, marginTop: 15, fontSize: 18, fontWeight: "600" }}>
                            {name}
                        </Text>
                        <Text style={{ color: Colors.foreground, fontSize: 16, marginTop: 10 }}>{description}</Text>
                    </View>
                </View>
            </Card>
        </ContextMenu>
    )
}

export default GoalCategory
