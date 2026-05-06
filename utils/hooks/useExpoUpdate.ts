import * as Updates from "expo-updates"
import { useCallback, useEffect, useState } from "react"

interface UpdateState {
    isChecking: boolean
    isDownloading: boolean
    isUpdateAvailable: boolean
    isUpdatePending: boolean
    error: string | null
}

interface UseExpoUpdatesReturn extends UpdateState {
    checkForUpdate: () => Promise<void>
    downloadAndRestart: () => Promise<void>
    restart: () => Promise<void>
}

export const useExpoUpdates = (autoCheck = false): UseExpoUpdatesReturn => {
    const [state, setState] = useState<UpdateState>({
        isChecking: false,
        isDownloading: false,
        isUpdateAvailable: false,
        isUpdatePending: false,
        error: null,
    })

    const isReady = Updates.isEnabled && !!Updates.channel

    const checkForUpdate = useCallback(async () => {
        if (!isReady) return

        setState((prev) => ({ ...prev, isChecking: true, error: null }))

        try {
            const update = await Updates.checkForUpdateAsync()
            setState((prev) => ({
                ...prev,
                isChecking: false,
                isUpdateAvailable: update.isAvailable,
            }))
        } catch (error) {
            setState((prev) => ({
                ...prev,
                isChecking: false,
                error: error instanceof Error ? error.message : "Check failed",
            }))
        }
    }, [isReady])

    const downloadAndRestart = useCallback(async () => {
        if (!isReady) return

        setState((prev) => ({ ...prev, isDownloading: true, error: null }))

        try {
            await Updates.fetchUpdateAsync()
            setState((prev) => ({ ...prev, isDownloading: false, isUpdatePending: true }))
            await Updates.reloadAsync()
        } catch (error) {
            setState((prev) => ({
                ...prev,
                isDownloading: false,
                error: error instanceof Error ? error.message : "Download failed",
            }))
        }
    }, [isReady])

    const restart = useCallback(async () => {
        try {
            await Updates.reloadAsync()
        } catch (error) {
            setState((prev) => ({
                ...prev,
                error: error instanceof Error ? error.message : "Restart failed",
            }))
        }
    }, [])

    useEffect(() => {
        if (autoCheck) {
            checkForUpdate()
        }
    }, [autoCheck, checkForUpdate])

    return {
        ...state,
        checkForUpdate,
        downloadAndRestart,
        restart,
    }
}
