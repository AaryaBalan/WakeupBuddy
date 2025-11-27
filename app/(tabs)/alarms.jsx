import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery } from "convex/react";
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Toast } from 'toastify-react-native';
import { api } from "../../convex/_generated/api";

export default function AlarmsScreen() {
    const router = useRouter();
    const [userId, setUserId] = useState(null);
    const alarms = useQuery(api.alarms.getAlarmsByUser, userId ? { user_id: userId } : "skip") || [];
    const toggleAlarmMutation = useMutation(api.alarms.toggleAlarm);
    const deleteAlarmMutation = useMutation(api.alarms.deleteAlarm);

    useFocusEffect(
        useCallback(() => {
            const getUser = async () => {
                const userString = await AsyncStorage.getItem('user');
                if (userString) {
                    const user = JSON.parse(userString);
                    setUserId(user._id);
                }
            };
            getUser();
        }, [])
    );

    const toggleAlarm = async (id, currentStatus) => {
        try {
            await toggleAlarmMutation({ id, enabled: !currentStatus });
        } catch (error) {
            console.error('Error toggling alarm:', error);
            Toast.error('Failed to toggle alarm');
        }
    };

    const deleteAlarm = async (id) => {
        try {
            await deleteAlarmMutation({ id });
            Toast.success('Alarm deleted');
        } catch (error) {
            console.error('Error deleting alarm:', error);
            Toast.error('Failed to delete alarm');
        }
    };

    const formatDays = (daysData) => {
        if (!daysData) return '';
        // Handle if it comes as a string representation of array or actual array
        let daysArray = daysData;
        if (typeof daysData === 'string' && daysData.startsWith('[')) {
            try {
                daysArray = JSON.parse(daysData);
            } catch (e) {
                return daysData;
            }
        }

        if (!Array.isArray(daysArray)) return daysData;

        const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const activeDays = daysArray.map((d, i) => (d === 1 || d === true) ? dayNames[i] : null).filter(Boolean);

        if (activeDays.length === 7) return 'Everyday';
        if (activeDays.length === 0) return 'Once';
        return activeDays.join(', ');
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.alarmItem}
            onPress={() => router.push({
                pathname: '/screens/alarm-editor',
                params: { alarm: JSON.stringify(item) }
            })}
        >
            <View style={styles.alarmInfo}>
                <View style={styles.timeContainer}>
                    <Text style={[styles.timeText, !item.enabled && styles.disabledText]}>{item.time}</Text>
                    <Text style={[styles.ampmText, !item.enabled && styles.disabledText]}>{item.ampm}</Text>
                </View>
                <Text style={styles.alarmLabel}>{item.label} • {formatDays(item.days)}</Text>
            </View>
            <View style={styles.actions}>
                <Switch
                    trackColor={{ false: "#333", true: "#C9E265" }}
                    thumbColor={item.enabled ? "#000" : "#f4f3f4"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={() => toggleAlarm(item._id, item.enabled)}
                    value={item.enabled}
                />
                <TouchableOpacity onPress={() => deleteAlarm(item._id)} style={styles.deleteButton}>
                    <Ionicons name="trash-outline" size={20} color="#ff4444" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Alarms</Text>
            </View>

            <FlatList
                data={alarms}
                renderItem={renderItem}
                keyExtractor={item => item._id}
                contentContainerStyle={[styles.listContent, alarms.length === 0 && styles.emptyListContent]}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="alarm-outline" size={80} color="#C9E265" />
                        <Text style={styles.emptyTitle}>No Alarms Set</Text>
                        <Text style={styles.emptySubtitle}>Click add button to set the alarm</Text>
                        <Text style={styles.emptyDescription}>Connect with stranger or set alarm in solo mode</Text>
                    </View>
                }
            />
            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push('/screens/alarm-editor')}
            >
                <Ionicons name="add" size={32} color="#000" />
            </TouchableOpacity>
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
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    deleteButton: {
        padding: 5,
    },
    fab: {
        position: 'absolute',
        bottom: 20,
        alignSelf: 'center',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#C9E265',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    emptyListContent: {
        flex: 1,
        justifyContent: 'center',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    emptyTitle: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 20,
    },
    emptySubtitle: {
        color: '#888',
        fontSize: 16,
        marginTop: 10,
        textAlign: 'center',
    },
    emptyDescription: {
        color: '#666',
        fontSize: 14,
        marginTop: 5,
        textAlign: 'center',
    },
});
