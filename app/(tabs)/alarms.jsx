import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from "convex/react";
import { useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePopup } from '../../contexts/PopupContext';
import { useUser } from '../../contexts/UserContext';
import { api } from "../../convex/_generated/api";
import styles from '../../styles/alarms.styles';

import { cancelAlarm, scheduleAlarm } from '../native/AlarmNative';

export default function AlarmsScreen() {
    const router = useRouter();
    const { user } = useUser();
    const { showPopup } = usePopup();
    const userId = user?._id;
    const alarms = useQuery(api.alarms.getAlarmsByUser, userId ? { user_id: userId } : "skip");
    const toggleAlarmMutation = useMutation(api.alarms.toggleAlarm);
    const deleteAlarmMutation = useMutation(api.alarms.deleteAlarm);

    const toggleAlarm = async (alarm) => {
        const newStatus = !alarm.enabled;
        try {
            await toggleAlarmMutation({ id: alarm._id, enabled: newStatus });

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

                await scheduleAlarm(alarmDate, alarm.buddy);
                showPopup('Alarm enabled', '#4CAF50');
            } else {
                // Disable: Cancel the alarm
                await cancelAlarm();
                showPopup('Alarm disabled', '#4CAF50');
            }
        } catch (error) {
            console.error('Error toggling alarm:', error);
            showPopup('Failed to toggle alarm', '#FF6B6B');
        }
    };

    const deleteAlarm = async (id) => {
        try {
            await deleteAlarmMutation({ id });
            // Cancel the native alarm as well
            await cancelAlarm();
            showPopup('Alarm deleted', '#4CAF50');
        } catch (error) {
            console.error('Error deleting alarm:', error);
            showPopup('Failed to delete alarm', '#FF6B6B');
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
        >
            <View style={styles.alarmInfo}>
                <View style={styles.timeContainer}>
                    <Text style={[styles.timeText, !item.enabled && styles.disabledText]}>{item.time}</Text>
                    <Text style={[styles.ampmText, !item.enabled && styles.disabledText]}>{item.ampm}</Text>
                </View>
                <Text style={styles.alarmLabel}>{item.label} • {formatDays(item.days)}</Text>

                {/* Mode Badge */}
                <View style={[
                    styles.modeBadge,
                    item.solo_mode ? styles.soloBadge : (item.buddy ? styles.buddyBadge : styles.strangerBadge)
                ]}>
                    <Ionicons
                        name={item.solo_mode ? "person" : "people"}
                        size={12}
                        color={item.solo_mode ? "#888" : (item.buddy ? "#C9E265" : "#C9E265")}
                    />
                    <Text style={[
                        styles.modeText,
                        item.solo_mode ? styles.soloText : (item.buddy ? styles.buddyText : styles.strangerText)
                    ]}>
                        {item.solo_mode
                            ? "Solo Mode"
                            : item.buddy
                                ? `Buddy: ${item.buddy}`
                                : "Stranger Mode"
                        }
                    </Text>
                </View>
            </View>
            <View style={styles.actions}>
                <Switch
                    trackColor={{ false: "#333", true: "#C9E265" }}
                    thumbColor={item.enabled ? "#000" : "#f4f3f4"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={() => toggleAlarm(item)}
                    value={item.enabled}
                />
                <TouchableOpacity onPress={() => deleteAlarm(item._id)} style={styles.deleteButton}>
                    <Ionicons name="trash-outline" size={20} color="#ff4444" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Alarms</Text>
            </View>

            {alarms === undefined ? (
                <View style={[styles.listContent, styles.loadingContainer]}>
                    <ActivityIndicator size="large" color="#C9E265" />
                </View>
            ) : (
                <FlatList
                    data={alarms}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={[styles.listContent, alarms.length === 0 && styles.emptyListContent]}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="alarm-outline" size={80} color="#C9E265" />
                            <Text style={styles.emptyTitle}>No Alarms Set</Text>
                            <Text style={styles.emptySubtitle}>Click add button to set the alarm</Text>
                            <Text style={styles.emptyDescription}>Connect with stranger or set alarm in solo mode</Text>
                        </View>
                    }
                />
            )}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push('/screens/alarm-editor')}
            >
                <Ionicons name="add" size={32} color="#000" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}
