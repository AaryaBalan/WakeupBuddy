import { Alert, Linking, NativeModules, Platform } from 'react-native';
const { AlarmModule } = NativeModules;

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

export async function checkAllPermissions() {
    const exactAlarms = await canScheduleExactAlarms();
    const batteryOpt = await isBatteryOptimizationDisabled();
    const overlays = await canDrawOverlays();

    return {
        canScheduleExactAlarms: exactAlarms,
        batteryOptimizationDisabled: batteryOpt,
        canDrawOverlays: overlays,
        allGranted: exactAlarms && batteryOpt && overlays
    };
}

export async function scheduleAlarm(date, buddyName = null, requestCode = 1001) {
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
        console.log(`Scheduling alarm for ${date.toLocaleString()} (${date.getTime()}ms) with buddy: ${buddyName}`);
        await AlarmModule.scheduleExactAlarm(date.getTime(), buddyName, requestCode);
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
