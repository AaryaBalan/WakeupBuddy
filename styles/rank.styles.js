import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');
const NEON = '#C9E265';
const BG = '#050505'; // Slightly lighter than pure black for depth
const CARD_BG = '#121212';
const GRAY = '#888';

const styles = StyleSheet.create({
    /* ---------- Container ---------- */
    container: {
        flex: 1,
        backgroundColor: BG,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 100,
    },

    /* ---------- Header ---------- */
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        marginTop: 10,
    },
    headerTitle: {
        color: "#fff",
        fontSize: 28,
        fontFamily: 'Montserrat_700Bold',
        letterSpacing: -0.5,
    },

    /* ---------- Tabs ---------- */
    tabsContainer: {
        flexDirection: "row",
        backgroundColor: CARD_BG,
        borderRadius: 25,
        padding: 4,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#222',
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: "center",
        borderRadius: 22,
    },
    activeTab: {
        backgroundColor: NEON,
    },
    activeTabText: {
        color: "#000",
        fontFamily: 'Montserrat_700Bold',
        fontSize: 13,
    },
    inactiveTabText: {
        color: GRAY,
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 13,
    },

    /* ---------- Banner ---------- */
    banner: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(201, 226, 101, 0.08)",
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "rgba(201, 226, 101, 0.15)",
    },
    bannerText: {
        color: "#E0E0E0",
        fontSize: 12,
        fontFamily: 'Montserrat_500Medium',
    },

    /* ---------- Stats Banner ---------- */
    statsBanner: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: CARD_BG,
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 16,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#222',
    },
    statItem: {
        alignItems: "center",
        flex: 1,
    },
    statValue: {
        color: "#fff",
        fontSize: 18,
        fontFamily: 'Montserrat_700Bold',
        marginBottom: 4,
    },
    statLabel: {
        color: GRAY,
        fontSize: 11,
        fontFamily: 'Montserrat_500Medium',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: "#333",
    },

    /* ---------- Leaderboard Item Row ---------- */
    itemRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
        backgroundColor: CARD_BG,
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#1A1A1A',
    },

    /* Rank */
    rankCol: {
        width: 32,
        alignItems: "center",
        justifyContent: 'center',
    },
    rankText: {
        color: GRAY,
        fontSize: 16,
        fontFamily: 'Montserrat_700Bold',
    },

    /* Avatar */
    avatarCol: {
        marginHorizontal: 12,
    },
    // Avatar styles are handled by the component, but we can add container styling if needed

    /* Info */
    infoCol: {
        flex: 1,
        justifyContent: 'center',
    },
    nameText: {
        color: "#fff",
        fontSize: 15,
        fontFamily: 'Montserrat_600SemiBold',
        marginBottom: 2,
    },
    locationText: {
        color: GRAY,
        fontSize: 11,
        fontFamily: 'Montserrat_500Medium',
    },

    /* Points */
    pointsCol: {
        alignItems: "flex-end",
        minWidth: 60,
    },
    pointsText: {
        color: NEON,
        fontSize: 16,
        fontFamily: 'Montserrat_700Bold',
    },
    ptsLabel: {
        color: GRAY,
        fontSize: 10,
        fontFamily: 'Montserrat_500Medium',
        marginTop: 2,
    },

    /* ---------- Invite Button ---------- */
    inviteBtn: {
        backgroundColor: '#1A1A1A',
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
        borderRadius: 14,
        marginTop: 10,
        width: "100%",
        borderWidth: 1,
        borderColor: '#333',
    },
    inviteText: {
        color: "#fff",
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 14,
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
        backgroundColor: "rgba(18, 18, 18, 0.95)", // slightly transparent
        borderTopWidth: 1,
        borderTopColor: '#333',
        paddingHorizontal: 20,
        paddingVertical: 16,
        paddingBottom: 20, // Extra padding for safe area
    },

    footerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    footerRank: {
        color: "#fff",
        fontFamily: 'Montserrat_700Bold',
        fontSize: 16,
        width: 30,
        textAlign: 'center',
    },
    footerName: {
        color: "#fff",
        fontFamily: 'Montserrat_700Bold',
        fontSize: 14,
    },
    footerPoints: {
        color: NEON,
        fontSize: 11,
        fontFamily: 'Montserrat_500Medium',
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
        color: GRAY,
        fontSize: 11,
        fontFamily: 'Montserrat_500Medium',
    },
});

export default styles;