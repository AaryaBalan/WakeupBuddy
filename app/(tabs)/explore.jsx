import { Ionicons } from '@expo/vector-icons';
import { useQuery } from "convex/react";
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
                        <Text style={styles.youBadgeText}>YOU</Text>
                    </View>
                )}
                <View style={styles.featuredImageContainer}>
                    <ProfilePic user={item} size={70} />
                    {item.streak >= 7 && (
                        <View style={[styles.featuredBadge, isMe && styles.featuredBadgeMe]}>
                            <Text style={{ fontSize: 10 }}>🔥</Text>
                        </View>
                    )}
                    {isMe && (
                        <View style={styles.meRing} />
                    )}
                </View>
                <Text style={[styles.featuredName, isMe && styles.featuredNameMe]} numberOfLines={1}>
                    {isMe ? 'You' : item.name}
                </Text>
                <Text style={[styles.featuredStreak, isMe && styles.featuredStreakMe]}>
                    {item.streak || 0} day streak
                </Text>
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
                    <Text style={styles.userName}>{item.name}</Text>
                    <Text style={styles.userUsername}>@{item.username}</Text>
                    {item.bio ? (
                        <Text style={styles.userBio} numberOfLines={2}>{item.bio}</Text>
                    ) : (
                        <Text style={[styles.userBio, { fontStyle: 'italic' }]}>No bio yet</Text>
                    )}
                </View>
            </View>

            <View style={styles.userCardBottom}>
                <View style={styles.streakContainer}>
                    <View style={styles.streakBadge}>
                        <Text style={{ fontSize: 12 }}>🔥</Text>
                        <Text style={styles.streakText}>{item.streak || 0}</Text>
                    </View>
                    <View style={styles.maxStreakBadge}>
                        <Text style={{ fontSize: 12 }}>🏆</Text>
                        <Text style={styles.maxStreakText}>{item.maxStreak || 0}</Text>
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
                        <Text style={styles.inviteButtonText}>Invite</Text>
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
                    <Text style={styles.loadingText}>Finding buddies...</Text>
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
                            <Text style={styles.headerTitle}>Explore</Text>
                            <Text style={styles.headerSubtitle}>Find your wake-up buddy</Text>
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
                                <Text style={styles.statNumber}>{allUsersIncludingMe?.length || 0}</Text>
                                <Text style={styles.statLabel}>Total Users</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Text style={styles.statNumber}>
                                    {allUsersIncludingMe?.filter(u => (u.streak || 0) > 0).length || 0}
                                </Text>
                                <Text style={styles.statLabel}>Active Streaks</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Text style={styles.statNumber}>
                                    {Math.max(...(allUsersIncludingMe?.map(u => u.maxStreak || 0) || [0]))}
                                </Text>
                                <Text style={styles.statLabel}>Top Streak</Text>
                            </View>
                        </View>

                        {/* Featured Top Streakers */}
                        {topStreakers && topStreakers.length > 0 && (
                            <View style={styles.featuredSection}>
                                <Text style={styles.sectionTitle}>🏆 Top Streakers</Text>
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
                        <Text style={styles.sectionTitle}>
                            {searchQuery ? `Results for "${searchQuery}"` : 'All Buddies'}
                        </Text>
                    </>
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="people-outline" size={60} color="#333" style={styles.emptyIcon} />
                        <Text style={styles.emptyText}>
                            {searchQuery ? 'No users found' : 'No buddies yet'}
                        </Text>
                        <Text style={styles.emptySubtext}>
                            {searchQuery
                                ? 'Try a different search term'
                                : 'Be the first to invite friends!'}
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}