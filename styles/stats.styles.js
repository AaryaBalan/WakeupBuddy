import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');
const NEON = '#C9E265';
const BG = '#000';
const GRAY = '#BDBDBD';

const statsStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BG,
    },
    scroll: {
        padding: 14,
        paddingBottom: 32,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: GRAY,
        marginTop: 10,
        fontSize: 13,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Montserrat_700Bold',
    },
    iconButton: {
        padding: 6,
    },
    // Buddy Card
    buddyCard: {
        backgroundColor: '#0a0a0a',
        borderRadius: 14,
        padding: 16,
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#1a1a1a',
    },
    buddyAvatarRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    avatarRing: {
        width: 96,
        height: 96,
        borderRadius: 48,
        borderWidth: 2,
        borderColor: NEON,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 2,
    },
    heartContainer: {
        marginHorizontal: 14,
    },
    buddyNames: {
        color: '#fff',
        fontSize: 15,
        fontFamily: 'Montserrat_700Bold',
    },
    buddySubtitle: {
        color: GRAY,
        fontSize: 12,
        marginTop: 3,
    },
    // Section Title
    sectionTitle: {
        color: '#fff',
        fontSize: 15,
        fontFamily: 'Montserrat_700Bold',
        marginBottom: 10,
        marginTop: 6,
    },
    // Overview Grid
    overviewGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 14,
    },
    overviewCard: {
        width: (width - 42) / 2,
        backgroundColor: '#0a0a0a',
        borderRadius: 10,
        padding: 14,
        alignItems: 'center',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#1a1a1a',
    },
    overviewValue: {
        color: '#fff',
        fontSize: 24,
        fontFamily: 'Montserrat_800ExtraBold',
        marginTop: 7,
    },
    overviewLabel: {
        color: GRAY,
        fontSize: 11,
        marginTop: 3,
    },
    // Comparison Legend
    comparisonLegend: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 24,
        marginBottom: 12,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    legendLabel: {
        color: GRAY,
        fontSize: 12,
    },
    // Weekly Comparison Chart
    comparisonChartContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        backgroundColor: '#0a0a0a',
        borderRadius: 14,
        padding: 16,
        paddingTop: 12,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#1a1a1a',
    },
    comparisonBarColumn: {
        alignItems: 'center',
        flex: 1,
    },
    comparisonBarsRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 3,
        height: 75,
    },
    comparisonBarTrack: {
        width: 14,
        height: 75,
        backgroundColor: '#1a1a1a',
        borderRadius: 4,
        justifyContent: 'flex-end',
        overflow: 'hidden',
    },
    comparisonBar: {
        width: '100%',
        borderRadius: 4,
    },
    comparisonDayLabel: {
        color: GRAY,
        fontSize: 9,
        marginTop: 6,
        fontFamily: 'Montserrat_500Medium',
    },
    comparisonDayLabelToday: {
        color: NEON,
        fontFamily: 'Montserrat_700Bold',
    },
    // Stats Comparison Card
    statsComparisonCard: {
        backgroundColor: '#0a0a0a',
        borderRadius: 12,
        padding: 14,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#1a1a1a',
    },
    statCompareRow: {
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a1a',
    },
    statCompareLabel: {
        color: GRAY,
        fontSize: 12,
        marginBottom: 10,
        textAlign: 'center',
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
        fontSize: 28,
        fontFamily: 'Montserrat_800ExtraBold',
    },
    statCompareUser: {
        color: GRAY,
        fontSize: 11,
        marginTop: 2,
    },
    statCompareDivider: {
        width: 1,
        height: 40,
        backgroundColor: '#2a2a2a',
        marginHorizontal: 20,
    },
    // Call Stats Card
    callStatsCard: {
        backgroundColor: '#0a0a0a',
        borderRadius: 10,
        padding: 14,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#1a1a1a',
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
        gap: 10,
    },
    callStatLabel: {
        color: '#fff',
        fontSize: 14,
    },
    callStatValue: {
        color: NEON,
        fontSize: 16,
        fontFamily: 'Montserrat_700Bold',
    },
    divider: {
        height: 1,
        backgroundColor: '#1a1a1a',
    },
    // Monthly Card
    monthlyCard: {
        backgroundColor: '#0a0a0a',
        borderRadius: 10,
        padding: 10,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#1a1a1a',
    },
    monthRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 3,
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a1a',
    },
    monthLabel: {
        color: '#fff',
        fontSize: 14,
        fontFamily: 'Montserrat_500Medium',
    },
    monthStats: {
        flexDirection: 'row',
        gap: 16,
    },
    monthStatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    monthStatText: {
        color: GRAY,
        fontSize: 13,
    },
    // Daily Card
    dailyCard: {
        backgroundColor: '#0a0a0a',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#1a1a1a',
    },
    dayRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a1a',
    },
    dayLabel: {
        color: '#fff',
        fontSize: 13,
        flex: 1,
    },
    dayStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    dayBadge: {
        backgroundColor: '#1a1a1a',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    dayBadgeActive: {
        backgroundColor: 'rgba(201, 226, 101, 0.15)',
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
    },
    // Recent Card
    recentCard: {
        backgroundColor: '#0a0a0a',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#1a1a1a',
    },
    recentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a1a',
    },
    recentIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(201, 226, 101, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    recentInfo: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    recentDate: {
        color: '#fff',
        fontSize: 13,
    },
    recentDuration: {
        color: NEON,
        fontSize: 13,
        fontFamily: 'Montserrat_600SemiBold',
    },
    // Empty State
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 30,
    },
    emptyTitle: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Montserrat_600SemiBold',
        marginTop: 16,
    },
    emptySubtitle: {
        color: GRAY,
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
    },
});

export default statsStyles;
