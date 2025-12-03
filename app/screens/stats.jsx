import { Ionicons } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
                    <Text style={styles.loadingText}>Loading stats...</Text>
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
                    <Text style={styles.headerTitle}>Buddy Stats</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Buddy Info Card */}
                <View style={styles.buddyCard}>
                    <View style={styles.buddyAvatarRow}>
                        <View style={styles.avatarRing}>
                            <ProfilePic user={currentUser} size={50} />
                        </View>
                        <View style={styles.heartContainer}>
                            <Ionicons name="heart" size={24} color={NEON} />
                        </View>
                        <View style={styles.avatarRing}>
                            <ProfilePic user={buddy} size={50} />
                        </View>
                    </View>
                    <Text style={styles.buddyNames}>
                        You & {buddy.name}
                    </Text>
                    <Text style={styles.buddySubtitle}>Wake-up buddies</Text>
                </View>

                {/* Overview Stats */}
                <Text style={styles.sectionTitle}>Overview</Text>
                <View style={styles.overviewGrid}>
                    <View style={styles.overviewCard}>
                        <Ionicons name="sunny" size={28} color={NEON} />
                        <Text style={styles.overviewValue}>{buddyStats.totalWakeups}</Text>
                        <Text style={styles.overviewLabel}>Total Wakeups</Text>
                    </View>
                    <View style={styles.overviewCard}>
                        <Ionicons name="time" size={28} color={NEON} />
                        <Text style={styles.overviewValue}>{totalTime.value}</Text>
                        <Text style={styles.overviewLabel}>{totalTime.unit} together</Text>
                    </View>
                    <View style={styles.overviewCard}>
                        <Ionicons name="flame" size={28} color={NEON} />
                        <Text style={styles.overviewValue}>{buddyStats.currentStreak}</Text>
                        <Text style={styles.overviewLabel}>Current Streak</Text>
                    </View>
                    <View style={styles.overviewCard}>
                        <Ionicons name="trophy" size={28} color={NEON} />
                        <Text style={styles.overviewValue}>{buddyStats.bestStreak}</Text>
                        <Text style={styles.overviewLabel}>Best Streak</Text>
                    </View>
                </View>

                {/* Call Stats */}
                <Text style={styles.sectionTitle}>Call Statistics</Text>
                <View style={styles.callStatsCard}>
                    <View style={styles.callStatRow}>
                        <View style={styles.callStatItem}>
                            <Ionicons name="timer-outline" size={20} color={GRAY} />
                            <Text style={styles.callStatLabel}>Average Call</Text>
                        </View>
                        <Text style={styles.callStatValue}>{formatDuration(buddyStats.averageCallTime)}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.callStatRow}>
                        <View style={styles.callStatItem}>
                            <Ionicons name="ribbon-outline" size={20} color={GRAY} />
                            <Text style={styles.callStatLabel}>Longest Call</Text>
                        </View>
                        <Text style={styles.callStatValue}>{formatDuration(buddyStats.longestCall)}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.callStatRow}>
                        <View style={styles.callStatItem}>
                            <Ionicons name="hourglass-outline" size={20} color={GRAY} />
                            <Text style={styles.callStatLabel}>Total Time</Text>
                        </View>
                        <Text style={styles.callStatValue}>{formatDuration(buddyStats.totalCallTime)}</Text>
                    </View>
                </View>

                {/* Monthly Stats */}
                {buddyStats.monthlyStats.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>Monthly Breakdown</Text>
                        <View style={styles.monthlyCard}>
                            {buddyStats.monthlyStats.slice(0, 6).map((month, index) => (
                                <View key={month.month} style={styles.monthRow}>
                                    <Text style={styles.monthLabel}>{month.label}</Text>
                                    <View style={styles.monthStats}>
                                        <View style={styles.monthStatItem}>
                                            <Ionicons name="sunny" size={14} color={NEON} />
                                            <Text style={styles.monthStatText}>{month.wakeups}</Text>
                                        </View>
                                        <View style={styles.monthStatItem}>
                                            <Ionicons name="time" size={14} color={GRAY} />
                                            <Text style={styles.monthStatText}>{formatDuration(month.callTime)}</Text>
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
                        <Text style={styles.sectionTitle}>Recent Days</Text>
                        <View style={styles.dailyCard}>
                            {buddyStats.dailyStats.slice(0, 7).map((day, index) => (
                                <View key={day.date} style={styles.dayRow}>
                                    <Text style={styles.dayLabel}>{day.label}</Text>
                                    <View style={styles.dayStats}>
                                        <View style={[styles.dayBadge, day.wakeups > 0 && styles.dayBadgeActive]}>
                                            <Text style={[styles.dayBadgeText, day.wakeups > 0 && styles.dayBadgeTextActive]}>
                                                {day.wakeups} {day.wakeups === 1 ? 'wakeup' : 'wakeups'}
                                            </Text>
                                        </View>
                                        <Text style={styles.dayTime}>{formatDuration(day.callTime)}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </>
                )}

                {/* Recent Calls */}
                {buddyStats.recentCalls.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>Recent Wake-ups Together</Text>
                        <View style={styles.recentCard}>
                            {buddyStats.recentCalls.map((call, index) => (
                                <View key={call._id} style={styles.recentRow}>
                                    <View style={styles.recentIcon}>
                                        <Ionicons name="call" size={16} color={NEON} />
                                    </View>
                                    <View style={styles.recentInfo}>
                                        <Text style={styles.recentDate}>{call.formattedDate}</Text>
                                        <Text style={styles.recentDuration}>
                                            {formatDuration(call.call_duration)}
                                        </Text>
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
                        <Text style={styles.emptyTitle}>No wake-ups yet!</Text>
                        <Text style={styles.emptySubtitle}>
                            Set an alarm with {buddy.name} to start tracking your wake-up journey together.
                        </Text>
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}
