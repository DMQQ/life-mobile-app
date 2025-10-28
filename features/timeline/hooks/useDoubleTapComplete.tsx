import { useRef } from "react"
import Haptic from "react-native-haptic-feedback"

interface UseDoubleTapCompleteProps {
    onComplete: (completed: boolean) => Promise<any>
    currentlyCompleted: boolean
}

export const useDoubleTapComplete = ({ onComplete, currentlyCompleted }: UseDoubleTapCompleteProps) => {
    const tapCountRef = useRef(0)
    const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const isProcessingRef = useRef(false)

    const handleToggleComplete = () => {
        if (isProcessingRef.current) return

        tapCountRef.current += 1

        if (tapTimeoutRef.current) {
            clearTimeout(tapTimeoutRef.current)
        }

        if (tapCountRef.current === 1) {
            tapTimeoutRef.current = setTimeout(() => {
                tapCountRef.current = 0
            }, 300)
        } else if (tapCountRef.current === 2) {
            if (tapTimeoutRef.current) {
                clearTimeout(tapTimeoutRef.current)
            }
            tapCountRef.current = 0
            isProcessingRef.current = true

            Haptic.trigger("impactLight")

            onComplete(!currentlyCompleted)
                .then((result) => {
                    isProcessingRef.current = false
                })
                .catch((error) => {
                    isProcessingRef.current = false
                })
        }
    }

    return { handleToggleComplete }
}
