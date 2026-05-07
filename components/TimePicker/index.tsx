import { useState } from "react"
import { Pressable } from "react-native"
import DateTimePicker from "react-native-modal-datetime-picker"
import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import moment from "moment"

interface TimePickerProps {
    value: string
    onChange: (time: string) => void
    label?: string
}

export default function TimePicker({ value, onChange, label }: TimePickerProps) {
    const [show, setShow] = useState(false)

    return (
        <>
            <Pressable
                onPress={() => setShow(true)}
                style={{
                    paddingHorizontal: 15,
                    paddingVertical: 8,
                    borderRadius: 100,
                    backgroundColor: Colors.primary_light,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                }}
            >
                {label && <Text style={{ color: Colors.text_dark, fontSize: 13 }}>{label}</Text>}
                <Text style={{ color: Colors.foreground, fontSize: 17, fontWeight: "600" }}>{value}</Text>
            </Pressable>
            <DateTimePicker
                date={moment(value, "HH:mm").toDate()}
                mode="time"
                isDarkModeEnabled
                is24Hour
                isVisible={show}
                onConfirm={(d) => {
                    onChange(moment(d).format("HH:mm"))
                    setShow(false)
                }}
                onCancel={() => setShow(false)}
            />
        </>
    )
}
