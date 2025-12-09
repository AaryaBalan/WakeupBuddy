
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from 'convex/react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, Modal, ScrollView, StatusBar, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from '../../components/AppText';
import ProfilePic from '../../components/ProfilePic';
import { useUser } from '../../contexts/UserContext';
import { api } from '../../convex/_generated/api';
import styles from "../../styles/profile.styles";
import BannerAds from '../ads/BannerAds';
import { showInterstitialAd } from '../ads/InterstitialAds';

const { width } = Dimensions.get('window');
const NEON = '#C9E265';
const BG = '#050505';
const GRAY = '#888';

export default function PublicProfile() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const { user: currentUser } = useUser();
    const [isLoading, setIsLoading] = useState(false);
    const [achievementsModalVisible, setAchievementsModalVisible] = useState(false);

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

    // Fetch user achievements
    const achievementsWithStatus = useQuery(
        api.achievements.getUserAchievementsWithStatus,
        params.id ? { userId: params.id } : 'skip'
    );

    // Get achievement count
    const achievementCount = useQuery(
        api.achievements.getAchievementCount,
        params.id ? { userId: params.id } : 'skip'
    );

    // Get profile stats (includes total wakeups)
    const profileStats = useQuery(
        api.streaks.getProfileStatsById,
        params.id ? { userId: params.id } : 'skip'
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
                        onPress={showUserStats}
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
                        <AppText style={styles.secondaryBtnText}>Remove</AppText>
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

    // show stats
    const showUserStats = () => {
        showInterstitialAd(() => {
            router.push({
                pathname: '/screens/stats',
                params: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    profile_code: user.profile_code,
                    username: user.username,
                }
            })
        })
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#050505" />
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
                            <ProfilePic user={user} size={88} />
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
                        <AppText style={styles.statNumber}>{profileStats?.totalWakeups || recentStreaks?.length || 0}</AppText>
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
                        <View style={[styles.legendSquare, { backgroundColor: '#1A1A1A' }]} />
                        <View style={[styles.legendSquare, { backgroundColor: '#2d4a2d' }]} />
                        <View style={[styles.legendSquare, { backgroundColor: '#6a9a3d' }]} />
                        <View style={[styles.legendSquare, { backgroundColor: NEON }]} />
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
                    <AppText style={styles.achCount}>
                        {achievementCount ? `${achievementCount.earned}/${achievementCount.total}` : '0/0'} Unlocked
                    </AppText>
                </View>

                <View style={styles.achRow}>
                    {achievementsWithStatus ? (
                        <>
                            {achievementsWithStatus.slice(0, 3).map((achievement) => (
                                <View key={achievement.type} style={styles.achItem}>
                                    <View style={[styles.achCircle, achievement.earned && styles.achievedRing]}>
                                        <Ionicons
                                            name={achievement.earned ? achievement.icon : 'lock-closed'}
                                            size={24}
                                            color={achievement.earned ? NEON : GRAY}
                                        />
                                    </View>
                                    <AppText style={styles.achLabel} numberOfLines={2}>
                                        {achievement.earned ? achievement.name : 'Locked'}
                                    </AppText>
                                </View>
                            ))}
                            {/* 4th item - Arrow to open modal */}
                            <TouchableOpacity
                                style={styles.achItem}
                                onPress={() => setAchievementsModalVisible(true)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.achCircleArrow}>
                                    <Ionicons name="chevron-forward" size={24} color={NEON} />
                                </View>
                                <AppText style={styles.achLabelMore}>See All</AppText>
                            </TouchableOpacity>
                        </>
                    ) : (
                        // Default placeholder achievements while loading
                        <>
                            {[
                                { key: '7day', label: '7 Day Streak', icon: 'flame' },
                                { key: 'early', label: 'Early Bird', icon: 'sunny' },
                                { key: 'help5', label: 'First Buddy', icon: 'people' },
                            ].map((a) => (
                                <View key={a.key} style={styles.achItem}>
                                    <View style={styles.achCircle}>
                                        <Ionicons name={a.icon} size={24} color={GRAY} />
                                    </View>
                                    <AppText style={styles.achLabel}>{a.label}</AppText>
                                </View>
                            ))}
                            {/* 4th item - Arrow placeholder */}
                            <View style={styles.achItem}>
                                <View style={styles.achCircleArrow}>
                                    <Ionicons name="chevron-forward" size={24} color={NEON} />
                                </View>
                                <AppText style={styles.achLabelMore}>See All</AppText>
                            </View>
                        </>
                    )}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Achievements Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={achievementsModalVisible}
                onRequestClose={() => setAchievementsModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.achievementsModalContent}>
                        <View style={styles.modalHeader}>
                            <View>
                                <AppText style={styles.modalTitle}>{user.name}'s Achievements</AppText>
                                <AppText style={styles.achModalSubtitle}>
                                    {achievementCount ? `${achievementCount.earned} of ${achievementCount.total} unlocked` : '0 of 0 unlocked'}
                                </AppText>
                            </View>
                            <TouchableOpacity onPress={() => setAchievementsModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.achievementsList} showsVerticalScrollIndicator={false}>
                            {achievementsWithStatus && achievementsWithStatus.length > 0 ? (
                                achievementsWithStatus.map((achievement) => (
                                    <View
                                        key={achievement.type}
                                        style={[
                                            styles.achievementModalItem,
                                            !achievement.earned && styles.achievementModalItemLocked
                                        ]}
                                    >
                                        <View style={[
                                            styles.achModalCircle,
                                            achievement.earned && styles.achModalCircleEarned
                                        ]}>
                                            <Ionicons
                                                name={achievement.icon}
                                                size={28}
                                                color={achievement.earned ? NEON : '#666'}
                                            />
                                        </View>
                                        <View style={styles.achModalInfo}>
                                            <AppText style={[
                                                styles.achModalName,
                                                !achievement.earned && styles.achModalNameLocked
                                            ]}>
                                                {achievement.name}
                                            </AppText>
                                            <AppText style={[
                                                styles.achModalDesc,
                                                !achievement.earned && styles.achModalDescLocked
                                            ]}>
                                                {achievement.description}
                                            </AppText>
                                            {achievement.earned && achievement.earnedAt && (
                                                <AppText style={styles.achModalDate}>
                                                    Earned {new Date(achievement.earnedAt).toLocaleDateString()}
                                                </AppText>
                                            )}
                                        </View>
                                        {achievement.earned ? (
                                            <Ionicons name="checkmark-circle" size={24} color={NEON} />
                                        ) : (
                                            <Ionicons name="lock-closed" size={22} color="#666" />
                                        )}
                                    </View>
                                ))
                            ) : (
                                <View style={styles.emptyAchievements}>
                                    <Ionicons name="trophy-outline" size={60} color={GRAY} />
                                    <AppText style={styles.emptyAchievementsText}>Loading achievements...</AppText>
                                </View>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
            <BannerAds />
        </SafeAreaView>
    );
}