import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: BG },
    scroll: { padding: 16, paddingBottom: 40 },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
    iconButton: { padding: 6 },

    card: {
        backgroundColor: '#070707',
        borderRadius: 16,
        padding: 18,
        alignItems: 'center',
        marginBottom: 14,
    },
    avatarContainer: { position: 'relative', marginBottom: 12 },
    avatarRing: {
        width: 108,
        height: 108,
        borderRadius: 54,
        borderWidth: 3,
        borderColor: NEON,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 2,
    },
    avatar: { width: 100, height: 100, borderRadius: 50, overflow: 'hidden' },
    name: { color: '#fff', fontSize: 22, fontWeight: '700' },
    username: { color: GRAY, fontSize: 15, marginTop: 4 },
    bio: { color: '#9f9f9f', fontSize: 13, marginTop: 8, textAlign: 'center' },

    actionButtons: { width: '100%', marginTop: 20, gap: 12 },
    primaryBtn: { backgroundColor: NEON, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
    primaryBtnText: { color: '#000', fontWeight: '700', fontSize: 16 },
    secondaryBtn: { backgroundColor: '#222', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
    secondaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },

    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 12 },
    statBox: {
        flex: 1,
        marginHorizontal: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: NEON,
        paddingVertical: 12,
        alignItems: 'center',
        backgroundColor: '#050505',
    },
    statNumber: { color: '#fff', fontSize: 18, fontWeight: '700' },
    statLabel: { color: GRAY, fontSize: 13, marginTop: 4 },

    sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 12 },
    sectionTitle: { color: '#fff', fontWeight: '700', fontSize: 16 },
    viewAllText: { color: NEON, fontSize: 12, fontWeight: '600' },

    historySubHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    monthText: { color: GRAY, fontSize: 13 },
    legend: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    legendText: { color: GRAY, fontSize: 11 },
    legendSquare1: { width: 12, height: 12, borderRadius: 2, backgroundColor: '#1a2a1a' },
    legendSquare2: { width: 12, height: 12, borderRadius: 2, backgroundColor: '#2d4a2d' },
    legendSquare3: { width: 12, height: 12, borderRadius: 2, backgroundColor: '#6a9a3d' },
    legendSquare4: { width: 12, height: 12, borderRadius: 2, backgroundColor: NEON },

    achCount: { color: GRAY, fontSize: 12 },

    gridContainer: {
        marginTop: 10,
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 30,
        justifyContent: 'center',
        gap: 6,
    },
    gridSquare: { width: 15, height: 15, borderRadius: 3, backgroundColor: '#111' },
    gridSquareFilled: { backgroundColor: NEON },

    achRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 },
    achItem: { alignItems: 'center', width: (width - 32) / 4, },
    achCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#0b0b0b', justifyContent: 'center', alignItems: 'center' },
    achievedRing: { borderWidth: 2, borderColor: NEON },
    achLabel: { color: GRAY, fontSize: 11, marginTop: 8, textAlign: 'center' },
});
