import Colors from "@/constants/Colors"
import moment from "moment"
import { ReactElement, useEffect, useRef, useState } from "react"
import { Calendar } from "react-native-calendars"
import ChipButton from "../ui/Button/ChipButton"
import FloatingMenu, { FloatingMenuRef } from "../ui/FloatingMenu"
import Color from "color"
import GlassView from "../ui/GlassView"

const theme = {
    backgroundColor: "transparent",
    calendarBackground: "transparent",
    dayTextColor: "#FFFFFF",
    textDisabledColor: "#666666",
    monthTextColor: "#FFFFFF",
    textMonthFontSize: 16,
    textMonthFontWeight: "600" as const,
    selectedDayBackgroundColor: Colors.secondary,
    selectedDayTextColor: "#FFFFFF",
    todayTextColor: Colors.secondary,
    arrowColor: "#FFFFFF",
    textDayFontSize: 14,
    textDayHeaderFontSize: 12,
    textDayHeaderFontWeight: "500" as const,
    textSectionTitleColor: "#999999",
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

    const pickerRef = useRef<FloatingMenuRef>(null)

    useEffect(() => {
        if (mode === "single") {
            updateSelectedRange(dates.start, dates.start)
        } else {
            updateSelectedRange(dates.start, dates.end)
        }

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
            pickerRef.current?.close()
            return
        }

        if (!selecting || selecting === "start") {
            setTempStartDate(selectedDate)
            updateSelectedRange(selectedDate, selectedDate)
            setSelecting("end")
        } else {
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
            pickerRef.current?.close()
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
                color: Colors.secondary,
            }
        } else {
            let current = startMoment.clone()
            while (current.isSameOrBefore(endMoment)) {
                const dateString = current.format("YYYY-MM-DD")
                range[dateString] = {
                    selected: true,
                    startingDay: current.isSame(startMoment),
                    endingDay: current.isSame(endMoment),
                    color: Colors.secondary,
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
            ref={pickerRef}
            menuWidth={320}
            menuHeight={380}
            menuContent={
                <GlassView
                    style={{
                        padding: 5,
                        borderRadius: 20,
                        overflow: "hidden",
                        backgroundColor: Colors.primary_lighter,
                    }}
                >
                    <Calendar
                        onDayPress={handleDayPress}
                        markedDates={selectedRange}
                        markingType={mode === "single" ? "simple" : "period"}
                        theme={theme}
                        style={{
                            borderRadius: 15,
                        }}
                    />
                </GlassView>
            }
        >
            {typeof buttonComponent === "function" ? (
                buttonComponent({ start: dates.start, end: dates.end })
            ) : (
                <ChipButton icon="clock-circle">{getDisplayText()}</ChipButton>
            )}
        </FloatingMenu>
    )
}
