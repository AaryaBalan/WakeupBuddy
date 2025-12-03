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
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a1a',
    },
    headerTitle: {
        fontSize: 16,
        fontFamily: 'Montserrat_700Bold',
        color: '#fff',
    },
    sectionHeader: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
    },
    sectionTitle: {
        color: '#666',
        fontSize: 12,
        fontFamily: 'Montserrat_700Bold',
        letterSpacing: 1,
    },
    listContent: {
        padding: 20,
    },
    inviteCard: {
        backgroundColor: '#111',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
    },
    inviteHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 15,
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
        backgroundColor: '#333',
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
        color: '#888',
        fontSize: 14,
        lineHeight: 20,
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
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginBottom: 20,
        marginLeft: 52, // Align with text
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
        gap: 15,
    },
    declineButton: {
        flex: 1,
        backgroundColor: '#1a1a1a',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    declineText: {
        color: '#fff',
        fontFamily: 'Montserrat_600SemiBold',
    },
    acceptButton: {
        flex: 1,
        backgroundColor: '#C9E265',
        paddingVertical: 12,
        borderRadius: 12,
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
        borderRadius: 16,
        padding: 15,
        marginBottom: 15,
        opacity: 0.8,
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
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
        color: '#888',
        fontSize: 12,
    },
    historyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 42, // Align with text
        marginTop: 5,
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
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#6B8BE3',
    },
    friendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(107, 139, 227, 0.15)',
        alignSelf: 'flex-start',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginBottom: 20,
        marginLeft: 52,
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
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#C9E265',
    },
    // Section tabs
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingTop: 15,
        gap: 10,
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
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
        top: -5,
        right: -5,
        backgroundColor: '#ff4444',
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontFamily: 'Montserrat_700Bold',
    },
});

export default styles;
