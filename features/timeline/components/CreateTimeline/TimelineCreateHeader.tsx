import { Header, IconButton } from "@/components"
import DatePicker from "@/components/DatePicker"
import Text from "@/components/ui/Text/Text"
import { AntDesign } from "@expo/vector-icons"
import dayjs from "dayjs"
import { useMemo } from "react"

export default function TimelineCreateHeader(props: {
    selectedDate: string
    handleChangeDate: (...rest: any) => void
}) {
    const buttons = useMemo(
        () => [
            {
                icon: "",
                onPress() {},
                children: props.selectedDate.split(";").length === 1 && (
                    <DatePicker
                        mode="single"
                        setDates={({ start }) => props.handleChangeDate(start)}
                        dates={{
                            start: dayjs(props.selectedDate).toDate(),
                            end: dayjs(props.selectedDate).toDate(),
                        }}
                        buttonComponent={({ start }) => (
                            <Text style={{ color: "#fff", paddingHorizontal: 5 }}>
                                {dayjs(start).format("MMMM D, YYYY")}
                            </Text>
                        )}
                    />
                ),
            },
        ],
        [props.selectedDate, props.handleChangeDate],
    )

    return (
        <Header
            shadow={false}
            backIcon={<AntDesign name="close" size={20} color="#fff" />}
            goBack
            isScreenModal
            initialHeight={80}
            buttons={buttons}
        />
    )
}
