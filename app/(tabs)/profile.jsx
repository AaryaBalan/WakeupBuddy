import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from "convex/react";
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Toast } from 'toastify-react-native';
import ProfilePic from '../../components/ProfilePic';
import { useUser } from '../../contexts/UserContext';
import { api } from "../../convex/_generated/api";
import styles from '../../styles/profile.styles';

const { width } = Dimensions.get('window');
const NEON = '#C9E265';
const BG = '#000';
const GRAY = '#BDBDBD';

export default function Profile() {
  const router = useRouter();
  const { user, logout, updateUser: updateContextUser } = useUser();
  const updateUserMutation = useMutation(api.users.updateUser);

  const [modalVisible, setModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Get 60-day streak data for heatmap
  const recentStreaks = useQuery(
    api.streaks.getRecentStreaks,
    user?.email ? { userEmail: user.email, days: 80 } : "skip"
  );

  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditBio(user.bio || '');
      setEditPhone(user.phone || '');
    }
  }, [user]);

  const achievements = [
    { key: '7day', label: '7 Day Streak', icon: 'flame' },
    { key: 'early', label: 'Early Bird', icon: 'sunny' },
    { key: 'help5', label: 'Help 5 Buddies', icon: 'people' },
    { key: 'locked', label: 'Locked', icon: 'lock-closed' },
  ];

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const updatedUser = await updateUserMutation({
        id: user._id,
        name: editName,
        bio: editBio,
        phone: editPhone,
      });

      await updateContextUser(updatedUser);
      setModalVisible(false);
      Toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      Toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  // Generate username from email or name
  const generateUsername = () => {
    if (!user) return '@user';
    if (user.username) return '@' + user.username;
    if (user.name) {
      return '@' + user.name.toLowerCase().replace(/\s+/g, '_');
    }
    return '@' + user.email.split('@')[0];
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Profile</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                style={styles.iconButton}
                activeOpacity={0.7}
                onPress={() => setModalVisible(true)}
              >
                <Ionicons name="pencil" size={24} color={NEON} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
                <Ionicons name="settings-outline" size={24} color={GRAY} />
              </TouchableOpacity>
            </View>
          </View>

          {/* User Card */}
          <View style={styles.card}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarRing}>
                <ProfilePic user={user} size={100} />
              </View>
              <View style={styles.badge}>
                <Ionicons name="camera" size={14} color="#000" />
              </View>
            </View>
            <Text style={styles.name}>{user?.name || 'User'}</Text>
            <Text style={styles.username}>{generateUsername()}</Text>
            <Text style={styles.bio}>{user?.bio || 'Welcome to WakeBuddy! Start your journey to better mornings. 🌅'}</Text>

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
            {(() => {
              // Generate last 60 days
              const days = [];
              for (let i = 79; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                days.push(dateStr);
              }

              // Map to grid boxes with colors
              return days.map((dateStr, index) => {
                const streakData = recentStreaks?.find(s => s.date === dateStr);
                const count = streakData?.count || 0;

                // Color based on count (GitHub-style)
                let boxColor = '#1a1a1a'; // Grey/ash for 0
                if (count >= 7) boxColor = NEON; // Bright neon for 7+
                else if (count >= 5) boxColor = '#6a9a3d'; // Bright green for 5-6
                else if (count >= 3) boxColor = '#2d4a2d'; // Medium green for 3-4
                else if (count >= 1) boxColor = '#1a2a1a'; // Light green for 1-2

                return (
                  <View key={index} style={[styles.gridSquare, { backgroundColor: boxColor }]} />
                );
              });
            })()}
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

      {/* Edit Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Enter your name"
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Bio</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={editBio}
                  onChangeText={setEditBio}
                  placeholder="Tell us about yourself"
                  placeholderTextColor="#666"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone</Text>
                <TextInput
                  style={styles.input}
                  value={editPhone}
                  onChangeText={setEditPhone}
                  placeholder="Enter phone number"
                  placeholderTextColor="#666"
                  keyboardType="phone-pad"
                />
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveProfile}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}