import type { TimelineFilterState } from "./types"

let _apply: ((f: TimelineFilterState) => void) | null = null

export function registerFilterApply(fn: (f: TimelineFilterState) => void) {
    _apply = fn
}

export function unregisterFilterApply() {
    _apply = null
}

export function applyFilters(f: TimelineFilterState) {
    _apply?.(f)
}
