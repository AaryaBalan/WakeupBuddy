import { Ionicons } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, TouchableOpacity, View } from 'react-native';
import AppText from '../../components/AppText';
import ProfilePic from '../../components/ProfilePic';
import { useUser } from '../../contexts/UserContext';
import { api } from '../../convex/_generated/api';
import styles from '../../styles/rank.styles';

const NEON = '#C9E265';
const BG = '#000';
const GRAY = '#BDBDBD';
const DARK_GRAY = '#1A1A1A';

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

    // Calculate success rate (consistency percentage)
    const getSuccessRate = (item) => {
        if (!item.total_days_active || !item.first_activity_date) return '';
        const daysSinceStart = Math.max(1, Math.ceil((Date.now() - item.first_activity_date) / (1000 * 60 * 60 * 24)));
        const rate = Math.min(100, Math.round((item.total_days_active / daysSinceStart) * 100));
        return ` • ${rate}% Success`;
    };

    const renderItem = ({ item, index }) => {
        const rank = index + 1;
        let rankIcon;
        if (rank === 1) rankIcon = <Ionicons name="trophy" size={24} color={NEON} />;
        else if (rank === 2) rankIcon = <Ionicons name="medal-outline" size={24} color="#C0C0C0" />;
        else if (rank === 3) rankIcon = <Ionicons name="medal-outline" size={24} color="#CD7F32" />;
        else rankIcon = <AppText style={styles.rankText}>{rank}</AppText>;

        const hasStreak = item.current_streak >= 7;
        const points = activeTab === 'daily' ? item.daily_points : item.total_points;

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
                style={styles.itemRow}
                activeOpacity={0.7}
                onPress={handlePress}
            >
                <View style={styles.rankCol}>{rankIcon}</View>

                <View style={styles.avatarCol}>
                    <ProfilePic user={item.user} size={44} />
                </View>

                <View style={styles.infoCol}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <AppText style={styles.nameText}>{item.user?.name || 'Unknown'}</AppText>
                        {hasStreak && <Ionicons name="flame" size={14} color="#FF6B35" style={{ marginLeft: 4 }} />}
                    </View>
                    <AppText style={styles.locationText}>
                        {item.current_streak} day streak{getSuccessRate(item)}
                    </AppText>
                </View>

                <View style={styles.pointsCol}>
                    <AppText style={styles.pointsText}>{formatPoints(points)}</AppText>
                    {rank <= 3 && <AppText style={styles.ptsLabel}>pts</AppText>}
                </View>
            </TouchableOpacity>
        );
    };

    const ListHeader = () => (
        <View>
            <View style={styles.headerRow}>
                <AppText style={styles.headerTitle}>Leaderboard</AppText>
                <Ionicons name="information-circle-outline" size={24} color={GRAY} />
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
                <Ionicons name="people-outline" size={18} color={NEON} style={{ marginRight: 8 }} />
                <AppText style={styles.bannerText}>Earn points by waking up & solving puzzles together!</AppText>
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
                        <AppText style={styles.statLabel}>Best Streak</AppText>
                    </View>
                </View>
            )}
        </View>
    );

    const ListFooter = () => (
        <View style={{ paddingBottom: 100, alignItems: 'center', marginTop: 20 }}>
            {leaderboardData === undefined ? (
                <ActivityIndicator size="large" color={NEON} style={{ marginVertical: 40 }} />
            ) : leaderboardData.length === 0 ? (
                <View style={{ alignItems: 'center', marginVertical: 40 }}>
                    <Ionicons name="trophy-outline" size={48} color="#333" />
                    <AppText style={{ color: '#666', marginTop: 12 }}>
                        No leaderboard data yet
                    </AppText>
                </View>
            ) : (
                <>
                    <View style={{ height: 4, width: 4, backgroundColor: '#333', borderRadius: 2, marginBottom: 4 }} />
                    <View style={{ height: 4, width: 4, backgroundColor: '#333', borderRadius: 2, marginBottom: 4 }} />
                    <View style={{ height: 4, width: 4, backgroundColor: '#333', borderRadius: 2 }} />
                </>
            )}

            <TouchableOpacity style={styles.inviteBtn} activeOpacity={0.8}>
                <Ionicons name="share-social-outline" size={20} color="#000" style={{ marginRight: 8 }} />
                <AppText style={styles.inviteText}>Invite Friends to Compete</AppText>
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
        if (!userStats) return '+0 pts today';
        // This would need proper tracking, for now show recent activity indicator
        const recentlyActive = userStats.last_updated && (Date.now() - userStats.last_updated < 24 * 60 * 60 * 1000);
        return recentlyActive ? '+points earned today' : 'Wake up to earn!';
    };

    return (
        <View style={styles.container}>
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
                activeOpacity={0.8}
                onPress={() => router.push('/(tabs)/profile')}
            >
                <View style={styles.footerLeft}>
                    <AppText style={styles.footerRank}>#{userStats?.rank || '-'}</AppText>
                    <ProfilePic user={user} size={40} />
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
        </View>
    );
}
