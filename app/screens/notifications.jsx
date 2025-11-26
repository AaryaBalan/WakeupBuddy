import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Toast } from 'toastify-react-native';

export default function NotificationsScreen() {
    const router = useRouter();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const userString = await AsyncStorage.getItem('user');
            if (userString) {
                const user = JSON.parse(userString);
                // Assuming user object has email. If not, we might need to fetch it or use ID.
                // The requirement says /notifications/email/:email
                if (user.email) {
                    const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/notifications/email/${user.email}`);
                    console.log(response.data);
                    setNotifications(response.data);
                }
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (id) => {
        console.log(id)
        try {
            await axios.put(`${process.env.EXPO_PUBLIC_API_URL}/notifications/${id}/accept`);
            Toast.success('Invitation Accepted');
            fetchNotifications(); // Refresh list
        } catch (error) {
            console.error('Error accepting invitation:', error);
            Toast.error('Failed to accept invitation');
        }
    };

    const handleDecline = async (id) => {
        try {
            await axios.put(`${process.env.EXPO_PUBLIC_API_URL}/notifications/${id}/reject`);
            Toast.success('Invitation Declined');
            fetchNotifications(); // Refresh list
        } catch (error) {
            console.error('Error declining invitation:', error);
            Toast.error('Failed to decline invitation');
        }
    };

    const formatRelativeTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) {
            return 'now';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes}m ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours}h ago`;
        } else {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days}d ago`;
        }
    };

    const renderHistoryItem = ({ item }) => (
        <View style={styles.historyCard}>
            <View style={styles.historyHeader}>
                <View style={styles.userInfo}>
                    <View style={styles.avatarPlaceholderSmall}>
                        <Text style={styles.avatarTextSmall}>{item.created_by.name?.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View>
                        <Text style={styles.userNameSmall}>{item.created_by.name}</Text>
                        <Text style={styles.historyText}>
                            {item.status === 1 ? 'You accepted the request.' : 'You declined the request.'}
                        </Text>
                    </View>
                </View>
                <Text style={styles.timeAgo}>{formatRelativeTime(item.time)}</Text>
            </View>
            <View style={styles.historyBadge}>
                <Ionicons
                    name={item.status === 1 ? "checkmark-circle" : "close-circle"}
                    size={16}
                    color={item.status === 1 ? "#C9E265" : "#ff4444"}
                />
                <Text style={[styles.historyStatus, { color: item.status === 1 ? "#C9E265" : "#ff4444" }]}>
                    {item.status === 1 ? 'Accepted' : 'Declined'}
                </Text>
            </View>
        </View>
    );

    const renderInviteItem = ({ item }) => (
        <View style={styles.inviteCard}>
            <View style={styles.inviteHeader}>
                <View style={styles.userInfo}>
                    {/* Placeholder Avatar */}
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>{item.created_by.name?.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View>
                        <Text style={styles.userName}>{item.created_by.name}</Text>
                        <Text style={styles.inviteText}>
                            Invited you to be their <Text style={styles.boldText}>Wake Buddy</Text> for tomorrow's alarm.
                        </Text>
                    </View>
                </View>
                <Text style={styles.timeAgo}>{formatRelativeTime(item.time)}</Text>
            </View>

            <View style={styles.alarmBadge}>
                <Ionicons name="alarm-outline" size={16} color="#C9E265" />
                <Text style={styles.alarmTime}>{item.alarm_time}</Text>
                <Text style={styles.puzzleType}>• {item.with_whom || 'Medium Puzzle'}</Text>
            </View>

            <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.declineButton} onPress={() => handleDecline(item.id)}>
                    <Text style={styles.declineText}>Decline</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.acceptButton} onPress={() => handleAccept(item.id)}>
                    <Text style={styles.acceptText}>Accept</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderItem = ({ item }) => {
        if (item.status === 1 || item.status === -1) {
            return renderHistoryItem({ item });
        }
        return renderInviteItem({ item });
    };

    // Separate invites and earlier notifications if needed. 
    // For now, I'll render everything as invites based on the UI, 
    // or we can differentiate based on some data field. 
    // The prompt implies all are "info" but the UI shows sections.
    // I'll assume for now all fetched items are "Invites" for the top section.
    // If there's a distinction, we'd need a field in the response.

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <Ionicons name="checkmark-done-outline" size={24} color="#888" />
            </View>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>INVITES</Text>
            </View>

            <FlatList
                data={notifications}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    !loading && (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No new notifications</Text>
                        </View>
                    )
                }
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
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    sectionHeader: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
    },
    sectionTitle: {
        color: '#666',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    listContent: {
        padding: 20,
    },
    inviteCard: {
        backgroundColor: '#111',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
    },
    inviteHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    userInfo: {
        flexDirection: 'row',
        flex: 1,
        marginRight: 10,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    userName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    inviteText: {
        color: '#888',
        fontSize: 14,
        lineHeight: 20,
    },
    boldText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    timeAgo: {
        color: '#666',
        fontSize: 12,
    },
    alarmBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        alignSelf: 'flex-start',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginBottom: 20,
        marginLeft: 52, // Align with text
    },
    alarmTime: {
        color: '#C9E265',
        fontWeight: 'bold',
        marginLeft: 6,
        marginRight: 6,
    },
    puzzleType: {
        color: '#888',
        fontSize: 12,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 15,
    },
    declineButton: {
        flex: 1,
        backgroundColor: '#1a1a1a',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    declineText: {
        color: '#fff',
        fontWeight: '600',
    },
    acceptButton: {
        flex: 1,
        backgroundColor: '#C9E265',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    acceptText: {
        color: '#000',
        fontWeight: 'bold',
    },
    emptyState: {
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        color: '#666',
        fontSize: 16,
    },
    // History Card Styles
    historyCard: {
        backgroundColor: '#111',
        borderRadius: 16,
        padding: 15,
        marginBottom: 15,
        opacity: 0.8,
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    avatarPlaceholderSmall: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#222',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    avatarTextSmall: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    userNameSmall: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    historyText: {
        color: '#888',
        fontSize: 12,
    },
    historyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 42, // Align with text
        marginTop: 5,
    },
    historyStatus: {
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 5,
    },
});
