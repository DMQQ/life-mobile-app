import { Card } from "@/components"
import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import { useNavigation } from "@react-navigation/native"
import moment from "moment"
import { View } from "react-native"
import Animated, { FadeIn } from "react-native-reanimated"
import { Group, useGroupStats } from "../hooks"

const successRate = (num: number) => {
    if (num === 0) return "red"

    if (num < 50) return "orange"

    if (num < 70) return "yellow"

    if (num < 90) return "green"

    return Colors.secondary
}

const FlashCardGroup = (group: Group & { index: number; length: number; onLongPress?: () => void }) => {
    const navigation = useNavigation<any>()

    const { data } = useGroupStats(group.id)

    const groupStats = data?.groupStats

    return (
        <Card
            ripple
            onPress={() => navigation.navigate("FlashCard", { groupId: group.id })}
            onLongPress={group.onLongPress}
            style={{
                backgroundColor: Colors.primary_lighter,
                borderRadius: 15,
                marginVertical: 7.5,
                gap: 10,
                minHeight: 150,

                ...(group.index === group.length - 1 && { marginBottom: 40 }),
            }}
        >
            <Text style={{ color: Colors.secondary, fontSize: 20, fontWeight: "bold" }}>{group.name}</Text>
            <Text style={{ color: Colors.foreground, fontSize: 15 }}>{group.description}</Text>

            {groupStats && (
                <Animated.View entering={FadeIn} style={{ gap: 15 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}>
                            {moment(group.createdAt).format("MMM Do YYYY")}
                        </Text>

                        <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}>
                            {groupStats?.masteredCards} Mastered
                        </Text>
                    </View>

                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}>
                            {groupStats?.totalCards} Cards
                        </Text>
                        <Text style={{ color: successRate(groupStats?.averageSuccessRate || 0), fontSize: 12 }}>
                            {groupStats?.averageSuccessRate.toFixed(2)}% Success Rate
                        </Text>
                    </View>
                </Animated.View>
            )}
        </Card>
    )
}
export default FlashCardGroup
