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

    const renderItem = ({ item, index }) => {
        const rank = index + 1;
        let rankIcon;
        // Distinct styling for top 3
        if (rank === 1) rankIcon = <Ionicons name="trophy" size={22} color="#FFD700" />; // Gold
        else if (rank === 2) rankIcon = <Ionicons name="medal" size={22} color="#C0C0C0" />; // Silver
        else if (rank === 3) rankIcon = <Ionicons name="medal" size={22} color="#CD7F32" />; // Bronze
        else rankIcon = <AppText style={styles.rankText}>{rank}</AppText>;

        const hasStreak = item.current_streak >= 7;

        // Determine what to display based on active tab
        let primaryMetric, secondaryMetric;

        if (activeTab === 'daily') {
            // Daily tab: Show today's wake-ups and today's call time
            primaryMetric = `${item.today_wakeups || 0} wakeups today`;
            secondaryMetric = `${formatCallTime(item.today_call_time)} call time`;
        } else {
            // Global tab: Show streak and total stats
            primaryMetric = `${item.current_streak} day streak`;
            secondaryMetric = `${formatCallTime(item.total_call_time)} total calls`;
        }

        // Check if this is the current user
        const isCurrentUser = user?._id === item.user_id;

        const handlePress = () => {
            if (isCurrentUser) {
                // Go to own profile tab
                router.push('/(tabs)/profile');
            } else {
                // Go to public profile
                router.push({
                    pathname: `/user/${item.user_id}`,
                    params: {
                        name: item.user?.name,
                        username: item.user?.username,
                        email: item.user?.email,
                        profile_code: item.user?.profile_code,
                        badge: hasStreak ? 'flame' : '',
                        streak: item.current_streak,
                        maxStreak: item.max_streak,
                    }
                });
            }
        };

        return (
            <TouchableOpacity
                style={[styles.itemRow, isCurrentUser && { borderColor: 'rgba(201, 226, 101, 0.3)', backgroundColor: 'rgba(201, 226, 101, 0.05)' }]}
                activeOpacity={0.7}
                onPress={handlePress}
            >
                <View style={styles.rankCol}>{rankIcon}</View>

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
                            {rank <= 3 && <AppText style={styles.ptsLabel}>wakeups</AppText>}
                        </>
                    ) : (
                        <>
                            <AppText style={styles.pointsText}>{formatPoints(item.total_points)}</AppText>
                            {rank <= 3 && <AppText style={styles.ptsLabel}>pts</AppText>}
                        </>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    const ListHeader = () => (
        <View>
            <View style={styles.headerRow}>
                <AppText style={styles.headerTitle}>Leaderboard</AppText>
                {/* Removed info icon for cleaner look */}
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

            {/* Stats Banner */}
            {globalStats && (
                <View style={styles.statsBanner}>
                    <View style={styles.statItem}>
                        <AppText style={styles.statValue}>{globalStats.totalUsers}</AppText>
                        <AppText style={styles.statLabel}>Players</AppText>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <AppText style={styles.statValue}>{formatPoints(globalStats.totalPoints)}</AppText>
                        <AppText style={styles.statLabel}>Total Pts</AppText>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <AppText style={styles.statValue}>{globalStats.highestStreak}</AppText>
                        <AppText style={styles.statLabel}>Top Streak</AppText>
                    </View>
                </View>
            )}
        </View>
    );

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

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor="#050505" />
            <FlatList
                data={leaderboardData || []}
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
