import { StyleSheet } from 'react-native';

const NEON = '#C9E265';
const GRAY = '#BDBDBD';

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
    scrollView: {
        flex: 1,
        padding: 16,
    },
    profileSection: {
        alignItems: 'center',
        paddingVertical: 24,
        marginBottom: 8,
    },
    profileName: {
        fontSize: 22,
        fontFamily: 'Montserrat_700Bold',
        color: '#fff',
        marginTop: 16,
    },
    profileEmail: {
        fontSize: 14,
        fontFamily: 'Montserrat_500Medium',
        color: GRAY,
        marginTop: 4,
    },
    infoCard: {
        backgroundColor: '#111',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 12,
        fontFamily: 'Montserrat_700Bold',
        color: '#666',
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a1a',
    },
    infoLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconBg: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(201, 226, 101, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    infoLabel: {
        fontSize: 11,
        fontFamily: 'Montserrat_500Medium',
        color: '#666',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 14,
        fontFamily: 'Montserrat_600SemiBold',
        color: '#fff',
    },
    codeContainer: {
        backgroundColor: '#0a0a0a',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(201, 226, 101, 0.2)',
        borderStyle: 'dashed',
    },
    codeText: {
        fontSize: 24,
        fontFamily: 'Montserrat_700Bold',
        color: NEON,
        letterSpacing: 4,
    },
    codeHint: {
        fontSize: 12,
        fontFamily: 'Montserrat_500Medium',
        color: '#666',
        marginTop: 8,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    actionText: {
        fontSize: 14,
        fontFamily: 'Montserrat_600SemiBold',
        color: '#fff',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#111',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 18,
        fontFamily: 'Montserrat_700Bold',
        color: '#fff',
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 12,
        fontFamily: 'Montserrat_600SemiBold',
        color: GRAY,
        marginBottom: 8,
    },
    passwordInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        paddingHorizontal: 16,
    },
    passwordInput: {
        flex: 1,
        color: '#fff',
        fontSize: 14,
        fontFamily: 'Montserrat_500Medium',
        paddingVertical: 14,
    },
    changePasswordBtn: {
        backgroundColor: NEON,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    changePasswordBtnText: {
        fontSize: 15,
        fontFamily: 'Montserrat_700Bold',
        color: '#000',
    },
    // Message Box Styles
    messageBox: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 10,
        marginBottom: 16,
    },
    errorBox: {
        backgroundColor: 'rgba(255, 107, 107, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(255, 107, 107, 0.3)',
    },
    successBox: {
        backgroundColor: 'rgba(76, 175, 80, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(76, 175, 80, 0.3)',
    },
    messageText: {
        fontSize: 13,
        fontFamily: 'Montserrat_600SemiBold',
        marginLeft: 10,
        flex: 1,
    },
    errorText: {
        color: '#FF6B6B',
    },
    successText: {
        color: '#4CAF50',
    },
});

export default styles;
