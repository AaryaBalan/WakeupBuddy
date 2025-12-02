import { Alert, Linking, NativeEventEmitter, NativeModules, Platform } from 'react-native';
const { AlarmModule } = NativeModules;

// Event emitter for call state changes
let callStateEmitter = null;
if (AlarmModule) {
    callStateEmitter = new NativeEventEmitter(AlarmModule);
}

/**
 * Subscribe to call state changes
 * @param {function} callback - Callback with {status: 'started'|'ended', duration?: number}
 * @returns {function} Unsubscribe function
 */
export function subscribeToCallState(callback) {
    if (!callStateEmitter) {
        console.warn('CallStateEmitter not available');
        return () => { };
    }

    const subscription = callStateEmitter.addListener('CallStateChanged', callback);
    return () => subscription.remove();
}

export async function canScheduleExactAlarms() {
    if (Platform.OS !== 'android') return true;
    if (!AlarmModule) return false;

    try {
        return await AlarmModule.canScheduleExactAlarms();
    } catch (error) {
        console.error('Error checking alarm permission:', error);
        return false;
    }
}

export async function requestExactAlarmPermission() {
    if (Platform.OS !== 'android') return;

    const canSchedule = await canScheduleExactAlarms();
    if (canSchedule) {
        Alert.alert('Permission Granted', 'You can now set exact alarms!');
        return;
    }

    Alert.alert(
        'Alarm Permission Required',
        'This app needs permission to set exact alarms. Tap "Open Settings" to grant this permission.',
        [
            {
                text: 'Cancel',
                style: 'cancel',
            },
            {
                text: 'Open Settings',
                onPress: async () => {
                    try {
                        if (AlarmModule && AlarmModule.openAlarmSettings) {
                            await AlarmModule.openAlarmSettings();
                        } else {
                            await Linking.openSettings();
                        }
                    } catch (error) {
                        console.error('Failed to open settings:', error);
                    }
                },
            },
        ]
    );
}

export async function isBatteryOptimizationDisabled() {
    if (Platform.OS !== 'android') return true;
    if (!AlarmModule) return false;

    try {
        return await AlarmModule.isBatteryOptimizationDisabled();
    } catch (error) {
        console.error('Error checking battery optimization:', error);
        return false;
    }
}

export async function requestBatteryOptimization() {
    if (Platform.OS !== 'android') return;

    const isDisabled = await isBatteryOptimizationDisabled();
    if (isDisabled) {
        Alert.alert('Already Optimized', 'Battery optimization is already disabled for this app.');
        return;
    }

    Alert.alert(
        'Battery Optimization',
        'To ensure alarms work when the app is closed, please disable battery optimization for WakeBuddy.',
        [
            {
                text: 'Cancel',
                style: 'cancel',
            },
            {
                text: 'Open Settings',
                onPress: async () => {
                    try {
                        if (AlarmModule && AlarmModule.requestBatteryOptimizationExemption) {
                            await AlarmModule.requestBatteryOptimizationExemption();
                        } else {
                            await Linking.openSettings();
                        }
                    } catch (error) {
                        console.error('Failed to open battery settings:', error);
                    }
                },
            },
        ]
    );
}

export async function canDrawOverlays() {
    if (Platform.OS !== 'android') return true;
    if (!AlarmModule) return false;

    try {
        return await AlarmModule.canDrawOverlays();
    } catch (error) {
        console.error('Error checking overlay permission:', error);
        return false;
    }
}

export async function requestDrawOverlays() {
    if (Platform.OS !== 'android') return;

    const canDraw = await canDrawOverlays();
    if (canDraw) {
        Alert.alert('Already Allowed', 'Display over other apps is already enabled.');
        return;
    }

    Alert.alert(
        'Display Over Other Apps',
        'This permission allows the alarm to show even when your phone is locked.',
        [
            {
                text: 'Cancel',
                style: 'cancel',
            },
            {
                text: 'Open Settings',
                onPress: async () => {
                    try {
                        if (AlarmModule && AlarmModule.requestDrawOverlays) {
                            await AlarmModule.requestDrawOverlays();
                        } else {
                            await Linking.openSettings();
                        }
                    } catch (error) {
                        console.error('Failed to open overlay settings:', error);
                    }
                },
            },
        ]
    );
}

/**
 * Check if CALL_PHONE permission is granted
 */
