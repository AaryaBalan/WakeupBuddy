import { StyleSheet } from 'react-native';

const NEON = '#C9E265';
const BG = '#050505';
const CARD_BG = '#121212';
const GRAY = '#888';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BG,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 20,
        marginTop: 10,
    },
    headerTitle: {
        fontSize: 28,
        fontFamily: 'Montserrat_700Bold',
        color: '#fff',
        letterSpacing: -0.5,
    },
    listContent: {
        padding: 5,
        paddingBottom: 100,
    },
    alarmItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: CARD_BG,
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#1A1A1A',
    },
    alarmInfo: {
        flex: 1,
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 4,
    },
    timeText: {
        fontSize: 42,
        fontFamily: 'Montserrat_700Bold',
        color: '#fff',
        letterSpacing: -1,
    },
    ampmText: {
        fontSize: 16,
        color: GRAY,
        marginLeft: 6,
        fontFamily: 'Montserrat_600SemiBold',
    },
    disabledText: {
        color: '#444',
    },
    alarmLabel: {
        color: GRAY,
        fontSize: 13,
        fontFamily: 'Montserrat_500Medium',
        marginBottom: 10,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    deleteButton: {
        padding: 8,
        backgroundColor: '#1A1A1A',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#333',
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: NEON,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        borderWidth: 4,
        borderColor: 'rgba(0,0,0,0.2)',
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
        fontSize: 20,
        fontFamily: 'Montserrat_700Bold',
        marginTop: 20,
    },
    emptySubtitle: {
        color: GRAY,
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
        fontFamily: 'Montserrat_500Medium',
    },
    emptyDescription: {
        color: '#555',
        fontSize: 12,
        marginTop: 4,
        textAlign: 'center',
        fontFamily: 'Montserrat_400Regular',
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
        borderRadius: 12,
        alignSelf: 'flex-start',
        borderWidth: 1,
        gap: 6,
    },
    modeText: {
        fontSize: 11,
        fontFamily: 'Montserrat_600SemiBold',
        numberOfLines: 1,
        flexShrink: 1,
    },
    soloBadge: {
        backgroundColor: '#1A1A1A',
        borderColor: '#333',
    },
    buddyBadge: {
        backgroundColor: 'rgba(201, 226, 101, 0.1)',
        borderColor: 'rgba(201, 226, 101, 0.2)',
    },
    strangerBadge: {
        backgroundColor: 'rgba(201, 226, 101, 0.1)',
        borderColor: 'rgba(201, 226, 101, 0.2)',
    },
    soloText: {
        color: GRAY,
    },
    buddyText: {
        color: NEON,
    },
    strangerText: {
        color: NEON,
    },
});

export default styles;
