import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 40,
    },
    cancelText: {
        color: '#888',
        fontSize: 16,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    timeContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'baseline',
        marginBottom: 40,
    },
    timeText: {
        fontSize: 80,
        fontWeight: 'bold',
        color: '#fff',
        letterSpacing: 2,
    },
    ampmText: {
        fontSize: 24,
        color: '#888',
        marginLeft: 10,
    },
    sectionLabel: {
        color: '#888',
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 15,
        letterSpacing: 1,
    },
    modeToggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#111',
        borderRadius: 12,
        padding: 4,
        marginBottom: 20,
    },
    modeButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 10,
    },
    modeButtonActive: {
        backgroundColor: '#222',
    },
    modeButtonText: {
        color: '#888',
        fontWeight: '600',
    },
    modeButtonTextActive: {
        color: '#fff',
    },
    buddyCard: {
        borderWidth: 1,
        borderColor: '#C9E265',
        borderRadius: 16,
        padding: 16,
        marginBottom: 30,
        backgroundColor: '#0a0a0a',
    },
    buddyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    buddyIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1a1a1a',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    buddyInfo: {
        flex: 1,
    },
    buddyTitle: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    buddySubtitle: {
        color: '#888',
        fontSize: 14,
    },
    changeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    changeButtonText: {
        color: '#C9E265',
        fontWeight: 'bold',
    },
    usernameInput: {
        backgroundColor: '#111',
        color: '#fff',
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#333',
    },
    buddyFooter: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 5,
    },
    buddyFooterText: {
        color: '#666',
        fontSize: 12,
        flex: 1,
        lineHeight: 16,
    },
    configItem: {
        marginBottom: 25,
    },
    configLabel: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    daysContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dayButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#111',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333',
    },
    dayButtonActive: {
        backgroundColor: '#C9E265', // Or outline style if preferred, but filled is clearer
        borderColor: '#C9E265',
    },
    dayText: {
        color: '#888',
        fontWeight: 'bold',
    },
    dayTextActive: {
        color: '#000',
    },
    difficultyContainer: {
        flexDirection: 'row',
        backgroundColor: '#111',
        borderRadius: 20,
        padding: 4,
    },
    difficultyButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 16,
    },
    difficultyButtonActive: {
        backgroundColor: '#C9E265',
    },
    difficultyText: {
        color: '#888',
        fontWeight: '600',
    },
    difficultyTextActive: {
        color: '#000',
    },
    configRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25,
        paddingVertical: 5,
    },
    configValueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    configValue: {
        color: '#C9E265',
        fontSize: 16,
    },
    configSublabel: {
        color: '#666',
        fontSize: 12,
        marginTop: 4,
    },
    saveButton: {
        backgroundColor: '#C9E265',
        borderRadius: 30,
        paddingVertical: 18,
        alignItems: 'center',
        marginTop: 20,
    },
    saveButtonText: {
        color: '#000',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default styles;
