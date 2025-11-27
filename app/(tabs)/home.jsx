import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '../../contexts/UserContext';

export default function HomeScreen() {
    const router = useRouter();
    const { user } = useUser();
    const [isEnabled, setIsEnabled] = useState(true);
    const toggleSwitch = () => setIsEnabled(previousState => !previousState);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <View style={styles.logoContainer}>
                            <Ionicons name="flash" size={24} color="#000" />
                        </View>
                        <Text style={styles.headerTitle}>WakeBuddy</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <TouchableOpacity
                            style={styles.notificationButton}
                            onPress={() => router.push('/screens/notifications')}
                        >
                            <Ionicons name="notifications-outline" size={24} color="#fff" />
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>2</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.profileImageContainer}
                            onPress={() => router.push('/(tabs)/profile')}
                        >
                            {user?.profileImage ? (
                                <Image
                                    source={{ uri: user.profileImage }}
                                    style={styles.profileImage}
                                />
                            ) : (
                                <View style={styles.profilePlaceholder}>
                                    <Text style={styles.profileInitials}>
                                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Streak Card */}
                <View style={styles.streakCard}>
                    <View style={styles.streakHeader}>
                        <Text style={styles.streakLabel}>Current Streak</Text>
                        <TouchableOpacity style={styles.shareBadge}>
                            <Ionicons name="share-social-outline" size={16} color="#C9E265" />
                            <Text style={styles.shareBadgeText}>Share Badge</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.streakCountContainer}>
                        <Text style={styles.streakCount}>12 days</Text>
                        <Text style={styles.fireEmoji}>🔥</Text>
                    </View>
                    <Text style={styles.streakSubtext}>You're on fire! Keep it up.</Text>
                    <View style={styles.streakProgress}>
                        {[...Array(7)].map((_, i) => (
                            <View key={i} style={[styles.progressSquare, i < 5 && styles.progressSquareActive]} />
                        ))}
                        <View style={[styles.progressSquare, styles.progressSquareInactive]} />
                        <View style={[styles.progressSquare, styles.progressSquareActive]} />
                        <View style={[styles.progressSquare, styles.progressSquareActive]} />
                        <View style={[styles.progressSquare, styles.progressSquareInactive]} />
                    </View>
                </View>

                {/* Up Next */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Up Next</Text>
                    <TouchableOpacity>
                        <Text style={styles.seeAllText}>See All</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.alarmCard}>
                    <View style={styles.alarmHeader}>
                        <Text style={styles.alarmDate}>Tomorrow, Wed</Text>
                        <View style={styles.alarmActions}>
                            <TouchableOpacity style={styles.actionButton}>
                                <Ionicons name="pencil" size={16} color="#888" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton}>
                                <Ionicons name="trash-outline" size={16} color="#888" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.timeContainer}>
                        <Text style={styles.timeText}>07:00</Text>
                        <Text style={styles.ampmText}>AM</Text>
                    </View>
                    <View style={styles.alarmFooter}>
                        <View style={styles.modeContainer}>
                            <Ionicons name="people-outline" size={20} color="#C9E265" />
                            <Text style={styles.modeText}>Wake Buddy Mode</Text>
                        </View>
                        <Switch
                            trackColor={{ false: "#333", true: "#C9E265" }}
                            thumbColor={isEnabled ? "#000" : "#f4f3f4"}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={toggleSwitch}
                            value={isEnabled}
                        />
                    </View>
                </View>

                {/* Quick Actions */}
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.quickActionsContainer}>
                    <TouchableOpacity style={styles.quickActionItem}>
                        <View style={[styles.quickActionIcon, { backgroundColor: '#2a2a1a' }]}>
                            <Ionicons name="add" size={24} color="#C9E265" />
                        </View>
                        <Text style={styles.quickActionText}>Set Alarm</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickActionItem}>
                        <View style={styles.quickActionIcon}>
                            <Ionicons name="person-outline" size={24} color="#888" />
                        </View>
                        <Text style={styles.quickActionText}>Solo Mode</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickActionItem}>
                        <View style={styles.quickActionIcon}>
                            <Ionicons name="bar-chart-outline" size={24} color="#888" />
                        </View>
                        <Text style={styles.quickActionText}>Analytics</Text>
                    </TouchableOpacity>
                </View>

                {/* Social Notification */}
                <View style={styles.socialCard}>
                    <View style={styles.socialContent}>
                        <View style={styles.socialAvatar}>
                            {/* Placeholder */}
                            <Ionicons name="person" size={20} color="#fff" />
                        </View>
                        <View style={styles.socialTextContainer}>
                            <Text style={styles.socialTitle}>Sarah just hit a 30 day streak!</Text>
                            <Text style={styles.socialSubtitle}>Send her a congratulations.</Text>
                        </View>
                        <TouchableOpacity style={styles.thumbsUpButton}>
                            <Ionicons name="thumbs-up-outline" size={20} color="#C9E265" />
                        </TouchableOpacity>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    logoContainer: {
        width: 32,
        height: 32,
        backgroundColor: '#C9E265',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    notificationButton: {
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: 'red',
        borderRadius: 10,
        width: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    profileImageContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileImage: {
        width: '100%',
        height: '100%',
        borderRadius: 16,
    },
    profilePlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#C9E265',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileInitials: {
        color: '#000',
        fontSize: 14,
        fontWeight: 'bold',
    },
    streakCard: {
        backgroundColor: '#111',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#333',
        marginBottom: 30,
    },
    streakHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    streakLabel: {
        color: '#888',
        fontSize: 14,
    },
    shareBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: '#2a2a1a',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#C9E265',
    },
    shareBadgeText: {
        color: '#C9E265',
        fontSize: 12,
        fontWeight: '600',
    },
    streakCountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 5,
    },
    streakCount: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#fff',
    },
    fireEmoji: {
        fontSize: 32,
    },
    streakSubtext: {
        color: '#888',
        fontSize: 14,
        marginBottom: 20,
    },
    streakProgress: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    progressSquare: {
        width: 25,
        height: 25,
        borderRadius: 4,
        backgroundColor: '#222',
    },
    progressSquareActive: {
        backgroundColor: '#C9E265',
    },
    progressSquareInactive: {
        backgroundColor: '#222',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    seeAllText: {
        color: '#C9E265',
        fontSize: 14,
    },
    alarmCard: {
        backgroundColor: '#000', // Or slightly lighter if needed, but design looks black/dark
        borderRadius: 20,
        padding: 20,
        marginBottom: 30,
        // Add subtle shadow or border if needed to separate from background
        borderWidth: 1,
        borderColor: '#222',
    },
    alarmHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    alarmDate: {
        color: '#888',
        fontSize: 14,
    },
    alarmActions: {
        flexDirection: 'row',
        gap: 10,
    },
    actionButton: {
        padding: 5,
        backgroundColor: '#1a1a1a',
        borderRadius: 8,
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 20,
    },
    timeText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#fff',
    },
    ampmText: {
        fontSize: 20,
        color: '#888',
        marginLeft: 10,
    },
    alarmFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    modeText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    quickActionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
        marginTop: 15,
    },
    quickActionItem: {
        backgroundColor: '#111',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        width: '30%',
        aspectRatio: 1,
        justifyContent: 'center',
    },
    quickActionIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#1a1a1a',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    quickActionText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    socialCard: {
        backgroundColor: '#111',
        borderRadius: 20,
        padding: 15,
        marginBottom: 20,
    },
    socialContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    socialAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#333', // Placeholder image bg
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    socialTextContainer: {
        flex: 1,
    },
    socialTitle: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    socialSubtitle: {
        color: '#888',
        fontSize: 12,
    },
    thumbsUpButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1a1a1a', // Darker background for button
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333',
    },
});
