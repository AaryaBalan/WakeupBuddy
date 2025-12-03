import { Ionicons } from '@expo/vector-icons';
import { useQuery } from "convex/react";
import { useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from '../../components/AppText';
import ProfilePic from '../../components/ProfilePic';
import { useUser } from '../../contexts/UserContext';
import { api } from "../../convex/_generated/api";
import styles from '../../styles/myBuddies.styles';

export default function MyBuddiesScreen() {
    const router = useRouter();
    const { user } = useUser();

    const friends = useQuery(
        api.friends.getFriends,
        user?.email ? { userEmail: user.email } : "skip"
    );

    const renderFriend = ({ item }) => {
        const friend = item.friend;
        const friendsSince = item.friendsSince 
            ? new Date(item.friendsSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
            : '';

        return (
            <TouchableOpacity 
                style={styles.friendCard}
                onPress={() => router.push(`/user/${friend._id}`)}
            >
                <ProfilePic user={friend} size={50} />
                <View style={styles.friendInfo}>
                    <AppText style={styles.friendName}>{friend.name}</AppText>
                    <AppText style={styles.friendUsername}>@{friend.username}</AppText>
                    {friendsSince && (
                        <AppText style={styles.friendsSince}>Friends since {friendsSince}</AppText>
                    )}
                </View>
                <View style={styles.friendStats}>
                    <View style={styles.streakBadge}>
                        <Ionicons name="flame" size={14} color="#FF6B35" />
                        <AppText style={styles.streakText}>{friend.streak || 0}</AppText>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#666" />
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <AppText style={styles.headerTitle}>My Buddies</AppText>
                <View style={{ width: 40 }} />
            </View>

            {/* Friends Count */}
            {friends && (
                <View style={styles.countContainer}>
                    <AppText style={styles.countText}>
                        {friends.length} {friends.length === 1 ? 'Buddy' : 'Buddies'}
                    </AppText>
                </View>
            )}

            {/* Friends List */}
            {friends === undefined ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#C9E265" />
                </View>
            ) : (
                <FlatList
                    data={friends}
                    renderItem={renderFriend}
                    keyExtractor={item => item.friendshipId}
                    contentContainerStyle={[
                        styles.listContent,
                        friends.length === 0 && styles.emptyListContent
                    ]}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="people-outline" size={80} color="#333" />
                            <AppText style={styles.emptyTitle}>No Buddies Yet</AppText>
                            <AppText style={styles.emptySubtitle}>
                                Find people to connect with and become wake buddies!
                            </AppText>
                            <TouchableOpacity 
                                style={styles.exploreButton}
                                onPress={() => router.push('/(tabs)/rank')}
                            >
                                <Ionicons name="search" size={18} color="#000" />
                                <AppText style={styles.exploreButtonText}>Explore People</AppText>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}
