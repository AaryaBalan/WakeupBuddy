import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from 'convex/react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProfilePic from '../../components/ProfilePic';
import { useUser } from '../../contexts/UserContext';
import { api } from '../../convex/_generated/api';
import styles from "../../styles/profile.styles";

const { width } = Dimensions.get('window');
const NEON = '#C9E265';
const BG = '#000';
const GRAY = '#BDBDBD';

export default function PublicProfile() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const { user: currentUser } = useUser();
    const [isLoading, setIsLoading] = useState(false);

    // Use params from navigation, fallback to defaults if missing
    const user = {
        _id: params.id,
        name: params.name || 'User',
        username: params.username || (params.email ? params.email.split('@')[0] : params.name?.toLowerCase().replace(/\s+/g, '_') || 'user'),
        bio: params.bio || 'Morning person in training.',
        profile_code: params.profile_code || params.email,
        badge: params.badge || '',
        streak: parseInt(params.streak) || 0,
        maxStreak: parseInt(params.maxStreak) || 0,
        email: params.email || '',
    };

    // Mutations
    const sendFriendRequest = useMutation(api.friends.sendFriendRequest);
    const acceptFriendRequest = useMutation(api.friends.acceptFriendRequest);
    const rejectFriendRequest = useMutation(api.friends.rejectFriendRequest);
    const removeFriend = useMutation(api.friends.removeFriend);

    // Get friendship status
    const friendshipStatus = useQuery(
        api.friends.getFriendshipStatus,
        currentUser?.email && params.id
            ? { userEmail: currentUser.email, otherUserId: params.id }
            : 'skip'
    );

    // Fetch real wake history for the last 90 days (3 months)
    const recentStreaks = useQuery(
        api.streaks.getRecentStreaks,
        user.email ? { userEmail: user.email, days: 90 } : 'skip'
    );

    // Generate grid squares from real data
    const gridSquares = useMemo(() => {
        const today = new Date();
        const squares = [];

        // Create a map of dates with wakeups
        const streakMap = new Map();
        if (recentStreaks) {
            recentStreaks.forEach(s => {
                streakMap.set(s.date, s.count);
            });
        }

        // Generate 90 days (3 months) going backwards from today
        for (let i = 89; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const count = streakMap.get(dateStr) || 0;

            squares.push({
                id: 89 - i,
                date: dateStr,
                count: count,
                filled: count > 0,
                intensity: count >= 3 ? 4 : count >= 2 ? 3 : count >= 1 ? 2 : 0,
            });
        }

        return squares;
    }, [recentStreaks]);

    const achievements = [
        { key: '7day', label: '7 Day Streak', icon: 'flame' },
        { key: 'early', label: 'Early Bird', icon: 'sunny' },
        { key: 'help5', label: 'Help 5 Buddies', icon: 'people' },
        { key: 'locked', label: 'Locked', icon: 'lock-closed' },
    ];

    const handleSendFriendRequest = async () => {
        if (!currentUser?.email || !params.id) return;
        setIsLoading(true);
        try {
            await sendFriendRequest({
                senderEmail: currentUser.email,
                receiverId: params.id,
            });
        } catch (error) {
            console.error('Failed to send friend request:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAcceptRequest = async () => {
        if (!currentUser?.email || !friendshipStatus?.friendshipId) return;
        setIsLoading(true);
        try {
            await acceptFriendRequest({
                friendshipId: friendshipStatus.friendshipId,
                userEmail: currentUser.email,
            });
        } catch (error) {
            console.error('Failed to accept friend request:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRejectRequest = async () => {
        if (!currentUser?.email || !friendshipStatus?.friendshipId) return;
        setIsLoading(true);
        try {
            await rejectFriendRequest({
                friendshipId: friendshipStatus.friendshipId,
                userEmail: currentUser.email,
            });
        } catch (error) {
            console.error('Failed to reject friend request:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveFriend = async () => {
        if (!currentUser?.email || !friendshipStatus?.friendshipId) return;
        setIsLoading(true);
        try {
            await removeFriend({
                friendshipId: friendshipStatus.friendshipId,
                userEmail: currentUser.email,
            });
        } catch (error) {
            console.error('Failed to remove friend:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const renderFriendActions = () => {
        if (isLoading) {
            return (
                <View style={styles.actionButtons}>
                    <View style={[styles.primaryBtn, { opacity: 0.7 }]}>
                        <ActivityIndicator color="#000" />
                    </View>
                </View>
            );
        }

        if (!friendshipStatus || friendshipStatus.status === 'none' || friendshipStatus.status === 'rejected') {
            return (
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={styles.primaryBtn}
                        onPress={handleSendFriendRequest}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.primaryBtnText}>Send Friend Request</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (friendshipStatus.status === 'pending') {
            if (friendshipStatus.isSender) {
                // Current user sent the request
                return (
                    <View style={styles.actionButtons}>
                        <View style={[styles.secondaryBtn, { backgroundColor: '#333' }]}>
                            <Text style={styles.secondaryBtnText}>Request Pending...</Text>
                        </View>
                    </View>
                );
            } else {
                // Current user received the request
                return (
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={styles.primaryBtn}
                            onPress={handleAcceptRequest}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.primaryBtnText}>Accept Request</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.secondaryBtn, { backgroundColor: '#ff4444', borderColor: '#ff4444' }]}
                            onPress={handleRejectRequest}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.secondaryBtnText, { color: '#fff' }]}>Decline</Text>
                        </TouchableOpacity>
                    </View>
                );
            }
        }

        if (friendshipStatus.status === 'friends') {
            const friendsSince = friendshipStatus.friendsSince
                ? new Date(friendshipStatus.friendsSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                : '';
            return (
                <View style={styles.actionButtons}>
                    <View style={[styles.primaryBtn, { backgroundColor: '#2d4a2d', flexDirection: 'row', gap: 8 }]}>
                        <Ionicons name="checkmark-circle" size={18} color="#C9E265" />
                        <Text style={[styles.primaryBtnText, { color: '#C9E265' }]}>
                            Friends {friendsSince ? `since ${friendsSince}` : ''}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.secondaryBtn}
                        onPress={handleRemoveFriend}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.secondaryBtnText}>Remove Friend</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return null;
    };

    return (
        <SafeAreaView style={styles.container}>

            <View style={styles.container}>
                <ScrollView contentContainerStyle={styles.scroll}>
                    {/* Header */}
                    <View style={styles.headerRow}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Profile</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    {/* User Card */}
                    <View style={styles.card}>
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatarRing}>
                                <ProfilePic user={user} size={80} />
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={styles.name}>{user.name}</Text>
                            {user.badge ? <Text style={{ fontSize: 18 }}>{user.badge}</Text> : null}
                        </View>
                        <Text style={styles.username}>@{user.username}</Text>
                        <Text style={styles.bio}>{user.bio}</Text>

                        {/* Friend Actions */}
                        {renderFriendActions()}
                    </View>

                    {/* Stats Section */}
                    <View style={styles.statsRow}>
                        <View style={styles.statBox}>
                            <Text style={styles.statNumber}>{gridSquares.filter(s => s.filled).length}</Text>
                            <Text style={styles.statLabel}>Wakeups</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={styles.statNumber}>{user.streak}</Text>
                            <Text style={styles.statLabel}>Streak</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={styles.statNumber}>{user.maxStreak}</Text>
                            <Text style={styles.statLabel}>Best</Text>
                        </View>
                    </View>

                    {/* Wake History */}
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionTitle}>Wake History</Text>
                        <TouchableOpacity activeOpacity={0.8}>
                            <Text style={styles.viewAllText}>Last 90 days</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.historySubHeader}>
                        <Text style={styles.monthText}>
                            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </Text>
                        <View style={styles.legend}>
                            <Text style={styles.legendText}>Less</Text>
                            <View style={styles.legendSquare1} />
                            <View style={styles.legendSquare2} />
                            <View style={styles.legendSquare3} />
                            <View style={styles.legendSquare4} />
                            <Text style={styles.legendText}>More</Text>
                        </View>
                    </View>

                    <View style={styles.gridContainer}>
                        {gridSquares.map((sq) => (
                            <View
                                key={sq.id}
                                style={[
                                    styles.gridSquare,
                                    sq.intensity === 1 && styles.gridSquareLight,
                                    sq.intensity === 2 && styles.gridSquareMedium,
                                    sq.intensity === 3 && styles.gridSquareHigh,
                                    sq.intensity === 4 && styles.gridSquareFilled
                                ]}
                            />
                        ))}
                    </View>

                    {/* Achievements */}
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionTitle}>Achievements</Text>
                        <Text style={styles.achCount}>12/48 Unlocked</Text>
                    </View>

                    <View style={styles.achRow}>
                        {achievements.map((a, idx) => {
                            const achieved = a.key !== 'locked';
                            return (
                                <View key={a.key} style={styles.achItem}>
                                    <View style={[styles.achCircle, achieved && styles.achievedRing]}>
                                        <Ionicons name={a.icon} size={22} color={achieved ? NEON : GRAY} />
                                    </View>
                                    <Text style={styles.achLabel}>{a.label}</Text>
                                </View>
                            );
                        })}
                    </View>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}