export async function hasCallPhonePermission() {
    if (Platform.OS !== 'android') return true;

    try {
        const { PermissionsAndroid } = require('react-native');
        const granted = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.CALL_PHONE
        );
        return granted;
    } catch (error) {
        console.error('Error checking CALL_PHONE permission:', error);
        return false;
    }
}

/**
 * Request CALL_PHONE permission
 */
export async function requestCallPhonePermission() {
    if (Platform.OS !== 'android') return true;

    try {
        const { PermissionsAndroid } = require('react-native');
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CALL_PHONE,
            {
                title: "Phone Call Permission",
                message: "WakeBuddy needs permission to call your buddy when you dismiss an alarm.",
                buttonNeutral: "Ask Me Later",
                buttonNegative: "Cancel",
                buttonPositive: "OK"
            }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (error) {
        console.error('Error requesting CALL_PHONE permission:', error);
        return false;
    }
}

/**
 * Check if READ_PHONE_STATE permission is granted (needed for call duration tracking)
 */
export async function hasReadPhoneStatePermission() {
    if (Platform.OS !== 'android') return true;

    try {
        const { PermissionsAndroid } = require('react-native');
        const granted = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE
        );
        return granted;
    } catch (error) {
        console.error('Error checking READ_PHONE_STATE permission:', error);
        return false;
    }
}

/**
 * Request READ_PHONE_STATE permission (needed for call duration tracking)
 */
export async function requestReadPhoneStatePermission() {
    if (Platform.OS !== 'android') return true;

    try {
        const { PermissionsAndroid } = require('react-native');
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
            {
                title: "Phone State Permission",
                message: "WakeBuddy needs permission to track call duration with your buddy.",
                buttonNeutral: "Ask Me Later",
                buttonNegative: "Cancel",
                buttonPositive: "OK"
            }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (error) {
        console.error('Error requesting READ_PHONE_STATE permission:', error);
        return false;
    }
}

/**
 * Check if READ_CALL_LOG permission is granted
 */
export async function hasReadCallLogPermission() {
    if (Platform.OS !== 'android') return true;

    try {
        const { PermissionsAndroid } = require('react-native');
        const granted = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.READ_CALL_LOG
        );
        return granted;
    } catch (error) {
        console.error('Error checking READ_CALL_LOG permission:', error);
        return false;
    }
}

/**
 * Request READ_CALL_LOG permission (needed for getting call duration from call log)
 */
