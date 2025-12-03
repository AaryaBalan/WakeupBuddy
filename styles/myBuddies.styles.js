import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a1a',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
    countContainer: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a1a',
    },
    countText: {
        fontSize: 14,
        color: '#888',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 16,
    },
    emptyListContent: {
        flex: 1,
        justifyContent: 'center',
    },
    friendCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111',
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
    },
    friendInfo: {
        flex: 1,
        marginLeft: 12,
    },
    friendName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    friendUsername: {
        fontSize: 13,
        color: '#888',
        marginTop: 2,
    },
    friendsSince: {
        fontSize: 11,
        color: '#666',
        marginTop: 4,
    },
    friendStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    streakBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    streakText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FF6B35',
    },
    emptyState: {
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#fff',
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
    },
    exploreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#C9E265',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
        marginTop: 24,
        gap: 8,
    },
    exploreButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
    },
});
