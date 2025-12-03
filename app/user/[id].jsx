import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from 'convex/react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from '../../components/AppText';
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

    // Fetch user data from Convex by ID
    const fetchedUser = useQuery(
        api.users.getUserById,
        params.id ? { userId: params.id } : 'skip'
    );

    // Use fetched data, with params as fallback
    const user = {
        _id: params.id,
        name: fetchedUser?.name || params.name || 'User',
        username: fetchedUser?.username || params.username || 'user',
        bio: fetchedUser?.bio || params.bio || 'Morning person in training.',
        profile_code: fetchedUser?.profile_code || params.profile_code,
        email: fetchedUser?.email || params.email || '',
        streak: fetchedUser?.streak || parseInt(params.streak) || 0,
        maxStreak: fetchedUser?.maxStreak || parseInt(params.maxStreak) || 0,
        badge: params.badge || '',
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

    // Fetch real wake history for the last 90 days (3 months) by user ID
    const recentStreaks = useQuery(
        api.streaks.getRecentStreaksById,
        params.id ? { userId: params.id, days: 90 } : 'skip'
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
                        <AppText style={styles.primaryBtnText}>Send Friend Request</AppText>
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
                            <AppText style={styles.secondaryBtnText}>Request Pending...</AppText>
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
                            <AppText style={styles.primaryBtnText}>Accept Request</AppText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.secondaryBtn, { backgroundColor: '#ff4444', borderColor: '#ff4444' }]}
                            onPress={handleRejectRequest}
                            activeOpacity={0.8}
                        >
                            <AppText style={[styles.secondaryBtnText, { color: '#fff' }]}>Decline</AppText>
                        </TouchableOpacity>
                    </View>
                );
            }
        }

        if (friendshipStatus.status === 'friends') {
            return (
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.primaryBtn, { flexDirection: 'row', gap: 8 }]}
                        onPress={() => router.push({
                            pathname: '/screens/stats',
                            params: {
                                id: user._id,
                                name: user.name,
                                email: user.email,
                                profile_code: user.profile_code,
                                username: user.username,
                            }
                        })}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="stats-chart" size={18} color="#000" />
                        <AppText style={styles.primaryBtnText}>View Stats</AppText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.secondaryBtn}
                        onPress={handleRemoveFriend}
                        activeOpacity={0.8}
                    >
                        <AppText style={styles.secondaryBtnText}>Remove Friend</AppText>
                    </TouchableOpacity>
                </View>
            );
        }

        return null;
    };

    // Show loading state while fetching user data
    if (fetchedUser === undefined) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                    <ActivityIndicator size="large" color={NEON} />
                    <AppText style={{ color: '#666', marginTop: 12 }}>Loading profile...</AppText>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>

            <View style={styles.container}>
                <ScrollView contentContainerStyle={styles.scroll}>
                    {/* Header */}
                    <View style={styles.headerRow}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <AppText style={styles.headerTitle}>Profile</AppText>
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
                            <AppText style={styles.name}>{user.name}</AppText>
                            {user.badge ? <AppText style={{ fontSize: 18 }}>{user.badge}</AppText> : null}
                        </View>
                        <AppText style={styles.username}>@{user.username}</AppText>
                        <AppText style={styles.bio}>{user.bio}</AppText>

                        {/* Friend Actions */}
                        {renderFriendActions()}
                    </View>

                    {/* Stats Section */}
                    <View style={styles.statsRow}>
                        <View style={styles.statBox}>
                            <AppText style={styles.statNumber}>{gridSquares.filter(s => s.filled).length}</AppText>
                            <AppText style={styles.statLabel}>Wakeups</AppText>
                        </View>
                        <View style={styles.statBox}>
                            <AppText style={styles.statNumber}>{user.streak}</AppText>
                            <AppText style={styles.statLabel}>Streak</AppText>
                        </View>
                        <View style={styles.statBox}>
                            <AppText style={styles.statNumber}>{user.maxStreak}</AppText>
                            <AppText style={styles.statLabel}>Best</AppText>
                        </View>
                    </View>

                    {/* Wake History */}
                    <View style={styles.sectionHeaderRow}>
                        <AppText style={styles.sectionTitle}>Wake History</AppText>
                        <TouchableOpacity activeOpacity={0.8}>
                            <AppText style={styles.viewAllText}>Last 90 days</AppText>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.historySubHeader}>
                        <AppText style={styles.monthText}>
                            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </AppText>
                        <View style={styles.legend}>
                            <AppText style={styles.legendText}>Less</AppText>
                            <View style={styles.legendSquare1} />
                            <View style={styles.legendSquare2} />
                            <View style={styles.legendSquare3} />
                            <View style={styles.legendSquare4} />
                            <AppText style={styles.legendText}>More</AppText>
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
                        <AppText style={styles.sectionTitle}>Achievements</AppText>
                        <AppText style={styles.achCount}>12/48 Unlocked</AppText>
                    </View>

                    <View style={styles.achRow}>
                        {achievements.map((a, idx) => {
                            const achieved = a.key !== 'locked';
                            return (
                                <View key={a.key} style={styles.achItem}>
                                    <View style={[styles.achCircle, achieved && styles.achievedRing]}>
                                        <Ionicons name={a.icon} size={22} color={achieved ? NEON : GRAY} />
                                    </View>
                                    <AppText style={styles.achLabel}>{a.label}</AppText>
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