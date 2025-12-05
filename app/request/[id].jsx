import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import AppText from '../../components/AppText';
import ScreenWrapper from '../../components/ScreenWrapper';
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
        <ScreenWrapper>

            <View style={styles.container}>
                {/* Header */}
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                        <Ionicons name="close" size={28} color="#fff" />
                    </TouchableOpacity>
                    <AppText style={styles.headerTitle}>Friend Request</AppText>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.content}>
                    {/* Avatars */}
                    <View style={styles.avatarsRow}>
                        <View style={styles.userCol}>
                            <Image source={{ uri: currentUser.avatar }} style={styles.avatar} />
                            <AppText style={styles.username}>{currentUser.username}</AppText>
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
                            <AppText style={styles.username}>{targetUser.username}</AppText>
                        </View>
                    </View>

                    {requestSent ? (
                        <View style={styles.successContainer}>
                            <View style={styles.successBadge}>
                                <Ionicons name="checkmark-circle" size={48} color={NEON} />
                            </View>
                            <AppText style={styles.successTitle}>Request Sent!</AppText>
                            <AppText style={styles.successText}>
                                Wakeup buddy request has been sent to <AppText style={{ color: '#fff', fontWeight: 'bold' }}>{targetUser.username}</AppText>
                            </AppText>

                            <View style={styles.streakComparison}>
                                <AppText style={styles.streakTitle}>Current Streaks</AppText>
                                <View style={styles.streakRow}>
                                    <View style={styles.streakBox}>
                                        <Ionicons name="flame" size={24} color={NEON} />
                                        <AppText style={styles.streakNum}>{currentUser.streak}</AppText>
                                        <AppText style={styles.streakLabel}>You</AppText>
                                    </View>
                                    <View style={styles.vsBadge}>
                                        <AppText style={styles.vsText}>VS</AppText>
                                    </View>
                                    <View style={styles.streakBox}>
                                        <Ionicons name="flame" size={24} color={NEON} />
                                        <AppText style={styles.streakNum}>{targetUser.streak}</AppText>
                                        <AppText style={styles.streakLabel}>{targetUser.name.split(' ')[0]}</AppText>
                                    </View>
                                </View>
                            </View>

                            <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.back()}>
                                <AppText style={styles.secondaryBtnText}>Back to Profile</AppText>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.actionContainer}>
                            <AppText style={styles.promptText}>Send a request to become wake buddies with {targetUser.name.split(' ')[0]}!</AppText>
                            <TouchableOpacity style={styles.primaryBtn} onPress={handleSendRequest} activeOpacity={0.8}>
                                <AppText style={styles.primaryBtnText}>Give Friend Request</AppText>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </ScreenWrapper>
    );
}