import * as Location from "expo-location"
import * as Notifications from "expo-notifications"
import * as TaskManager from "expo-task-manager"
import { getAllGeofences, removeGeofence, saveGeofence, type GeofenceRecord } from "./geofenceStorage"

export const GEOFENCE_TASK = "TIMELINE_GEOFENCE_TASK"

type GeofenceTaskData = {
    eventType: Location.GeofencingEventType
    region: Location.LocationRegion
}

TaskManager.defineTask(GEOFENCE_TASK, async ({ data, error }: TaskManager.TaskManagerTaskBody<GeofenceTaskData>) => {
    if (error) return
    const { eventType, region } = data
    if (eventType !== Location.GeofencingEventType.Enter) return

    const all = await getAllGeofences()
    const match = all.find((r) => r.occurrenceId === region.identifier)
    if (!match) return

    await Notifications.scheduleNotificationAsync({
        content: {
            title: match.title,
            body: `You're near the location for this event.`,
            sound: true,
            data: {
                type: "timeline",
                eventId: match.occurrenceId,
            },
        },
        trigger: null,
    })
})

async function buildRegions(excluding?: string): Promise<Location.LocationRegion[]> {
    const all = await getAllGeofences()
    return all
        .filter((r) => r.occurrenceId !== excluding)
        .map((r) => ({
            identifier: r.occurrenceId,
            latitude: r.latitude,
            longitude: r.longitude,
            radius: r.radius,
        }))
}

export async function registerGeofence(record: GeofenceRecord): Promise<void> {
    const { status } = await Location.requestBackgroundPermissionsAsync()
    if (status !== "granted") return

    await saveGeofence(record)

    const existing = await buildRegions(record.occurrenceId)
    existing.push({
        identifier: record.occurrenceId,
        latitude: record.latitude,
        longitude: record.longitude,
        radius: record.radius,
    })

    await Location.startGeofencingAsync(GEOFENCE_TASK, existing)
}

export async function unregisterGeofence(occurrenceId: string): Promise<void> {
    await removeGeofence(occurrenceId)

    const remaining = await buildRegions()
    if (remaining.length === 0) {
        const isRunning = await Location.hasStartedGeofencingAsync(GEOFENCE_TASK)
        if (isRunning) await Location.stopGeofencingAsync(GEOFENCE_TASK)
    } else {
        await Location.startGeofencingAsync(GEOFENCE_TASK, remaining)
    }
}
