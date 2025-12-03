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
        paddingHorizontal: 16,
        paddingTop: 60,
    },

    /* ---------- Header ---------- */
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    headerTitle: {
        color: "#fff",
        fontSize: 28,
        fontFamily: 'Montserrat_700Bold',
    },

    /* ---------- Search Bar ---------- */
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#111",
        borderRadius: 12,
        paddingHorizontal: 12,
        marginBottom: 16,
        height: 46,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        color: "#fff",
        fontSize: 16,
    },

    /* ---------- Tabs ---------- */
    tabsContainer: {
        flexDirection: "row",
        backgroundColor: "#111",
        borderRadius: 12,
        padding: 4,
        marginBottom: 20,
    },
    tab: {
        flex: 1,
        paddingVertical: 8,
        alignItems: "center",
        borderRadius: 8,
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
        padding: 10,
        borderRadius: 8,
        marginBottom: 24,
    },
    bannerText: {
        color: "#999",
        fontSize: 12,
    },

    /* ---------- Leaderboard Item Row ---------- */
    itemRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 24,
    },

    /* Rank */
    rankCol: {
        width: 40,
        alignItems: "center",
    },
    rankText: {
        color: "#666",
        fontSize: 16,
        fontFamily: 'Montserrat_700Bold',
    },

    /* Avatar */
    avatarCol: {
        marginHorizontal: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
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
        fontSize: 16,
        fontFamily: 'Montserrat_700Bold',
    },
    badgeText: {
        fontSize: 14,
    },
    locationText: {
        color: "#666",
        fontSize: 12,
        marginTop: 4,
    },

    /* Points */
    pointsCol: {
        alignItems: "flex-end",
    },
    pointsText: {
        color: NEON,
        fontSize: 16,
        fontFamily: 'Montserrat_700Bold',
    },
    ptsLabel: {
        color: "#666",
        fontSize: 12,
    },

    /* ---------- Invite Button ---------- */
    inviteBtn: {
        backgroundColor: NEON,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
        borderRadius: 12,
        marginTop: 30,
        width: "100%",
    },
    inviteText: {
        color: "#000",
        fontFamily: 'Montserrat_700Bold',
        fontSize: 16,
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
        paddingHorizontal: 20,
        paddingVertical: 12,
    },

    footerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    footerRank: {
        color: NEON,
        fontFamily: 'Montserrat_700Bold',
        fontSize: 16,
    },
    footerAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    footerName: {
        color: "#fff",
        fontFamily: 'Montserrat_700Bold',
        fontSize: 14,
    },
    footerPoints: {
        color: "#666",
        fontSize: 12,
    },

    footerRight: {
        alignItems: "flex-end",
    },
    footerTotal: {
        color: NEON,
        fontFamily: 'Montserrat_700Bold',
        fontSize: 16,
    },
    footerPercent: {
        color: "#666",
        fontSize: 12,
    },
});

export default styles;