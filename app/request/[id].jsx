import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from '../../styles/request.styles'; 

const NEON = '#C9E265';

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
        <SafeAreaView style={styles.container}>

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
        </SafeAreaView>
    );
}