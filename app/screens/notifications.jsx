import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from "convex/react";
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, TouchableOpacity, View } from 'react-native';
import AppText from '../../components/AppText';
import ProfilePic from '../../components/ProfilePic';
import ScreenWrapper from '../../components/ScreenWrapper';
import { usePopup } from '../../contexts/PopupContext';
import { useUser } from '../../contexts/UserContext';
import { api } from "../../convex/_generated/api";
import styles from '../../styles/notifications.styles';
import { generateRequestCode, requestExactAlarmPermission, scheduleAlarm } from '../native/AlarmNative';

export default function NotificationsScreen() {
    const router = useRouter();
    const { user } = useUser();
    const { showPopup } = usePopup();
    const userEmail = user?.email;
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'alarms', 'friends'

    // Fetch alarm notifications using Convex query
    const notifications = useQuery(api.notifications.getNotificationsByEmail, userEmail ? { email: userEmail } : "skip");

    // Fetch ALL friend requests (including accepted/rejected for history)
    const friendRequests = useQuery(api.friends.getAllReceivedRequests, userEmail ? { userEmail } : "skip");

    const [processingId, setProcessingId] = useState(null);
    const [isClearing, setIsClearing] = useState(false);

    const createAlarm = useMutation(api.alarms.createAlarm);
    const updateNotificationStatus = useMutation(api.notifications.updateNotificationStatus);
    const acceptBuddyRequest = useMutation(api.notifications.acceptBuddyRequest);
    const clearAllNotifications = useMutation(api.notifications.clearAllNotifications);

    // Friend request mutations
    const acceptFriendRequest = useMutation(api.friends.acceptFriendRequest);
    const rejectFriendRequest = useMutation(api.friends.rejectFriendRequest);

    // Clear all notifications handler
    const handleClearAll = async () => {
        if (!userEmail || isClearing) return;

        setIsClearing(true);
        try {
            const result = await clearAllNotifications({ userEmail });
            showPopup(`Cleared ${result.deletedCount} notifications`, '#4CAF50');
        } catch (error) {
            console.error('Error clearing notifications:', error);
            showPopup('Failed to clear notifications', '#FF6B6B');
        } finally {
            setIsClearing(false);
        }
    };

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

                // Schedule the native alarm with buddy EMAIL and unique request code
                const alarmId = result.receiverAlarmId;
                const requestCode = generateRequestCode(alarmId);
                await scheduleAlarm(alarmDate, item.created_by.email, alarmId, requestCode);
                console.log('Native alarm scheduled successfully for buddy at:', alarmDate.toLocaleString(), 'alarmId:', alarmId, 'requestCode:', requestCode);

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

    // Friend request handlers
    const handleAcceptFriend = async (friendshipId) => {
        setProcessingId(friendshipId);
        try {
            await acceptFriendRequest({
                friendshipId,
                userEmail: user.email,
            });
            showPopup('Friend request accepted!', '#4CAF50');
        } catch (error) {
            console.error('Error accepting friend request:', error);
            showPopup('Failed to accept request', '#FF6B6B');
        } finally {
            setProcessingId(null);
        }
    };

    const handleDeclineFriend = async (friendshipId) => {
        setProcessingId(friendshipId);
        try {
            await rejectFriendRequest({
                friendshipId,
                userEmail: user.email,
            });
            showPopup('Friend request declined', '#888');
        } catch (error) {
            console.error('Error declining friend request:', error);
            showPopup('Failed to decline request', '#FF6B6B');
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
                    <TouchableOpacity
                        style={{ marginRight: 10 }}
                        onPress={() => router.push(`/user/${item.created_by._id}?name=${encodeURIComponent(item.created_by.name)}&email=${encodeURIComponent(item.created_by.email || '')}&avatar=${encodeURIComponent(item.created_by.avatar || '')}`)}
                    >
                        <ProfilePic user={item.created_by} size={32} />
                    </TouchableOpacity>
                    <View>
                        <AppText style={styles.userNameSmall}>{item.created_by.name}</AppText>
                        <AppText style={styles.historyText}>
                            {item.status === 1 ? 'You accepted the request.' : 'You declined the request.'}
                        </AppText>
                    </View>
                </View>
                <AppText style={styles.timeAgo}>{formatRelativeTime(item.time)}</AppText>
            </View>
            <View style={styles.historyBadge}>
                <Ionicons
                    name={item.status === 1 ? "checkmark-circle" : "close-circle"}
                    size={16}
                    color={item.status === 1 ? "#C9E265" : "#ff4444"}
                />
                <AppText style={[styles.historyStatus, { color: item.status === 1 ? "#C9E265" : "#ff4444" }]}>
                    {item.status === 1 ? 'Accepted' : 'Declined'}
                </AppText>
            </View>
        </View>
    );

    const renderInviteItem = ({ item }) => (
        <View style={styles.alarmRequestCard}>
            <View style={styles.inviteHeader}>
                <View style={styles.userInfo}>
                    <TouchableOpacity
                        style={{ marginRight: 12 }}
                        onPress={() => router.push(`/user/${item.created_by._id}?name=${encodeURIComponent(item.created_by.name)}&email=${encodeURIComponent(item.created_by.email || '')}&avatar=${encodeURIComponent(item.created_by.avatar || '')}`)}
                    >
                        <ProfilePic user={item.created_by} size={40} />
                    </TouchableOpacity>
                    <View>
                        <AppText style={styles.userName}>{item.created_by.name}</AppText>
                        <AppText style={styles.inviteText}>
                            Invited you to be their <AppText style={styles.boldText}>Wake Buddy</AppText> for tomorrow's alarm.
                        </AppText>
                    </View>
                </View>
                <AppText style={styles.timeAgo}>{formatRelativeTime(item.time)}</AppText>
            </View>

            <View style={styles.alarmBadge}>
                <Ionicons name="alarm-outline" size={16} color="#C9E265" />
                <AppText style={styles.alarmTime}>{item.alarm_time} {item.ampm}</AppText>
                <AppText style={styles.puzzleType}>• {item.with_whom || 'Medium Puzzle'}</AppText>
            </View>

            <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.declineButton} onPress={() => handleDecline(item._id)} disabled={processingId === item._id}>
                    {processingId === item._id ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <AppText style={styles.declineText}>Decline</AppText>
                    )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.acceptButton} onPress={() => handleAccept(item)} disabled={processingId === item._id}>
                    {processingId === item._id ? (
                        <ActivityIndicator size="small" color="#000" />
                    ) : (
                        <AppText style={styles.acceptText}>Accept</AppText>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderFriendRequestItem = ({ item }) => {
        // If it's accepted or rejected, show history view
        if (item.status === 1 || item.status === -1) {
            return (
                <View style={[styles.historyCard, { borderLeftWidth: 4, borderLeftColor: '#FF6B9D' }]}>
                    <View style={styles.historyHeader}>
                        <View style={styles.userInfo}>
                            <TouchableOpacity
                                style={{ marginRight: 10 }}
                                onPress={() => router.push(`/user/${item.sender._id}?name=${encodeURIComponent(item.sender.name)}&email=${encodeURIComponent(item.sender.email || '')}&avatar=${encodeURIComponent(item.sender.avatar || '')}`)}
                            >
                                <ProfilePic user={item.sender} size={32} />
                            </TouchableOpacity>
                            <View>
                                <AppText style={styles.userNameSmall}>{item.sender.name}</AppText>
                                <AppText style={styles.historyText}>
                                    {item.status === 1 ? 'You are now friends!' : 'You declined the request.'}
                                </AppText>
                            </View>
                        </View>
                        <AppText style={styles.timeAgo}>{formatRelativeTime(item.status === 1 ? item.friendsSince : item.createdAt)}</AppText>
                    </View>
                    <View style={styles.historyBadge}>
                        <Ionicons
                            name={item.status === 1 ? "people" : "close-circle"}
                            size={16}
                            color={item.status === 1 ? "#FF6B9D" : "#ff4444"}
                        />
                        <AppText style={[styles.historyStatus, { color: item.status === 1 ? "#FF6B9D" : "#ff4444" }]}>
                            {item.status === 1 ? 'Friends' : 'Declined'}
                        </AppText>
                    </View>
                </View>
            );
        }

        // Pending request - show action buttons
        return (
            <View style={styles.friendRequestCard}>
                <View style={styles.inviteHeader}>
                    <View style={styles.userInfo}>
                        <TouchableOpacity
                            style={{ marginRight: 12 }}
                            onPress={() => router.push(`/user/${item.sender._id}?name=${encodeURIComponent(item.sender.name)}&email=${encodeURIComponent(item.sender.email || '')}&avatar=${encodeURIComponent(item.sender.avatar || '')}`)}
                        >
                            <ProfilePic user={item.sender} size={40} />
                        </TouchableOpacity>
                        <View style={{ flex: 1 }}>
                            <AppText style={styles.userName}>{item.sender.name}</AppText>
                            <AppText style={styles.inviteText}>
                                Wants to be your <AppText style={[styles.boldText, { color: '#FF6B9D' }]}>Friend</AppText>
                            </AppText>
                        </View>
                    </View>
                    <AppText style={styles.timeAgo}>{formatRelativeTime(item.createdAt)}</AppText>
                </View>

                <View style={styles.friendBadge}>
                    <Ionicons name="people" size={16} color="#FF6B9D" />
                    <AppText style={styles.friendBadgeText}>Friend Request</AppText>
                    {item.sender.streak > 0 && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
                            <Ionicons name="flame" size={12} color="#FF6B35" />
                            <AppText style={{ color: '#888', marginLeft: 4, fontSize: 12 }}>
                                {item.sender.streak} day streak
                            </AppText>
                        </View>
                    )}
                </View>

                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={styles.declineButton}
                        onPress={() => handleDeclineFriend(item.friendshipId)}
                        disabled={processingId === item.friendshipId}
                    >
                        {processingId === item.friendshipId ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <AppText style={styles.declineText}>Decline</AppText>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.friendAcceptButton}
                        onPress={() => handleAcceptFriend(item.friendshipId)}
                        disabled={processingId === item.friendshipId}
                    >
                        {processingId === item.friendshipId ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <AppText style={styles.friendAcceptText}>Accept</AppText>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderItem = ({ item }) => {
        // Check if it's a friend request
        if (item.type === 'friend_request') {
            return renderFriendRequestItem({ item });
        }
        // Alarm notifications
        if (item.status === 1 || item.status === -1) {
            return renderHistoryItem({ item });
        }
        return renderInviteItem({ item });
    };

    // Combine and filter notifications based on active tab
    const getCombinedNotifications = () => {
        const alarmNotifs = (notifications || []).map(n => ({ ...n, type: 'alarm' }));
        const friendNotifs = (friendRequests || []).map(f => ({ ...f, type: 'friend_request' }));

        let combined = [];

        if (activeTab === 'all') {
            combined = [...alarmNotifs, ...friendNotifs];
        } else if (activeTab === 'alarms') {
            combined = alarmNotifs;
        } else if (activeTab === 'friends') {
            combined = friendNotifs;
        }

        // Sort by time (most recent first)
        return combined.sort((a, b) => {
            const timeA = a.type === 'friend_request' ? a.createdAt : new Date(a.time).getTime();
            const timeB = b.type === 'friend_request' ? b.createdAt : new Date(b.time).getTime();
            return timeB - timeA;
        });
    };

    const pendingAlarms = (notifications || []).filter(n => n.status === 0).length;
    const pendingFriends = (friendRequests || []).filter(f => f.status === 0).length;
    const isScreenLoading = notifications === undefined || friendRequests === undefined;

    return (
        <ScreenWrapper isLoading={isScreenLoading}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color="#fff" />
                </TouchableOpacity>
                <AppText style={styles.headerTitle}>Notifications</AppText>
                <TouchableOpacity onPress={handleClearAll} disabled={isClearing}>
                    {isClearing ? (
                        <ActivityIndicator size="small" color="#888" />
                    ) : (
                        <Ionicons name="checkmark-done-outline" size={24} color="#888" />
                    )}
                </TouchableOpacity>
            </View>

            {/* Filter Tabs */}
            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'all' && styles.tabActive]}
                    onPress={() => setActiveTab('all')}
                >
                    <AppText style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
                        All
                    </AppText>
                    {(pendingAlarms + pendingFriends) > 0 && (
                        <View style={styles.tabBadge}>
                            <AppText style={styles.tabBadgeText}>{pendingAlarms + pendingFriends}</AppText>
                        </View>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'alarms' && styles.tabActive]}
                    onPress={() => setActiveTab('alarms')}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Ionicons name="notifications" size={14} color={activeTab === 'alarms' ? '#000' : '#888'} />
                        <AppText style={[styles.tabText, activeTab === 'alarms' && styles.tabTextActive]}>
                            Alarms
                        </AppText>
                    </View>
                    {pendingAlarms > 0 && (
                        <View style={styles.tabBadge}>
                            <AppText style={styles.tabBadgeText}>{pendingAlarms}</AppText>
                        </View>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'friends' && styles.tabActive]}
                    onPress={() => setActiveTab('friends')}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Ionicons name="people" size={14} color={activeTab === 'friends' ? '#000' : '#888'} />
                        <AppText style={[styles.tabText, activeTab === 'friends' && styles.tabTextActive]}>
                            Friends
                        </AppText>
                    </View>
                    {pendingFriends > 0 && (
                        <View style={styles.tabBadge}>
                            <AppText style={styles.tabBadgeText}>{pendingFriends}</AppText>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <View style={styles.sectionHeader}>
                <AppText style={styles.sectionTitle}>
                    {activeTab === 'all' ? 'ALL NOTIFICATIONS' :
                        activeTab === 'alarms' ? 'ALARM INVITES' : 'FRIEND REQUESTS'}
                </AppText>
            </View>

            <FlatList
                data={getCombinedNotifications()}
                renderItem={renderItem}
                keyExtractor={item => item._id || item.friendshipId}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    (
                        <View style={styles.emptyState}>
                            <AppText style={styles.emptyText}>
                                {activeTab === 'all' ? 'No notifications' :
                                    activeTab === 'alarms' ? 'No alarm invites' : 'No friend requests'}
                            </AppText>
                        </View>
                    )
                }
            />
        </ScreenWrapper>
    );
}