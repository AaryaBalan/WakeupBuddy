import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');
const NEON = '#C9E265';
const BG = '#000';
const GRAY = '#BDBDBD';

const styles = StyleSheet.create({
    /* ---------- Container ---------- */
    container: {
        flex: 1,
        backgroundColor: BG,
    },
    listContent: {
        paddingHorizontal: 14,
        paddingTop: 50,
    },

    /* ---------- Header ---------- */
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 14,
    },
    headerTitle: {
        color: "#fff",
        fontSize: 24,
        fontFamily: 'Montserrat_700Bold',
    },

    /* ---------- Search Bar ---------- */
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#111",
        borderRadius: 10,
        paddingHorizontal: 10,
        marginBottom: 14,
        height: 42,
    },
    searchIcon: {
        marginRight: 6,
    },
    searchInput: {
        flex: 1,
        color: "#fff",
        fontSize: 15,
    },

    /* ---------- Tabs ---------- */
    tabsContainer: {
        flexDirection: "row",
        backgroundColor: "#111",
        borderRadius: 10,
        padding: 3,
        marginBottom: 16,
    },
    tab: {
        flex: 1,
        paddingVertical: 7,
        alignItems: "center",
        borderRadius: 7,
    },
    activeTab: {
        backgroundColor: "#222",
    },
    activeTabText: {
        color: "#fff",
        fontFamily: 'Montserrat_700Bold',
        fontSize: 14,
    },
    inactiveTabText: {
        color: "#666",
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 14,
    },

    /* ---------- Banner ---------- */
    banner: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(200, 255, 0, 0.1)",
        padding: 8,
        borderRadius: 7,
        marginBottom: 12,
    },
    bannerText: {
        color: "#999",
        fontSize: 11,
    },

    /* ---------- Stats Banner ---------- */
    statsBanner: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        backgroundColor: "#111",
        padding: 12,
        borderRadius: 10,
        marginBottom: 20,
    },
    statItem: {
        alignItems: "center",
        flex: 1,
    },
    statValue: {
        color: NEON,
        fontSize: 16,
        fontFamily: 'Montserrat_700Bold',
    },
    statLabel: {
        color: "#666",
        fontSize: 10,
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: 24,
        backgroundColor: "#333",
    },

    /* ---------- Leaderboard Item Row ---------- */
    itemRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },

    /* Rank */
    rankCol: {
        width: 36,
        alignItems: "center",
    },
    rankText: {
        color: "#666",
        fontSize: 15,
        fontFamily: 'Montserrat_700Bold',
    },

    /* Avatar */
    avatarCol: {
        marginHorizontal: 10,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
    },
    avatarPlaceholder: {
        backgroundColor: "#333",
        justifyContent: "center",
        alignItems: "center",
    },
    avatarInitials: {
        color: "#888",
        fontFamily: 'Montserrat_700Bold',
    },

    /* Info */
    infoCol: {
        flex: 1,
    },
    nameText: {
        color: "#fff",
        fontSize: 15,
        fontFamily: 'Montserrat_700Bold',
    },
    badgeText: {
        fontSize: 13,
    },
    locationText: {
        color: "#666",
        fontSize: 11,
        marginTop: 3,
    },

    /* Points */
    pointsCol: {
        alignItems: "flex-end",
    },
    pointsText: {
        color: NEON,
        fontSize: 15,
        fontFamily: 'Montserrat_700Bold',
    },
    ptsLabel: {
        color: "#666",
        fontSize: 11,
    },

    /* ---------- Invite Button ---------- */
    inviteBtn: {
        backgroundColor: NEON,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        borderRadius: 10,
        marginTop: 24,
        width: "100%",
    },
    inviteText: {
        color: "#000",
        fontFamily: 'Montserrat_700Bold',
        fontSize: 15,
    },

    /* ---------- Sticky Footer ---------- */
    stickyFooter: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#000",
        borderTopWidth: 1,
        borderTopColor: NEON,
        paddingHorizontal: 16,
        paddingVertical: 10,
    },

    footerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    footerRank: {
        color: NEON,
        fontFamily: 'Montserrat_700Bold',
        fontSize: 15,
    },
    footerAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    footerName: {
        color: "#fff",
        fontFamily: 'Montserrat_700Bold',
        fontSize: 13,
    },
    footerPoints: {
        color: "#666",
        fontSize: 11,
    },

    footerRight: {
        alignItems: "flex-end",
    },
    footerTotal: {
        color: NEON,
        fontFamily: 'Montserrat_700Bold',
        fontSize: 15,
    },
    footerPercent: {
        color: "#666",
        fontSize: 11,
    },
});

export default styles;