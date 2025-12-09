
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, StatusBar, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from '../../components/AppText';
import ProfilePic from '../../components/ProfilePic';
import { useUser } from '../../contexts/UserContext';
import { api } from '../../convex/_generated/api';
import styles from '../../styles/rank.styles';

const NEON = '#C9E265';
const GRAY = '#888';

export default function RankScreen() {
    const router = useRouter();
    const { user } = useUser();
    const [activeTab, setActiveTab] = useState('global'); // 'global', 'friends', 'daily'

    // Fetch leaderboard data from Convex
    const leaderboardData = useQuery(
        activeTab === 'friends'
            ? api.leaderboard.getFriendsLeaderboard
            : api.leaderboard.getLeaderboard,
        activeTab === 'friends'
            ? (user?._id ? { userId: user._id, limit: 50 } : 'skip')
            : { limit: 50, period: activeTab === 'daily' ? 'daily' : 'all' }
    );

    // Fetch current user's stats
    const userStats = useQuery(
        api.leaderboard.getUserLeaderboardStats,
        user?._id ? { userId: user._id } : 'skip'
    );

    // Fetch global stats
    const globalStats = useQuery(api.leaderboard.getLeaderboardStats);

    // Format points with commas
    const formatPoints = (points) => {
        if (!points && points !== 0) return '0';
        return Math.round(points).toLocaleString();
    };

    // Format call time from seconds to readable format
    const formatCallTime = (seconds) => {
        if (!seconds) return '0m';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    };

    const handleUserPress = (item) => {
        const isCurrentUser = user?._id === item.user_id;
        if (isCurrentUser) {
            router.push('/(tabs)/profile');
        } else {
            router.push({
                pathname: `/user/${item.user_id}`,
                params: {
                    name: item.user?.name,
                    username: item.user?.username,
                    email: item.user?.email,
                    profile_code: item.user?.profile_code,
                    badge: item.current_streak >= 7 ? 'flame' : '',
                    streak: item.current_streak,
                    maxStreak: item.max_streak,
                }
            });
        }
    };

    const renderItem = ({ item, index }) => {
        // Adjust index because top 3 are in podium
        const rank = index + 4;

        const hasStreak = item.current_streak >= 7;

        // Determine what to display based on active tab
        let primaryMetric;

        if (activeTab === 'daily') {
            primaryMetric = `${item.today_wakeups || 0} wakeups today`;
        } else {
            primaryMetric = `${item.current_streak} day streak`;
        }

        const isCurrentUser = user?._id === item.user_id;

        return (
            <TouchableOpacity
                style={[styles.itemRow, isCurrentUser && { borderColor: 'rgba(201, 226, 101, 0.3)', backgroundColor: 'rgba(201, 226, 101, 0.05)' }]}
                activeOpacity={0.7}
                onPress={() => handleUserPress(item)}
            >
                <View style={styles.rankCol}>
                    <AppText style={styles.rankText}>{rank}</AppText>
                </View>

                <View style={styles.avatarCol}>
                    <ProfilePic user={item.user} size={42} />
                </View>

                <View style={styles.infoCol}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <AppText style={styles.nameText} numberOfLines={1}>{item.user?.name || 'Unknown'}</AppText>
                        {hasStreak && <Ionicons name="flame" size={14} color="#FF6B35" style={{ marginLeft: 6 }} />}
                    </View>
                    <AppText style={styles.locationText}>
                        {primaryMetric}
                    </AppText>
                </View>

                <View style={styles.pointsCol}>
                    {activeTab === 'daily' ? (
                        <>
                            <AppText style={styles.pointsText}>{item.today_wakeups || 0}</AppText>
                        </>
                    ) : (
                        <>
                            <AppText style={styles.pointsText}>{formatPoints(item.total_points)}</AppText>
                        </>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    const Podium = ({ topUsers }) => {
        if (!topUsers || topUsers.length === 0) return null;

        const first = topUsers[0];
        const second = topUsers[1];
        const third = topUsers[2];

        const renderPodiumItem = (item, rank) => {
            if (!item) return <View style={styles.podiumItem} />;

            const isFirst = rank === 1;
            const isSecond = rank === 2;
            const isThird = rank === 3;

            let ringColor = isFirst ? '#FFD700' : isSecond ? '#C0C0C0' : '#CD7F32';
            let badgeColor = ringColor;
            let baseStyle = isFirst ? styles.podiumBaseFirst : isSecond ? styles.podiumBaseSecond : styles.podiumBaseThird;

            return (
                <TouchableOpacity
                    style={[styles.podiumItem, isFirst && styles.podiumItemFirst]}
                    activeOpacity={0.8}
                    onPress={() => handleUserPress(item)}
                >
                    {isFirst && (
                        <View style={styles.podiumCrown}>
                            <Ionicons name="trophy" size={24} color="#FFD700" />
                        </View>
                    )}
                    <View style={styles.podiumAvatarContainer}>
                        <View style={[styles.podiumAvatarRing, { borderColor: ringColor }]}>
                            <ProfilePic user={item.user} size={isFirst ? 64 : 50} />
                        </View>
                        <View style={[styles.podiumRankBadge, { backgroundColor: badgeColor }]}>
                            <AppText style={styles.podiumRankText}>{rank}</AppText>
                        </View>
                    </View>
                    <AppText style={styles.podiumName} numberOfLines={1}>{item.user?.name?.split(' ')[0] || 'User'}</AppText>
                    <AppText style={styles.podiumPoints}>
                        {activeTab === 'daily' ? (item.today_wakeups || 0) : formatPoints(item.total_points)}
                    </AppText>
                </TouchableOpacity>
            );
        };

        return (
            <View style={styles.podiumContainer}>
                {renderPodiumItem(second, 2)}
                {renderPodiumItem(first, 1)}
                {renderPodiumItem(third, 3)}
            </View>
        );
    };

    const ListHeader = () => {
        const top3 = leaderboardData ? leaderboardData.slice(0, 3) : [];

        return (
            <View>
                <View style={styles.headerRow}>
                    <AppText style={styles.headerTitle}>Leaderboard</AppText>
                </View>

                {/* Tabs */}
                <View style={styles.tabsContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'global' && styles.activeTab]}
                        onPress={() => setActiveTab('global')}
                    >
                        <AppText style={activeTab === 'global' ? styles.activeTabText : styles.inactiveTabText}>Global</AppText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
                        onPress={() => setActiveTab('friends')}
                    >
                        <AppText style={activeTab === 'friends' ? styles.activeTabText : styles.inactiveTabText}>Friends</AppText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'daily' && styles.activeTab]}
                        onPress={() => setActiveTab('daily')}
                    >
                        <AppText style={activeTab === 'daily' ? styles.activeTabText : styles.inactiveTabText}>Daily</AppText>
                    </TouchableOpacity>
                </View>

                {/* Banner */}
                <View style={styles.banner}>
                    <Ionicons name="trophy-outline" size={16} color={NEON} style={{ marginRight: 8 }} />
                    <AppText style={styles.bannerText}>
                        {activeTab === 'daily'
                            ? 'Today\'s Top Risers'
                            : activeTab === 'friends'
                                ? 'Friend Competitions'
                                : 'All-Time Legends'}
                    </AppText>
                </View>

                {/* Podium */}
                {leaderboardData && leaderboardData.length > 0 && (
                    <Podium topUsers={top3} />
                )}


            </View>
        );
    };

    const ListFooter = () => (
        <View style={{ alignItems: 'center', marginTop: 10 }}>
            {leaderboardData === undefined ? (
                <ActivityIndicator size="large" color={NEON} style={{ marginVertical: 40 }} />
            ) : leaderboardData.length === 0 ? (
                <View style={{ alignItems: 'center', marginVertical: 40 }}>
                    <Ionicons name="trophy-outline" size={48} color="#333" />
                    <AppText style={{ color: '#666', marginTop: 12 }}>
                        No leaderboard data yet
                    </AppText>
                </View>
            ) : null}

            <TouchableOpacity style={styles.inviteBtn} activeOpacity={0.8}>
                <Ionicons name="share-social-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                <AppText style={styles.inviteText}>Invite Friends</AppText>
            </TouchableOpacity>
        </View>
    );

    // Calculate user's percentile
    const getUserPercentile = () => {
        if (!userStats?.rank || !globalStats?.totalUsers) return '';
        const percentile = Math.round((1 - (userStats.rank / globalStats.totalUsers)) * 100);
        return `Top ${Math.max(1, percentile)}%`;
    };

    // Calculate today's points (approximate based on recent activity)
    const getTodayPoints = () => {
        if (!userStats) return '+0 pts';
        // This would need proper tracking, for now show recent activity indicator
        const recentlyActive = userStats.last_updated && (Date.now() - userStats.last_updated < 24 * 60 * 60 * 1000);
        return recentlyActive ? '+points earned' : 'Wake up to earn!';
    };

    // Filter out top 3 for the list
    const listData = leaderboardData ? leaderboardData.slice(3) : [];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor="#050505" />
            <FlatList
                data={listData}
                renderItem={renderItem}
                keyExtractor={(item) => item._id || item.user_id}
                ListHeaderComponent={ListHeader}
                ListFooterComponent={ListFooter}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />

            {/* Sticky User Footer - Clickable to go to profile */}
            <TouchableOpacity
                style={styles.stickyFooter}
                activeOpacity={0.9}
                onPress={() => router.push('/(tabs)/profile')}
            >
                <View style={styles.footerLeft}>
                    <AppText style={styles.footerRank}>#{userStats?.rank || '-'}</AppText>
                    <ProfilePic user={user} size={36} />
                    <View>
                        <AppText style={styles.footerName}>{user?.name || 'You'}</AppText>
                        <AppText style={styles.footerPoints}>{getTodayPoints()}</AppText>
                    </View>
                </View>
                <View style={styles.footerRight}>
                    <AppText style={styles.footerTotal}>{formatPoints(userStats?.total_points)}</AppText>
                    <AppText style={styles.footerPercent}>{getUserPercentile()}</AppText>
                </View>
            </TouchableOpacity>
        </SafeAreaView>
    );
}
