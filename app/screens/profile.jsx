import { Ionicons } from '@expo/vector-icons';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');
const NEON = '#C8FF00';
const BG = '#000';
const GRAY = '#BDBDBD';

export default function Profile() {
  const gridSquares = Array.from({ length: 35 }).map((_, i) => ({
    filled: i % 3 === 0,
    id: i,
  }));

  const achievements = [
    { key: '7day', label: '7 Day Streak', icon: 'flame' },
    { key: 'help5', label: 'Help 5 Buddies', icon: 'people' },
    { key: 'early', label: 'Early Bird', icon: 'sunny' },
    { key: 'locked', label: 'Locked', icon: 'lock-closed' },
  ];

  return (
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
          <Image
            source={{ uri: 'https://placekitten.com/300/300' }}
            style={styles.avatar}
          />
          <Text style={styles.name}>Alex Walker</Text>
          <Text style={styles.username}>@alex_w</Text>
          <Text style={styles.bio}>Morning person in training. Seeking wake buddies in NYC time zone.</Text>

          <TouchableOpacity style={styles.shareButton} activeOpacity={0.8}>
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
          <Text style={styles.sectionTitle}>October 2023</Text>
          <TouchableOpacity style={styles.viewAllBtn} activeOpacity={0.8}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.gridContainer}>
          {gridSquares.map((sq) => (
            <View key={sq.id} style={[styles.gridSquare, sq.filled && styles.gridSquareFilled]} />
          ))}
        </View>

        {/* Achievements */}
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

        {/* Settings List */}
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

        {/* Footer */}
        <TouchableOpacity style={styles.premiumBtn} activeOpacity={0.85}>
          <Text style={styles.premiumText}>Manage Premium</Text>
        </TouchableOpacity>

        <View style={styles.footerRow}>
          <Text style={styles.versionText}>WakeBuddy v1.0.2</Text>
          <TouchableOpacity>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} activeOpacity={0.7}>
          <Ionicons name="home-outline" size={22} color={GRAY} />
          <Text style={styles.tabLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} activeOpacity={0.7}>
          <Ionicons name="trail-sign-outline" size={22} color={GRAY} />
          <Text style={styles.tabLabel}>Rest</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} activeOpacity={0.7}>
          <Ionicons name="alarm-outline" size={22} color={GRAY} />
          <Text style={styles.tabLabel}>Alarms</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} activeOpacity={0.7}>
          <Ionicons name="person" size={22} color={NEON} />
          <Text style={[styles.tabLabel, { color: NEON }]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  scroll: { padding: 16, paddingBottom: 120 },
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
  avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 12, borderWidth: 2, borderColor: '#111' },
  name: { color: '#fff', fontSize: 22, fontWeight: '700' },
  username: { color: GRAY, fontSize: 15, marginTop: 4 },
  bio: { color: '#9f9f9f', fontSize: 13, marginTop: 8, textAlign: 'center' },
  shareButton: { marginTop: 12, backgroundColor: NEON, paddingVertical: 10, paddingHorizontal: 22, borderRadius: 999 },
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

  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  sectionTitle: { color: '#fff', fontWeight: '700' },
  viewAllBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: NEON },
  viewAllText: { color: NEON, fontSize: 12, fontWeight: '700' },

  gridContainer: {
    marginTop: 10,
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridSquare: { width: (width - 16 * 2 - 6 * 6) / 7, height: 14, margin: 3, borderRadius: 3, backgroundColor: '#111' },
  gridSquareFilled: { backgroundColor: NEON },

  achRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 },
  achItem: { alignItems: 'center', width: (width - 32) / 4, },
  achCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#0b0b0b', justifyContent: 'center', alignItems: 'center' },
  achievedRing: { borderWidth: 2, borderColor: NEON },
  achLabel: { color: GRAY, fontSize: 11, marginTop: 8, textAlign: 'center' },

  settingsCard: { marginTop: 20, borderRadius: 12, backgroundColor: '#070707', overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 14, borderBottomColor: '#121212', borderBottomWidth: 1 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingLabel: { color: '#fff', marginLeft: 12 },

  premiumBtn: { marginTop: 18, backgroundColor: NEON, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  premiumText: { color: '#000', fontWeight: '700' },

  footerRow: { marginTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 2 },
  versionText: { color: GRAY, fontSize: 12 },
  logoutText: { color: GRAY, fontSize: 12 },

  tabBar: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 64, backgroundColor: '#050505', borderTopWidth: 1, borderTopColor: '#101010', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  tabItem: { alignItems: 'center' },
  tabLabel: { color: GRAY, fontSize: 11, marginTop: 2 },
});
