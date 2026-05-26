import AsyncStorage from "@react-native-async-storage/async-storage"
import { useCallback, useEffect, useState } from "react"
import { WIDGETS } from "../widgets/registry"

const STORAGE_KEY = "home_widgets_config_v2"

const ALL_KEYS = WIDGETS.map((w) => w.key)

interface WidgetsConfig {
    enabled: Record<string, boolean>
    order: string[]
}

function buildDefault(): WidgetsConfig {
    return {
        enabled: Object.fromEntries(ALL_KEYS.map((k) => [k, true])),
        order: ALL_KEYS,
    }
}

let _config: WidgetsConfig = buildDefault()
let _loaded = false
let _loading: Promise<void> | null = null
const _listeners = new Set<() => void>()

function _notify(next: WidgetsConfig) {
    _config = next
    _listeners.forEach((fn) => fn())
}

function _persist(next: WidgetsConfig) {
    _notify(next)
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}

function _load() {
    if (_loaded || _loading) return _loading ?? Promise.resolve()
    _loading = AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
        if (raw) {
            try {
                const stored: Partial<WidgetsConfig> = JSON.parse(raw)
                const storedOrder = (stored.order ?? []).filter((k) => ALL_KEYS.includes(k))
                const newKeys = ALL_KEYS.filter((k) => !storedOrder.includes(k))
                _config = {
                    enabled: { ...buildDefault().enabled, ...(stored.enabled ?? {}) },
                    order: [...storedOrder, ...newKeys],
                }
            } catch {}
        }
        _loaded = true
        _listeners.forEach((fn) => fn())
    })
    return _loading
}

export function useHomeWidgets() {
    const [config, setConfig] = useState<WidgetsConfig>(() => _config)

    useEffect(() => {
        const refresh = () => setConfig({ ..._config })
        _listeners.add(refresh)
        _load()
        if (_loaded) setConfig({ ..._config })
        return () => {
            _listeners.delete(refresh)
        }
    }, [])

    const toggleWidget = useCallback((key: string, value: boolean) => {
        _persist({ ..._config, enabled: { ..._config.enabled, [key]: value } })
    }, [])

    const reorder = useCallback((newOrder: string[]) => {
        _persist({ ..._config, order: newOrder })
    }, [])

    return { enabled: config.enabled, order: config.order, toggleWidget, reorder, loaded: _loaded }
}
