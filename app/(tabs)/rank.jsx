import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Image, TextInput, TouchableOpacity, View } from 'react-native';
import AppText from '../../components/AppText';
import ProfilePic from '../../components/ProfilePic';
import { useUser } from '../../contexts/UserContext';
import styles from '../../styles/rank.styles';

const NEON = '#C9E265';
const BG = '#000';
const GRAY = '#BDBDBD';
const DARK_GRAY = '#1A1A1A';

const DATA = [
    { id: '1', name: 'Sarah Jenkins', badge: 'flame', location: 'New York • 98% Success', points: '12,450', rank: 1, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&q=80' },
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
        else rankIcon = <AppText style={styles.rankText}>{item.rank}</AppText>;

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
                            <AppText style={styles.avatarInitials}>{item.name.split(' ').map(n => n[0]).join('')}</AppText>
                        </View>
                    )}
                </View>

                <View style={styles.infoCol}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <AppText style={styles.nameText}>{item.name}</AppText>
                        {item.badge ? <Ionicons name={item.badge} size={14} color="#FF6B35" style={{ marginLeft: 4 }} /> : null}
                    </View>
                    <AppText style={styles.locationText}>{item.location}</AppText>
                </View>

                <View style={styles.pointsCol}>
                    <AppText style={styles.pointsText}>{item.points}</AppText>
                    {item.rank <= 3 && <AppText style={styles.ptsLabel}>pts</AppText>}
                </View>
            </TouchableOpacity>
        );
    };

    const ListHeader = () => (
        <View>
            <View style={styles.headerRow}>
                <AppText style={styles.headerTitle}>Leaderboard</AppText>
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
                    <AppText style={styles.activeTabText}>Global</AppText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tab}>
                    <AppText style={styles.inactiveTabText}>Friends</AppText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tab}>
                    <AppText style={styles.inactiveTabText}>Today</AppText>
                </TouchableOpacity>
            </View>

            {/* Banner */}
            <View style={styles.banner}>
                <Ionicons name="people-outline" size={18} color={NEON} style={{ marginRight: 8 }} />
                <AppText style={styles.bannerText}>Earn points by waking up & solving puzzles together!</AppText>
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
                <AppText style={styles.inviteText}>Invite Friends to Compete</AppText>
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
                    <AppText style={styles.footerRank}>#42</AppText>
                    <ProfilePic user={user} size={40} />
                    <View>
                        <AppText style={styles.footerName}>{user?.name || 'You'}</AppText>
                        <AppText style={styles.footerPoints}>+150 pts today</AppText>
                    </View>
                </View>
                <View style={styles.footerRight}>
                    <AppText style={styles.footerTotal}>4,320</AppText>
                    <AppText style={styles.footerPercent}>Top 15%</AppText>
                </View>
            </View>
        </View>
    );
}
