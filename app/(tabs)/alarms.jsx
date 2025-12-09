import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from "convex/react";
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, StatusBar, Switch, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from '../../components/AppText';
import { usePopup } from '../../contexts/PopupContext';
import { useUser } from '../../contexts/UserContext';
import { api } from "../../convex/_generated/api";
import styles from '../../styles/alarms.styles';

import { cancelAlarm, generateRequestCode, scheduleAlarm } from '../native/AlarmNative';

const NEON = '#C9E265';

export default function AlarmsScreen() {
    const router = useRouter();
    const { user } = useUser();
    const { showPopup } = usePopup();
    const userId = user?._id;
    const alarms = useQuery(api.alarms.getAlarmsByUser, userId ? { user_id: userId } : "skip");
    const toggleAlarmMutation = useMutation(api.alarms.toggleAlarm);
    const deleteAlarmMutation = useMutation(api.alarms.deleteAlarm);
    const [deletingId, setDeletingId] = useState(null); // Track which alarm is being deleted

    const toggleAlarm = async (alarm) => {
        const newStatus = !alarm.enabled;
        try {
            await toggleAlarmMutation({ id: alarm._id, enabled: newStatus });

            // Generate unique request code from alarm ID
            const requestCode = generateRequestCode(alarm._id.toString());

            if (newStatus) {
                // Enable: Schedule the alarm
                // Parse time logic similar to alarm-editor
                const [hoursStr, minutesStr] = alarm.time.split(':');
                let hours = parseInt(hoursStr);
                const minutes = parseInt(minutesStr);

                if (alarm.ampm === 'PM' && hours !== 12) hours += 12;
                if (alarm.ampm === 'AM' && hours === 12) hours = 0;

                const now = new Date();
                const alarmDate = new Date();
                alarmDate.setHours(hours);
                alarmDate.setMinutes(minutes);
                alarmDate.setSeconds(0);

                if (alarmDate <= now) {
                    alarmDate.setDate(alarmDate.getDate() + 1);
                }

                await scheduleAlarm(alarmDate, alarm.buddy, alarm._id.toString(), requestCode);
                showPopup('Alarm enabled', '#4CAF50');
            } else {
                // Disable: Cancel the alarm with the same request code
                await cancelAlarm(requestCode);
                showPopup('Alarm disabled', '#4CAF50');
            }
        } catch (error) {
            console.error('Error toggling alarm:', error);
            showPopup('Failed to toggle alarm', '#FF6B6B');
        }
    };

    const deleteAlarm = async (id) => {
        if (deletingId) return; // Prevent multiple deletions
        setDeletingId(id);
        try {
            // Generate unique request code from alarm ID for proper cancellation
            const requestCode = generateRequestCode(id.toString());
            await deleteAlarmMutation({ id });
            // Cancel the native alarm with the correct request code
            await cancelAlarm(requestCode);
            showPopup('Alarm deleted', '#4CAF50');
        } catch (error) {
            console.error('Error deleting alarm:', error);
            showPopup('Failed to delete alarm', '#FF6B6B');
        } finally {
            setDeletingId(null);
        }
    };

    const formatDays = (daysData) => {
        if (!daysData) return '';
        // Handle if it comes as a string representation of array or actual array
        let daysArray = daysData;
        if (typeof daysData === 'string' && daysData.startsWith('[')) {
            try {
                daysArray = JSON.parse(daysData);
            } catch (e) {
                return daysData;
            }
        }

        if (!Array.isArray(daysArray)) return daysData;

        const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const activeDays = daysArray.map((d, i) => (d === 1 || d === true) ? dayNames[i] : null).filter(Boolean);

        if (activeDays.length === 7) return 'Everyday';
        if (activeDays.length === 0) return 'Once';
        return activeDays.join(', ');
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.alarmItem}
            onPress={() => router.push({
                pathname: '/screens/alarm-editor',
                params: { alarm: JSON.stringify(item) }
            })}
            activeOpacity={0.7}
        >
            <View style={styles.alarmInfo}>
                <View style={styles.timeContainer}>
                    <AppText style={[styles.timeText, !item.enabled && styles.disabledText]}>{item.time}</AppText>
                    <AppText style={[styles.ampmText, !item.enabled && styles.disabledText]}>{item.ampm}</AppText>
                </View>
                <AppText style={styles.alarmLabel}>{item.label} • {formatDays(item.days)}</AppText>

                {/* Mode Badge */}
                <View style={[
                    styles.modeBadge,
                    item.solo_mode ? styles.soloBadge : (item.buddy ? styles.buddyBadge : styles.strangerBadge)
                ]}>
                    <Ionicons
                        name={item.solo_mode ? "person-outline" : "people-outline"}
                        size={12}
                        color={item.solo_mode ? "#888" : NEON}
                    />
                    <AppText
                        style={[
                            styles.modeText,
                            item.solo_mode ? styles.soloText : (item.buddy ? styles.buddyText : styles.strangerText)
                        ]}
                        numberOfLines={1}
                        ellipsizeMode="middle"
                    >
                        {item.solo_mode
                            ? "Solo Mode"
                            : item.buddy
                                ? `Buddy: ${item.buddy.split('@')[0]}`
                                : "Stranger Mode"
                        }
                    </AppText>
                </View>
            </View>
            <View style={styles.actions}>
                <Switch
                    trackColor={{ false: "#222", true: "rgba(201, 226, 101, 0.3)" }}
                    thumbColor={item.enabled ? NEON : "#444"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={() => toggleAlarm(item)}
                    value={item.enabled}
                />
                <TouchableOpacity
                    onPress={() => deleteAlarm(item._id)}
                    style={styles.deleteButton}
                    disabled={deletingId === item._id}
                >
                    {deletingId === item._id ? (
                        <ActivityIndicator size="small" color="#ff4444" />
                    ) : (
                        <Ionicons name="trash-outline" size={18} color="#ff4444" />
                    )}
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor="#050505" />
            <View style={styles.header}>
                <AppText style={styles.headerTitle}>Alarms</AppText>
            </View>

            {alarms === undefined ? (
                <View style={[styles.listContent, styles.loadingContainer]}>
                    <ActivityIndicator size="large" color={NEON} />
                </View>
            ) : (
                <FlatList
                    data={alarms}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={[styles.listContent, alarms.length === 0 && styles.emptyListContent]}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="alarm-outline" size={64} color="#333" />
                            <AppText style={styles.emptyTitle}>No Alarms Set</AppText>
                            <AppText style={styles.emptySubtitle}>Tap the + button to create your first alarm</AppText>
                            <AppText style={styles.emptyDescription}>Wake up with a buddy or go solo!</AppText>
                        </View>
                    }
                />
            )}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push('/screens/alarm-editor')}
                activeOpacity={0.8}
            >
                <Ionicons name="add" size={32} color="#000" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}
