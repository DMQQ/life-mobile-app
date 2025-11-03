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
        justifyContent: "center",
        flexDirection: "row",
        alignItems: "center",
        padding: 15,
    },

    eventTitle: {
        color: Colors.foreground,
        marginRight: 2.5,
    },
})

export default function TimelineCreateHeader(props: {
    selectedDate: string
    handleChangeDate: (...rest: any) => void
}) {
    return (
        <View style={[styles.header]}>
            {props.selectedDate.split(";").length === 1 && (
                <DatePicker
                    mode="single"
                    setDates={({ start }) => props.handleChangeDate(start)}
                    dates={{ start: dayjs(props.selectedDate).toDate(), end: dayjs(props.selectedDate).toDate() }}
                />
            )}
        </View>
    )
}
