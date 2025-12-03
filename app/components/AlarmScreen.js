import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from 'convex/react';
import { useEffect, useRef } from 'react';
import { BackHandler, Linking, TouchableOpacity, View } from 'react-native';
import AppText from '../../components/AppText';
import { useUser } from '../../contexts/UserContext';
import { api } from '../../convex/_generated/api';
import styles from '../../styles/alarmScreen.styles';
import { cancelAlarm, subscribeToCallState } from '../native/AlarmNative';

export default function AlarmScreen() {
    const { user } = useUser();
    const markAwake = useMutation(api.streaks.markAwake);
    const createCall = useMutation(api.calls.createCall);
    const updateCallDuration = useMutation(api.calls.updateCallDuration);
    const callIdRef = useRef(null);

    // Listen for call state changes to update duration
    useEffect(() => {
        const unsubscribe = subscribeToCallState(async (event) => {
            console.log('Call state changed:', event);

            if (event.status === 'ended' && callIdRef.current && event.duration) {
                try {
                    await updateCallDuration({
                        callId: callIdRef.current,
                        duration: Math.round(event.duration)
                    });
                    console.log(`Call duration updated: ${event.duration} seconds`);
                } catch (error) {
                    console.error('Failed to update call duration:', error);
                }
                callIdRef.current = null;
            }
        });

        return () => unsubscribe();
    }, [updateCallDuration]);

    // Fetch user's alarms to find the active one with a buddy
    const alarms = useQuery(api.alarms.getAlarmsByUser, user ? { user_id: user._id } : "skip");

    // Find the alarm that is likely ringing (enabled and has a buddy)
    const activeBuddyAlarm = alarms?.find(a => a.enabled && a.buddy && a.buddy.includes('@'));

    // Fetch buddy details if we found an alarm with a buddy
    const buddy = useQuery(api.users.getUserByEmail, activeBuddyAlarm ? { email: activeBuddyAlarm.buddy } : "skip");

    const handleImAwake = async () => {
        try {
            // Debug logging
            console.log('=== ALARM DISMISSED ===');
            console.log('User:', user?.email);
            console.log('Total alarms:', alarms?.length);
            console.log('Active buddy alarm:', activeBuddyAlarm);
            console.log('Buddy details:', buddy);

            // Cancel the alarm first
            await cancelAlarm(1001);
            console.log('Alarm cancelled successfully');

            // Mark awake if user is logged in
            if (user && user.email) {
                // Get local date YYYY-MM-DD
                const now = new Date();
                const localDate = now.getFullYear() + '-' +
                    String(now.getMonth() + 1).padStart(2, '0') + '-' +
                    String(now.getDate()).padStart(2, '0');

                const result = await markAwake({
                    userEmail: user.email,
                    userDate: localDate
                });

                if (result.status === 'success') {
                    console.log(`Streak updated: ${result.streak} days (Wakeup #${result.wakeupCount} today)`);
                } else if (result.status === 'incremented') {
                    console.log(`Wakeup count incremented to ${result.wakeupCount} for today`);
                }
            } else {
                console.warn('User not logged in, skipping streak update');
            }

            // Call buddy if available
            if (buddy && buddy.phone) {
                console.log(`✅ CALLING BUDDY: ${buddy.name} at ${buddy.phone}`);

                // Record the call in database
                try {
                    const callRecord = await createCall({
                        user1Email: user.email,
                        user2Email: buddy.email,
                        alarmId: activeBuddyAlarm._id.toString()
                    });
                    console.log('Call record created:', callRecord);
                    // Store call ID to update duration later
                    callIdRef.current = callRecord.callId;
                } catch (callError) {
                    console.error('Failed to create call record:', callError);
                }

                Linking.openURL(`tel:${buddy.phone}`);
            } else if (activeBuddyAlarm) {
                console.log('❌ Buddy alarm found but buddy has no phone number');
                console.log('Buddy email:', activeBuddyAlarm.buddy);
            } else {
                console.log('ℹ️ No buddy alarm found');
            }

            // Exit the app after a short delay to allow call intent to fire
            setTimeout(() => {
                BackHandler.exitApp();
            }, 1000);
        } catch (error) {
            console.error('Error in handleImAwake:', error);
            // Still exit even if marking awake fails
            BackHandler.exitApp();
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Ionicons name="alarm-outline" size={100} color="#C9E265" />
                <AppText style={styles.title}>WAKE UP!</AppText>
                <AppText style={styles.subtitle}>Time to start your day</AppText>

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleImAwake}
                    activeOpacity={0.8}
                >
                    <AppText style={styles.buttonText}>I'm Awake</AppText>
                </TouchableOpacity>
            </View>
        </View>
    );
}
