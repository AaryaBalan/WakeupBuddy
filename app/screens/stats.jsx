import { Ionicons } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Dimensions, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from '../../components/AppText';
import ProfilePic from '../../components/ProfilePic';
import { useUser } from '../../contexts/UserContext';
import { api } from '../../convex/_generated/api';
import styles from '../../styles/stats.styles';

const { width } = Dimensions.get('window');
const NEON = '#C9E265';
const GRAY = '#BDBDBD';
const BUDDY_COLOR = '#FF6B9D';

export default function BuddyStats() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const { user: currentUser } = useUser();

    // Buddy info from params
    const buddy = {
        _id: params.id,
        name: params.name || 'Buddy',
        email: params.email || '',
        profile_code: params.profile_code || params.email,
        username: params.username || '',
    };

    // Fetch buddy stats
    const buddyStats = useQuery(
        api.calls.getBuddyStats,
        currentUser?.email && buddy.email
            ? { user1Email: currentUser.email, user2Email: buddy.email }
            : 'skip'
    );

    // Fetch comparison stats for charts
    const comparisonStats = useQuery(
        api.calls.getComparisonStats,
        currentUser?.email && buddy.email
            ? { user1Email: currentUser.email, user2Email: buddy.email }
            : 'skip'
    );

    // Format duration in seconds to readable format
    const formatDuration = (seconds) => {
        if (!seconds || seconds === 0) return '0s';
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hrs > 0) {
            return `${hrs}h ${mins}m`;
        } else if (mins > 0) {
            return `${mins}m ${secs}s`;
        }
        return `${secs}s`;
    };

    // Format total time for big display
    const formatTotalTime = (seconds) => {
        if (!seconds || seconds === 0) return { value: '0', unit: 'minutes' };
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);

        if (hrs > 0) {
            return { value: hrs.toString(), unit: hrs === 1 ? 'hour' : 'hours' };
        }
        return { value: mins.toString(), unit: mins === 1 ? 'minute' : 'minutes' };
    };

    if (!buddyStats) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={NEON} />
                    <AppText style={styles.loadingText}>Loading stats...</AppText>
                </View>
            </SafeAreaView>
        );
    }

    const totalTime = formatTotalTime(buddyStats.totalCallTime);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
                {/* Header */}
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <AppText style={styles.headerTitle}>Buddy Stats</AppText>
                    <View style={{ width: 40 }} />
                </View>

                {/* Buddy Info Card */}
                <View style={styles.buddyCard}>
                    <View style={styles.buddyAvatarRow}>
                        <View style={styles.avatarRing}>
                            <ProfilePic user={currentUser} size={100} />
                        </View>
                        <View style={styles.heartContainer}>
                            <Ionicons name="heart" size={24} color={NEON} />
                        </View>
                        <View style={styles.avatarRing}>
                            <ProfilePic user={buddy} size={100} />
                        </View>
                    </View>
                    <AppText style={styles.buddyNames}>
                        You & {buddy.name}
                    </AppText>
                    <AppText style={styles.buddySubtitle}>Wake-up buddies</AppText>
                </View>

                {/* Overview Stats */}
                <AppText style={styles.sectionTitle}>Overview</AppText>
                <View style={styles.overviewGrid}>
                    <View style={styles.overviewCard}>
                        <Ionicons name="sunny" size={28} color={NEON} />
                        <AppText style={styles.overviewValue}>{buddyStats.totalWakeups}</AppText>
                        <AppText style={styles.overviewLabel}>Total Wakeups</AppText>
                    </View>
                    <View style={styles.overviewCard}>
                        <Ionicons name="time" size={28} color={NEON} />
                        <AppText style={styles.overviewValue}>{totalTime.value}</AppText>
                        <AppText style={styles.overviewLabel}>{totalTime.unit} together</AppText>
                    </View>
                    <View style={styles.overviewCard}>
                        <Ionicons name="flame" size={28} color={NEON} />
                        <AppText style={styles.overviewValue}>{buddyStats.currentStreak}</AppText>
                        <AppText style={styles.overviewLabel}>Current Streak</AppText>
                    </View>
                    <View style={styles.overviewCard}>
                        <Ionicons name="trophy" size={28} color={NEON} />
                        <AppText style={styles.overviewValue}>{buddyStats.bestStreak}</AppText>
                        <AppText style={styles.overviewLabel}>Best Streak</AppText>
                    </View>
                </View>

                {/* Weekly Comparison Chart */}
                {comparisonStats && comparisonStats.weeklyComparison && (
                    <>
                        <AppText style={styles.sectionTitle}>Weekly Comparison</AppText>
                        <View style={styles.comparisonLegend}>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: NEON }]} />
                                <AppText style={styles.legendLabel}>You</AppText>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: BUDDY_COLOR }]} />
                                <AppText style={styles.legendLabel}>{buddy.name?.split(' ')[0] || 'Buddy'}</AppText>
                            </View>
                        </View>
                        <View style={styles.comparisonChartContainer}>
                            {comparisonStats.weeklyComparison.map((day, index) => {
                                const maxCount = Math.max(
                                    ...comparisonStats.weeklyComparison.map(d => Math.max(d.user1Count, d.user2Count)),
                                    1
                                );
                                const user1Height = day.user1Count > 0 ? Math.max((day.user1Count / maxCount) * 70, 8) : 4;
                                const user2Height = day.user2Count > 0 ? Math.max((day.user2Count / maxCount) * 70, 8) : 4;
                                const isToday = index === 6;

                                return (
                                    <View key={day.date} style={styles.comparisonBarColumn}>
                                        <View style={styles.comparisonBarsRow}>
                                            <View style={styles.comparisonBarTrack}>
                                                <View
                                                    style={[
                                                        styles.comparisonBar,
                                                        { height: user1Height, backgroundColor: day.user1Count > 0 ? NEON : '#1a1a1a' },
                                                    ]}
                                                />
                                            </View>
                                            <View style={styles.comparisonBarTrack}>
                                                <View
                                                    style={[
                                                        styles.comparisonBar,
                                                        { height: user2Height, backgroundColor: day.user2Count > 0 ? BUDDY_COLOR : '#1a1a1a' },
                                                    ]}
                                                />
                                            </View>
                                        </View>
                                        <AppText style={[styles.comparisonDayLabel, isToday && styles.comparisonDayLabelToday]}>
                                            {day.dayName}
                                        </AppText>
                                    </View>
                                );
                            })}
                        </View>
                    </>
                )}

                {/* Individual Stats Comparison */}
                {comparisonStats && (
                    <>
                        <AppText style={styles.sectionTitle}>Stats Comparison</AppText>
                        <View style={styles.statsComparisonCard}>
                            {/* Streak Comparison */}
                            <View style={styles.statCompareRow}>
                                <AppText style={styles.statCompareLabel}>Current Streak</AppText>
                                <View style={styles.statCompareValues}>
                                    <View style={styles.statCompareItem}>
                                        <AppText style={[styles.statCompareValue, { color: NEON }]}>
                                            {comparisonStats.user1Stats?.streak || 0}
                                        </AppText>
                                        <AppText style={styles.statCompareUser}>You</AppText>
                                    </View>
                                    <View style={styles.statCompareDivider} />
                                    <View style={styles.statCompareItem}>
                                        <AppText style={[styles.statCompareValue, { color: BUDDY_COLOR }]}>
                                            {comparisonStats.user2Stats?.streak || 0}
                                        </AppText>
                                        <AppText style={styles.statCompareUser}>{buddy.name?.split(' ')[0]}</AppText>
                                    </View>
                                </View>
                            </View>

                            {/* Max Streak Comparison */}
                            <View style={styles.statCompareRow}>
                                <AppText style={styles.statCompareLabel}>Best Streak</AppText>
                                <View style={styles.statCompareValues}>
                                    <View style={styles.statCompareItem}>
                                        <AppText style={[styles.statCompareValue, { color: NEON }]}>
                                            {comparisonStats.user1Stats?.maxStreak || 0}
                                        </AppText>
                                        <AppText style={styles.statCompareUser}>You</AppText>
                                    </View>
                                    <View style={styles.statCompareDivider} />
                                    <View style={styles.statCompareItem}>
                                        <AppText style={[styles.statCompareValue, { color: BUDDY_COLOR }]}>
                                            {comparisonStats.user2Stats?.maxStreak || 0}
                                        </AppText>
                                        <AppText style={styles.statCompareUser}>{buddy.name?.split(' ')[0]}</AppText>
                                    </View>
                                </View>
                            </View>

                            {/* Total Wakeups Comparison */}
                            <View style={[styles.statCompareRow, { borderBottomWidth: 0 }]}>
                                <AppText style={styles.statCompareLabel}>Total Wakeups</AppText>
                                <View style={styles.statCompareValues}>
                                    <View style={styles.statCompareItem}>
                                        <AppText style={[styles.statCompareValue, { color: NEON }]}>
                                            {comparisonStats.user1Stats?.totalWakeups || 0}
                                        </AppText>
                                        <AppText style={styles.statCompareUser}>You</AppText>
                                    </View>
                                    <View style={styles.statCompareDivider} />
                                    <View style={styles.statCompareItem}>
                                        <AppText style={[styles.statCompareValue, { color: BUDDY_COLOR }]}>
                                            {comparisonStats.user2Stats?.totalWakeups || 0}
                                        </AppText>
                                        <AppText style={styles.statCompareUser}>{buddy.name?.split(' ')[0]}</AppText>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </>
                )}

                {/* Call Stats */}
                <AppText style={styles.sectionTitle}>Call Statistics</AppText>
                <View style={styles.callStatsCard}>
                    <View style={styles.callStatRow}>
                        <View style={styles.callStatItem}>
                            <Ionicons name="timer-outline" size={20} color={GRAY} />
                            <AppText style={styles.callStatLabel}>Average Call</AppText>
                        </View>
                        <AppText style={styles.callStatValue}>{formatDuration(buddyStats.averageCallTime)}</AppText>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.callStatRow}>
                        <View style={styles.callStatItem}>
                            <Ionicons name="ribbon-outline" size={20} color={GRAY} />
                            <AppText style={styles.callStatLabel}>Longest Call</AppText>
                        </View>
                        <AppText style={styles.callStatValue}>{formatDuration(buddyStats.longestCall)}</AppText>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.callStatRow}>
                        <View style={styles.callStatItem}>
                            <Ionicons name="hourglass-outline" size={20} color={GRAY} />
                            <AppText style={styles.callStatLabel}>Total Time</AppText>
                        </View>
                        <AppText style={styles.callStatValue}>{formatDuration(buddyStats.totalCallTime)}</AppText>
                    </View>
                </View>

                {/* Monthly Stats */}
                {buddyStats.monthlyStats.length > 0 && (
                    <>
                        <AppText style={styles.sectionTitle}>Monthly Breakdown</AppText>
                        <View style={styles.monthlyCard}>
                            {buddyStats.monthlyStats.slice(0, 6).map((month, index) => (
                                <View key={month.month} style={styles.monthRow}>
                                    <AppText style={styles.monthLabel}>{month.label}</AppText>
                                    <View style={styles.monthStats}>
                                        <View style={styles.monthStatItem}>
                                            <Ionicons name="sunny" size={14} color={NEON} />
                                            <AppText style={styles.monthStatText}>{month.wakeups}</AppText>
                                        </View>
                                        <View style={styles.monthStatItem}>
                                            <Ionicons name="time" size={14} color={GRAY} />
                                            <AppText style={styles.monthStatText}>{formatDuration(month.callTime)}</AppText>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </>
                )}

                {/* Daily Stats (Last 7 days) */}
                {buddyStats.dailyStats.length > 0 && (
                    <>
                        <AppText style={styles.sectionTitle}>Recent Days</AppText>
                        <View style={styles.dailyCard}>
                            {buddyStats.dailyStats.slice(0, 7).map((day, index) => (
                                <View key={day.date} style={styles.dayRow}>
                                    <AppText style={styles.dayLabel}>{day.label}</AppText>
                                    <View style={styles.dayStats}>
                                        <View style={[styles.dayBadge, day.wakeups > 0 && styles.dayBadgeActive]}>
                                            <AppText style={[styles.dayBadgeText, day.wakeups > 0 && styles.dayBadgeTextActive]}>
                                                {day.wakeups} {day.wakeups === 1 ? 'wakeup' : 'wakeups'}
                                            </AppText>
                                        </View>
                                        <AppText style={styles.dayTime}>{formatDuration(day.callTime)}</AppText>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </>
                )}

                {/* Recent Calls */}
                {buddyStats.recentCalls.length > 0 && (
                    <>
                        <AppText style={styles.sectionTitle}>Recent Wake-ups Together</AppText>
                        <View style={styles.recentCard}>
                            {buddyStats.recentCalls.map((call, index) => (
                                <View key={call._id} style={styles.recentRow}>
                                    <View style={styles.recentIcon}>
                                        <Ionicons name="call" size={16} color={NEON} />
                                    </View>
                                    <View style={styles.recentInfo}>
                                        <AppText style={styles.recentDate}>{call.formattedDate}</AppText>
                                        <AppText style={styles.recentDuration}>
                                            {formatDuration(call.call_duration)}
                                        </AppText>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </>
                )}

                {/* Empty State */}
                {buddyStats.totalWakeups === 0 && (
                    <View style={styles.emptyState}>
                        <Ionicons name="moon-outline" size={60} color={GRAY} />
                        <AppText style={styles.emptyTitle}>No wake-ups yet!</AppText>
                        <AppText style={styles.emptySubtitle}>
                            Set an alarm with {buddy.name} to start tracking your wake-up journey together.
                        </AppText>
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}
