import { Ionicons } from '@expo/vector-icons';
import { useQuery } from "convex/react";
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from '../../components/AppText';
import ProfilePic from '../../components/ProfilePic';
import { useUser } from '../../contexts/UserContext';
import { api } from "../../convex/_generated/api";
import styles from '../../styles/explore.styles';

export default function ExploreScreen() {
    const router = useRouter();
    const { user } = useUser();
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch all users (including current user for top streakers)
    const allUsersIncludingMe = useQuery(api.users.getAllUsers, {});

    // Filter out current user for the main list below
    const allUsers = allUsersIncludingMe?.filter(u => u.email !== user?.email);

    // Filter users based on search query (excluding current user)
    const filteredUsers = allUsers?.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.bio && u.bio.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Get top streakers INCLUDING current user for featured section
    const topStreakers = allUsersIncludingMe
        ?.slice()
        .sort((a, b) => (b.streak || 0) - (a.streak || 0))
        .slice(0, 5);

    const renderFeaturedUser = (item) => {
        const isMe = item.email === user?.email;

        return (
            <TouchableOpacity
                key={item._id}
                style={[
                    styles.featuredCard,
                    isMe && styles.featuredCardMe
                ]}
                onPress={() => isMe ? router.push('/(tabs)/profile') : navigateToProfile(item)}
                activeOpacity={0.7}
            >
                {isMe && (
                    <View style={styles.youBadge}>
                        <AppText style={styles.youBadgeText}>YOU</AppText>
                    </View>
                )}
                <View style={styles.featuredImageContainer}>
                    <ProfilePic user={item} size={70} />
                    {item.streak >= 7 && (
                        <View style={[styles.featuredBadge, isMe && styles.featuredBadgeMe]}>
                            <Ionicons name="flame" size={10} color="#FF6B35" />
                        </View>
                    )}
                    {isMe && (
                        <View style={styles.meRing} />
                    )}
                </View>
                <AppText style={[styles.featuredName, isMe && styles.featuredNameMe]} numberOfLines={1}>
                    {isMe ? 'You' : item.name}
                </AppText>
                <AppText style={[styles.featuredStreak, isMe && styles.featuredStreakMe]}>
                    {item.streak || 0} day streak
                </AppText>
            </TouchableOpacity>
        );
    };

    const navigateToProfile = (item) => {
        router.push({
            pathname: `/user/${item._id}`,
            params: {
                name: item.name,
                username: item.username,
                bio: item.bio || '',
                email: item.email,
                streak: item.streak || 0,
                maxStreak: item.maxStreak || 0,
                profileImageSeed: item.profileImageSeed || item.username,
            }
        });
    };

    const renderUserCard = ({ item }) => (
        <TouchableOpacity
            style={styles.userCard}
            onPress={() => navigateToProfile(item)}
            activeOpacity={0.8}
        >
            <View style={styles.userCardTop}>
                <View style={styles.userImageContainer}>
                    <ProfilePic user={item} size={60} />
                    <View style={styles.onlineIndicator} />
                </View>
                <View style={styles.userInfo}>
                    <AppText style={styles.userName}>{item.name}</AppText>
                    <AppText style={styles.userUsername}>@{item.username}</AppText>
                    {item.bio ? (
                        <AppText style={styles.userBio} numberOfLines={2}>{item.bio}</AppText>
                    ) : (
                        <AppText style={[styles.userBio, { fontStyle: 'italic' }]}>No bio yet</AppText>
                    )}
                </View>
            </View>

            <View style={styles.userCardBottom}>
                <View style={styles.streakContainer}>
                    <View style={styles.streakBadge}>
                        <Ionicons name="flame" size={12} color="#FF6B35" />
                        <AppText style={styles.streakText}>{item.streak || 0}</AppText>
                    </View>
                    <View style={styles.maxStreakBadge}>
                        <Ionicons name="trophy" size={12} color="#FFD700" />
                        <AppText style={styles.maxStreakText}>{item.maxStreak || 0}</AppText>
                    </View>
                </View>

                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={styles.inviteButton}
                        onPress={() => router.push({
                            pathname: '/screens/alarm-editor',
                            params: { buddyEmail: item.email, buddyName: item.name }
                        })}
                    >
                        <Ionicons name="alarm-outline" size={16} color="#000" />
                        <AppText style={styles.inviteButtonText}>Invite</AppText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.profileButton}
                        onPress={() => navigateToProfile(item)}
                    >
                        <Ionicons name="person-outline" size={18} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    if (allUsersIncludingMe === undefined) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#C9E265" />
                    <AppText style={styles.loadingText}>Finding buddies...</AppText>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={filteredUsers}
                keyExtractor={(item) => item._id}
                renderItem={renderUserCard}
                contentContainerStyle={styles.scrollContent}
                ListHeaderComponent={
                    <>
                        {/* Header */}
                        <View style={styles.header}>
                            <AppText style={styles.headerTitle}>Explore</AppText>
                            <AppText style={styles.headerSubtitle}>Find your wake-up buddy</AppText>
                        </View>

                        {/* Search Bar */}
                        <View style={styles.searchContainer}>
                            <Ionicons name="search-outline" size={20} color="#888" style={styles.searchIcon} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search by name or username..."
                                placeholderTextColor="#666"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchQuery('')}>
                                    <Ionicons name="close-circle" size={20} color="#666" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Stats */}
                        <View style={styles.statsContainer}>
                            <View style={styles.statCard}>
                                <AppText style={styles.statNumber}>{allUsersIncludingMe?.length || 0}</AppText>
                                <AppText style={styles.statLabel}>Total Users</AppText>
                            </View>
                            <View style={styles.statCard}>
                                <AppText style={styles.statNumber}>
                                    {allUsersIncludingMe?.filter(u => (u.streak || 0) > 0).length || 0}
                                </AppText>
                                <AppText style={styles.statLabel}>Active Streaks</AppText>
                            </View>
                            <View style={styles.statCard}>
                                <AppText style={styles.statNumber}>
                                    {Math.max(...(allUsersIncludingMe?.map(u => u.maxStreak || 0) || [0]))}
                                </AppText>
                                <AppText style={styles.statLabel}>Top Streak</AppText>
                            </View>
                        </View>

                        {/* Featured Top Streakers */}
                        {topStreakers && topStreakers.length > 0 && (
                            <View style={styles.featuredSection}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <Ionicons name="trophy" size={18} color="#FFD700" />
                                    <AppText style={styles.sectionTitle}>Top Streakers</AppText>
                                </View>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.featuredScroll}
                                >
                                    {topStreakers.map(renderFeaturedUser)}
                                </ScrollView>
                            </View>
                        )}

                        {/* All Users Section Title */}
                        <AppText style={styles.sectionTitle}>
                            {searchQuery ? `Results for "${searchQuery}"` : 'All Buddies'}
                        </AppText>
                    </>
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="people-outline" size={60} color="#333" style={styles.emptyIcon} />
                        <AppText style={styles.emptyText}>
                            {searchQuery ? 'No users found' : 'No buddies yet'}
                        </AppText>
                        <AppText style={styles.emptySubtext}>
                            {searchQuery
                                ? 'Try a different search term'
                                : 'Be the first to invite friends!'}
                        </AppText>
                    </View>
                }
            />
        </SafeAreaView>
    );
}