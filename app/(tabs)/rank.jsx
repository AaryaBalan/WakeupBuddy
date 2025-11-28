import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useUser } from '../../contexts/UserContext';
import ProfilePic from '../../components/ProfilePic';
import styles from '../../styles/rank.styles';

const NEON = '#C9E265';
const BG = '#000';
const GRAY = '#BDBDBD';
const DARK_GRAY = '#1A1A1A';

const DATA = [
    { id: '1', name: 'Sarah Jenkins', badge: '🔥', location: 'New York • 98% Success', points: '12,450', rank: 1, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&q=80' },
    { id: '2', name: 'Mike T.', badge: '', location: 'London • 95% Success', points: '11,200', rank: 2, avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&q=80' },
    { id: '3', name: 'Elena R.', badge: '', location: 'Berlin • 92% Success', points: '10,850', rank: 3, avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&q=80' },
    { id: '4', name: 'David Chen', badge: '', location: 'Toronto', points: '9,540', rank: 4, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&q=80' },
    { id: '5', name: 'Priya Patel', badge: '', location: 'Mumbai', points: '9,120', rank: 5, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&q=80' },
    { id: '6', name: 'John D.', badge: '', location: 'Chicago', points: '8,900', rank: 6, avatar: null },
    { id: '7', name: 'Anna K.', badge: '', location: 'Moscow', points: '8,750', rank: 7, avatar: null },
];

export default function RankScreen() {
    const router = useRouter();
    const { user } = useUser();
    const [searchQuery, setSearchQuery] = useState('');

    const renderItem = ({ item }) => {
        let rankIcon;
        if (item.rank === 1) rankIcon = <Ionicons name="trophy" size={24} color={NEON} />;
        else if (item.rank === 2) rankIcon = <Ionicons name="medal-outline" size={24} color="#C0C0C0" />;
        else if (item.rank === 3) rankIcon = <Ionicons name="medal-outline" size={24} color="#CD7F32" />;
        else rankIcon = <Text style={styles.rankText}>{item.rank}</Text>;

        return (
            <TouchableOpacity
                style={styles.itemRow}
                activeOpacity={0.7}
                onPress={() => router.push({
                    pathname: `/user/${item.id}`,
                    params: {
                        name: item.name,
                        avatar: item.avatar,
                        badge: item.badge,
                        location: item.location,
                        points: item.points,
                        rank: item.rank
                    }
                })}
            >
                <View style={styles.rankCol}>{rankIcon}</View>

                <View style={styles.avatarCol}>
                    {item.avatar ? (
                        <Image source={{ uri: item.avatar }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, styles.avatarPlaceholder]}>
                            <Text style={styles.avatarInitials}>{item.name.split(' ').map(n => n[0]).join('')}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.infoCol}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.nameText}>{item.name}</Text>
                        {item.badge ? <Text style={styles.badgeText}> {item.badge}</Text> : null}
                    </View>
                    <Text style={styles.locationText}>{item.location}</Text>
                </View>

                <View style={styles.pointsCol}>
                    <Text style={styles.pointsText}>{item.points}</Text>
                    {item.rank <= 3 && <Text style={styles.ptsLabel}>pts</Text>}
                </View>
            </TouchableOpacity>
        );
    };

    const ListHeader = () => (
        <View>
            <View style={styles.headerRow}>
                <Text style={styles.headerTitle}>Leaderboard</Text>
                <Ionicons name="information-circle-outline" size={24} color={GRAY} />
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={GRAY} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search username..."
                    placeholderTextColor="#666"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                <TouchableOpacity style={[styles.tab, styles.activeTab]}>
                    <Text style={styles.activeTabText}>Global</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tab}>
                    <Text style={styles.inactiveTabText}>Friends</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tab}>
                    <Text style={styles.inactiveTabText}>Today</Text>
                </TouchableOpacity>
            </View>

            {/* Banner */}
            <View style={styles.banner}>
                <Ionicons name="people-outline" size={18} color={NEON} style={{ marginRight: 8 }} />
                <Text style={styles.bannerText}>Earn points by waking up & solving puzzles together!</Text>
            </View>
        </View>
    );

    const ListFooter = () => (
        <View style={{ paddingBottom: 100, alignItems: 'center', marginTop: 20 }}>
            <View style={{ height: 4, width: 4, backgroundColor: '#333', borderRadius: 2, marginBottom: 4 }} />
            <View style={{ height: 4, width: 4, backgroundColor: '#333', borderRadius: 2, marginBottom: 4 }} />
            <View style={{ height: 4, width: 4, backgroundColor: '#333', borderRadius: 2 }} />

            <TouchableOpacity style={styles.inviteBtn} activeOpacity={0.8}>
                <Ionicons name="share-social-outline" size={20} color="#000" style={{ marginRight: 8 }} />
                <Text style={styles.inviteText}>Invite Friends to Compete</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={DATA}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={ListHeader}
                ListFooterComponent={ListFooter}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />

            {/* Sticky User Footer */}
            <View style={styles.stickyFooter}>
                <View style={styles.footerLeft}>
                    <Text style={styles.footerRank}>#42</Text>
                    <ProfilePic user={user} size={40} />
                    <View>
                        <Text style={styles.footerName}>{user?.name || 'You'}</Text>
                        <Text style={styles.footerPoints}>+150 pts today</Text>
                    </View>
                </View>
                <View style={styles.footerRight}>
                    <Text style={styles.footerTotal}>4,320</Text>
                    <Text style={styles.footerPercent}>Top 15%</Text>
                </View>
            </View>
        </View>
    );
}
