import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a1a',
    },
    headerTitle: {
        fontSize: 15,
        fontFamily: 'Montserrat_700Bold',
        color: '#fff',
    },
    sectionHeader: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    sectionTitle: {
        color: '#666',
        fontSize: 11,
        fontFamily: 'Montserrat_700Bold',
        letterSpacing: 1,
    },
    listContent: {
        padding: 16,
    },
    inviteCard: {
        backgroundColor: '#111',
        borderRadius: 14,
        padding: 16,
        marginBottom: 16,
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
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    avatarText: {
        color: '#fff',
        fontSize: 15,
        fontFamily: 'Montserrat_700Bold',
    },
    userName: {
        color: '#fff',
        fontSize: 15,
        fontFamily: 'Montserrat_700Bold',
        marginBottom: 3,
    },
    inviteText: {
        color: '#888',
        fontSize: 13,
        lineHeight: 18,
    },
    boldText: {
        color: '#fff',
        fontFamily: 'Montserrat_700Bold',
    },
    timeAgo: {
        color: '#666',
        fontSize: 12,
    },
    alarmBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        alignSelf: 'flex-start',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 7,
        marginBottom: 16,
        marginLeft: 46, // Align with text
    },
    alarmTime: {
        color: '#C9E265',
        fontFamily: 'Montserrat_700Bold',
        marginLeft: 6,
        marginRight: 6,
    },
    puzzleType: {
        color: '#888',
        fontSize: 12,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    declineButton: {
        flex: 1,
        backgroundColor: '#1a1a1a',
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    declineText: {
        color: '#fff',
        fontFamily: 'Montserrat_600SemiBold',
    },
    acceptButton: {
        flex: 1,
        backgroundColor: '#C9E265',
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    acceptText: {
        color: '#000',
        fontFamily: 'Montserrat_700Bold',
    },
    emptyState: {
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        color: '#666',
        fontSize: 16,
    },
    // History Card Styles
    historyCard: {
        backgroundColor: '#111',
        // borderRadius: 14,
        padding: 12,
        marginBottom: 12,
        opacity: 0.8,
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    avatarPlaceholderSmall: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#222',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    avatarTextSmall: {
        color: '#fff',
        fontSize: 13,
        fontFamily: 'Montserrat_700Bold',
    },
    userNameSmall: {
        color: '#fff',
        fontSize: 13,
        fontFamily: 'Montserrat_700Bold',
        marginBottom: 2,
    },
    historyText: {
        color: '#888',
        fontSize: 11,
    },
    historyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 36, // Align with text
        marginTop: 4,
    },
    historyStatus: {
        fontSize: 12,
        fontFamily: 'Montserrat_700Bold',
        marginLeft: 5,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Friend Request Card Styles
    friendRequestCard: {
        backgroundColor: '#111',
        borderRadius: 14,
        padding: 16,
        marginBottom: 16,
        borderLeftWidth: 3,
        borderLeftColor: '#6B8BE3',
    },
    friendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(107, 139, 227, 0.15)',
        alignSelf: 'flex-start',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 7,
        marginBottom: 16,
        marginLeft: 46,
    },
    friendBadgeText: {
        color: '#6B8BE3',
        fontFamily: 'Montserrat_700Bold',
        marginLeft: 6,
    },
    friendAcceptButton: {
        flex: 1,
        backgroundColor: '#6B8BE3',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    friendAcceptText: {
        color: '#fff',
        fontFamily: 'Montserrat_700Bold',
    },
    // Alarm request accent
    alarmRequestCard: {
        backgroundColor: '#111',
        borderRadius: 14,
        padding: 16,
        marginBottom: 16,
        borderLeftWidth: 3,
        borderLeftColor: '#C9E265',
    },
    // Section tabs
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingTop: 12,
        gap: 8,
    },
    tab: {
        paddingVertical: 7,
        paddingHorizontal: 14,
        borderRadius: 16,
        backgroundColor: '#1a1a1a',
    },
    tabActive: {
        backgroundColor: '#C9E265',
    },
    tabText: {
        color: '#888',
        fontSize: 13,
        fontFamily: 'Montserrat_600SemiBold',
    },
    tabTextActive: {
        color: '#000',
    },
    tabBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#ff4444',
        borderRadius: 8,
        minWidth: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabBadgeText: {
        color: '#fff',
        fontSize: 9,
        fontFamily: 'Montserrat_700Bold',
    },
});

export default styles;
