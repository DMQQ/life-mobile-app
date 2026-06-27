import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { View } from "react-native"
import PagerView from "react-native-pager-view"
import moment from "moment"
import Feedback from "react-native-haptic-feedback"
import TimelineDayPage from "./TimelineDayPage"
import { OccurrenceSearchInput } from "../hooks/query/useGetOccurrencesQuery"

const EPOCH = moment().startOf("day")
const WINDOW_SIZE = 7
const WINDOW_CENTER = Math.floor(WINDOW_SIZE / 2)

function dayForPage(pageIndex: number) {
    return EPOCH.clone().add(pageIndex, "days").format("YYYY-MM-DD")
}

function pageForDay(date: string) {
    return moment(date).startOf("day").diff(EPOCH, "days")
}

interface DayPageProps {
    date: string
    contentPaddingTop: number
    onScroll?: (...args: any[]) => void
    search?: OccurrenceSearchInput
}

const DayPage = memo(({ date, contentPaddingTop, onScroll, search }: DayPageProps) => (
    <TimelineDayPage date={date} contentPaddingTop={contentPaddingTop} onScroll={onScroll} search={search} />
))

interface DayViewProps {
    selectedDate: string
    setSelected: (date: string) => void
    contentPaddingTop: number
    onScroll?: (...args: any[]) => void
    search?: OccurrenceSearchInput
}

export default function DayView({ selectedDate, setSelected, contentPaddingTop, onScroll, search }: DayViewProps) {
    const pagerRef = useRef<PagerView>(null)
    const targetGlobalPage = pageForDay(selectedDate)
    const lastGlobalPageRef = useRef(targetGlobalPage)

    const [basePage, setBasePage] = useState(targetGlobalPage - WINDOW_CENTER)
    const [initialLocalPage, setInitialLocalPage] = useState(WINDOW_CENTER)
    const [pagerKey, setPagerKey] = useState(0)

    const pages = useMemo(() => Array.from({ length: WINDOW_SIZE }, (_, i) => basePage + i), [basePage])

    useEffect(() => {
        const localPos = targetGlobalPage - basePage
        if (localPos >= 0 && localPos < WINDOW_SIZE) {
            lastGlobalPageRef.current = targetGlobalPage
            pagerRef.current?.setPageWithoutAnimation(localPos)
        } else {
            lastGlobalPageRef.current = targetGlobalPage
            setBasePage(targetGlobalPage - WINDOW_CENTER)
            setInitialLocalPage(WINDOW_CENTER)
            setPagerKey((k) => k + 1)
        }
    }, [targetGlobalPage])

    const handlePageSelected = useCallback(
        (e: any) => {
            const pos = e.nativeEvent.position
            const globalPage = basePage + pos
            if (globalPage === lastGlobalPageRef.current) return
            lastGlobalPageRef.current = globalPage

            Feedback.trigger("impactLight")
            const newDate = dayForPage(globalPage)

            if (pos <= 1) {
                setBasePage((prev) => prev - WINDOW_CENTER)
                setInitialLocalPage(pos + WINDOW_CENTER)
                setPagerKey((k) => k + 1)
            } else if (pos >= WINDOW_SIZE - 2) {
                setBasePage((prev) => prev + WINDOW_CENTER)
                setInitialLocalPage(pos - WINDOW_CENTER)
                setPagerKey((k) => k + 1)
            }

            setSelected(newDate)
        },
        [basePage, setSelected],
    )

    return (
        <PagerView
            key={pagerKey}
            ref={pagerRef}
            style={{ flex: 1 }}
            initialPage={initialLocalPage}
            offscreenPageLimit={2}
            onPageSelected={handlePageSelected}
        >
            {pages.map((globalPage) => (
                <View key={`d${globalPage}`} style={{ flex: 1 }}>
                    <DayPage
                                date={dayForPage(globalPage)}
                                contentPaddingTop={contentPaddingTop}
                                onScroll={onScroll}
                                search={search}
                            />
                </View>
            ))}
        </PagerView>
    )
}
