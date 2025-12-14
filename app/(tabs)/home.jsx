import { Ionicons } from '@expo/vector-icons';
import { ConvexHttpClient } from "convex/browser";
import { useMutation, useQuery } from "convex/react";
import * as Linking from 'expo-linking';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, StatusBar, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RNShare from 'react-native-share';
import ViewShot from 'react-native-view-shot';
import AppText from '../../components/AppText';
import ProfilePic from '../../components/ProfilePic';
import { usePopup } from '../../contexts/PopupContext';
import { useUser } from '../../contexts/UserContext';
import { api } from "../../convex/_generated/api";
import styles from '../../styles/home.styles';
import BannerAds from '../ads/BannerAds';
import AlarmScreen from '../components/AlarmScreen';
import { checkPendingCall, clearPendingCall, getLastCallDuration, getMostRecentCallDuration, makePhoneCall, requestCallPhonePermission, requestReadCallLogPermission, requestReadPhoneStatePermission, savePendingCall, subscribeToCallState } from '../native/AlarmNative';
import { showInterstitialAd } from '../ads/InterstitialAds';

// Initialize Convex HTTP client for imperative queries
const CONVEX_URL = process.env.EXPO_PUBLIC_CONVEX_URL || "";
const convexClient = new ConvexHttpClient(CONVEX_URL);

const NEON = '#C9E265';

