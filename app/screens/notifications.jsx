import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from "convex/react";
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePopup } from '../../contexts/PopupContext';
import { useUser } from '../../contexts/UserContext';
import { api } from "../../convex/_generated/api";
import styles from '../../styles/notifications.styles';
import { requestExactAlarmPermission, scheduleAlarm } from '../native/AlarmNative';

export default function NotificationsScreen() {
    const router = useRouter();
    const { user } = useUser();
    const { showPopup } = usePopup();
    const userEmail = user?.email;

    // Fetch notifications using Convex query
    const notifications = useQuery(api.notifications.getNotificationsByEmail, userEmail ? { email: userEmail } : "skip");
    const [processingId, setProcessingId] = useState(null); // Track which item is being processed

    const createAlarm = useMutation(api.alarms.createAlarm);
    const updateNotificationStatus = useMutation(api.notifications.updateNotificationStatus);
    const acceptBuddyRequest = useMutation(api.notifications.acceptBuddyRequest);

    const handleAccept = async (item) => {
        setProcessingId(item._id);
        try {
            // Use new acceptBuddyRequest mutation that creates alarms for both users
            const result = await acceptBuddyRequest({
                notificationId: item._id,
                receiverUserId: user._id,
                receiverEmail: user.email
            });

            // Schedule native Android alarm on buddy's device
            try {
                // Parse the alarm time (e.g., "7:00") and AM/PM
                const [hoursStr, minutesStr] = result.alarm_time.split(':');
                let hours = parseInt(hoursStr);
                const minutes = parseInt(minutesStr);

                // Convert to 24-hour format
                if (result.ampm === 'PM' && hours !== 12) {
                    hours += 12;
                }
                if (result.ampm === 'AM' && hours === 12) {
                    hours = 0;
                }

                // Create alarm date
                const now = new Date();
                let alarmDate = new Date();
                alarmDate.setHours(hours);
                alarmDate.setMinutes(minutes);
                alarmDate.setSeconds(0);
                alarmDate.setMilliseconds(0);

                // If the time has already passed today, schedule for tomorrow
                if (alarmDate <= now) {
                    alarmDate.setDate(alarmDate.getDate() + 1);
                }

                // Schedule the native alarm with buddy EMAIL instead of name
                await scheduleAlarm(alarmDate, item.created_by.email);
                console.log('Native alarm scheduled successfully for buddy at:', alarmDate.toLocaleString());

                showPopup(`Alarm set for ${result.alarm_time} ${result.ampm} - You and ${item.created_by.name} will wake up together!`, '#4CAF50');
            } catch (alarmError) {
                console.error('Failed to schedule native alarm:', alarmError);

                // If permission error, show helpful alert
                if (alarmError && (
                    alarmError.message === 'EXACT_ALARM_PERMISSION_REQUIRED' ||
                    alarmError.message === 'BATTERY_OPTIMIZATION_REQUIRED' ||
                    alarmError.message === 'DISPLAY_OVERLAY_REQUIRED'
                )) {
                    showPopup('Please enable all alarm permissions in Settings', '#FF6B6B');
                    await requestExactAlarmPermission();
                } else {
                    // Alarm saved to database but native scheduling failed
                    showPopup(`Accepted but alarm may not ring. Please check permissions.`, '#FFA500');
                }
            }
        } catch (error) {
            console.error('Error accepting invitation:', error);
            showPopup('Failed to accept invitation', '#FF6B6B');
        } finally {
            setProcessingId(null);
        }
    };

    const handleDecline = async (id) => {
        setProcessingId(id);
        try {
            await updateNotificationStatus({ id, status: -1 });
            showPopup('Invitation Declined', '#4CAF50');
        } catch (error) {
            console.error('Error declining invitation:', error);
            showPopup('Failed to decline invitation', '#FF6B6B');
        } finally {
            setProcessingId(null);
        }
    };

    const formatRelativeTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) {
            return 'now';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes}m ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours}h ago`;
        } else {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days}d ago`;
        }
    };

    const renderHistoryItem = ({ item }) => (
        <View style={styles.historyCard}>
            <View style={styles.historyHeader}>
                <View style={styles.userInfo}>
                    <View style={styles.avatarPlaceholderSmall}>
                        <Text style={styles.avatarTextSmall}>{item.created_by.name?.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View>
                        <Text style={styles.userNameSmall}>{item.created_by.name}</Text>
                        <Text style={styles.historyText}>
                            {item.status === 1 ? 'You accepted the request.' : 'You declined the request.'}
                        </Text>
                    </View>
                </View>
                <Text style={styles.timeAgo}>{formatRelativeTime(item.time)}</Text>
            </View>
            <View style={styles.historyBadge}>
                <Ionicons
                    name={item.status === 1 ? "checkmark-circle" : "close-circle"}
                    size={16}
                    color={item.status === 1 ? "#C9E265" : "#ff4444"}
                />
                <Text style={[styles.historyStatus, { color: item.status === 1 ? "#C9E265" : "#ff4444" }]}>
                    {item.status === 1 ? 'Accepted' : 'Declined'}
                </Text>
            </View>
        </View>
    );

    const renderInviteItem = ({ item }) => (
        <View style={styles.inviteCard}>
            <View style={styles.inviteHeader}>
                <View style={styles.userInfo}>
                    {/* Placeholder Avatar */}
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>{item.created_by.name?.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View>
                        <Text style={styles.userName}>{item.created_by.name}</Text>
                        <Text style={styles.inviteText}>
                            Invited you to be their <Text style={styles.boldText}>Wake Buddy</Text> for tomorrow's alarm.
                        </Text>
                    </View>
                </View>
                <Text style={styles.timeAgo}>{formatRelativeTime(item.time)}</Text>
            </View>

            <View style={styles.alarmBadge}>
                <Ionicons name="alarm-outline" size={16} color="#C9E265" />
                <Text style={styles.alarmTime}>{item.alarm_time} {item.ampm}</Text>
                <Text style={styles.puzzleType}>• {item.with_whom || 'Medium Puzzle'}</Text>
            </View>

            <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.declineButton} onPress={() => handleDecline(item._id)} disabled={processingId === item._id}>
                    {processingId === item._id ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.declineText}>Decline</Text>
                    )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.acceptButton} onPress={() => handleAccept(item)} disabled={processingId === item._id}>
                    {processingId === item._id ? (
                        <ActivityIndicator size="small" color="#000" />
                    ) : (
                        <Text style={styles.acceptText}>Accept</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderItem = ({ item }) => {
        if (item.status === 1 || item.status === -1) {
            return renderHistoryItem({ item });
        }
        return renderInviteItem({ item });
    };

    // Separate invites and earlier notifications if needed. 
    // For now, I'll render everything as invites based on the UI, 
    // or we can differentiate based on some data field. 
    // The prompt implies all are "info" but the UI shows sections.
    // I'll assume for now all fetched items are "Invites" for the top section.
    // If there's a distinction, we'd need a field in the response.

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <Ionicons name="checkmark-done-outline" size={24} color="#888" />
            </View>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>INVITES</Text>
            </View>

            {notifications === undefined ? (
                <View style={[styles.listContent, styles.loadingContainer]}>
                    <ActivityIndicator size="large" color="#C9E265" />
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyText}>No new notifications</Text>
                            </View>
                        )
                    }
                />
            )}
        </SafeAreaView>
    );
}