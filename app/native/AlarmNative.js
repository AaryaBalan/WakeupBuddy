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

export async function scheduleAlarm(date, requestCode = 1001) {
    if (Platform.OS !== 'android') {
        console.warn('Alarm scheduling is only supported on Android');
        throw new Error('Android only');
    }
    if (!AlarmModule) {
        console.error('AlarmModule not found. Make sure you built the native app.');
        throw new Error('AlarmModule not available');
    }

    // Check permission first
    const canSchedule = await canScheduleExactAlarms();
    if (!canSchedule) {
        throw new Error('PERMISSION_REQUIRED');
    }

    try {
        console.log(`Scheduling alarm for ${date.toLocaleString()} (${date.getTime()}ms)`);
        await AlarmModule.scheduleExactAlarm(date.getTime(), requestCode);
        return true;
    } catch (error) {
        console.error('Error scheduling alarm:', error);
        if (error.message && error.message.includes('PERMISSION_REQUIRED')) {
            throw new Error('PERMISSION_REQUIRED');
        }
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