export async function requestReadCallLogPermission() {
    if (Platform.OS !== 'android') return true;

    try {
        const { PermissionsAndroid } = require('react-native');
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
            {
                title: "Call Log Permission",
                message: "WakeBuddy needs permission to read call duration from your call history.",
                buttonNeutral: "Ask Me Later",
                buttonNegative: "Cancel",
                buttonPositive: "OK"
            }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (error) {
        console.error('Error requesting READ_CALL_LOG permission:', error);
        return false;
    }
}

/**
 * Get the duration of the last call to a specific phone number from call log
 * @param {string} phoneNumber - The phone number to check
 * @returns {Promise<number>} Duration in seconds
 */
export async function getLastCallDuration(phoneNumber) {
    if (Platform.OS !== 'android' || !AlarmModule) return 0;

    try {
        console.log('Getting call duration for:', phoneNumber);
        const duration = await AlarmModule.getLastCallDuration(phoneNumber);
        console.log('Got duration from native:', duration);
        return duration || 0;
    } catch (error) {
        console.error('Error getting last call duration:', error);
        return 0;
    }
}

/**
 * Get the duration of the most recent outgoing call (regardless of number)
 * @returns {Promise<number>} Duration in seconds
 */
export async function getMostRecentCallDuration() {
    if (Platform.OS !== 'android' || !AlarmModule) return 0;

    try {
        const duration = await AlarmModule.getMostRecentCallDuration();
        console.log('Got most recent call duration:', duration);
        return duration || 0;
    } catch (error) {
        console.error('Error getting most recent call duration:', error);
        return 0;
    }
}

export async function checkAllPermissions() {
    const exactAlarms = await canScheduleExactAlarms();
    const batteryOpt = await isBatteryOptimizationDisabled();
    const overlays = await canDrawOverlays();
    const callPhone = await hasCallPhonePermission();
    const readPhoneState = await hasReadPhoneStatePermission();
    const readCallLog = await hasReadCallLogPermission();

    // Core permissions needed for basic alarm functionality (4 permissions)
    const coreGranted = exactAlarms && batteryOpt && overlays && callPhone;

    // All permissions including optional call duration tracking
    const allGranted = coreGranted && readPhoneState && readCallLog;

    return {
        canScheduleExactAlarms: exactAlarms,
        batteryOptimizationDisabled: batteryOpt,
        canDrawOverlays: overlays,
        hasCallPermission: callPhone,
        hasReadPhoneStatePermission: readPhoneState,
        hasReadCallLogPermission: readCallLog,
        coreGranted: coreGranted,  // Basic 4 permissions for alarm functionality
        allGranted: coreGranted    // For backward compatibility, use coreGranted
    };
}

export async function scheduleAlarm(date, buddyName = null, alarmId = null, requestCode = 1001) {
    if (Platform.OS !== 'android') {
        console.warn('Alarm scheduling is only supported on Android');
        throw new Error('Android only');
    }
    if (!AlarmModule) {
        console.error('AlarmModule not found. Make sure you built the native app.');
        throw new Error('AlarmModule not available');
    }

    // Check all three permissions
    const exactAlarms = await canScheduleExactAlarms();
    const batteryOpt = await isBatteryOptimizationDisabled();
    const overlays = await canDrawOverlays();

    if (!exactAlarms) {
        throw new Error('EXACT_ALARM_PERMISSION_REQUIRED');
    }

    if (!batteryOpt) {
        throw new Error('BATTERY_OPTIMIZATION_REQUIRED');
    }

    if (!overlays) {
        throw new Error('DISPLAY_OVERLAY_REQUIRED');
    }

    try {
        console.log(`Scheduling alarm for ${date.toLocaleString()} (${date.getTime()}ms) with buddy: ${buddyName}, alarmId: ${alarmId}`);
        await AlarmModule.scheduleExactAlarm(date.getTime(), buddyName, alarmId, requestCode);
        return true;
    } catch (error) {
        console.error('Error scheduling alarm:', error);
        throw error;
    }
}

export async function cancelAlarm(requestCode = 1001) {
    if (Platform.OS !== 'android') {
        throw new Error('Android only');
    }
    if (!AlarmModule) {
        throw new Error('AlarmModule not available');
    }

    try {
        console.log(`Cancelling alarm with request code ${requestCode}`);
        await AlarmModule.cancelAlarm(requestCode);
        return true;
    } catch (error) {
        console.error('Error cancelling alarm:', error);
        throw error;
    }
}

/**
 * Make a phone call directly without user prompts
 * @param {string} phoneNumber - Phone number to call
 * @returns {Promise<boolean>}
 */
export async function makePhoneCall(phoneNumber) {
    if (!AlarmModule) {
        throw new Error('AlarmModule not available');
    }

    try {
        console.log(`Making phone call to ${phoneNumber}`);
        await AlarmModule.makePhoneCall(phoneNumber);
        return true;
    } catch (error) {
        console.error('Error making phone call:', error);
        throw error;
    }
}

export async function savePendingCall(callId, phoneNumber) {
    if (!AlarmModule) {
        throw new Error('AlarmModule not available');
    }

    try {
        console.log(`Saving pending call: ${callId} to ${phoneNumber}`);
        await AlarmModule.savePendingCall(callId, phoneNumber);
        return true;
    } catch (error) {
        console.error('Error saving pending call:', error);
        throw error;
    }
}

export async function checkPendingCall() {
    if (!AlarmModule) {
        throw new Error('AlarmModule not available');
    }

    try {
        console.log('Checking for pending call');
        const result = await AlarmModule.checkPendingCall();
        return result;
    } catch (error) {
        console.error('Error checking pending call:', error);
        return null;
    }
}

export async function clearPendingCall() {
    if (!AlarmModule) {
        return;
    }

    try {
        console.log('Clearing pending call');
        await AlarmModule.clearPendingCall();
    } catch (error) {
        console.error('Error clearing pending call:', error);
    }
}

export default {
    canScheduleExactAlarms,
    requestExactAlarmPermission,
    isBatteryOptimizationDisabled,
    requestBatteryOptimization,
    canDrawOverlays,
    requestDrawOverlays,
    hasCallPhonePermission,
    requestCallPhonePermission,
    hasReadPhoneStatePermission,
    requestReadPhoneStatePermission,
    hasReadCallLogPermission,
    requestReadCallLogPermission,
    getLastCallDuration,
    getMostRecentCallDuration,
    savePendingCall,
    checkPendingCall,
    clearPendingCall,
    checkAllPermissions,
    scheduleAlarm,
    cancelAlarm,
    makePhoneCall,
    subscribeToCallState
};
