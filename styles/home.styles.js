import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');
const NEON = '#C9E265';
const BG = '#050505';
const CARD_BG = '#121212';
const GRAY = '#888';

const homeStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BG,
    },
    scrollContent: {
        padding: 5,
        paddingBottom: 100,
    },

    /* ---------- Header ---------- */
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        marginTop: 10,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    logoContainer: {
        width: 32,
        height: 32,
        backgroundColor: NEON,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: 'Montserrat_700Bold',
        color: '#fff',
        letterSpacing: -0.5,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    notificationButton: {
        position: 'relative',
        padding: 4,
    },
    badge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#FF6B35',
        borderRadius: 9,
        width: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: BG,
    },
    badgeText: {
        color: '#fff',
        fontSize: 8,
        fontFamily: 'Montserrat_700Bold',
    },
    profileImageContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#333',
    },
    profileImage: {
        width: '100%',
        height: '100%',
    },

    /* ---------- Streak Card ---------- */
    streakCard: {
        backgroundColor: CARD_BG,
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#1A1A1A',
        marginBottom: 24,
    },
    streakHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    streakLabel: {
        color: GRAY,
        fontSize: 12,
        fontFamily: 'Montserrat_600SemiBold',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    shareBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(201, 226, 101, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(201, 226, 101, 0.2)',
    },
    shareBadgeText: {
        color: NEON,
        fontSize: 11,
        fontFamily: 'Montserrat_600SemiBold',
    },
    streakCountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 6,
    },
    streakCount: {
        fontSize: 36,
        fontFamily: 'Montserrat_700Bold',
        color: '#fff',
        letterSpacing: -1,
    },
    streakSubtext: {
        color: '#999',
        fontSize: 14,
        marginBottom: 20,
        fontFamily: 'Montserrat_500Medium',
    },

    /* Heatmap */
    heatmapContainer: {
        marginTop: 8,
        backgroundColor: '#0A0A0A',
        padding: 12,
        borderRadius: 14,
    },
    heatmapTitle: {
        color: GRAY,
        fontSize: 10,
        marginBottom: 10,
        textAlign: 'center',
        fontFamily: 'Montserrat_500Medium',
    },
    heatmap: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 4,
        marginBottom: 10,
    },
    heatmapDayContainer: {
        flex: 1,
    },
    heatmapBox: {
        aspectRatio: 1,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heatmapCount: {
        color: '#000',
        fontSize: 10,
        fontFamily: 'Montserrat_700Bold',
    },
    heatmapLegend: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
        marginTop: 4,
    },
    legendText: {
        color: '#444',
        fontSize: 9,
        fontFamily: 'Montserrat_500Medium',
    },
    legendBox: {
        width: 8,
        height: 8,
        borderRadius: 2,
    },

    /* ---------- Section Headers ---------- */
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'Montserrat_700Bold',
        color: '#fff',
    },
    seeAllText: {
        color: NEON,
        fontSize: 13,
        fontFamily: 'Montserrat_600SemiBold',
    },

    /* ---------- Alarm Card ---------- */
    alarmCard: {
        backgroundColor: CARD_BG,
        borderRadius: 18,
        padding: 18,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#1A1A1A',
    },
    alarmHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    alarmDate: {
        color: GRAY,
        fontSize: 13,
        fontFamily: 'Montserrat_500Medium',
    },
    alarmActions: {
        flexDirection: 'row',
        gap: 10,
    },
    actionButton: {
        padding: 6,
        backgroundColor: '#1A1A1A',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#333',
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    timeText: {
        fontSize: 48,
        fontFamily: 'Montserrat_700Bold',
        color: '#fff',
        letterSpacing: -1,
    },
    ampmText: {
        fontSize: 18,
        color: GRAY,
        marginLeft: 8,
        fontFamily: 'Montserrat_500Medium',
    },
    alarmFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(201, 226, 101, 0.08)',
        borderColor: 'rgba(201, 226, 101, 0.15)',
        borderWidth: 1,
        marginHorizontal: -18,
        marginBottom: -18,
        marginTop: 10,
        paddingHorizontal: 18,
        paddingVertical: 14,
        borderBottomLeftRadius: 18,
        borderBottomRightRadius: 18,
        borderTopWidth: 1,
        borderTopColor: '#222',
    },
    modeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    modeText: {
        color: '#fff',
        fontSize: 14,
        fontFamily: 'Montserrat_600SemiBold',
    },

    /* ---------- Quick Actions ---------- */
    quickActionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
        marginTop: 8,
        gap: 12,
    },
    quickActionItem: {
        backgroundColor: CARD_BG,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        flex: 1,
        aspectRatio: 1,
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#1A1A1A',
    },
    quickActionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#1A1A1A',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#333',
    },
    quickActionText: {
        color: '#fff',
        fontSize: 12,
        fontFamily: 'Montserrat_600SemiBold',
        textAlign: 'center',
    },

    /* ---------- Social Card ---------- */
    socialCard: {
        backgroundColor: CARD_BG,
        borderRadius: 16,
        padding: 14,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#1A1A1A',
    },
    socialContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    socialAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#1A1A1A',
        marginRight: 4,
    },
    socialTextContainer: {
        flex: 1,
    },
    socialTitle: {
        color: '#fff',
        fontSize: 13,
        fontFamily: 'Montserrat_700Bold',
        marginBottom: 2,
    },
    socialSubtitle: {
        color: GRAY,
        fontSize: 11,
        fontFamily: 'Montserrat_500Medium',
    },
    thumbsUpButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#1A1A1A',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333',
    },
    achievementBadge: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(201, 226, 101, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(201, 226, 101, 0.3)',
    },
});

export default homeStyles;
