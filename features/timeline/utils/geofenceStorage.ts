import AsyncStorage from "@react-native-async-storage/async-storage"

const KEY = "timeline_geofences_v1"

export type GeofenceRecord = {
    occurrenceId: string
    title: string
    latitude: number
    longitude: number
    radius: number
    address: string
}

async function loadAll(): Promise<GeofenceRecord[]> {
    const raw = await AsyncStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
}

async function persistAll(records: GeofenceRecord[]): Promise<void> {
    await AsyncStorage.setItem(KEY, JSON.stringify(records))
}

export async function saveGeofence(record: GeofenceRecord): Promise<void> {
    const all = await loadAll()
    const filtered = all.filter((r) => r.occurrenceId !== record.occurrenceId)
    await persistAll([...filtered, record])
}

export async function removeGeofence(occurrenceId: string): Promise<void> {
    const all = await loadAll()
    await persistAll(all.filter((r) => r.occurrenceId !== occurrenceId))
}

export async function getGeofence(occurrenceId: string): Promise<GeofenceRecord | null> {
    const all = await loadAll()
    return all.find((r) => r.occurrenceId === occurrenceId) ?? null
}

export async function getAllGeofences(): Promise<GeofenceRecord[]> {
    return loadAll()
}
