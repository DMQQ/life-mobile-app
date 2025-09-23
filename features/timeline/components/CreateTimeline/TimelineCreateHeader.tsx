import DatePicker from "@/components/DatePicker"
import GlassView from "@/components/ui/GlassView"
import Colors from "@/constants/Colors"
import { AntDesign, Feather } from "@expo/vector-icons"
import { NativeStackHeaderProps } from "@react-navigation/native-stack"
import dayjs from "dayjs"
import { StyleSheet, View } from "react-native"
import Ripple from "react-native-material-ripple"

const styles = StyleSheet.create({
    header: {
        justifyContent: "space-between",
        flexDirection: "row",
        alignItems: "center",
        padding: 15,
    },

    eventTitle: {
        color: Colors.foreground,
        marginRight: 2.5,
    },
})

export default function TimelineCreateHeader(
    props: NativeStackHeaderProps & {
        selectedDate: string
        onToggleOptions: () => void
        handleChangeDate: (...rest: any) => void
    },
) {
    return (
        <View style={[styles.header]}>
            <GlassView style={{ padding: 10, borderRadius: 100 }}>
                <Ripple onPress={props.navigation.goBack}>
                    <AntDesign name="close" color={Colors.foreground} size={20} />
                </Ripple>
            </GlassView>

            {props.selectedDate.split(";").length === 1 && (
                <DatePicker
                    mode="single"
                    setDates={({ start }) => props.handleChangeDate(start)}
                    dates={{ start: dayjs(props.selectedDate).toDate(), end: dayjs(props.selectedDate).toDate() }}
                />
            )}
            <GlassView style={{ padding: 10, borderRadius: 100 }} tintColor={Colors.error}>
                <Ripple onPress={props.onToggleOptions}>
                    <Feather name="trash" color={Colors.foreground} size={20} />
                </Ripple>
            </GlassView>
        </View>
    )
}
