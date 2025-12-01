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
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    listContent: {
        padding: 20,
    },
    alarmItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#111',
        borderRadius: 16,
        padding: 20,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#222',
    },
    alarmInfo: {
        flex: 1,
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 5,
    },
    timeText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
    },
    ampmText: {
        fontSize: 16,
        color: '#888',
        marginLeft: 5,
    },
    disabledText: {
        color: '#555',
    },
    alarmLabel: {
        color: '#888',
        fontSize: 14,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    deleteButton: {
        padding: 5,
    },
    fab: {
        position: 'absolute',
        bottom: 20,
        alignSelf: 'center',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#C9E265',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    emptyListContent: {
        flex: 1,
        justifyContent: 'center',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    emptyTitle: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 20,
    },
    emptySubtitle: {
        color: '#888',
        fontSize: 16,
        marginTop: 10,
        textAlign: 'center',
    },
    emptyDescription: {
        color: '#666',
        fontSize: 14,
        marginTop: 5,
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        marginTop: 8,
        alignSelf: 'flex-start',
        borderWidth: 1,
    },
    modeText: {
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 6,
    },
    soloBadge: {
        backgroundColor: '#1a1a1a',
        borderColor: '#333',
    },
    buddyBadge: {
        backgroundColor: 'rgba(201, 226, 101, 0.1)',
        borderColor: 'rgba(201, 226, 101, 0.3)',
    },
    strangerBadge: {
        backgroundColor: 'rgba(201, 226, 101, 0.1)',
        borderColor: 'rgba(201, 226, 101, 0.3)',
    },
    soloText: {
        color: '#888',
    },
    buddyText: {
        color: '#C9E265',
    },
    strangerText: {
        color: '#C9E265',
    },
});

export default styles;
