import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 30,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    cancelText: {
        color: '#888',
        fontSize: 16,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Montserrat_700Bold',
    },
    timeContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'baseline',
        marginBottom: 32,
    },
    timeText: {
        fontSize: 70,
        fontFamily: 'Montserrat_700Bold',
        color: '#fff',
        letterSpacing: 2,
    },
    ampmText: {
        fontSize: 20,
        color: '#888',
        marginLeft: 8,
    },
    sectionLabel: {
        color: '#888',
        fontSize: 11,
        fontFamily: 'Montserrat_700Bold',
        marginBottom: 12,
        letterSpacing: 1,
    },
    modeToggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#111',
        borderRadius: 10,
        padding: 3,
        marginBottom: 16,
    },
    modeButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    modeButtonActive: {
        backgroundColor: '#222',
    },
    modeButtonText: {
        color: '#888',
        fontFamily: 'Montserrat_600SemiBold',
    },
    modeButtonTextActive: {
        color: '#fff',
    },
    buddyCard: {
        borderWidth: 1,
        borderColor: '#C9E265',
        borderRadius: 14,
        padding: 14,
        marginBottom: 24,
        backgroundColor: '#0a0a0a',
    },
    buddyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    buddyIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#1a1a1a',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    buddyInfo: {
        flex: 1,
    },
    buddyTitle: {
        color: '#fff',
        fontFamily: 'Montserrat_700Bold',
        fontSize: 15,
    },
    buddySubtitle: {
        color: '#888',
        fontSize: 13,
    },
    changeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    changeButtonText: {
        color: '#C9E265',
        fontFamily: 'Montserrat_700Bold',
    },
    usernameInput: {
        backgroundColor: '#111',
        color: '#fff',
        padding: 10,
        borderRadius: 7,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#333',
    },
    buddyFooter: {
        flexDirection: 'row',
        gap: 6,
        marginTop: 4,
    },
    buddyFooterText: {
        color: '#666',
        fontSize: 12,
        flex: 1,
        lineHeight: 16,
    },
    configItem: {
        marginBottom: 20,
    },
    configLabel: {
        color: '#fff',
        fontSize: 15,
        fontFamily: 'Montserrat_600SemiBold',
        marginBottom: 10,
    },
    daysContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dayButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
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
        fontFamily: 'Montserrat_700Bold',
    },
    dayTextActive: {
        color: '#000',
    },
    difficultyContainer: {
        flexDirection: 'row',
        backgroundColor: '#111',
        borderRadius: 16,
        padding: 3,
    },
    difficultyButton: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 13,
    },
    difficultyButtonActive: {
        backgroundColor: '#C9E265',
    },
    difficultyText: {
        color: '#888',
        fontFamily: 'Montserrat_600SemiBold',
    },
    difficultyTextActive: {
        color: '#000',
    },
    configRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingVertical: 4,
    },
    configValueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    configValue: {
        color: '#C9E265',
        fontSize: 15,
    },
    configSublabel: {
        color: '#666',
        fontSize: 12,
        marginTop: 4,
    },
    saveButton: {
        backgroundColor: '#C9E265',
        borderRadius: 24,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 16,
    },
    saveButtonText: {
        color: '#000',
        fontSize: 15,
        fontFamily: 'Montserrat_700Bold',
    },
    // Label Modal Styles
    labelModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'flex-end',
    },
    labelModalContent: {
        backgroundColor: '#111',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    labelModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    labelModalTitle: {
        fontSize: 18,
        fontFamily: 'Montserrat_700Bold',
        color: '#fff',
    },
    defaultLabelsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 24,
    },
    defaultLabelChip: {
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 20,
        backgroundColor: '#1a1a1a',
        borderWidth: 1,
        borderColor: '#333',
    },
    defaultLabelChipActive: {
        backgroundColor: 'rgba(201, 226, 101, 0.2)',
        borderColor: '#C9E265',
    },
    defaultLabelText: {
        fontSize: 14,
        fontFamily: 'Montserrat_600SemiBold',
        color: '#888',
    },
    defaultLabelTextActive: {
        color: '#C9E265',
    },
    customLabelContainer: {
        borderTopWidth: 1,
        borderTopColor: '#222',
        paddingTop: 20,
    },
    customLabelTitle: {
        fontSize: 13,
        fontFamily: 'Montserrat_600SemiBold',
        color: '#888',
        marginBottom: 12,
    },
    customLabelInputRow: {
        flexDirection: 'row',
        gap: 12,
    },
    customLabelInput: {
        flex: 1,
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        color: '#fff',
        fontSize: 14,
        fontFamily: 'Montserrat_500Medium',
    },
    customLabelSaveBtn: {
        backgroundColor: '#C9E265',
        borderRadius: 12,
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    customLabelSaveBtnDisabled: {
        backgroundColor: '#333',
    },
    customLabelSaveBtnText: {
        fontSize: 14,
        fontFamily: 'Montserrat_700Bold',
        color: '#000',
    },
    // Wake Method Button
    wakeMethodButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#C9E265',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    wakeMethodText: {
        fontSize: 13,
        fontFamily: 'Montserrat_700Bold',
        color: '#000',
    },
});

export default styles;
