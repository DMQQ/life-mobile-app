import { requireNativeModule } from 'expo-modules-core';

const ExpoAppleWatch = requireNativeModule('ExpoAppleWatch');

/**
 * Send authentication token to Apple Watch via WatchConnectivity
 * @param token - The authentication token to send
 * @returns Promise that resolves when token is sent
 */
export async function sendAuthToken(token: string): Promise<boolean> {
  return await ExpoAppleWatch.sendAuthToken(token);
}

/**
 * Check if Apple Watch is available (paired and app installed)
 * @returns boolean indicating if watch is available
 */
export function isWatchAvailable(): boolean {
  return ExpoAppleWatch.isWatchAvailable();
}

/**
 * Check if Apple Watch is currently reachable
 * @returns boolean indicating if watch is reachable
 */
export function isWatchReachable(): boolean {
  return ExpoAppleWatch.isWatchReachable();
}

/**
 * Send any data to Apple Watch via WatchConnectivity
 * @param data - The data object to send
 * @returns Promise with result containing success status and method used
 */
export async function sendDataToWatch(data: Record<string, any>): Promise<{
  success: boolean;
  method: 'message' | 'context';
  reply?: Record<string, any>;
}> {
  return await ExpoAppleWatch.sendDataToWatch(data);
}
