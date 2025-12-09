import { Dimensions, StyleSheet } from 'react-native';

const { width, height } = Dimensions.get('window');
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
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a1a',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 17,
        fontFamily: 'Montserrat_700Bold',
        color: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },

    // Profile Section - Hero Style
    profileSection: {
        alignItems: 'center',
        paddingVertical: 28,
        paddingHorizontal: 20,
        marginBottom: 20,
        backgroundColor: '#0a0a0a',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#1a1a1a',
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    avatarRing: {
        padding: 4,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: NEON,
        shadowColor: NEON,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        backgroundColor: NEON,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#0a0a0a',
    },
    profileName: {
        fontSize: Math.min(24, width * 0.06),
        fontFamily: 'Montserrat_700Bold',
        color: '#fff',
        textAlign: 'center',
    },
    usernameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    profileUsername: {
        fontSize: 14,
        fontFamily: 'Montserrat_500Medium',
        color: NEON,
    },
    profileEmail: {
        fontSize: 13,
        fontFamily: 'Montserrat_500Medium',
        color: GRAY,
        marginTop: 4,
    },
    memberSinceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        backgroundColor: 'rgba(201, 226, 101, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    memberSinceText: {
        fontSize: 11,
        fontFamily: 'Montserrat_600SemiBold',
        color: NEON,
        marginLeft: 6,
    },

    // Info Card Styles
    infoCard: {
        backgroundColor: '#111',
        borderRadius: 16,
        padding: 18,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#1a1a1a',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 13,
        fontFamily: 'Montserrat_700Bold',
        color: '#888',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
    },
    cardBadge: {
        backgroundColor: 'rgba(201, 226, 101, 0.15)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    cardBadgeText: {
        fontSize: 10,
        fontFamily: 'Montserrat_700Bold',
        color: NEON,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a1a',
    },
    infoRowLast: {
        borderBottomWidth: 0,
    },
    infoLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconBg: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(201, 226, 101, 0.12)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    infoTextContainer: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 11,
        fontFamily: 'Montserrat_500Medium',
        color: '#666',
        marginBottom: 3,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    infoValue: {
        fontSize: 15,
        fontFamily: 'Montserrat_600SemiBold',
        color: '#fff',
    },
    infoValueSmall: {
        fontSize: 13,
    },
    copyButton: {
        padding: 8,
        backgroundColor: 'rgba(201, 226, 101, 0.1)',
        borderRadius: 8,
    },

    // Profile Code Section
    codeContainer: {
        backgroundColor: '#0a0a0a',
        borderRadius: 14,
        padding: 20,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: 'rgba(201, 226, 101, 0.25)',
        borderStyle: 'dashed',
    },
    codeLabel: {
        fontSize: 10,
        fontFamily: 'Montserrat_600SemiBold',
        color: '#666',
        letterSpacing: 1,
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    codeText: {
        fontSize: Math.min(28, width * 0.07),
        fontFamily: 'Montserrat_700Bold',
        color: NEON,
        letterSpacing: 6,
    },
    codeHint: {
        fontSize: 12,
        fontFamily: 'Montserrat_500Medium',
        color: '#666',
        marginTop: 10,
        textAlign: 'center',
    },
    codeCopyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 14,
        backgroundColor: 'rgba(201, 226, 101, 0.15)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    codeCopyText: {
        fontSize: 12,
        fontFamily: 'Montserrat_600SemiBold',
        color: NEON,
        marginLeft: 6,
    },

    // Action Row Styles
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 4,
    },
    actionText: {
        fontSize: 15,
        fontFamily: 'Montserrat_600SemiBold',
        color: '#fff',
    },
    actionChevron: {
        backgroundColor: '#1a1a1a',
        padding: 6,
        borderRadius: 8,
    },

    // Stats Row
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#1a1a1a',
        marginTop: 8,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statDivider: {
        width: 1,
        backgroundColor: '#1a1a1a',
    },
    statValue: {
        fontSize: 20,
        fontFamily: 'Montserrat_700Bold',
        color: NEON,
    },
    statLabel: {
        fontSize: 11,
        fontFamily: 'Montserrat_500Medium',
        color: '#666',
        marginTop: 4,
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#111',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        padding: 24,
        paddingBottom: 40,
        maxHeight: height * 0.85,
    },
    modalHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#333',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: 'Montserrat_700Bold',
        color: '#fff',
    },
    modalCloseBtn: {
        padding: 4,
    },
    modalSubtitle: {
        fontSize: 13,
        fontFamily: 'Montserrat_500Medium',
        color: '#666',
        marginBottom: 24,
    },
    inputGroup: {
        marginBottom: 18,
    },
    inputLabel: {
        fontSize: 12,
        fontFamily: 'Montserrat_600SemiBold',
        color: GRAY,
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    passwordInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        borderRadius: 14,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#222',
    },
    passwordInputFocused: {
        borderColor: NEON,
    },
    passwordInput: {
        flex: 1,
        color: '#fff',
        fontSize: 15,
        fontFamily: 'Montserrat_500Medium',
        paddingVertical: 16,
    },
    eyeButton: {
        padding: 4,
    },
    passwordHint: {
        fontSize: 11,
        fontFamily: 'Montserrat_500Medium',
        color: '#555',
        marginTop: 6,
        marginLeft: 4,
    },
    changePasswordBtn: {
        backgroundColor: NEON,
        borderRadius: 14,
        paddingVertical: 18,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: NEON,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    changePasswordBtnDisabled: {
        backgroundColor: '#333',
        shadowOpacity: 0,
    },
    changePasswordBtnText: {
        fontSize: 16,
        fontFamily: 'Montserrat_700Bold',
        color: '#000',
    },

    // Message Box Styles
    messageBox: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 12,
        marginBottom: 20,
    },
    errorBox: {
        backgroundColor: 'rgba(255, 107, 107, 0.12)',
        borderWidth: 1,
        borderColor: 'rgba(255, 107, 107, 0.25)',
    },
    successBox: {
        backgroundColor: 'rgba(76, 175, 80, 0.12)',
        borderWidth: 1,
        borderColor: 'rgba(76, 175, 80, 0.25)',
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

    // Danger Zone
    dangerCard: {
        backgroundColor: 'rgba(255, 107, 107, 0.08)',
        borderColor: 'rgba(255, 107, 107, 0.2)',
    },
    dangerIconBg: {
        backgroundColor: 'rgba(255, 107, 107, 0.15)',
    },
    dangerText: {
        color: '#FF6B6B',
    },
});

export default styles;
