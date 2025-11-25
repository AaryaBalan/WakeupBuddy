import { StyleSheet, Text, View } from 'react-native';

export default function AlarmsScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Alarms Screen</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    text: {
        color: '#fff',
    },
});
