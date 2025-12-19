import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from "convex/react";
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Modal, StatusBar, Switch, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from '../../components/AppText';
import { usePopup } from '../../contexts/PopupContext';
import { useUser } from '../../contexts/UserContext';
import { api } from "../../convex/_generated/api";
import styles from '../../styles/alarms.styles';

import { showInterstitialAd } from '../ads/InterstitialAds';
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
    const deleteAllAlarmsMutation = useMutation(api.alarms.deleteAllAlarms);
    const [deletingId, setDeletingId] = useState(null); // Track which alarm is being deleted
    const [clearingAll, setClearingAll] = useState(false); // Track clearing all alarms
    const [showClearModal, setShowClearModal] = useState(false); // Modal visibility

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

    // Open confirmation modal
    const handleClearAllAlarms = () => {
        if (!alarms || alarms.length === 0) {
            showPopup('No alarms to clear', '#888');
            return;
        }
        setShowClearModal(true);
    };

    // Execute the deletion
    const confirmClearAll = async () => {
        setShowClearModal(false);
        setClearingAll(true);
        try {
            // Cancel all native alarms first
            for (const alarm of alarms) {
                const requestCode = generateRequestCode(alarm._id.toString());
                await cancelAlarm(requestCode).catch(e => console.log('Cancel error:', e));
            }

            // Delete all from database
            const result = await deleteAllAlarmsMutation({ user_id: userId });
            showPopup(`${result.deletedCount} alarm${result.deletedCount > 1 ? 's' : ''} deleted`, '#4CAF50');
        } catch (error) {
            console.error('Error clearing all alarms:', error);
            showPopup('Failed to clear alarms', '#FF6B6B');
        } finally {
            setClearingAll(false);
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

    // Open alarm editor screen
    const openAlarmEditor = () => {
        showInterstitialAd(() => {
            router.push('/screens/alarm-editor');
        });
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
                {alarms && alarms.length > 0 && (
                    <TouchableOpacity
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: 'rgba(255, 68, 68, 0.15)',
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 20,
                            borderWidth: 1,
                            borderColor: 'rgba(255, 68, 68, 0.3)',
                        }}
                        onPress={handleClearAllAlarms}
                        disabled={clearingAll}
                        activeOpacity={0.7}
                    >
                        {clearingAll ? (
                            <ActivityIndicator size="small" color="#ff4444" />
                        ) : (
                            <>
                                <Ionicons name="trash-outline" size={16} color="#ff4444" />
                                <AppText style={{ color: '#ff4444', fontSize: 12, marginLeft: 4, fontWeight: '600' }}>
                                    Clear All
                                </AppText>
                            </>
                        )}
                    </TouchableOpacity>
                )}
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
                    contentContainerStyle={[
                        styles.listContent,
                        alarms.length === 0 && { flexGrow: 1, justifyContent: 'center' }
                    ]}
                    scrollEnabled={alarms.length > 0}
                    ListEmptyComponent={
                        <View style={[styles.emptyState, { marginTop: 0 }]}>
                            <Ionicons name="alarm-outline" size={96} color={NEON} />
                            <AppText style={styles.emptyTitle}>No Alarms Set</AppText>
                            <AppText style={styles.emptySubtitle}>Tap the + button to create your first alarm</AppText>
                            <AppText style={styles.emptyDescription}>Wake up with a buddy or go solo!</AppText>
                        </View>
                    }
                />
            )}
            <TouchableOpacity
                style={styles.fab}
                onPress={openAlarmEditor}
                activeOpacity={0.8}
            >
                <Ionicons name="add" size={32} color="#000" />
            </TouchableOpacity>

            {/* Clear All Confirmation Modal - Bottom Sheet */}
            <Modal
                visible={showClearModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowClearModal(false)}
            >
                <TouchableOpacity
                    style={{
                        flex: 1,
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    }}
                    activeOpacity={1}
                    onPress={() => setShowClearModal(false)}
                />
                <View style={{
                    backgroundColor: '#1A1A1A',
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                    padding: 24,
                    paddingBottom: 40,
                    borderTopWidth: 1,
                    borderColor: 'rgba(255, 68, 68, 0.3)',
                }}>
                    {/* Drag Handle */}
                    <View style={{
                        width: 40,
                        height: 4,
                        backgroundColor: '#444',
                        borderRadius: 2,
                        alignSelf: 'center',
                        marginBottom: 20,
                    }} />

                    <View style={{ alignItems: 'center', marginBottom: 20 }}>
                        <View style={{
                            backgroundColor: 'rgba(255, 68, 68, 0.15)',
                            borderRadius: 50,
                            padding: 16,
                            marginBottom: 12,
                        }}>
                            <Ionicons name="warning" size={32} color="#ff4444" />
                        </View>
                        <AppText style={{
                            color: '#fff',
                            fontSize: 20,
                            fontWeight: '700',
                            marginBottom: 8,
                            textAlign: 'center',
                        }}>
                            Clear All Alarms?
                        </AppText>
                        <AppText style={{
                            color: '#888',
                            fontSize: 14,
                            textAlign: 'center',
                            lineHeight: 20,
                        }}>
                            Are you sure you want to delete all {alarms?.length || 0} alarm{(alarms?.length || 0) > 1 ? 's' : ''}? This action cannot be undone.
                        </AppText>
                    </View>

                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        <TouchableOpacity
                            style={{
                                flex: 1,
                                backgroundColor: '#333',
                                paddingVertical: 16,
                                borderRadius: 14,
                                alignItems: 'center',
                            }}
                            onPress={() => setShowClearModal(false)}
                            activeOpacity={0.7}
                        >
                            <AppText style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Cancel</AppText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{
                                flex: 1,
                                backgroundColor: '#ff4444',
                                paddingVertical: 16,
                                borderRadius: 14,
                                alignItems: 'center',
                            }}
                            onPress={confirmClearAll}
                            activeOpacity={0.7}
                        >
                            <AppText style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Delete All</AppText>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
