import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');
const NEON = '#C9E265';
const BG = '#050505';
const CARD_BG = '#121212';
const GRAY = '#888';

const statsStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BG,
    },
    scroll: {
        paddingVertical: 20,
        paddingHorizontal: 10,
        paddingBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: BG,
    },
    loadingText: {
        color: GRAY,
        marginTop: 12,
        fontSize: 14,
        fontFamily: 'Montserrat_500Medium',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontFamily: 'Montserrat_700Bold',
    },
    iconButton: {
        padding: 8,
        borderRadius: 12,
        backgroundColor: '#1A1A1A',
    },

    // Buddy Card
    buddyCard: {
        backgroundColor: CARD_BG,
        borderRadius: 24,
        paddingVertical: 24,
        paddingHorizontal: 16,
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#1A1A1A',
    },
    buddyAvatarRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarRing: {
        padding: 4,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: '#333',
        backgroundColor: '#000',
    },
    heartContainer: {
        marginHorizontal: -15,
        zIndex: 10,
        backgroundColor: CARD_BG,
        borderRadius: 20,
        padding: 6,
        borderWidth: 4,
        borderColor: CARD_BG,
    },
    buddyNames: {
        color: '#fff',
        fontSize: 18,
        fontFamily: 'Montserrat_700Bold',
        marginBottom: 4,
        textAlign: 'center',
    },
    buddySubtitle: {
        color: GRAY,
        fontSize: 13,
        fontFamily: 'Montserrat_500Medium',
    },

    // Section Title
    sectionTitle: {
        color: '#fff',
        fontSize: 18,
        fontFamily: 'Montserrat_700Bold',
        marginBottom: 12,
        marginTop: 8,
        marginLeft: 4,
    },

    // Overview Grid
    overviewGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    overviewCard: {
        width: (width - 32) / 2,
        backgroundColor: CARD_BG,
        borderRadius: 20,
        padding: 16,
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#1A1A1A',
    },
    overviewValue: {
        color: '#fff',
        fontSize: 24,
        fontFamily: 'Montserrat_700Bold',
        marginTop: 8,
        marginBottom: 2,
    },
    overviewLabel: {
        color: GRAY,
        fontSize: 11,
        fontFamily: 'Montserrat_500Medium',
        textAlign: 'center',
    },

    // Comparison Legend
    comparisonLegend: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 24,
        marginBottom: 16,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendLabel: {
        color: GRAY,
        fontSize: 12,
        fontFamily: 'Montserrat_500Medium',
    },

    // Weekly Comparison Chart
    comparisonChartContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        backgroundColor: CARD_BG,
        borderRadius: 24,
        padding: 20,
        paddingTop: 30, // More space at top
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#1A1A1A',
        height: 180,
    },
    comparisonBarColumn: {
        alignItems: 'center',
        flex: 1,
        height: '100%',
        justifyContent: 'flex-end',
    },
    comparisonBarsRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 4,
        height: 100,
    },
    comparisonBarTrack: {
        width: 12,
        height: 100,
        justifyContent: 'flex-end',
        borderRadius: 6,
    },
    comparisonBar: {
        width: '100%',
        borderRadius: 6,
        minHeight: 4,
    },
    comparisonDayLabel: {
        color: GRAY,
        fontSize: 10,
        marginTop: 12,
        fontFamily: 'Montserrat_500Medium',
    },
    comparisonDayLabelToday: {
        color: NEON,
        fontFamily: 'Montserrat_700Bold',
    },

    // Stats Comparison Card
    statsComparisonCard: {
        backgroundColor: CARD_BG,
        borderRadius: 24,
        padding: 4,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#1A1A1A',
    },
    statCompareRow: {
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#1A1A1A',
    },
    statCompareLabel: {
        color: GRAY,
        fontSize: 12,
        marginBottom: 12,
        textAlign: 'center',
        fontFamily: 'Montserrat_500Medium',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statCompareValues: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statCompareItem: {
        flex: 1,
        alignItems: 'center',
    },
    statCompareValue: {
        fontSize: 24,
        fontFamily: 'Montserrat_700Bold',
    },
    statCompareUser: {
        color: GRAY,
        fontSize: 11,
        marginTop: 4,
        fontFamily: 'Montserrat_500Medium',
    },
    statCompareDivider: {
        width: 1,
        height: 30,
        backgroundColor: '#2a2a2a',
        marginHorizontal: 20,
    },

    // Call Stats Card
    callStatsCard: {
        backgroundColor: CARD_BG,
        borderRadius: 24,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#1A1A1A',
    },
    callStatRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    callStatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    callStatLabel: {
        color: '#fff',
        fontSize: 14,
        fontFamily: 'Montserrat_500Medium',
    },
    callStatValue: {
        color: NEON,
        fontSize: 15,
        fontFamily: 'Montserrat_600SemiBold',
    },
    divider: {
        height: 1,
        backgroundColor: '#1A1A1A',
    },

    // Monthly Card
    monthlyCard: {
        backgroundColor: CARD_BG,
        borderRadius: 24,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#1A1A1A',
    },
    monthRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#1A1A1A',
    },
    monthLabel: {
        color: '#fff',
        fontSize: 14,
        fontFamily: 'Montserrat_600SemiBold',
    },
    monthStats: {
        flexDirection: 'row',
        gap: 20,
    },
    monthStatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    monthStatText: {
        color: GRAY,
        fontSize: 13,
        fontFamily: 'Montserrat_500Medium',
    },

    // Daily Card
    dailyCard: {
        backgroundColor: CARD_BG,
        borderRadius: 24,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#1A1A1A',
    },
    dayRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#1A1A1A',
    },
    dayLabel: {
        color: '#fff',
        fontSize: 14,
        flex: 1,
        fontFamily: 'Montserrat_500Medium',
    },
    dayStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    dayBadge: {
        backgroundColor: '#1A1A1A',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    dayBadgeActive: {
        backgroundColor: 'rgba(201, 226, 101, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(201, 226, 101, 0.2)',
    },
    dayBadgeText: {
        color: GRAY,
        fontSize: 11,
        fontFamily: 'Montserrat_600SemiBold',
    },
    dayBadgeTextActive: {
        color: NEON,
    },
    dayTime: {
        color: GRAY,
        fontSize: 12,
        minWidth: 50,
        textAlign: 'right',
        fontFamily: 'Montserrat_500Medium',
    },

    // Recent Card
    recentCard: {
        backgroundColor: CARD_BG,
        borderRadius: 24,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#1A1A1A',
    },
    recentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#1A1A1A',
    },
    recentIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(201, 226, 101, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        borderWidth: 1,
        borderColor: 'rgba(201, 226, 101, 0.2)',
    },
    recentInfo: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    recentDate: {
        color: '#fff',
        fontSize: 14,
        fontFamily: 'Montserrat_500Medium',
    },
    recentDuration: {
        color: NEON,
        fontSize: 13,
        fontFamily: 'Montserrat_600SemiBold',
    },

    // Empty State
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 30,
    },
    emptyTitle: {
        color: '#fff',
        fontSize: 18,
        fontFamily: 'Montserrat_700Bold',
        marginTop: 20,
    },
    emptySubtitle: {
        color: GRAY,
        fontSize: 14,
        textAlign: 'center',
        marginTop: 10,
        lineHeight: 22,
        fontFamily: 'Montserrat_400Regular',
    },
});

export default statsStyles;
