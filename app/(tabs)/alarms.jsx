import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AlarmsScreen() {
    const router = useRouter();
    const [alarms, setAlarms] = useState([
        { id: '1', time: '07:00', ampm: 'AM', label: 'Work', enabled: true, days: 'Mon, Tue, Wed, Thu, Fri' },
        { id: '2', time: '09:00', ampm: 'AM', label: 'Gym', enabled: false, days: 'Sat, Sun' },
    ]);

    const toggleAlarm = (id) => {
        setAlarms(alarms.map(alarm =>
            alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm
        ));
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.alarmItem}
            onPress={() => router.push('/screens/alarm-editor')}
        >
            <View style={styles.alarmInfo}>
                <View style={styles.timeContainer}>
                    <Text style={[styles.timeText, !item.enabled && styles.disabledText]}>{item.time}</Text>
                    <Text style={[styles.ampmText, !item.enabled && styles.disabledText]}>{item.ampm}</Text>
                </View>
                <Text style={styles.alarmLabel}>{item.label} • {item.days}</Text>
            </View>
            <Switch
                trackColor={{ false: "#333", true: "#C9E265" }}
                thumbColor={item.enabled ? "#000" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={() => toggleAlarm(item.id)}
                value={item.enabled}
            />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Alarms</Text>
                <TouchableOpacity onPress={() => router.push('/screens/alarm-editor')}>
                    <Ionicons name="add" size={28} color="#C9E265" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={alarms}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a1a',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    listContent: {
        padding: 20,
    },
    alarmItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#111',
        borderRadius: 16,
        padding: 20,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#222',
    },
    alarmInfo: {
        flex: 1,
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 5,
    },
    timeText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
    },
    ampmText: {
        fontSize: 16,
        color: '#888',
        marginLeft: 5,
    },
    disabledText: {
        color: '#555',
    },
    alarmLabel: {
        color: '#888',
        fontSize: 14,
    },
});
