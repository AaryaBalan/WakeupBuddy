import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const NEON = '#C8FF00';
const BG = '#000';
const GRAY = '#BDBDBD';

export default function FriendRequestScreen() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const [requestSent, setRequestSent] = useState(false);

    // Mock users
    const currentUser = {
        name: 'You',
        username: '@alex_w',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
        streak: 12
    };

    const targetUser = {
        name: params.name || 'User',
        username: params.username || `@user_${params.id}`,
        avatar: params.avatar || null,
        streak: Math.floor(Math.random() * 50) + 5 // Mock streak for demo
    };

    const handleSendRequest = () => {
        setRequestSent(true);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                    <Ionicons name="close" size={28} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Friend Request</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                {/* Avatars */}
                <View style={styles.avatarsRow}>
                    <View style={styles.userCol}>
                        <Image source={{ uri: currentUser.avatar }} style={styles.avatar} />
                        <Text style={styles.username}>{currentUser.username}</Text>
                    </View>

                    <View style={styles.connector}>
                        <View style={styles.line} />
                        <View style={styles.iconCircle}>
                            <Ionicons name={requestSent ? "checkmark" : "arrow-forward"} size={20} color="#000" />
                        </View>
                    </View>

                    <View style={styles.userCol}>
                        {targetUser.avatar ? (
                            <Image source={{ uri: targetUser.avatar }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, { backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' }]}>
                                <Ionicons name="person" size={32} color="#666" />
                            </View>
                        )}
                        <Text style={styles.username}>{targetUser.username}</Text>
                    </View>
                </View>

                {requestSent ? (
                    <View style={styles.successContainer}>
                        <View style={styles.successBadge}>
                            <Ionicons name="checkmark-circle" size={48} color={NEON} />
                        </View>
                        <Text style={styles.successTitle}>Request Sent!</Text>
                        <Text style={styles.successText}>
                            Wakeup buddy request has been sent to <Text style={{ color: '#fff', fontWeight: 'bold' }}>{targetUser.username}</Text>
                        </Text>

                        <View style={styles.streakComparison}>
                            <Text style={styles.streakTitle}>Current Streaks</Text>
                            <View style={styles.streakRow}>
                                <View style={styles.streakBox}>
                                    <Ionicons name="flame" size={24} color={NEON} />
                                    <Text style={styles.streakNum}>{currentUser.streak}</Text>
                                    <Text style={styles.streakLabel}>You</Text>
                                </View>
                                <View style={styles.vsBadge}>
                                    <Text style={styles.vsText}>VS</Text>
                                </View>
                                <View style={styles.streakBox}>
                                    <Ionicons name="flame" size={24} color={NEON} />
                                    <Text style={styles.streakNum}>{targetUser.streak}</Text>
                                    <Text style={styles.streakLabel}>{targetUser.name.split(' ')[0]}</Text>
                                </View>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.back()}>
                            <Text style={styles.secondaryBtnText}>Back to Profile</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.actionContainer}>
                        <Text style={styles.promptText}>Send a request to become wake buddies with {targetUser.name.split(' ')[0]}!</Text>
                        <TouchableOpacity style={styles.primaryBtn} onPress={handleSendRequest} activeOpacity={0.8}>
                            <Text style={styles.primaryBtnText}>Give Friend Request</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: BG, padding: 20 },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40, marginTop: 20 },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
    iconButton: { padding: 6 },

    content: { flex: 1, alignItems: 'center' },

    avatarsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 40, width: '100%' },
    userCol: { alignItems: 'center' },
    avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: '#333' },
    username: { color: '#fff', marginTop: 8, fontWeight: '600' },

    connector: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
    line: { height: 2, backgroundColor: '#333', flex: 1, position: 'absolute', left: 0, right: 0 },
    iconCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: NEON, justifyContent: 'center', alignItems: 'center', zIndex: 1 },

    actionContainer: { width: '100%', alignItems: 'center' },
    promptText: { color: GRAY, textAlign: 'center', marginBottom: 24, fontSize: 16 },
    primaryBtn: { backgroundColor: NEON, paddingVertical: 16, borderRadius: 12, alignItems: 'center', width: '100%' },
    primaryBtnText: { color: '#000', fontWeight: '700', fontSize: 16 },

    successContainer: { width: '100%', alignItems: 'center' },
    successBadge: { marginBottom: 16 },
    successTitle: { color: '#fff', fontSize: 24, fontWeight: '700', marginBottom: 8 },
    successText: { color: GRAY, textAlign: 'center', marginBottom: 40, fontSize: 16, lineHeight: 24 },

    streakComparison: { backgroundColor: '#111', padding: 20, borderRadius: 16, width: '100%', marginBottom: 30 },
    streakTitle: { color: GRAY, fontSize: 14, textAlign: 'center', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 },
    streakRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
    streakBox: { alignItems: 'center' },
    streakNum: { color: '#fff', fontSize: 24, fontWeight: '700', marginVertical: 4 },
    streakLabel: { color: GRAY, fontSize: 12 },
    vsBadge: { backgroundColor: '#222', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    vsText: { color: '#666', fontSize: 10, fontWeight: '700' },

    secondaryBtn: { backgroundColor: '#222', paddingVertical: 16, borderRadius: 12, alignItems: 'center', width: '100%' },
    secondaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
