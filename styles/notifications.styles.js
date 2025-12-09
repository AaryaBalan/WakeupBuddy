import { StyleSheet } from 'react-native';

const NEON = '#C9E265';
const BG = '#050505';
const CARD_BG = '#121212';
const GRAY = '#888';
const BUDDY_COLOR = '#FF6B9D';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BG,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginBottom: 10,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: 'Montserrat_700Bold',
        color: '#fff',
    },
    sectionHeader: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 10,
    },
    sectionTitle: {
        color: GRAY,
        fontSize: 12,
        fontFamily: 'Montserrat_600SemiBold',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    listContent: {
        padding: 16,
        paddingTop: 0,
    },

    // Invite Card
    inviteCard: {
        backgroundColor: CARD_BG,
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#1A1A1A',
    },
    inviteHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    userInfo: {
        flexDirection: 'row',
        flex: 1,
        marginRight: 10,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#222',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Montserrat_700Bold',
    },
    userName: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Montserrat_700Bold',
        marginBottom: 4,
    },
    inviteText: {
        color: GRAY,
        fontSize: 13,
        lineHeight: 20,
        fontFamily: 'Montserrat_500Medium',
    },
    boldText: {
        color: '#fff',
        fontFamily: 'Montserrat_700Bold',
    },
    timeAgo: {
        color: '#666',
        fontSize: 11,
        fontFamily: 'Montserrat_500Medium',
    },

    // Alarm Badge
    alarmBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(201, 226, 101, 0.1)',
        alignSelf: 'flex-start',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 12,
        marginBottom: 16,
        marginLeft: 52, // Align with text
        borderWidth: 1,
        borderColor: 'rgba(201, 226, 101, 0.2)',
    },
    alarmTime: {
        color: NEON,
        fontFamily: 'Montserrat_700Bold',
        marginLeft: 6,
        marginRight: 6,
        fontSize: 13,
    },
    puzzleType: {
        color: GRAY,
        fontSize: 12,
        fontFamily: 'Montserrat_500Medium',
    },

    // Action Buttons
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 4,
    },
    declineButton: {
        flex: 1,
        backgroundColor: '#1A1A1A',
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#333',
    },
    declineText: {
        color: '#fff',
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 14,
    },
    acceptButton: {
        flex: 1,
        backgroundColor: NEON,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 14,
    },
    acceptText: {
        color: '#000',
        fontFamily: 'Montserrat_700Bold',
        fontSize: 14,
    },

    // Empty State
    emptyState: {
        alignItems: 'center',
        padding: 60,
    },
    emptyText: {
        color: GRAY,
        fontSize: 16,
        fontFamily: 'Montserrat_500Medium',
    },

    // History Card Styles
    historyCard: {
        backgroundColor: CARD_BG,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#1A1A1A',
        opacity: 0.7,
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    avatarPlaceholderSmall: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#222',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    avatarTextSmall: {
        color: '#fff',
        fontSize: 14,
        fontFamily: 'Montserrat_700Bold',
    },
    userNameSmall: {
        color: '#fff',
        fontSize: 14,
        fontFamily: 'Montserrat_700Bold',
        marginBottom: 2,
    },
    historyText: {
        color: GRAY,
        fontSize: 12,
        fontFamily: 'Montserrat_500Medium',
    },
    historyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 42, // Align with text
        marginTop: 6,
    },
    historyStatus: {
        fontSize: 12,
        fontFamily: 'Montserrat_700Bold',
        marginLeft: 6,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: BG,
    },

    // Friend Request Card Styles
    friendRequestCard: {
        backgroundColor: CARD_BG,
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#1A1A1A',
        // borderLeftWidth: 3,
        // borderLeftColor: BUDDY_COLOR,
    },
    friendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 107, 157, 0.15)',
        alignSelf: 'flex-start',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 12,
        marginBottom: 16,
        marginLeft: 52,
        borderWidth: 1,
        borderColor: 'rgba(255, 107, 157, 0.3)',
    },
    friendBadgeText: {
        color: BUDDY_COLOR,
        fontFamily: 'Montserrat_700Bold',
        marginLeft: 6,
        fontSize: 13,
    },
    friendAcceptButton: {
        flex: 1,
        backgroundColor: BUDDY_COLOR,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 14,
    },
    friendAcceptText: {
        color: '#fff',
        fontFamily: 'Montserrat_700Bold',
        fontSize: 14,
    },

    // Alarm request accent
    alarmRequestCard: {
        backgroundColor: CARD_BG,
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#1A1A1A',
        // borderLeftWidth: 3,
        // borderLeftColor: NEON,
    },

    // Section tabs
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingBottom: 10,
        gap: 10,
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#1A1A1A',
        borderWidth: 1,
        borderColor: '#333',
    },
    tabActive: {
        backgroundColor: NEON,
        borderColor: NEON,
    },
    tabText: {
        color: GRAY,
        fontSize: 13,
        fontFamily: 'Montserrat_600SemiBold',
    },
    tabTextActive: {
        color: '#000',
        fontFamily: 'Montserrat_700Bold',
    },
    tabBadge: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: '#ff4444',
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: BG,
    },
    tabBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontFamily: 'Montserrat_700Bold',
    },
});

export default styles;
