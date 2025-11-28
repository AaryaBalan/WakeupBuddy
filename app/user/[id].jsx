import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from "../../styles/profile.styles"

const { width } = Dimensions.get('window');
const NEON = '#C9E265';
const BG = '#000';
const GRAY = '#BDBDBD';

export default function PublicProfile() {
    const params = useLocalSearchParams();
    const router = useRouter();

    // Use params from navigation, fallback to defaults if missing
    const user = {
        name: params.name || 'User',
        username: params.username || `@user_${params.id}`,
        bio: params.bio || 'Morning person in training. 🌅',
        avatar: params.avatar || null,
        badge: params.badge || '',
    };

    const gridSquares = Array.from({ length: 81 }).map((_, i) => ({
        filled: Math.random() > 0.6,
        id: i,
    }));

    const achievements = [
        { key: '7day', label: '7 Day Streak', icon: 'flame' },
        { key: 'early', label: 'Early Bird', icon: 'sunny' },
        { key: 'help5', label: 'Help 5 Buddies', icon: 'people' },
        { key: 'locked', label: 'Locked', icon: 'lock-closed' },
    ];

    const handleFriendRequest = () => {
        router.push({
            pathname: `/request/${params.id}`,
            params: {
                name: user.name,
                avatar: user.avatar,
                username: user.username
            }
        });
    };

    return (
        <SafeAreaView style={styles.container}>

            <View style={styles.container}>
                <ScrollView contentContainerStyle={styles.scroll}>
                    {/* Header */}
                    <View style={styles.headerRow}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Profile</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    {/* User Card */}
                    <View style={styles.card}>
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatarRing}>
                                {user.avatar ? (
                                    <Image source={{ uri: user.avatar }} style={styles.avatar} />
                                ) : (
                                    <View style={[styles.avatar, { backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' }]}>
                                        <Ionicons name="person" size={40} color="#666" />
                                    </View>
                                )}
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={styles.name}>{user.name}</Text>
                            {user.badge ? <Text style={{ fontSize: 18 }}>{user.badge}</Text> : null}
                        </View>
                        <Text style={styles.username}>{user.username}</Text>
                        <Text style={styles.bio}>{user.bio}</Text>

                        {/* Friend Actions */}
                        <View style={styles.actionButtons}>
                            <TouchableOpacity style={styles.primaryBtn} onPress={handleFriendRequest} activeOpacity={0.8}>
                                <Text style={styles.primaryBtnText}>Give Friend Request</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.8}>
                                <Text style={styles.secondaryBtnText}>Manage Friendship</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Stats Section */}
                    <View style={styles.statsRow}>
                        <View style={styles.statBox}>
                            <Text style={styles.statNumber}>142</Text>
                            <Text style={styles.statLabel}>Wakeups</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={styles.statNumber}>28</Text>
                            <Text style={styles.statLabel}>Streak</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={styles.statNumber}>15</Text>
                            <Text style={styles.statLabel}>Buddies</Text>
                        </View>
                    </View>

                    {/* Wake History */}
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionTitle}>Wake History</Text>
                        <TouchableOpacity activeOpacity={0.8}>
                            <Text style={styles.viewAllText}>View All</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.historySubHeader}>
                        <Text style={styles.monthText}>October 2023</Text>
                        <View style={styles.legend}>
                            <Text style={styles.legendText}>Less</Text>
                            <View style={styles.legendSquare1} />
                            <View style={styles.legendSquare2} />
                            <View style={styles.legendSquare3} />
                            <View style={styles.legendSquare4} />
                            <Text style={styles.legendText}>More</Text>
                        </View>
                    </View>

                    <View style={styles.gridContainer}>
                        {gridSquares.map((sq) => (
                            <View key={sq.id} style={[styles.gridSquare, sq.filled && styles.gridSquareFilled]} />
                        ))}
                    </View>

                    {/* Achievements */}
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionTitle}>Achievements</Text>
                        <Text style={styles.achCount}>12/48 Unlocked</Text>
                    </View>

                    <View style={styles.achRow}>
                        {achievements.map((a, idx) => {
                            const achieved = a.key !== 'locked';
                            return (
                                <View key={a.key} style={styles.achItem}>
                                    <View style={[styles.achCircle, achieved && styles.achievedRing]}>
                                        <Ionicons name={a.icon} size={22} color={achieved ? NEON : GRAY} />
                                    </View>
                                    <Text style={styles.achLabel}>{a.label}</Text>
                                </View>
                            );
                        })}
                    </View>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}