export default function HomeScreen() {
    const router = useRouter();
    const { user, loading: userLoading, updateUser } = useUser();
    const { showPopup } = usePopup();
    const callIdRef = useRef(null);
    const lastCalledNumberRef = useRef(null);
    const callInProgressRef = useRef(false);
    const buddyEmailRef = useRef(null); // Store buddy email for streak updates after call
    const pendingAlarmRef = useRef(null);
    const streakCardRef = useRef(null);
    const [showAlarmScreen, setShowAlarmScreen] = useState(false);

    const markAwake = useMutation(api.streaks.markAwake);
    const createCall = useMutation(api.calls.createCall);
    const updateCallDuration = useMutation(api.calls.updateCallDuration);
    const markAwakeAfterCall = useMutation(api.streaks.markAwakeAfterCall);
    const recentStreaks = useQuery(
        api.streaks.getRecentStreaks,
        user?.email ? { userEmail: user.email, days: 10 } : "skip"
    );

    // Fetch user's alarms to find the active one with a buddy
    const alarms = useQuery(api.alarms.getAlarmsByUser, user ? { user_id: user._id } : "skip");

    // Fetch friends for achievements section
    const friends = useQuery(
        api.friends.getFriends,
        user?.email ? { userEmail: user.email } : "skip"
    );

    // Fetch pending notifications count
    const pendingNotificationsCount = useQuery(
        api.notifications.getPendingNotificationsCount,
        user?.email ? { userEmail: user.email } : "skip"
    );

    // Listen for call state changes to detect when call ends
    useEffect(() => {
        const unsubscribe = subscribeToCallState(async (event) => {
            console.log('Call state changed:', event);

            if (event.status === 'started' && !callInProgressRef.current) {
                callInProgressRef.current = true;
                console.log('📞 Call started, tracking...');

                // CRITICAL: If we don't have buddy email (receiving device), fetch it from the most recent call
                if (!buddyEmailRef.current && user?.email) {
                    console.log('📧 Receiving device: Fetching buddy email from recent calls...');
                    try {
                        // Get all calls for this user
                        const recentCalls = await convexClient.query(api.calls.getCallsByUser, { userEmail: user.email });

                        // Find the most recent call
                        if (recentCalls && recentCalls.length > 0) {
                            const latestCall = recentCalls[0]; // Most recent first

                            // Determine which email is the buddy (the one that's not ours)
                            const buddyEmail = latestCall.caller === user.email
                                ? latestCall.receiver
                                : latestCall.caller;

                            buddyEmailRef.current = buddyEmail;
                            callIdRef.current = latestCall._id;
                            console.log(`✅ Receiving device: Set buddy email to ${buddyEmail}`);
                            console.log(`✅ Receiving device: Set call ID to ${latestCall._id}`);
                        }
                    } catch (error) {
                        console.error('❌ Failed to fetch buddy email on receiving device:', error);
                    }
                }
            } else if (event.status === 'ended' && callInProgressRef.current) {
                callInProgressRef.current = false;
                console.log('📴 Call ended, fetching duration from call log...');

                // Wait for call log to update, then fetch duration
                setTimeout(async () => {
                    if (!callIdRef.current || !lastCalledNumberRef.current) {
                        console.log('⚠️ No call ID or phone number to update');
                        return;
                    }

                    try {
                        // First try to get duration by phone number
                        let duration = await getLastCallDuration(lastCalledNumberRef.current);
                        console.log(`Got call duration from getLastCallDuration: ${duration} seconds`);

                        // If still 0, try the most recent call as fallback
                        if (duration <= 0) {
                            console.log('Duration was 0, trying getMostRecentCallDuration as fallback...');
                            duration = await getMostRecentCallDuration();
                            console.log(`Got call duration from getMostRecentCallDuration: ${duration} seconds`);
                        }

                        if (duration > 0) {
                            await updateCallDuration({
                                callId: callIdRef.current,
                                duration: duration
                            });
                            console.log(`✅ Call duration updated in database: ${duration} seconds`);

                            // Debug: Check all conditions
                            console.log('🔍 Checking streak update conditions:');
                            console.log(`   - duration: ${duration}, >= 60 ? ${duration >= 60} `);
                            console.log(`   - buddyEmailRef.current: ${buddyEmailRef.current} `);
                            console.log(`   - user?.email: ${user?.email} `);
                            console.log(`   - All conditions met ? ${duration >= 60 && buddyEmailRef.current && user?.email} `);

                            // CRITICAL: If buddyEmailRef is not set (receiving device), fetch buddy email from call record
                            if (!buddyEmailRef.current && callIdRef.current) {
                                console.log('📧 Buddy email not set, fetching from call record...');
                                try {
                                    const callRecord = await convexClient.query(api.calls.getCallById, {
                                        callId: callIdRef.current
                                    });

                                    if (callRecord && user?.email) {
                                        const buddyEmail = callRecord.caller === user.email
                                            ? callRecord.receiver
                                            : callRecord.caller;

                                        buddyEmailRef.current = buddyEmail;
                                        console.log(`✅ Fetched buddy email from call record: ${buddyEmail}`);
                                    }
                                } catch (error) {
                                    console.error('❌ Failed to fetch buddy email from call record:', error);
                                }
                            }

                            // NEW: If call was >= 60 seconds, update streaks for both users
                            if (duration >= 60 && buddyEmailRef.current && user?.email) {
                                console.log('✅ Call >= 60s, updating streaks for both users...');
                                console.log(`📧 Buddy: ${buddyEmailRef.current}, User: ${user.email} `);
                                const localDate = new Date().toISOString().split('T')[0];
                                try {
                                    const result = await markAwakeAfterCall({
                                        user1Email: user.email,
                                        user2Email: buddyEmailRef.current,
                                        callDuration: duration,
                                        date: localDate
                                    });

                                    console.log('✅ markAwakeAfterCall result:', result);

                                    // Send system notification for successful streak update
                                    if (result.status === 'success') {
                                        const minutes = Math.floor(duration / 60);
                                        const seconds = duration % 60;
                                        const durationStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

                                        if (typeof Notifications !== 'undefined' && Notifications) {
                                            await Notifications.scheduleNotificationAsync({
                                                content: {
                                                    title: '🔥 Streak Updated!',
                                                    body: `Talked for ${durationStr}! Your streak: ${result.user1.streak} days 🎯`,
                                                    sound: true,
                                                    priority: Notifications.AndroidNotificationPriority.HIGH,
                                                },
                                                trigger: null,
                                            });
                                        }
                                    } else {
                                        if (typeof Notifications !== 'undefined' && Notifications) {
                                            await Notifications.scheduleNotificationAsync({
                                                content: {
                                                    title: '✅ Streak Updated!',
                                                    body: `Call completed successfully`,
                                                    sound: true,
                                                },
                                                trigger: null,
                                            });
                                        }
                                    }
                                } catch (error) {
                                    console.error('❌ Error updating streaks:', error);
                                    if (typeof Notifications !== 'undefined' && Notifications) {
                                        await Notifications.scheduleNotificationAsync({
                                            content: {
                                                title: '❌ Error',
                                                body: 'Failed to update streak',
                                                sound: true,
                                            },
                                            trigger: null,
                                        });
                                    }
                                }
                            } else if (duration < 60 && buddyEmailRef.current) {
                                console.log(`⏱️ Call too short (${duration}s)`);

                                // Send notification for short call
                                if (typeof Notifications !== 'undefined' && Notifications) {
                                    await Notifications.scheduleNotificationAsync({
                                        content: {
                                            title: '⏱️ Call Too Short',
                                            body: `Talked for only ${duration} sec. Need 60 sec to count streaks.`,
                                            sound: true,
                                            priority: Notifications.AndroidNotificationPriority.HIGH,
                                        },
                                        trigger: null,
                                    });
                                }
                            } else {
                                // Solo alarm or no buddy
                                console.log(`ℹ️ Conditions not met for streak update`);
                                console.log(`   - duration >= 60: ${duration >= 60} `);
                                console.log(`   - buddyEmailRef.current: ${buddyEmailRef.current} `);
                                console.log(`   - user?.email: ${user?.email} `);
                            }
                        } else {
                            console.log('❌ Could not retrieve call duration from call log');
                        }
                    } catch (error) {
                        console.error('Failed to update call duration:', error);
                    } finally {
                        // Reset refs
                        callIdRef.current = null;
                        lastCalledNumberRef.current = null;
                    }
                }, 3000); // Wait 3 seconds for call log to be updated
            }
        });

        return () => unsubscribe();
    }, [updateCallDuration, showPopup]);

    // Debug: Log all alarms
    useEffect(() => {
        if (alarms) {
            console.log('📋 All alarms:', JSON.stringify(alarms, null, 2));
        }
    }, [alarms]);

    // Request CALL_PHONE, READ_PHONE_STATE and READ_CALL_LOG permissions when user is logged in
    useEffect(() => {
        if (user) {
            // Request all permissions for calling and tracking call duration
            Promise.all([
                requestCallPhonePermission(),
                requestReadPhoneStatePermission(),
                requestReadCallLogPermission()
            ]).catch(err =>
                console.log('Permission request declined or failed:', err)
            );
        }
    }, [user]);

    // Check for call duration when app comes back to foreground (backup method)
    useEffect(() => {
        const { AppState } = require('react-native');
        let isProcessing = false;

        const handleAppStateChange = async (nextAppState) => {
            if (nextAppState === 'active' && !isProcessing) {
                isProcessing = true;
                console.log('App became active, checking for pending calls...');

                try {
                    // Check if there's a pending call to update
                    const pendingCall = await checkPendingCall();

                    if (pendingCall && pendingCall.callId) {
                        console.log('Found pending call:', pendingCall);
                        console.log('Duration from call log:', pendingCall.duration);

                        if (pendingCall.duration > 0) {
                            await updateCallDuration({
                                callId: pendingCall.callId,
                                duration: pendingCall.duration
                            });
                            console.log(`✅ Call duration updated in database: ${pendingCall.duration} seconds`);

                            // IMPORTANT: Get buddy email (works for both caller and receiver)
                            let buddyEmail = buddyEmailRef.current;

                            if (!buddyEmail && user?.email) {
                                // If buddyEmailRef is not set (receiver device), fetch from call record
                                console.log('🔍 buddyEmailRef not set, fetching buddy email from call record...');
                                try {
                                    const callRecord = await convexClient.query(api.calls.getCallById, {
                                        callId: pendingCall.callId
                                    });

                                    if (callRecord) {
                                        // Get the other user's email (not the current user)
                                        buddyEmail = callRecord.user1Email === user.email
                                            ? callRecord.user2Email
                                            : callRecord.user1Email;
                                        console.log(`✅ Found buddy email from call record: ${buddyEmail} `);
                                        // Store it for future use
                                        buddyEmailRef.current = buddyEmail;
                                    }
                                } catch (error) {
                                    console.error('Failed to fetch call record:', error);
                                }
                            }
                            // Update streaks and send notifications
                            console.log('🔍 [Second handler] Checking streak update conditions:');
                            console.log(`   - duration: ${pendingCall.duration}, >= 60 ? ${pendingCall.duration >= 60} `);
                            console.log(`   - buddyEmail: ${buddyEmail} `);
                            console.log(`   - user?.email: ${user?.email} `);

                            // CRITICAL: If buddyEmail is not set, try to fetch from call record
                            if (!buddyEmail && pendingCall.callId) {
                                console.log('📧 [Second handler] Buddy email not set, fetching from call record...');
                                try {
                                    const callRecord = await convexClient.query(api.calls.getCallById, { callId: pendingCall.callId });

                                    if (callRecord && user?.email) {
                                        buddyEmail = callRecord.caller === user.email
                                            ? callRecord.receiver
                                            : callRecord.caller;

                                        buddyEmailRef.current = buddyEmail;
                                        console.log(`✅ [Second handler] Fetched buddy email from call record: ${buddyEmail}`);
                                    }
                                } catch (error) {
                                    console.error('❌ [Second handler] Failed to fetch buddy email:', error);
                                }
                            }

                            if (pendingCall.duration >= 60 && buddyEmail && user?.email) {
                                console.log('✅ [Second handler] Call >= 60s, updating streaks...');
                                const localDate = new Date().toISOString().split('T')[0];
                                try {
                                    const result = await markAwakeAfterCall({
                                        user1Email: user.email,
                                        user2Email: buddyEmail,
                                        callDuration: pendingCall.duration,
                                        date: localDate
                                    });

                                    console.log('✅ markAwakeAfterCall result:', result);

                                    if (result.status === 'success') {
                                        const minutes = Math.floor(pendingCall.duration / 60);
                                        const seconds = pendingCall.duration % 60;
                                        const durationStr = minutes > 0 ? `${minutes}m ${seconds} s` : `${seconds} s`;

                                        // Send system notification (BOTH devices will receive this!)
                                        if (typeof Notifications !== 'undefined' && Notifications) {
                                            await Notifications.scheduleNotificationAsync({
                                                content: {
                                                    title: '🔥 Streak Updated!',
                                                    body: `Talked for ${durationStr}! Your streak: ${result.user1.streak} days 🎯`,
                                                    sound: true,
                                                    priority: Notifications.AndroidNotificationPriority.HIGH,
                                                },
                                                trigger: null, // Show immediately
                                            });
                                        }
                                    } else {
                                        if (typeof Notifications !== 'undefined' && Notifications) {
                                            await Notifications.scheduleNotificationAsync({
                                                content: {
                                                    title: '✅ Streak Updated!',
                                                    body: `Call completed successfully`,
                                                    sound: true,
                                                },
                                                trigger: null,
                                            });
                                        }
                                    }
                                } catch (error) {
                                    console.error('❌ Error updating streaks:', error);
                                    if (typeof Notifications !== 'undefined' && Notifications) {
                                        await Notifications.scheduleNotificationAsync({
                                            content: {
                                                title: '❌ Error',
                                                body: 'Failed to update streak',
                                                sound: true,
                                            },
                                            trigger: null,
                                        });
                                    }
                                }
                            } else if (pendingCall.duration < 60 && buddyEmail) {
                                console.log(`⏱️ Call too short(${pendingCall.duration}s)`);

                                // Debug: Check if Notifications is available
                                console.log(`🔔 Notifications available ? ${typeof Notifications !== 'undefined' && Notifications ? 'YES' : 'NO'} `);
                                console.log(`🔔 Notifications type: ${typeof Notifications} `);

                                // Send notification for short call (BOTH devices will receive this!)
                                if (typeof Notifications !== 'undefined' && Notifications) {
                                    console.log('📲 Sending short call notification...');
                                    await Notifications.scheduleNotificationAsync({
                                        content: {
                                            title: '⏱️ Call Too Short',
                                            body: `Talked for only ${pendingCall.duration} sec. Need 60 sec to count streaks.`,
                                            sound: true,
                                            priority: Notifications.AndroidNotificationPriority.HIGH,
                                        },
                                        trigger: null,
                                    });
                                    console.log('✅ Short call notification sent');
                                } else {
                                    console.warn('⚠️ Notifications module not available - cannot send notification');
                                }
                            } else {
                                console.log(`ℹ️[Second handler] Conditions not met`);
                                console.log(`   - buddyEmail: ${buddyEmail}, user: ${user?.email} `);
                            }

                            // Clear pending call
                            await clearPendingCall();
                            callIdRef.current = null;
                            lastCalledNumberRef.current = null;
                        } else {
                            console.log('⏳ Call duration still 0, will check again later');
                        }
                    } else if (callIdRef.current && lastCalledNumberRef.current && !callInProgressRef.current) {
                        // Fallback: use refs if pending call not found
                        console.log('No pending call found, using refs as fallback');
                        console.log('Looking for calls to number:', lastCalledNumberRef.current);
                        console.log('Call ID to update:', callIdRef.current);

                        let duration = await getLastCallDuration(lastCalledNumberRef.current);
                        console.log(`Got call duration from getLastCallDuration: ${duration} seconds`);

                        if (duration <= 0) {
                            console.log('Duration was 0, trying getMostRecentCallDuration as fallback...');
                            duration = await getMostRecentCallDuration();
                            console.log(`Got call duration from getMostRecentCallDuration: ${duration} seconds`);
                        }

                        if (duration > 0 && callIdRef.current) {
                            await updateCallDuration({
                                callId: callIdRef.current,
                                duration: duration
                            });
                            console.log(`✅ Call duration updated in database(via AppState): ${duration} seconds`);
                            showPopup(`Call duration: ${duration} seconds`, '#4CAF50');
                        }

                        callIdRef.current = null;
                        lastCalledNumberRef.current = null;
                    }
                } catch (error) {
                    console.error('Error in AppState handler:', error);
                } finally {
                    isProcessing = false;
                }
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription.remove();
    }, [updateCallDuration, showPopup]);

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

    // Check if buddy relationship is accepted (status = 1 in notifications) for THIS specific alarm
    const isBuddyRelationshipAccepted = useQuery(
        api.notifications.isBuddyAccepted,
        user && activeBuddyAlarm && activeBuddyAlarm.buddy.includes('@')
            ? {
                userEmail: user.email,
                buddyEmail: activeBuddyAlarm.buddy,
                alarmTime: activeBuddyAlarm.time,
                alarmAmpm: activeBuddyAlarm.ampm
            }
            : "skip"
    );

    const handleMarkAwake = async () => {
        try {
            // Check if user is authenticated
            if (!user || !user.email) {
                // If still loading, don't redirect - the pending alarm handler will retry
                if (userLoading) {
                    console.log('⏳ User still loading, skipping handleMarkAwake');
                    return;
                }
                showPopup("Please log in first", '#FF6B6B');
                router.push('/login');
            }

            console.log('🔍 Checking for buddy to call...');
            console.log('User loaded:', !!user);
            console.log('User ID:', user._id);
            console.log('Alarms data:', alarms);
            console.log('Active buddy alarm found:', activeBuddyAlarm);
            console.log('Buddy data:', buddy);

            // Call buddy if available AND relationship is accepted
            console.log('🔍 Checking buddy alarm...');
            console.log('Active buddy alarm:', activeBuddyAlarm);
            console.log('Buddy details from DB:', buddy);
            console.log('Buddy relationship accepted:', isBuddyRelationshipAccepted);

            if (buddy && buddy.phone && isBuddyRelationshipAccepted) {
                console.log(`✅ CALLING BUDDY: ${buddy.name} at ${buddy.phone} `);

                // Record the call in database (alarmId is required)
                try {
                    const callRecord = await createCall({
                        user1Email: user.email,
                        user2Email: buddy.email,
                        alarmId: activeBuddyAlarm._id, // Required foreign key to alarms table
                    });
                    console.log('Call record created:', callRecord);
                    // Store call ID and phone number to update duration later
                    callIdRef.current = callRecord.callId;
                    lastCalledNumberRef.current = buddy.phone;
                } catch (callError) {
                    console.error('Failed to create call record:', callError);
                }

                await makePhoneCall(buddy.phone).catch(err => console.error('Call failed:', err));
            } else if (activeBuddyAlarm && activeBuddyAlarm.buddy) {
                if (!isBuddyRelationshipAccepted) {
                    console.log('⏸️ Buddy request not accepted yet. Skipping call.');
                    console.log('💡 Buddy must accept your invitation for calls to work.');
                } else if (activeBuddyAlarm.buddy.includes('@')) {
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

    /**
     * Helper function to handle calling a buddy (either known buddy or stranger match)
     * This fetches the latest alarm data from Convex to handle stranger matching
     * @param {string} alarmTime - The alarm time (e.g., "5:43")
     * @param {string} alarmAmpm - The alarm AM/PM (e.g., "PM")
     * @param {string} alarmIdFromUrl - The alarm ID from URL
     * @param {string} buddyEmailFromUrl - The buddy email from URL
     * @param {object} currentUser - The current user object (pass explicitly to avoid stale closure)
     */
    const handleBuddyCall = async (alarmTime, alarmAmpm, alarmIdFromUrl, buddyEmailFromUrl, currentUser = null) => {
        // Use passed user or fall back to closure user
        const userToUse = currentUser || user;

        if (!userToUse || !userToUse.email) {
            console.log('❌ No user logged in, cannot handle buddy call');
            console.log('User from param:', currentUser);
            console.log('User from closure:', user);
            return;
        }

        console.log('🔄 handleBuddyCall called with:');
        console.log('  - alarmTime:', alarmTime);
        console.log('  - alarmAmpm:', alarmAmpm);
        console.log('  - alarmId:', alarmIdFromUrl);
        console.log('  - buddyEmail:', buddyEmailFromUrl);
        console.log('  - userEmail:', userToUse.email);

        try {
            let buddyEmail = buddyEmailFromUrl;
            let alarmId = alarmIdFromUrl;
            let buddyUser = null;
            let isStrangerMatch = false;

            // If no buddy in URL, check if this is a stranger match by fetching latest alarm data
            if (!buddyEmail && alarmTime && alarmAmpm) {
                console.log('🔍 No buddy in URL, checking for stranger match...');

                // Fetch the alarm with buddy details from Convex
                const alarmData = await convexClient.query(api.alarms.findAlarmByTimeForUser, {
                    userEmail: userToUse.email,
                    time: alarmTime,
                    ampm: alarmAmpm
                });

                console.log('📋 Alarm data from Convex:', alarmData);

                if (alarmData && alarmData.alarm) {
                    alarmId = alarmData.alarm._id;

                    // Check if a stranger was matched
                    if (alarmData.alarm.solo_mode === false && alarmData.alarm.buddy) {
                        buddyEmail = alarmData.alarm.buddy;
                        buddyUser = alarmData.buddyUser;
                        isStrangerMatch = alarmData.alarm.matched_at != null;
                        console.log(`🎉 Found ${isStrangerMatch ? 'STRANGER' : 'BUDDY'} match: ${buddyEmail} `);

                        // IMPORTANT: Store buddy email for call end handler
                        buddyEmailRef.current = buddyEmail;
                        console.log(`📧 Stored buddy email in ref: ${buddyEmailRef.current} `);
                    } else if (alarmData.alarm.solo_mode === false && !alarmData.alarm.buddy) {
                        console.log('😔 Stranger mode but no match found - alarm will ring solo');
                        return;
                    } else {
                        console.log('ℹ️ Solo mode alarm, no buddy to call');
                        return;
                    }
                } else {
                    console.log('❌ Could not find alarm in database');
                    return;
                }
            }

            // If we have a buddy email, proceed with the call
            if (buddyEmail && buddyEmail.includes('@')) {
                console.log(`📞 Processing call to buddy: ${buddyEmail} `);

                // For known buddy (not stranger), check if relationship is accepted
                if (!isStrangerMatch) {
                    const isAccepted = await convexClient.query(api.notifications.isBuddyAccepted, {
                        userEmail: userToUse.email,
                        buddyEmail: buddyEmail,
                        alarmTime: alarmTime,
                        alarmAmpm: alarmAmpm
                    });

                    console.log('🔍 Buddy acceptance status:', isAccepted);

                    if (!isAccepted) {
                        console.log('⏸️ Buddy request not accepted yet. Skipping call.');
                        return;
                    }
                }

                // Get buddy user details if not already fetched
                if (!buddyUser) {
                    buddyUser = await convexClient.query(api.users.getUserByEmail, { email: buddyEmail });
                }

                if (buddyUser && buddyUser.phone) {
                    console.log(`✅ CALLING ${isStrangerMatch ? 'STRANGER' : 'BUDDY'}: ${buddyUser.name} at ${buddyUser.phone} `);

                    // Resolve alarmId if not yet resolved
                    if (!alarmId && alarmTime && alarmAmpm) {
                        console.log('🔍 alarmId not available, looking up from database...');
                        const foundAlarm = await convexClient.query(api.alarms.findAlarmByDetails, {
                            userEmail: userToUse.email,
                            buddyEmail: buddyEmail,
                            time: alarmTime,
                            ampm: alarmAmpm
                        });
                        if (foundAlarm) {
                            alarmId = foundAlarm._id;
                            console.log('✅ Found alarm in database:', alarmId);
                        }
                    }

                    // Record the call in database
                    if (alarmId) {
                        try {
                            const callRecord = await createCall({
                                user1Email: userToUse.email,
                                user2Email: buddyEmail,
                                alarmId: alarmId,
                            });
                            console.log('Call record created:', callRecord);
                            callIdRef.current = callRecord.callId;
                            lastCalledNumberRef.current = buddyUser.phone;

                            // Save to SharedPreferences for persistent tracking
                            await savePendingCall(callRecord.callId, buddyUser.phone);
                        } catch (callError) {
                            console.error('Failed to create call record:', callError);
                        }
                    } else {
                        console.error('❌ Cannot create call record: alarmId is required');
                    }

                    // Make the phone call
                    console.log('📞 Initiating phone call to:', buddyUser.phone);
                    try {
                        await makePhoneCall(buddyUser.phone);
                        console.log('✅ Phone call initiated successfully');
                    } catch (err) {
                        console.error('❌ Call failed:', err);
                        // Try alternative method using Linking
                        try {
                            console.log('🔄 Trying alternative call method...');
                            await Linking.openURL(`tel:${buddyUser.phone} `);
                            console.log('✅ Alternative call method succeeded');
                        } catch (linkErr) {
                            console.error('❌ Alternative call method also failed:', linkErr);
                        }
                    }
                } else {
                    console.log('❌ Buddy found but no phone number:', buddyEmail);
                    console.log('Buddy user object:', buddyUser);
                }
            }
        } catch (error) {
            console.error('Error in handleBuddyCall:', error);
        }
    };

    // Process pending alarm after user is loaded
    useEffect(() => {
        const processPendingAlarm = async () => {
            if (user && user.email && pendingAlarmRef.current) {
                const { alarmTime, alarmAmpm, alarmId, buddyEmail } = pendingAlarmRef.current;
                console.log('📱 Processing pending alarm deep link now that user is loaded');
                console.log('📱 User email:', user.email);
                console.log('📱 Alarm time:', alarmTime, alarmAmpm);
                console.log('📱 Alarm ID:', alarmId);
                console.log('📱 Buddy email:', buddyEmail);

                // Clear the pending alarm FIRST to prevent double processing
                const pendingData = pendingAlarmRef.current;
                pendingAlarmRef.current = null;

                // Handle buddy/stranger call - pass user explicitly to avoid stale closure
                if (pendingData.alarmTime || pendingData.alarmId) {
                    await handleBuddyCall(pendingData.alarmTime, pendingData.alarmAmpm, pendingData.alarmId, pendingData.buddyEmail, user);
                }

                // Mark awake
                await handleMarkAwake();
            }
        };

        processPendingAlarm();
    }, [recentStreaks]);

    // Configure notifications and request permissions on mount
    useEffect(() => {
        const setupNotifications = async () => {
            try {
                // Check if Notifications module is available
                if (typeof Notifications === 'undefined' || !Notifications) {
                    console.warn('⚠️ Notifications module not available - notifications will not work');
                    return;
                }

                // Configure notification handler
                Notifications.setNotificationHandler({
                    handleNotification: async () => ({
                        shouldShowBanner: true,
                        shouldShowList: true,
                        shouldPlaySound: true,
                        shouldSetBadge: false,
                    }),
                });

                // Request permissions
                const { status: existingStatus } = await Notifications.getPermissionsAsync();
                let finalStatus = existingStatus;

                if (existingStatus !== 'granted') {
                    const { status } = await Notifications.requestPermissionsAsync();
                    finalStatus = status;
                }

                if (finalStatus !== 'granted') {
                    console.warn('Notification permissions not granted');
                } else {
                    console.log('✅ Notification permissions granted');
                }
            } catch (error) {
                console.error('❌ Failed to setup notifications:', error);
            }
        };

        setupNotifications();
    }, []);

    // Handle deep links - runs only once on mount
    useEffect(() => {
        let isProcessed = false;

        const handleDeepLink = async (event) => {
            const url = event.url;

            // Check if alarm is ringing
            if (url && url.includes('alarm=ringing')) {
                console.log('🚨 Alarm ringing - showing AlarmScreen overlay');
                setShowAlarmScreen(true);
                return;
            }

            if (url && (url.includes('alarm=dismissed') || url.includes('wakeupbuddy://awake'))) {
                console.log('Alarm dismissed via deep link (event), marking awake...');
                console.log('Full URL:', url);
                setShowAlarmScreen(false);

                // Extract parameters from URL
                const buddyMatch = url.match(/[?&]buddy=([^&]+)/);
                const alarmIdMatch = url.match(/[?&]alarmId=([^&]+)/);
                const timeMatch = url.match(/[?&]time=([^&]+)/);
                const ampmMatch = url.match(/[?&]ampm=([^&]+)/);

                const buddyEmail = buddyMatch ? decodeURIComponent(buddyMatch[1]) : null;
                const alarmId = alarmIdMatch ? decodeURIComponent(alarmIdMatch[1]) : null;
                const alarmTime = timeMatch ? decodeURIComponent(timeMatch[1]) : null;
                const alarmAmpm = ampmMatch ? decodeURIComponent(ampmMatch[1]) : null;

                console.log('📧 Buddy from URL:', buddyEmail);
                console.log('🆔 Alarm ID from URL:', alarmId);
                console.log('⏰ Time from URL:', alarmTime, alarmAmpm);

                // Check alarm mode before marking awake
                if (user && user.email && alarmTime && alarmAmpm) {
                    try {
                        const alarmData = await convexClient.query(api.alarms.getAlarmByTimeAndUser, {
                            userEmail: user.email,
                            alarmTime: alarmTime,
                            alarmAmpm: alarmAmpm
                        });

                        // Check if there's an actual buddy match
                        const hasBuddy = alarmData?.alarm?.buddy != null;
                        const localDate = new Date().toISOString().split('T')[0];

                        if (hasBuddy) {
                            // Matched alarm (stranger with buddy OR friend) - wait for call
                            console.log('⏳ Matched alarm from deep link - skipping increment');
                            await markAwake({
                                userEmail: user.email,
                                userDate: localDate,
                                skipIncrement: true
                            });
                            // Don't show popup here - will show after call ends based on duration
                        } else {
                            // Solo alarm OR unmatched stranger - increment immediately
                            console.log('✅ Solo/Unmatched alarm from deep link - incrementing immediately');
                            const result = await markAwake({
                                userEmail: user.email,
                                userDate: localDate
                            });

                            if (result.status === 'success' || result.status === 'incremented') {
                                showPopup(`Streak: ${result.streak} days!`, '#4CAF50');
                            }
                        }
                    } catch (error) {
                        console.error('Failed to check alarm mode:', error);
                        // Fall back to not incrementing if we can't determine mode
                        const localDate = new Date().toISOString().split('T')[0];
                        await markAwake({
                            userEmail: user.email,
                            userDate: localDate,
                            skipIncrement: true
                        });
                    }
                }

                // Handle buddy/stranger call (this will fetch latest data from Convex)
                if (user && user.email && (alarmTime || alarmId)) {
                    await handleBuddyCall(alarmTime, alarmAmpm, alarmId, buddyEmail, user);
                } else if (!user || !user.email) {
                    // Store for later processing
                    console.log('⏳ User not loaded, storing alarm for later');
                    pendingAlarmRef.current = { alarmTime, alarmAmpm, alarmId, buddyEmail };
                }
            }
        };

        // Check if app was opened via deep link - only process once
        Linking.getInitialURL().then(async (url) => {
            if (isProcessed) return;
            isProcessed = true;

            // Check if alarm is ringing
            if (url && url.includes('alarm=ringing')) {
                console.log('🚨 Alarm ringing - showing AlarmScreen overlay');
                setShowAlarmScreen(true);
                return;
            }

            if (url && (url.includes('alarm=dismissed') || url.includes('wakeupbuddy://awake'))) {
                console.log('App opened with alarm deep link (initial)...');
                console.log('Full URL:', url);
                console.log('Current user state:', user ? user.email : 'null');

                // Extract parameters from URL
                const buddyMatch = url.match(/[?&]buddy=([^&]+)/);
                const alarmIdMatch = url.match(/[?&]alarmId=([^&]+)/);
                const timeMatch = url.match(/[?&]time=([^&]+)/);
                const ampmMatch = url.match(/[?&]ampm=([^&]+)/);

                const buddyEmail = buddyMatch ? decodeURIComponent(buddyMatch[1]) : null;
                const alarmId = alarmIdMatch ? decodeURIComponent(alarmIdMatch[1]) : null;
                const alarmTime = timeMatch ? decodeURIComponent(timeMatch[1]) : null;
                const alarmAmpm = ampmMatch ? decodeURIComponent(ampmMatch[1]) : null;

                console.log('📧 Buddy from URL:', buddyEmail);
                console.log('🆔 Alarm ID from URL:', alarmId);
                console.log('⏰ Time from URL:', alarmTime, alarmAmpm);

                // ALWAYS store the alarm data first, then check if we can process immediately
                // This ensures we don't lose the data if user loads slowly
                pendingAlarmRef.current = { alarmTime, alarmAmpm, alarmId, buddyEmail };
                console.log('💾 Stored alarm data in pendingAlarmRef');

                // If user is already loaded, process immediately
                if (user && user.email) {
                    console.log('✅ User already loaded, processing alarm immediately');
                    // Clear pending and process
                    pendingAlarmRef.current = null;
                    if (alarmTime || alarmId) {
                        await handleBuddyCall(alarmTime, alarmAmpm, alarmId, buddyEmail, user);
                    }
                    handleMarkAwake();
                } else {
                    console.log('⏳ User not loaded yet, alarm data stored for later processing');
                    // The processPendingAlarm useEffect will handle it when user loads
                }
            }
        });

        // Listen for incoming links while app is running
        const subscription = Linking.addEventListener('url', handleDeepLink);

        return () => {
            subscription.remove();
        };
    }, []); // Empty dependency - only run once on mount

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

    // Handle share badge button press
    const handleShareBadge = async () => {
        try {
            if (!streakCardRef.current) {
                showPopup('Unable to capture streak card', '#FF6B6B');
                return;
            }

            // Capture the streak card as an image
            const uri = await streakCardRef.current.capture();
            console.log('Captured streak card:', uri);

            // Create caption with streak info
            const streakCount = user?.streak || 0;
            const maxStreak = user?.maxStreak || 0;
            const caption = `🔥 ${streakCount} Day Streak on WakeUpBuddy! 🔥\n\nI'm crushing my wake-up goals! ${maxStreak > streakCount ? `Personal best: ${maxStreak} days!` : 'New personal record!'}\n\nJoin me in building better morning habits! 💪⏰`;

            // Share both image and text using react-native-share
            const shareOptions = {
                title: 'My WakeUpBuddy Streak',
                message: caption,
                url: `file://${uri}`,
                type: 'image/png',
                subject: 'Check out my streak!',
                failOnCancel: false
            };

            await RNShare.open(shareOptions);

        } catch (error) {
            console.error('Error sharing streak card:', error);
            if (error.message !== 'User did not share') {
                showPopup('Failed to share streak card', '#FF6B6B');
            }
        }
    };

    // open alarm editor screen
    const openAlarmEditor = () => {
        showInterstitialAd(() => {
            router.push('/screens/alarm-editor');
        });
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor="#050505" />
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <View style={styles.logoContainer}>
                            <Ionicons name="flash" size={20} color="#000" />
                        </View>
                        <AppText style={styles.headerTitle}>WakeUpBuddy...</AppText>
                    </View>
                    <View style={styles.headerRight}>
                        <TouchableOpacity
                            style={styles.notificationButton}
                            onPress={() => router.push('/screens/notifications')}
                        >
                            <Ionicons name="notifications-outline" size={24} color="#fff" />
                            {pendingNotificationsCount > 0 && (
                                <View style={styles.badge}>
                                    <AppText style={styles.badgeText}>{pendingNotificationsCount}</AppText>
                                </View>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.profileImageContainer}
                            onPress={() => router.push('/(tabs)/profile')}
                        >
                            <ProfilePic user={user} size={36} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Streak Card */}
                <ViewShot ref={streakCardRef} options={{ format: 'png', quality: 1.0 }}>
                    <View style={styles.streakCard}>
                        <View style={styles.streakHeader}>
                            <AppText style={styles.streakLabel}>Current Streak</AppText>
                            <TouchableOpacity style={styles.shareBadge} onPress={handleShareBadge}>
                                <Ionicons name="share-social-outline" size={14} color={NEON} />
                                <AppText style={styles.shareBadgeText}>Share Badge</AppText>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.streakCountContainer}>
                            <AppText style={styles.streakCount}>{user?.streak || 0}</AppText>
                            <Ionicons name="flame" size={32} color="#FF6B35" />
                        </View>
                        <AppText style={styles.streakSubtext}>You're on fire! Keep it up.</AppText>

                        {/* Last 10 Days Heatmap */}
                        <View style={styles.heatmapContainer}>
                            <AppText style={styles.heatmapTitle}>Last 10 Days Activity</AppText>
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
                                        let boxColor = '#1A1A1A'; // Grey/ash for 0
                                        if (count >= 7) boxColor = NEON; // Bright neon for 7+
                                        else if (count >= 5) boxColor = '#8FB339'; // Bright green for 5-6
                                        else if (count >= 3) boxColor = '#556B2F'; // Medium green for 3-4
                                        else if (count >= 1) boxColor = '#2A3318'; // Light green for 1-2

                                        return (
                                            <View key={index} style={styles.heatmapDayContainer}>
                                                <View style={[styles.heatmapBox, { backgroundColor: boxColor }]}>
                                                    {count > 0 && (
                                                        <AppText style={styles.heatmapCount}>{count}</AppText>
                                                    )}
                                                </View>
                                            </View>
                                        );
                                    });
                                })()}
                            </View>
                            <View style={styles.heatmapLegend}>
                                <AppText style={styles.legendText}>Less</AppText>
                                <View style={[styles.legendBox, { backgroundColor: '#1A1A1A' }]} />
                                <View style={[styles.legendBox, { backgroundColor: '#556B2F' }]} />
                                <View style={[styles.legendBox, { backgroundColor: '#8FB339' }]} />
                                <View style={[styles.legendBox, { backgroundColor: NEON }]} />
                                <AppText style={styles.legendText}>More</AppText>
                            </View>
                        </View>
                    </View>
                </ViewShot>

                {/* Up Next */}
                <View style={styles.sectionHeader}>
                    <AppText style={styles.sectionTitle}>Up Next</AppText>
                    <TouchableOpacity onPress={() => router.push('/(tabs)/alarms')}>
                        <AppText style={styles.seeAllText}>See All</AppText>
                    </TouchableOpacity>
                </View>

                {/* Upcoming Alarms */}
                {(() => {
                    // Get current time info
                    const now = new Date();
                    const jsDay = now.getDay(); // JavaScript: 0 = Sunday, 6 = Saturday
                    const currentHours = now.getHours();
                    const currentMinutes = now.getMinutes();
                    const currentTimeInMinutes = currentHours * 60 + currentMinutes;

                    // Day names indexed by JavaScript's getDay() (0 = Sunday)
                    const fullDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

                    // Convert JavaScript day (0=Sun) to alarm day index (0=Mon)
                    // Alarm format: [Mon, Tue, Wed, Thu, Fri, Sat, Sun] = indices 0-6
                    // JS getDay(): Sun=0, Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6
                    const jsDayToAlarmIndex = (jsDay) => {
                        // Sun(0)->6, Mon(1)->0, Tue(2)->1, Wed(3)->2, Thu(4)->3, Fri(5)->4, Sat(6)->5
                        return jsDay === 0 ? 6 : jsDay - 1;
                    };

                    // Helper function to convert alarm time to minutes since midnight (24hr)
                    const getAlarmTimeInMinutes = (alarm) => {
                        let [hours, minutes] = alarm.time.split(':').map(Number);
                        if (alarm.ampm === 'PM' && hours !== 12) hours += 12;
                        if (alarm.ampm === 'AM' && hours === 12) hours = 0;
                        return hours * 60 + minutes;
                    };

                    // Helper function to get next occurrence of alarm
                    const getNextOccurrence = (alarm) => {
                        const alarmTimeInMinutes = getAlarmTimeInMinutes(alarm);

                        // Check if alarm has any days enabled
                        // alarm.days is stored as [0,1,1,1,1,0,0] where index 0=Mon, value 1=enabled
                        const hasAnyDayEnabled = alarm.days && alarm.days.some(d => d === 1);

                        // If no days enabled, treat as one-time alarm
                        if (!alarm.days || alarm.days.length === 0 || !hasAnyDayEnabled) {
                            if (alarmTimeInMinutes > currentTimeInMinutes) {
                                // Alarm is later today
                                return {
                                    daysFromNow: 0,
                                    timeInMinutes: alarmTimeInMinutes,
                                    dayName: 'Today'
                                };
                            }
                            // Alarm time already passed today, next occurrence is tomorrow
                            return {
                                daysFromNow: 1,
                                timeInMinutes: alarmTimeInMinutes,
                                dayName: 'Tomorrow'
                            };
                        }

                        // Find next scheduled day from the days array
                        // Loop through next 7 days starting from today
                        for (let i = 0; i <= 7; i++) {
                            const checkJsDay = (jsDay + i) % 7; // JavaScript day (0=Sun)
                            const alarmDayIndex = jsDayToAlarmIndex(checkJsDay); // Convert to alarm index (0=Mon)

                            // Check if this day is enabled in the alarm (value is 1)
                            if (alarm.days[alarmDayIndex] === 1) {
                                // If checking today (i === 0), verify time hasn't passed
                                if (i === 0 && alarmTimeInMinutes <= currentTimeInMinutes) {
                                    continue; // Already passed today, check next day
                                }

                                // Determine day name
                                let dayName;
                                if (i === 0) dayName = 'Today';
                                else if (i === 1) dayName = 'Tomorrow';
                                else dayName = fullDayNames[checkJsDay];

                                return {
                                    daysFromNow: i,
                                    timeInMinutes: alarmTimeInMinutes,
                                    dayName: dayName
                                };
                            }
                        }

                        return null; // No valid occurrence found
                    };

                    // Filter enabled alarms and calculate next occurrence
                    const upcomingAlarms = alarms
                        ?.filter(a => a.enabled)
                        .map(alarm => ({
                            ...alarm,
                            nextOccurrence: getNextOccurrence(alarm)
                        }))
                        .filter(a => a.nextOccurrence !== null)
                        .sort((a, b) => {
                            // Sort by days from now first, then by time
                            if (a.nextOccurrence.daysFromNow !== b.nextOccurrence.daysFromNow) {
                                return a.nextOccurrence.daysFromNow - b.nextOccurrence.daysFromNow;
                            }
                            return a.nextOccurrence.timeInMinutes - b.nextOccurrence.timeInMinutes;
                        })
                        .slice(0, 2); // Show only first 2 upcoming alarms

                    if (!upcomingAlarms || upcomingAlarms.length === 0) {
                        return (
                            <View style={styles.alarmCard}>
                                <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                                    <Ionicons name="alarm-outline" size={40} color="#333" />
                                    <AppText style={{ color: '#666', marginTop: 10 }}>No upcoming alarms</AppText>
                                    <TouchableOpacity
                                        style={[styles.shareBadge, { marginTop: 12 }]}
                                        onPress={openAlarmEditor}
                                    >
                                        <Ionicons name="add" size={16} color={NEON} />
                                        <AppText style={styles.shareBadgeText}>Add Alarm</AppText>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    }

                    return upcomingAlarms.map((alarm, index) => {
                        const [hours, minutes] = alarm.time.split(':');

                        return (
                            <View key={alarm._id} style={[styles.alarmCard, index > 0 && { marginTop: 10 }]}>
                                <View style={styles.alarmHeader}>
                                    <AppText style={styles.alarmDate}>{alarm.nextOccurrence.dayName}</AppText>
                                    <View style={styles.alarmActions}>
                                        <TouchableOpacity
                                            style={styles.actionButton}
                                            onPress={() => router.push({
                                                pathname: '/screens/alarm-editor',
                                                params: { alarm: JSON.stringify(alarm) }
                                            })}
                                        >
                                            <Ionicons name="pencil" size={16} color="#888" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={styles.timeContainer}>
                                    <AppText style={styles.timeText}>{hours}:{minutes}</AppText>
                                    <AppText style={styles.ampmText}>{alarm.ampm}</AppText>
                                </View>
                                <View style={styles.alarmFooter}>
                                    <View style={styles.modeContainer}>
                                        {alarm.solo_mode ? (
                                            <>
                                                <Ionicons name="person-outline" size={18} color="#888" />
                                                <AppText style={[styles.modeText, { color: '#888' }]}>Solo Mode</AppText>
                                            </>
                                        ) : (
                                            <>
                                                <Ionicons name="people-outline" size={18} color={NEON} />
                                                <AppText style={styles.modeText}>
                                                    {alarm.buddy ? `With ${alarm.buddy.split('@')[0]}` : 'Wake Buddy Mode'}
                                                </AppText>
                                            </>
                                        )}
                                    </View>
                                    {alarm.label && (
                                        <AppText style={{ color: '#666', fontSize: 12 }}>{alarm.label}</AppText>
                                    )}
                                </View>
                            </View>
                        );
                    });
                })()}

                {/* Quick Actions */}
                <AppText style={styles.sectionTitle}>Quick Actions</AppText>
                <View style={styles.quickActionsContainer}>
                    <TouchableOpacity style={styles.quickActionItem} onPress={openAlarmEditor}>
                        <View style={styles.quickActionIcon}>
                            <Ionicons name="alarm-outline" size={24} color={NEON} />
                        </View>
                        <AppText style={styles.quickActionText}>Add Alarm</AppText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickActionItem} onPress={() => router.push('/screens/my-buddies')}>
                        <View style={styles.quickActionIcon}>
                            <Ionicons name="people-outline" size={24} color={NEON} />
                        </View>
                        <AppText style={styles.quickActionText}>My Buddies</AppText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickActionItem} onPress={() => router.push('/screens/PermissionsGuide')}>
                        <View style={styles.quickActionIcon}>
                            <Ionicons name="settings-outline" size={24} color={NEON} />
                        </View>
                        <AppText style={styles.quickActionText}>Setup</AppText>
                    </TouchableOpacity>
                </View>

                {/* Friends Achievements */}
                <View style={styles.sectionHeader}>
                    <AppText style={styles.sectionTitle}>Buddy Achievements</AppText>
                    <TouchableOpacity onPress={() => router.push('/screens/my-buddies')}>
                        <AppText style={styles.seeAllText}>See All</AppText>
                    </TouchableOpacity>
                </View>

                {friends && friends.length > 0 ? (
                    friends
                        .filter(f => f.friend && (f.friend.streak > 0 || f.friend.maxStreak > 0))
                        .slice(0, 3)
                        .map((item, index) => {
                            const friend = item.friend;
                            // Determine achievement message
                            let achievementText = '';
                            let achievementIcon = 'flame';
                            let iconColor = '#FF6B35';

                            if (friend.streak >= 30) {
                                achievementText = `🔥 ${friend.streak} day streak! Amazing!`;
                            } else if (friend.streak >= 14) {
                                achievementText = `🔥 ${friend.streak} day streak! On fire!`;
                            } else if (friend.streak >= 7) {
                                achievementText = `🔥 ${friend.streak} day streak! Great job!`;
                            } else if (friend.streak >= 3) {
                                achievementText = `${friend.streak} day streak going strong`;
                            } else if (friend.maxStreak >= 7) {
                                achievementText = `Best streak: ${friend.maxStreak} days`;
                                achievementIcon = 'trophy';
                                iconColor = NEON;
                            } else if (friend.streak > 0) {
                                achievementText = `${friend.streak} day streak`;
                            } else {
                                achievementText = 'Getting started!';
                                achievementIcon = 'star';
                                iconColor = '#888';
                            }

                            return (
                                <TouchableOpacity
                                    key={item.friendshipId || index}
                                    style={styles.socialCard}
                                    onPress={() => router.push(`/user/${friend._id}`)}
                                >
                                    <View style={styles.socialContent}>
                                        <ProfilePic user={friend} size={36} />
                                        <View style={styles.socialTextContainer}>
                                            <AppText style={styles.socialTitle}>{friend.name}</AppText>
                                            <AppText style={styles.socialSubtitle}>{achievementText}</AppText>
                                        </View>
                                        <View style={styles.achievementBadge}>
                                            <Ionicons name={achievementIcon} size={18} color={iconColor} />
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        })
                ) : (
                    <View style={styles.socialCard}>
                        <View style={styles.socialContent}>
                            <View style={[styles.socialAvatar, { backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center' }]}>
                                <Ionicons name="people-outline" size={20} color="#666" />
                            </View>
                            <View style={styles.socialTextContainer}>
                                <AppText style={styles.socialTitle}>No buddies yet</AppText>
                                <AppText style={styles.socialSubtitle}>Add friends to see their achievements!</AppText>
                            </View>
                            <TouchableOpacity
                                style={styles.thumbsUpButton}
                                onPress={() => router.push('/(tabs)/rank')}
                            >
                                <Ionicons name="add" size={20} color={NEON} />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

            </ScrollView>
            <BannerAds />

            {/* Alarm Screen Overlay - shown when alarm is ringing */}
            {showAlarmScreen && <AlarmScreen />}
        </SafeAreaView>
    );
}
