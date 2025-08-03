import Button from "@/components/ui/Button/Button"
import Colors, { Sizing } from "@/constants/Colors"
import Layout from "@/constants/Layout"
import { useNavigation } from "@react-navigation/native"
import moment from "moment"
import { StyleSheet, View } from "react-native"
import Animated, { FadeIn } from "react-native-reanimated"
import SVGImage from "./SVGImage"

const styles = StyleSheet.create({
    container: {
        paddingVertical: 7.5,
        alignItems: "center",
        flexDirection: "row",
        flex: 1,
        justifyContent: "center",
    },
    heading: {
        color: Colors.foreground,
        fontSize: Sizing.subHead + 2,
        fontWeight: "bold",
    },
    content: {
        color: Colors.foreground,
        fontSize: 17,
        flex: 1,
        flexWrap: "wrap",
        marginTop: 2.5,
    },
})

export default function NotFound({ selectedDate }: { selectedDate: string }) {
    const navigation = useNavigation<any>()

    const onPress = () => {
        navigation.navigate("TimelineScreens", {
            selectedDate: selectedDate || moment().format("YYYY-MM-DD"),
        })
    }

    return (
        <View style={{ flexDirection: "column", flex: 1, width: "100%" }}>
            <View style={styles.container}>
                <Animated.View entering={FadeIn.delay(50)} style={{ marginRight: 15 }}>
                    <SVGImage width={Layout.screen.width / 5} height={100} />
                </Animated.View>
                <View style={{ flex: 1, marginTop: 10 }}>
                    <Animated.Text entering={FadeIn.delay(75)} style={styles.heading}>
                        No events found
                    </Animated.Text>
                    <Animated.Text
                        entering={FadeIn.delay(100)}
                        lineBreakMode="clip"
                        textBreakStrategy="highQuality"
                        style={styles.content}
                    >
                        Create events to keep track of your daily activities
                    </Animated.Text>
                </View>
            </View>

            <Animated.View entering={FadeIn.delay(150)} style={{ marginTop: 10 }}>
                <Button onPress={onPress} fontStyle={{ fontSize: 16 }}>
                    Create event
                </Button>
            </Animated.View>
        </View>
    )
}
