import { useMutation } from 'convex/react';
import { BackHandler, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useUser } from '../../contexts/UserContext';
import { api } from '../../convex/_generated/api';
import { cancelAlarm } from '../native/AlarmNative';

export default function AlarmScreen() {
    const { user } = useUser();
    const markAwake = useMutation(api.streaks.markAwake);

    const handleImAwake = async () => {
        try {
            // Cancel the alarm first
            await cancelAlarm(1001);
            console.log('Alarm cancelled successfully');

            // Mark as awake if user is logged in
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

                console.log('Streak updated successfully:', result);
            } else {
                console.warn('User not logged in, skipping streak update');
            }

            // Close the alarm activity
            BackHandler.exitApp();
        } catch (error) {
            console.error('Error in handleImAwake:', error);
            // Close anyway even if there's an error
            BackHandler.exitApp();
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.emoji}>⏰</Text>
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    emoji: {
        fontSize: 80,
        marginBottom: 20,
    },
    title: {
        color: '#C9E265',
        fontSize: 48,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        color: '#fff',
        fontSize: 18,
        marginBottom: 60,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#C9E265',
        paddingHorizontal: 50,
        paddingVertical: 18,
        borderRadius: 30,
        elevation: 5,
        shadowColor: '#C9E265',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    buttonText: {
        color: '#000',
        fontSize: 22,
        fontWeight: 'bold',
    },
});
