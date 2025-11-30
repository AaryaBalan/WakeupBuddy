import { Ionicons } from '@expo/vector-icons';
import { ConvexHttpClient } from "convex/browser";
import { useMutation, useQuery } from "convex/react";
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProfilePic from '../../components/ProfilePic';
import { usePopup } from '../../contexts/PopupContext';
import { useUser } from '../../contexts/UserContext';
import { api } from "../../convex/_generated/api";
import styles from '../../styles/home.styles';
import { makePhoneCall, requestCallPhonePermission } from '../native/AlarmNative';

// Initialize Convex HTTP client for imperative queries
const CONVEX_URL = process.env.EXPO_PUBLIC_CONVEX_URL || "";
const convexClient = new ConvexHttpClient(CONVEX_URL);

export default function HomeScreen() {
    const router = useRouter();
    const { user, updateUser } = useUser();
    const { showPopup } = usePopup();
    const [isEnabled, setIsEnabled] = useState(true);
    const toggleSwitch = () => setIsEnabled(previousState => !previousState);

    const markAwake = useMutation(api.streaks.markAwake);
    const recentStreaks = useQuery(
        api.streaks.getRecentStreaks,
        user?.email ? { userEmail: user.email, days: 10 } : "skip"
    );

    // Fetch user's alarms to find the active one with a buddy
    const alarms = useQuery(api.alarms.getAlarmsByUser, user ? { user_id: user._id } : "skip");

    // Debug: Log all alarms
    useEffect(() => {
        if (alarms) {
            console.log('📋 All alarms:', JSON.stringify(alarms, null, 2));
        }
    }, [alarms]);

    // Request CALL_PHONE permission when user is logged in
    useEffect(() => {
        if (user) {
            requestCallPhonePermission().catch(err =>
                console.log('Call permission request declined or failed:', err)
            );
        }
    }, [user]);

    // Find the alarm that is likely ringing (enabled and has a buddy)
    // Accept both email format (with @) or just a name
    const activeBuddyAlarm = alarms?.find(a => a.enabled && a.buddy && a.buddy.trim() !== '');

    // Fetch buddy details if we found an alarm with a buddy
    // Only if buddy looks like an email
    const buddy = useQuery(
        api.users.getUserByEmail,
        activeBuddyAlarm && activeBuddyAlarm.buddy.includes('@')
            ? { email: activeBuddyAlarm.buddy }
            : "skip"
    );

    const handleMarkAwake = async () => {
        try {
            // Check if user is authenticated
            if (!user || !user.email) {
                showPopup("Please log in first", '#FF6B6B');
                router.push('/login');
                return;
            }

            console.log('🔍 Checking for buddy to call...');
            console.log('User loaded:', !!user);
            console.log('User ID:', user._id);
            console.log('Alarms data:', alarms);
            console.log('Active buddy alarm found:', activeBuddyAlarm);
            console.log('Buddy data:', buddy);

            // Get current date in local timezone
            const now = new Date();
            const localDate = now.getFullYear() + '-' +
                String(now.getMonth() + 1).padStart(2, '0') + '-' +
                String(now.getDate()).padStart(2, '0');

            console.log('Calling markAwake with date:', localDate);

            const result = await markAwake({
                userEmail: user.email,
                userDate: localDate
            });

            console.log('markAwake result:', result);

            if (result.status === 'success') {
                updateUser({ streak: result.streak, maxStreak: result.maxStreak });
                showPopup(`Streak: ${result.streak} days! 🔥 (Wakeup #${result.wakeupCount} today)`, '#4CAF50');
            } else if (result.status === 'incremented') {
                showPopup(`Wakeup #${result.wakeupCount} today! Keep it up! 💪`, '#4CAF50');
            } else {
                showPopup("Marked awake!", '#4CAF50');
            }

            // Call buddy if available
            console.log('🔍 Checking buddy alarm...');
            console.log('Active buddy alarm:', activeBuddyAlarm);
            console.log('Buddy details from DB:', buddy);

            if (buddy && buddy.phone) {
                console.log(`✅ CALLING BUDDY: ${buddy.name} at ${buddy.phone}`);
                await makePhoneCall(buddy.phone).catch(err => console.error('Call failed:', err));
            } else if (activeBuddyAlarm && activeBuddyAlarm.buddy) {
                if (activeBuddyAlarm.buddy.includes('@')) {
                    console.log('❌ Buddy email found but user has no phone number in database');
                    console.log('Buddy email:', activeBuddyAlarm.buddy);
                } else {
                    console.log('❌ Buddy is stored as NAME only, not email. Cannot fetch phone number.');
                    console.log('Buddy name:', activeBuddyAlarm.buddy);
                    console.log('💡 SOLUTION: When creating alarm, use buddy EMAIL (e.g., latha@gmail.com) not just name');
                }
            } else {
                console.log('ℹ️ No buddy alarm found');
                if (!alarms || alarms.length === 0) {
                    console.log('⚠️ WARNING: No alarms found in database. Alarms might have been deleted or user data not loaded.');
                }
            }
        } catch (error) {
            console.error("Failed to mark awake:", error);
            showPopup(error.message || "Failed to update streak", '#FF6B6B');
        }
    };


    useEffect(() => {
        const handleDeepLink = async (event) => {
            const url = event.url;
            if (url && (url.includes('alarm=dismissed') || url.includes('wakeupbuddy://awake'))) {
                console.log('Alarm dismissed via deep link, marking awake...');

                // Extract buddy email from URL if present
                const buddyMatch = url.match(/[?&]buddy=([^&]+)/);
                if (buddyMatch) {
                    const buddyEmail = decodeURIComponent(buddyMatch[1]);
                    console.log('📧 Buddy email from deep link:', buddyEmail);

                    // Fetch buddy's phone number and call them
                    if (buddyEmail && buddyEmail.includes('@')) {
                        try {
                            const buddyUser = await convexClient.query(api.users.getUserByEmail, { email: buddyEmail });
                            if (buddyUser && buddyUser.phone) {
                                console.log(`✅ CALLING BUDDY: ${buddyUser.name} at ${buddyUser.phone}`);
                                await makePhoneCall(buddyUser.phone).catch(err => console.error('Call failed:', err));
                            } else {
                                console.log('❌ Buddy found but no phone number:', buddyEmail);
                            }
                        } catch (error) {
                            console.error('Error fetching buddy for call:', error);
                        }
                    }
                }

                // Mark awake
                handleMarkAwake();
            }
        };

        // Check if app was opened via deep link
        Linking.getInitialURL().then(async (url) => {
            if (url && (url.includes('alarm=dismissed') || url.includes('wakeupbuddy://awake'))) {
                console.log('App opened with alarm deep link, marking awake...');

                // Extract buddy email from URL if present
                const buddyMatch = url.match(/[?&]buddy=([^&]+)/);
                if (buddyMatch) {
                    const buddyEmail = decodeURIComponent(buddyMatch[1]);
                    console.log('📧 Buddy email from deep link:', buddyEmail);

                    // Fetch buddy's phone number and call them
                    if (buddyEmail && buddyEmail.includes('@')) {
                        try {
                            const buddyUser = await convexClient.query(api.users.getUserByEmail, { email: buddyEmail });
                            if (buddyUser && buddyUser.phone) {
                                console.log(`✅ CALLING BUDDY: ${buddyUser.name} at ${buddyUser.phone}`);
                                await makePhoneCall(buddyUser.phone).catch(err => console.error('Call failed:', err));
                            } else {
                                console.log('❌ Buddy found but no phone number:', buddyEmail);
                            }
                        } catch (error) {
                            console.error('Error fetching buddy for call:', error);
                        }
                    }
                }

                // Mark awake
                handleMarkAwake();
            }
        });

        // Listen for incoming links while app is running
        const subscription = Linking.addEventListener('url', handleDeepLink);

        return () => {
            subscription.remove();
        };
    }, []);

    useEffect(() => {
        // Check permissions when home screen loads
        const checkPerms = async () => {
            try {
                const { checkAllPermissions } = await import('../native/AlarmNative');
                const perms = await checkAllPermissions();

                if (!perms.allGranted) {
                    // Show a simple alert to guide user to permissions setup
                    setTimeout(() => {
                        Alert.alert(
                            'Setup Required',
                            'To ensure alarms work reliably in the background, please complete the permission setup.',
                            [
                                {
                                    text: 'Later',
                                    style: 'cancel'
                                },
                                {
                                    text: 'Setup Now',
                                    onPress: () => router.push('/screens/PermissionsGuide')
                                }
                            ]
                        );
                    }, 1000);
                }
            } catch (error) {
                console.error('Error checking permissions:', error);
            }
        };

        checkPerms();
    }, []);

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
                            <ProfilePic user={user} size={35} />
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
                        <Text style={styles.streakCount}>{user?.streak || 0} days</Text>
                        <Text style={styles.fireEmoji}>🔥</Text>
                    </View>
                    <Text style={styles.streakSubtext}>You're on fire! Keep it up.</Text>

                    {/* Last 10 Days Heatmap */}
                    <View style={styles.heatmapContainer}>
                        <Text style={styles.heatmapTitle}>Last 10 Days Activity</Text>
                        <View style={styles.heatmap}>
                            {(() => {
                                // Generate last 10 days
                                const days = [];
                                for (let i = 9; i >= 0; i--) {
                                    const date = new Date();
                                    date.setDate(date.getDate() - i);
                                    const dateStr = date.toISOString().split('T')[0];
                                    days.push(dateStr);
                                }

                                // Map to counts
                                return days.map((dateStr, index) => {
                                    const streakData = recentStreaks?.find(s => s.date === dateStr);
                                    const count = streakData?.count || 0;

                                    // Color based on count (matching profile page)
                                    let boxColor = '#1a1a1a'; // Grey/ash for 0
                                    if (count >= 7) boxColor = '#C9E265'; // Bright neon for 7+
                                    else if (count >= 5) boxColor = '#6a9a3d'; // Bright green for 5-6
                                    else if (count >= 3) boxColor = '#2d4a2d'; // Medium green for 3-4
                                    else if (count >= 1) boxColor = '#1a2a1a'; // Light green for 1-2

                                    return (
                                        <View key={index} style={styles.heatmapDayContainer}>
                                            <View style={[styles.heatmapBox, { backgroundColor: boxColor }]}>
                                                {count > 0 && (
                                                    <Text style={styles.heatmapCount}>{count}</Text>
                                                )}
                                            </View>
                                        </View>
                                    );
                                });
                            })()}
                        </View>
                        <View style={styles.heatmapLegend}>
                            <Text style={styles.legendText}>Less</Text>
                            <View style={[styles.legendBox, { backgroundColor: '#1a1a1a' }]} />
                            <View style={[styles.legendBox, { backgroundColor: '#2d4a2d' }]} />
                            <View style={[styles.legendBox, { backgroundColor: '#6a9a3d' }]} />
                            <View style={[styles.legendBox, { backgroundColor: '#C9E265' }]} />
                            <Text style={styles.legendText}>More</Text>
                        </View>
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
                    <TouchableOpacity style={styles.quickActionItem} onPress={handleMarkAwake}>
                        <View style={[styles.quickActionIcon, { backgroundColor: '#2a2a1a' }]}>
                            <Ionicons name="sunny" size={24} color="#C9E265" />
                        </View>
                        <Text style={styles.quickActionText}>I'm Awake</Text>
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
