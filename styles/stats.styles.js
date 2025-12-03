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
        padding: 16,
        paddingBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: GRAY,
        marginTop: 12,
        fontSize: 14,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '700',
    },
    iconButton: {
        padding: 6,
    },
    // Buddy Card
    buddyCard: {
        backgroundColor: '#0a0a0a',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#1a1a1a',
    },
    buddyAvatarRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarRing: {
        width: 58,
        height: 58,
        borderRadius: 29,
        borderWidth: 2,
        borderColor: NEON,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 2,
    },
    heartContainer: {
        marginHorizontal: 16,
    },
    buddyNames: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    buddySubtitle: {
        color: GRAY,
        fontSize: 13,
        marginTop: 4,
    },
    // Section Title
    sectionTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
        marginTop: 8,
    },
    // Overview Grid
    overviewGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    overviewCard: {
        width: (width - 48) / 2,
        backgroundColor: '#0a0a0a',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#1a1a1a',
    },
    overviewValue: {
        color: '#fff',
        fontSize: 28,
        fontWeight: '800',
        marginTop: 8,
    },
    overviewLabel: {
        color: GRAY,
        fontSize: 12,
        marginTop: 4,
    },
    // Call Stats Card
    callStatsCard: {
        backgroundColor: '#0a0a0a',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
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
        fontWeight: '700',
    },
    divider: {
        height: 1,
        backgroundColor: '#1a1a1a',
    },
    // Monthly Card
    monthlyCard: {
        backgroundColor: '#0a0a0a',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#1a1a1a',
    },
    monthRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a1a',
    },
    monthLabel: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
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
        fontWeight: '600',
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
        fontWeight: '600',
    },
    // Empty State
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 30,
    },
    emptyTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
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
