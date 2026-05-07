import { Header } from "@/components"
import { AntDesign } from "@expo/vector-icons"
import { useMemo } from "react"
import Colors from "@/constants/Colors"
import DatePicker from "@/components/DatePicker"
import dayjs from "dayjs"

interface TimelineCreateHeaderProps {
    selectedDate: string
    handleChangeDate: (date: Date) => void
    submitDisabled?: boolean
    onSubmit?: () => void
}

export default function TimelineCreateHeader(props: TimelineCreateHeaderProps) {
    const buttons = useMemo(
        () => [
            {
                position: "right",
                standalone: true,
                icon: <AntDesign name="check" size={20} color="#fff" />,
                onPress: props.onSubmit,
                disabled: props.submitDisabled,
                tintColor: Colors.secondary + (props.submitDisabled ? "80" : ""),
            },
        ],
        [props.selectedDate, props.handleChangeDate, props.submitDisabled, props.onSubmit],
    )

    const date = props.selectedDate ? dayjs(props.selectedDate).toDate() : new Date()

    return (
        <Header
            shadow={false}
            backIcon={<AntDesign name="close" size={20} color="#fff" />}
            goBack
            isScreenModal
            initialHeight={80}
            buttons={buttons}
        >
            <DatePicker
                mode="single"
                dates={{ start: date, end: date }}
                setDates={(d) => props.handleChangeDate(d.start)}
            />
        </Header>
    )
}
