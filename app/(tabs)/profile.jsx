import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from "convex/react";
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, KeyboardAvoidingView, Modal, Platform, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Rect } from 'react-native-svg';
import AppText from '../../components/AppText';
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
  const [achievementsModalVisible, setAchievementsModalVisible] = useState(false);
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

  // Get weekly stats for bar chart
  const weeklyStats = useQuery(
    api.streaks.getWeeklyStats,
    user?.email ? { userEmail: user.email } : "skip"
  );

  // Get monthly stats for chart
  const monthlyStats = useQuery(
    api.streaks.getMonthlyStats,
    user?.email ? { userEmail: user.email } : "skip"
  );

  // Get profile stats summary
  const profileStats = useQuery(
    api.streaks.getProfileStats,
    user?.email ? { userEmail: user.email } : "skip"
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

  // Get user achievements with status
  const achievementsWithStatus = useQuery(
    api.achievements.getUserAchievementsWithStatus,
    user?._id ? { userId: user._id } : "skip"
  );

  // Get achievement count
  const achievementCount = useQuery(
    api.achievements.getAchievementCount,
    user?._id ? { userId: user._id } : "skip"
  );

  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditBio(user.bio || '');
      setEditPhone(user.phone || '');
    }
  }, [user]);

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
            <AppText style={styles.headerTitle}>Profile</AppText>
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
            <AppText style={styles.name}>{user?.name || 'User'}</AppText>
            <AppText style={styles.username}>{generateUsername()}</AppText>
            <AppText style={styles.bio} numberOfLines={3}>{user?.bio || 'Welcome to WakeBuddy! Start your journey to better mornings.'}</AppText>

            <TouchableOpacity style={styles.shareButton} activeOpacity={0.8}>
              <Ionicons name="share-social" size={16} color="#000" style={{ marginRight: 6 }} />
              <AppText style={styles.shareText}>Share Profile</AppText>
            </TouchableOpacity>
          </View>

          {/* Stats Section */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <AppText style={styles.statNumber}>{profileStats?.totalWakeups || recentStreaks?.length || 0}</AppText>
              <AppText style={styles.statLabel}>Wakeups</AppText>
            </View>
            <View style={styles.statBox}>
              <AppText style={styles.statNumber}>{user?.streak || 0}</AppText>
              <AppText style={styles.statLabel}>Streak</AppText>
            </View>
            <View style={styles.statBox}>
              <AppText style={styles.statNumber}>{user?.maxStreak || 0}</AppText>
              <AppText style={styles.statLabel}>Best</AppText>
            </View>
          </View>

          {/* My Friends Button */}
          <TouchableOpacity
            style={styles.friendsButton}
            activeOpacity={0.8}
            onPress={() => setFriendsModalVisible(true)}
          >
            <Ionicons name="people" size={20} color="#000" style={{ marginRight: 8 }} />
            <AppText style={styles.friendsButtonText}>My Buddies</AppText>
            <View style={styles.friendsCountBadge}>
              <AppText style={styles.friendsCountText}>{friendCount || 0}</AppText>
            </View>
          </TouchableOpacity>

          {/* Wake History */}
          <View style={styles.sectionHeaderRow}>
            <AppText style={styles.sectionTitle}>Wake History</AppText>
            <TouchableOpacity activeOpacity={0.8}>
              <AppText style={styles.viewAllText}>Last 90 days</AppText>
            </TouchableOpacity>
          </View>

          <View style={styles.historySubHeader}>
            <AppText style={styles.monthText}>
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </AppText>
            <View style={styles.legend}>
              <AppText style={styles.legendText}>Less</AppText>
              <View style={styles.legendSquare1} />
              <View style={styles.legendSquare2} />
              <View style={styles.legendSquare3} />
              <View style={styles.legendSquare4} />
              <AppText style={styles.legendText}>More</AppText>
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

          {/* Bar Charts - Stacked Vertically */}
          {/* Weekly Bar Chart */}
          <View style={styles.fullWidthChartCard}>
            <View style={styles.chartCardHeader}>
              <AppText style={styles.chartCardTitle}>This Week</AppText>
              <AppText style={styles.chartCardTotal}>
                {weeklyStats?.reduce((sum, d) => sum + d.count, 0) || 0} wakeups
              </AppText>
            </View>
            <View style={styles.fullBarContainer}>
              {weeklyStats?.map((day, index) => {
                const maxCount = Math.max(...(weeklyStats?.map(d => d.count) || [1]), 1);
                const barHeight = day.count > 0 ? Math.max((day.count / maxCount) * 60, 8) : 4;
                const isToday = index === 6;
                
                return (
                  <View key={day.date} style={styles.fullBarColumn}>
                    <AppText style={styles.barValueLabel}>{day.count > 0 ? day.count : ''}</AppText>
                    <View style={styles.fullBarTrack}>
                      <View 
                        style={[
                          styles.fullBar,
                          { height: barHeight },
                          day.count > 0 && styles.fullBarFilled,
                          isToday && day.count > 0 && styles.fullBarToday,
                        ]} 
                      />
                    </View>
                    <AppText style={[styles.fullBarDay, isToday && styles.fullBarDayToday]}>
                      {day.dayName}
                    </AppText>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Monthly Bar Chart */}
          <View style={styles.fullWidthChartCard}>
            <View style={styles.chartCardHeader}>
              <AppText style={styles.chartCardTitle}>Last 6 Months</AppText>
              <AppText style={styles.chartCardTotal}>
                {monthlyStats?.reduce((sum, m) => sum + m.wakeups, 0) || 0} wakeups
              </AppText>
            </View>
            <View style={styles.fullBarContainer}>
              {monthlyStats?.map((month, index) => {
                const maxWakeups = Math.max(...(monthlyStats?.map(m => m.wakeups) || [1]), 1);
                const barHeight = month.wakeups > 0 ? Math.max((month.wakeups / maxWakeups) * 60, 8) : 4;
                const isCurrentMonth = index === monthlyStats.length - 1;
                
                return (
                  <View key={month.month} style={styles.fullBarColumn}>
                    <AppText style={styles.barValueLabel}>{month.wakeups > 0 ? month.wakeups : ''}</AppText>
                    <View style={styles.fullBarTrack}>
                      <View 
                        style={[
                          styles.fullBar,
                          { height: barHeight },
                          month.wakeups > 0 && styles.fullBarFilled,
                          isCurrentMonth && month.wakeups > 0 && styles.fullBarToday,
                        ]} 
                      />
                    </View>
                    <AppText style={[styles.fullBarDay, isCurrentMonth && styles.fullBarDayToday]}>
                      {month.monthName}
                    </AppText>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Achievements */}
          <View style={styles.sectionHeaderRow}>
            <AppText style={styles.sectionTitle}>Achievements</AppText>
            <AppText style={styles.achCount}>
              {achievementCount ? `${achievementCount.earned}/${achievementCount.total}` : '0/0'} Unlocked
            </AppText>
          </View>

          <View style={styles.achRow}>
            {achievementsWithStatus ? (
              <>
                {achievementsWithStatus.slice(0, 3).map((achievement, idx) => (
                  <View key={achievement.type} style={styles.achItem}>
                    <View style={[styles.achCircle, achievement.earned && styles.achievedRing]}>
                      <Ionicons
                        name={achievement.earned ? achievement.icon : 'lock-closed'}
                        size={22}
                        color={achievement.earned ? NEON : GRAY}
                      />
                    </View>
                    <AppText style={styles.achLabel} numberOfLines={2}>
                      {achievement.earned ? achievement.name : 'Locked'}
                    </AppText>
                  </View>
                ))}
                {/* 4th item - Arrow to open modal */}
                <TouchableOpacity
                  style={styles.achItem}
                  onPress={() => setAchievementsModalVisible(true)}
                  activeOpacity={0.7}
                >
                  <View style={styles.achCircleArrow}>
                    <Ionicons name="chevron-forward" size={22} color={NEON} />
                  </View>
                  <AppText style={styles.achLabelMore}>See All</AppText>
                </TouchableOpacity>
              </>
            ) : (
              // Default placeholder achievements while loading
              <>
                {[
                  { key: '7day', label: '7 Day Streak', icon: 'flame' },
                  { key: 'early', label: 'Early Bird', icon: 'sunny' },
                  { key: 'help5', label: 'First Buddy', icon: 'people' },
                ].map((a, idx) => (
                  <View key={a.key} style={styles.achItem}>
                    <View style={styles.achCircle}>
                      <Ionicons name={a.icon} size={22} color={GRAY} />
                    </View>
                    <AppText style={styles.achLabel}>{a.label}</AppText>
                  </View>
                ))}
                {/* 5th item - Arrow placeholder */}
                <View style={styles.achItem}>
                  <View style={styles.achCircleArrow}>
                    <Ionicons name="chevron-forward" size={22} color={NEON} />
                  </View>
                  <AppText style={styles.achLabelMore}>See All</AppText>
                </View>
              </>
            )}
          </View>

          {/* Settings */}
          <AppText style={styles.settingsHeader}>Settings</AppText>
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
                  <AppText style={styles.settingLabel}>{item.label}</AppText>
                </View>
                <Ionicons name="chevron-forward" size={20} color={GRAY} />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.premiumRow} activeOpacity={0.7}>
            <View style={styles.settingLeft}>
              <Ionicons name="star" size={20} color={NEON} />
              <AppText style={styles.premiumText}>Manage Premium</AppText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={GRAY} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} activeOpacity={0.7} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#000" style={{ marginRight: 8 }} />
            <AppText style={styles.logoutText}>Log Out</AppText>
          </TouchableOpacity>

          <AppText style={styles.versionText}>WakeBuddy v1.0.2</AppText>

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
              <AppText style={styles.modalTitle}>Edit Profile</AppText>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <AppText style={styles.inputLabel}>Full Name</AppText>
                <TextInput
                  style={styles.input}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Enter your name"
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.inputGroup}>
                <AppText style={styles.inputLabel}>Bio</AppText>
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
                <AppText style={styles.inputLabel}>Phone</AppText>
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
                  <AppText style={styles.saveButtonText}>Save Changes</AppText>
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
              <AppText style={styles.modalTitle}>My Friends</AppText>
              <TouchableOpacity onPress={() => setFriendsModalVisible(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {!friends || friends.length === 0 ? (
              <View style={styles.emptyFriendsContainer}>
                <Ionicons name="people-outline" size={60} color={GRAY} />
                <AppText style={styles.emptyFriendsText}>No friends yet</AppText>
                <AppText style={styles.emptyFriendsSubtext}>
                  Explore and add friends to wake up together!
                </AppText>
                <TouchableOpacity
                  style={styles.exploreFriendsButton}
                  onPress={() => {
                    setFriendsModalVisible(false);
                    router.push('/(tabs)/rank');
                  }}
                >
                  <Ionicons name="search" size={18} color="#000" style={{ marginRight: 6 }} />
                  <AppText style={styles.exploreFriendsText}>Find Friends</AppText>
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
                          username: item.friend.username || '',
                          profile_code: item.friend.profile_code || ''
                        }
                      });
                    }}
                  >
                    <ProfilePic user={item.friend} size={50} />
                    <View style={styles.friendInfo}>
                      <AppText style={styles.friendName}>{item.friend.name}</AppText>
                      <AppText style={styles.friendBio} numberOfLines={1}>
                        {item.friend.bio || 'No bio yet'}
                      </AppText>
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
              <AppText style={styles.modalTitle}>Choose Avatar</AppText>
              <TouchableOpacity onPress={() => setAvatarPickerVisible(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <AppText style={styles.avatarPickerSubtitle}>
              Select a new profile picture
            </AppText>

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
              <AppText style={styles.refreshAvatarsText}>Show More Options</AppText>
            </TouchableOpacity>

            {isSavingAvatar && (
              <View style={styles.savingOverlay}>
                <ActivityIndicator size="large" color={NEON} />
                <AppText style={styles.savingText}>Updating avatar...</AppText>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Achievements Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={achievementsModalVisible}
        onRequestClose={() => setAchievementsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.achievementsModalContent}>
            <View style={styles.modalHeader}>
              <View>
                <AppText style={styles.modalTitle}>All Achievements</AppText>
                <AppText style={styles.achModalSubtitle}>
                  {achievementCount ? `${achievementCount.earned} of ${achievementCount.total} unlocked` : '0 of 0 unlocked'}
                </AppText>
              </View>
              <TouchableOpacity onPress={() => setAchievementsModalVisible(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.achievementsList} showsVerticalScrollIndicator={false}>
              {achievementsWithStatus && achievementsWithStatus.length > 0 ? (
                achievementsWithStatus.map((achievement) => (
                  <View
                    key={achievement.type}
                    style={[
                      styles.achievementModalItem,
                      !achievement.earned && styles.achievementModalItemLocked
                    ]}
                  >
                    <View style={[
                      styles.achModalCircle,
                      achievement.earned && styles.achModalCircleEarned
                    ]}>
                      <Ionicons
                        name={achievement.icon}
                        size={28}
                        color={achievement.earned ? NEON : '#666'}
                      />
                    </View>
                    <View style={styles.achModalInfo}>
                      <AppText style={[
                        styles.achModalName,
                        !achievement.earned && styles.achModalNameLocked
                      ]}>
                        {achievement.name}
                      </AppText>
                      <AppText style={[
                        styles.achModalDesc,
                        !achievement.earned && styles.achModalDescLocked
                      ]}>
                        {achievement.description}
                      </AppText>
                      {achievement.earned && achievement.earnedAt && (
                        <AppText style={styles.achModalDate}>
                          Earned {new Date(achievement.earnedAt).toLocaleDateString()}
                        </AppText>
                      )}
                    </View>
                    {achievement.earned ? (
                      <Ionicons name="checkmark-circle" size={24} color={NEON} />
                    ) : (
                      <Ionicons name="lock-closed" size={22} color="#666" />
                    )}
                  </View>
                ))
              ) : (
                <View style={styles.emptyAchievements}>
                  <Ionicons name="trophy-outline" size={60} color={GRAY} />
                  <AppText style={styles.emptyAchievementsText}>Loading achievements...</AppText>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}