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
        paddingHorizontal: 5,
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
        paddingHorizontal: 10,
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
        marginHorizontal: 10,
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
        borderWidth: 1,
        borderColor: "rgba(201, 226, 101, 0.15)",
        marginHorizontal: 10,
    },
    bannerText: {
        color: "#E0E0E0",
        fontSize: 12,
        fontFamily: 'Montserrat_500Medium',
    },



    /* ---------- Podium ---------- */
    podiumContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end',
        marginBottom: 30,
        height: 220,
    },
    podiumItem: {
        alignItems: 'center',
        justifyContent: 'flex-end',
        width: width / 3.5,
    },
    podiumItemFirst: {
        marginBottom: 20,
        zIndex: 10,
    },
    podiumAvatarContainer: {
        marginBottom: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    podiumAvatarRing: {
        padding: 3,
        borderRadius: 100,
        borderWidth: 2,
    },
    podiumRankBadge: {
        position: 'absolute',
        bottom: -10,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: BG,
    },
    podiumRankText: {
        color: '#000',
        fontSize: 12,
        fontFamily: 'Montserrat_700Bold',
    },
    podiumName: {
        color: '#fff',
        fontSize: 13,
        fontFamily: 'Montserrat_700Bold',
        marginBottom: 4,
        textAlign: 'center',
    },
    podiumPoints: {
        color: NEON,
        fontSize: 12,
        fontFamily: 'Montserrat_600SemiBold',
    },
    podiumCrown: {
        position: 'absolute',
        top: -28,
        zIndex: 20,
    },
    podiumBase: {
        width: '100%',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 10,
    },
    podiumBaseFirst: {
        height: 110,
        backgroundColor: 'rgba(255, 215, 0, 0.15)', // Gold tint
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.3)',
    },
    podiumBaseSecond: {
        height: 80,
        backgroundColor: 'rgba(192, 192, 192, 0.15)', // Silver tint
        borderWidth: 1,
        borderColor: 'rgba(192, 192, 192, 0.3)',
    },
    podiumBaseThird: {
        height: 60,
        backgroundColor: 'rgba(205, 127, 50, 0.15)', // Bronze tint
        borderWidth: 1,
        borderColor: 'rgba(205, 127, 50, 0.3)',
    },

    /* ---------- Leaderboard Item Row ---------- */
    itemRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
        backgroundColor: CARD_BG,
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#1A1A1A',
        marginHorizontal: 5,
    },

    /* Rank */
    rankCol: {
        width: 32,
        alignItems: "center",
        justifyContent: 'center',
    },
    rankText: {
        color: GRAY,
        fontSize: 14,
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
        fontSize: 15,
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