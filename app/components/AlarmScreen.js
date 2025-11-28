import { useMutation } from 'convex/react';
import { BackHandler, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useUser } from '../../contexts/UserContext';
import { api } from '../../convex/_generated/api';
import { cancelAlarm } from '../native/AlarmNative';
import { Ionicons } from '@expo/vector-icons';
import styles from '../../styles/alarmScreen.styles';

export default function AlarmScreen() {
    const { user } = useUser();
    const markAwake = useMutation(api.streaks.markAwake);

    const handleImAwake = async () => {
        try {
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

            // Exit the app
            BackHandler.exitApp();
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
                <Text style={styles.title}>WAKE UP!</Text>
                <Text style={styles.subtitle}>Time to start your day</Text>

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleImAwake}
                    activeOpacity={0.8}
                >
                    <Text style={styles.buttonText}>I'm Awake</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
