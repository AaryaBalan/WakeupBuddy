import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const NEON = '#C9E265';
const BG = '#000';
const GRAY = '#BDBDBD';

export default function Profile() {
  const router = useRouter();

  const gridSquares = Array.from({ length: 81 }).map((_, i) => ({
    filled: Math.random() > 0.7,
    id: i,
  }));

  const achievements = [
    { key: '7day', label: '7 Day Streak', icon: 'flame' },
    { key: 'early', label: 'Early Bird', icon: 'sunny' },
    { key: 'help5', label: 'Help 5 Buddies', icon: 'people' },
    { key: 'locked', label: 'Locked', icon: 'lock-closed' },
  ];

  const handleLogout = async () => {
    await AsyncStorage.removeItem('user');
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Profile</Text>
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
              <Ionicons name="settings-outline" size={24} color={GRAY} />
            </TouchableOpacity>
          </View>

          {/* User Card */}
          <View style={styles.card}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarRing}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' }}
                  style={styles.avatar}
                />
              </View>
              <View style={styles.badge}>
                <Ionicons name="camera" size={14} color="#000" />
              </View>
            </View>
            <Text style={styles.name}>Alex Walker</Text>
            <Text style={styles.username}>@alex_walker_us</Text>
            <Text style={styles.bio}>Morning person in training 🌅 | Seeking wake buddies in NYC time zone.</Text>

            <TouchableOpacity style={styles.shareButton} activeOpacity={0.8}>
              <Ionicons name="share-social" size={16} color="#000" style={{ marginRight: 6 }} />
              <Text style={styles.shareText}>Share Profile</Text>
            </TouchableOpacity>
          </View>

          {/* Stats Section */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>128</Text>
              <Text style={styles.statLabel}>Wakeups</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>45</Text>
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

          {/* Settings */}
          <Text style={styles.settingsHeader}>Settings</Text>
          <View style={styles.settingsCard}>
            {[
              { key: 'account', label: 'Account Details', icon: 'person-outline' },
              { key: 'wake', label: 'Wake Preferences', icon: 'time-outline' },
              { key: 'privacy', label: 'Privacy & Data', icon: 'shield-checkmark-outline' },
              { key: 'notifications', label: 'Notifications', icon: 'notifications-outline' },
            ].map((item) => (
              <TouchableOpacity key={item.key} style={styles.settingRow} activeOpacity={0.7}>
                <View style={styles.settingLeft}>
                  <Ionicons name={item.icon} size={20} color={GRAY} />
                  <Text style={styles.settingLabel}>{item.label}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={GRAY} />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.premiumRow} activeOpacity={0.7}>
            <View style={styles.settingLeft}>
              <Ionicons name="star" size={20} color={NEON} />
              <Text style={styles.premiumText}>Manage Premium</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={GRAY} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} activeOpacity={0.7} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#000" style={{ marginRight: 8 }} />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>

          <Text style={styles.versionText}>WakeBuddy v1.0.2</Text>

          <View style={{ height: 80 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  scroll: { padding: 16, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: '700' },
  iconButton: { padding: 6 },

  card: {
    backgroundColor: '#070707',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
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
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: NEON,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#070707',
  },
  name: { color: '#fff', fontSize: 22, fontWeight: '700' },
  username: { color: GRAY, fontSize: 15, marginTop: 4 },
  bio: { color: '#9f9f9f', fontSize: 13, marginTop: 8, textAlign: 'center' },
  shareButton: { marginTop: 12, backgroundColor: NEON, paddingVertical: 10, paddingHorizontal: 22, borderRadius: 999, flexDirection: 'row', alignItems: 'center' },
  shareText: { color: '#000', fontWeight: '700' },

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

  settingsHeader: { color: '#fff', fontWeight: '700', fontSize: 16, marginTop: 20, marginBottom: 12 },
  settingsCard: { borderRadius: 12, backgroundColor: '#070707', overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 14, borderBottomColor: '#121212', borderBottomWidth: 1 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingLabel: { color: '#fff', marginLeft: 12 },

  premiumRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#070707'
  },
  premiumText: { color: '#fff', marginLeft: 12 },

  logoutButton: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: NEON,
  },
  logoutText: { color: '#000', fontSize: 15, fontWeight: '700' },
  versionText: { color: GRAY, fontSize: 12, textAlign: 'center', marginTop: 16 },
});
