import Colors from "@/constants/Colors"
import { memo } from "react"
import { StyleSheet } from "react-native"
import { Calendar, CalendarProps } from "react-native-calendars"

function ThemedCalendar(props: CalendarProps) {
    return <Calendar {...props} theme={styles.calendar} style={[styles.calendarContainer, props.style]} />
}

export default memo(ThemedCalendar)

const styles = StyleSheet.create({
    calendar: {
        backgroundColor: Colors.primary_light,
        calendarBackground: Colors.primary_light,
        dayTextColor: Colors.foreground,
        textDisabledColor: "#5e5e5e",
        monthTextColor: Colors.secondary,
        textMonthFontSize: 20,
        textMonthFontWeight: "bold",
        selectedDayBackgroundColor: Colors.secondary,
        arrowColor: Colors.secondary,
    },

    calendarContainer: { borderRadius: 15, paddingBottom: 5 },
})
