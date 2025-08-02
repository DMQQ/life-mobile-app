import Colors from "@/constants/Colors"
import moment from "moment"
import { ReactElement, useEffect, useState } from "react"
import { View } from "react-native"
import { Calendar } from "react-native-calendars"
import ChipButton from "../ui/Button/ChipButton"
import FloatingMenu from "../ui/FloatingMenu"

const theme = {
    backgroundColor: Colors.primary_lighter,
    calendarBackground: Colors.primary_lighter,
    dayTextColor: Colors.foreground,
    textDisabledColor: "#5e5e5e",
    monthTextColor: Colors.secondary,
    textMonthFontSize: 16,
    textMonthFontWeight: "600",
    selectedDayBackgroundColor: Colors.ternary,
    arrowColor: Colors.secondary,
    textDayFontSize: 14,
    textDayHeaderFontSize: 12,
}

interface DatePickerProps {
    dates: {
        start: Date
        end: Date
    }
    setDates: (dates: { start: Date; end: Date }) => void
    mode?: "single" | "period"
    placeholder?: string

    buttonComponent?: (prop: { start: Date; end: Date }) => ReactElement
}

export default function DatePicker({
    buttonComponent,
    dates,
    setDates,
    mode = "period",
    placeholder,
}: DatePickerProps) {
    const [selectedRange, setSelectedRange] = useState<{ [key: string]: any }>({})
    const [selecting, setSelecting] = useState<"start" | "end" | null>(null)
    const [tempStartDate, setTempStartDate] = useState<Date | null>(null)

    useEffect(() => {
        if (mode === "single") {
            updateSelectedRange(dates.start, dates.start)
        } else {
            updateSelectedRange(dates.start, dates.end)
        }
        // Reset selection state when dates change externally
        setSelecting(null)
        setTempStartDate(null)
    }, [dates, mode])

    const handleDayPress = (day: any) => {
        const selectedDate = moment(day.dateString).toDate()

        if (mode === "single") {
            setDates({
                start: selectedDate,
                end: selectedDate,
            })
            return
        }

        if (!selecting || selecting === "start") {
            // First date selection - store temporarily
            setTempStartDate(selectedDate)
            updateSelectedRange(selectedDate, selectedDate)
            setSelecting("end")
        } else {
            // Second date selection - now call setDates with both dates
            const startDate = moment(tempStartDate!)
            const endDate = moment(selectedDate)

            let finalDates
            if (endDate.isBefore(startDate)) {
                finalDates = {
                    start: selectedDate,
                    end: tempStartDate!,
                }
            } else {
                finalDates = {
                    start: tempStartDate!,
                    end: selectedDate,
                }
            }

            setDates(finalDates)
            setSelecting(null)
            setTempStartDate(null)
        }
    }

    const updateSelectedRange = (start: Date, end: Date) => {
        const startMoment = moment(start)
        const endMoment = moment(end)
        const range: { [key: string]: any } = {}

        if (startMoment.isSame(endMoment, "day")) {
            range[startMoment.format("YYYY-MM-DD")] = {
                selected: true,
                startingDay: true,
                endingDay: true,
                color: Colors.ternary,
            }
        } else {
            let current = startMoment.clone()
            while (current.isSameOrBefore(endMoment)) {
                const dateString = current.format("YYYY-MM-DD")
                range[dateString] = {
                    selected: true,
                    startingDay: current.isSame(startMoment),
                    endingDay: current.isSame(endMoment),
                    color: Colors.ternary,
                }
                current.add(1, "day")
            }
        }

        setSelectedRange(range)
    }

    const getDisplayText = () => {
        if (placeholder) return placeholder

        if (mode === "single") {
            return moment(dates.start).format("DD.MM.YYYY")
        }

        // If we're in the middle of selecting a period, show temp start date
        if (selecting === "end" && tempStartDate) {
            return `${moment(tempStartDate).format("DD.MM")} - ...`
        }

        if (moment(dates.start).isSame(dates.end, "day")) {
            return moment(dates.start).format("DD.MM.YYYY")
        }

        return `${moment(dates.start).format("DD.MM")} - ${moment(dates.end).format("DD.MM")}`
    }

    return (
        <FloatingMenu
            menuWidth={320}
            menuHeight={380}
            menuContent={
                <View
                    style={{
                        backgroundColor: Colors.primary_lighter,
                        padding: 8,
                        borderRadius: 20,
                        overflow: "hidden",
                    }}
                >
                    <Calendar
                        onDayPress={handleDayPress}
                        markedDates={selectedRange}
                        markingType={mode === "single" ? "simple" : "period"}
                        theme={theme}
                        style={{
                            borderRadius: 12,
                        }}
                    />
                </View>
            }
        >
            {typeof buttonComponent === "function" ? (
                buttonComponent({ start: dates.start, end: dates.end })
            ) : (
                <ChipButton icon="clockcircleo">{getDisplayText()}</ChipButton>
            )}
        </FloatingMenu>
    )
}
