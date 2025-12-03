import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from "convex/react";
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProfilePic from '../../components/ProfilePic';
import { usePopup } from '../../contexts/PopupContext';
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
  const updateProfileCodeMutation = useMutation(api.users.updateProfileCode);
  const { showPopup } = usePopup();

  const [modalVisible, setModalVisible] = useState(false);
  const [friendsModalVisible, setFriendsModalVisible] = useState(false);
  const [avatarPickerVisible, setAvatarPickerVisible] = useState(false);
  const [avatarOptions, setAvatarOptions] = useState([]);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);

  // Get 90-day streak data for heatmap (3 months)
  const recentStreaks = useQuery(
    api.streaks.getRecentStreaks,
    user?.email ? { userEmail: user.email, days: 90 } : "skip"
  );

  // Get friends list
  const friends = useQuery(
    api.friends.getFriends,
    user?.email ? { userEmail: user.email } : "skip"
  );

  // Get friend count
  const friendCount = useQuery(
    api.friends.getFriendCount,
    user?.email ? { userEmail: user.email } : "skip"
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

  // Generate random avatar codes
  const generateRandomAvatarCodes = () => {
    const codes = [];
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 8; i++) {
      let code = '';
      for (let j = 0; j < 10; j++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      codes.push(code);
    }
    return codes;
  };

  // Open avatar picker with random options
  const openAvatarPicker = () => {
    const randomCodes = generateRandomAvatarCodes();
    setAvatarOptions(randomCodes);
    setAvatarPickerVisible(true);
  };

  // Handle avatar selection
  const handleAvatarSelect = async (code) => {
    if (!user) return;
    setIsSavingAvatar(true);
    try {
      const updatedUser = await updateProfileCodeMutation({
        id: user._id,
        profile_code: code,
      });
      await updateContextUser(updatedUser);
      setAvatarPickerVisible(false);
      showPopup('Profile picture updated!', '#4CAF50');
    } catch (error) {
      console.error('Failed to update avatar:', error);
      showPopup('Failed to update avatar', '#FF6B6B');
    } finally {
      setIsSavingAvatar(false);
    }
  };

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
      showPopup('Profile updated successfully', '#4CAF50');
    } catch (error) {
      console.error('Failed to update profile:', error);
      showPopup('Failed to update profile', '#FF6B6B');
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
              <TouchableOpacity
                style={styles.iconButton}
                activeOpacity={0.7}
                onPress={() => router.push('/screens/PermissionsGuide')}
              >
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
              <TouchableOpacity
                style={styles.badge}
                activeOpacity={0.7}
                onPress={openAvatarPicker}
              >
                <Ionicons name="camera" size={14} color="#000" />
              </TouchableOpacity>
            </View>
            <Text style={styles.name}>{user?.name || 'User'}</Text>
            <Text style={styles.username}>{generateUsername()}</Text>
            <Text style={styles.bio}>{user?.bio || 'Welcome to WakeBuddy! Start your journey to better mornings.'}</Text>

            <TouchableOpacity style={styles.shareButton} activeOpacity={0.8}>
              <Ionicons name="share-social" size={16} color="#000" style={{ marginRight: 6 }} />
              <Text style={styles.shareText}>Share Profile</Text>
            </TouchableOpacity>
          </View>

          {/* Stats Section */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{recentStreaks?.length || 0}</Text>
              <Text style={styles.statLabel}>Wakeups</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{user?.streak || 0}</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{user?.maxStreak || 0}</Text>
              <Text style={styles.statLabel}>Best</Text>
            </View>
          </View>

          {/* My Friends Button */}
          <TouchableOpacity
            style={styles.friendsButton}
            activeOpacity={0.8}
            onPress={() => setFriendsModalVisible(true)}
          >
            <Ionicons name="people" size={20} color="#000" style={{ marginRight: 8 }} />
            <Text style={styles.friendsButtonText}>My Buddies</Text>
            <View style={styles.friendsCountBadge}>
              <Text style={styles.friendsCountText}>{friendCount || 0}</Text>
            </View>
          </TouchableOpacity>

          {/* Wake History */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Wake History</Text>
            <TouchableOpacity activeOpacity={0.8}>
              <Text style={styles.viewAllText}>Last 90 days</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.historySubHeader}>
            <Text style={styles.monthText}>
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Text>
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
              // Generate last 90 days (3 months)
              const days = [];
              for (let i = 89; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                days.push(dateStr);
              }

              // Create a map for quick lookup
              const streakMap = new Map();
              recentStreaks?.forEach(s => streakMap.set(s.date, s.count));

              // Map to grid boxes with colors
              return days.map((dateStr, index) => {
                const count = streakMap.get(dateStr) || 0;

                // Intensity based on count
                const intensity = count >= 3 ? 4 : count >= 2 ? 3 : count >= 1 ? 2 : 0;

                return (
                  <View
                    key={index}
                    style={[
                      styles.gridSquare,
                      intensity === 2 && styles.gridSquareLight,
                      intensity === 3 && styles.gridSquareMedium,
                      intensity === 4 && styles.gridSquareFilled,
                    ]}
                  />
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
              { key: 'wake', label: 'Wake Preferences', icon: 'time-outline', route: '/screens/PermissionsGuide' },
              { key: 'privacy', label: 'Privacy & Data', icon: 'shield-checkmark-outline' },
              { key: 'notifications', label: 'Notifications', icon: 'notifications-outline', route: '/screens/PermissionsGuide' },
            ].map((item) => (
              <TouchableOpacity
                key={item.key}
                style={styles.settingRow}
                activeOpacity={0.7}
                onPress={() => item.route && router.push(item.route)}
              >
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

      {/* Friends Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={friendsModalVisible}
        onRequestClose={() => setFriendsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.friendsModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>My Friends</Text>
              <TouchableOpacity onPress={() => setFriendsModalVisible(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {!friends || friends.length === 0 ? (
              <View style={styles.emptyFriendsContainer}>
                <Ionicons name="people-outline" size={60} color={GRAY} />
                <Text style={styles.emptyFriendsText}>No friends yet</Text>
                <Text style={styles.emptyFriendsSubtext}>
                  Explore and add friends to wake up together!
                </Text>
                <TouchableOpacity
                  style={styles.exploreFriendsButton}
                  onPress={() => {
                    setFriendsModalVisible(false);
                    router.push('/(tabs)/rank');
                  }}
                >
                  <Ionicons name="search" size={18} color="#000" style={{ marginRight: 6 }} />
                  <Text style={styles.exploreFriendsText}>Find Friends</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView style={styles.friendsList} showsVerticalScrollIndicator={false}>
                {friends.map((item) => (
                  <TouchableOpacity
                    key={item.friendshipId}
                    style={styles.friendCard}
                    activeOpacity={0.7}
                    onPress={() => {
                      setFriendsModalVisible(false);
                      router.push({
                        pathname: '/user/[id]',
                        params: {
                          id: item.friend._id,
                          name: item.friend.name,
                          email: item.friend.email,
                          bio: item.friend.bio || '',
                          profileImageSeed: item.friend.profileImageSeed || ''
                        }
                      });
                    }}
                  >
                    <ProfilePic user={item.friend} size={50} />
                    <View style={styles.friendInfo}>
                      <Text style={styles.friendName}>{item.friend.name}</Text>
                      <Text style={styles.friendBio} numberOfLines={1}>
                        {item.friend.bio || 'No bio yet'}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={GRAY} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Avatar Picker Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={avatarPickerVisible}
        onRequestClose={() => setAvatarPickerVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.avatarPickerContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Avatar</Text>
              <TouchableOpacity onPress={() => setAvatarPickerVisible(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <Text style={styles.avatarPickerSubtitle}>
              Select a new profile picture
            </Text>

            <View style={styles.avatarOptionsContainer}>
              {avatarOptions.map((code, index) => (
                <TouchableOpacity
                  key={code}
                  style={styles.avatarOption}
                  activeOpacity={0.7}
                  onPress={() => handleAvatarSelect(code)}
                  disabled={isSavingAvatar}
                >
                  <View style={styles.avatarOptionRing}>
                    <ProfilePic seed={code} size={70} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.refreshAvatarsButton}
              activeOpacity={0.7}
              onPress={() => setAvatarOptions(generateRandomAvatarCodes())}
              disabled={isSavingAvatar}
            >
              <Ionicons name="refresh" size={20} color="#000" style={{ marginRight: 8 }} />
              <Text style={styles.refreshAvatarsText}>Show More Options</Text>
            </TouchableOpacity>

            {isSavingAvatar && (
              <View style={styles.savingOverlay}>
                <ActivityIndicator size="large" color={NEON} />
                <Text style={styles.savingText}>Updating avatar...</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}