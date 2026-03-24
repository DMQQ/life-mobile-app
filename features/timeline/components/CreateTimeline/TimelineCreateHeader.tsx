import { Header, IconButton } from "@/components"
import DatePicker from "@/components/DatePicker"
import dayjs from "dayjs"

export default function TimelineCreateHeader(props: {
    selectedDate: string
    handleChangeDate: (...rest: any) => void
}) {
    return (
        <Header
            shadow={false}
            goBack
            isScreenModal
            initialHeight={80}
            buttons={[
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
                        />
                    ),
                },
            ]}
        />
    )
}
