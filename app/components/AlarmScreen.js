import { BackHandler, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { cancelAlarm } from '../native/AlarmNative';

export default function AlarmScreen() {
    const handleImAwake = async () => {
        try {
            await cancelAlarm(1001);
            console.log('Alarm cancelled successfully');
            // Close the alarm activity
            BackHandler.exitApp();
        } catch (error) {
            console.error('Error cancelling alarm:', error);
            // Close anyway even if cancel fails
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
