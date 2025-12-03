import { Ionicons } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from '../../components/AppText';
import ProfilePic from '../../components/ProfilePic';
import { useUser } from '../../contexts/UserContext';
import { api } from '../../convex/_generated/api';
import styles from '../../styles/stats.styles';

const NEON = '#C9E265';
const GRAY = '#BDBDBD';

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
