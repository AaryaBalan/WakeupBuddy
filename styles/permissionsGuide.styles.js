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
        padding: 5,
        paddingBottom: 40,
    },

    // Hero Section
    heroSection: {
        alignItems: 'center',
        paddingVertical: 24,
        marginBottom: 24,
    },
    iconWrapper: {
        position: 'relative',
        marginBottom: 16,
    },
    iconGlow: {
        position: 'absolute',
        top: -10,
        left: -10,
        right: -10,
        bottom: -10,
        backgroundColor: NEON,
        borderRadius: 50,
        opacity: 0.15,
    },
    iconContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: NEON,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: NEON,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    heroTitle: {
        fontSize: 26,
        fontFamily: 'Montserrat_700Bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 8,
    },
    heroSubtitle: {
        fontSize: 14,
        fontFamily: 'Montserrat_500Medium',
        color: '#888',
        textAlign: 'center',
        paddingHorizontal: 20,
        lineHeight: 20,
    },

    // Progress Indicator
    progressContainer: {
        width: '100%',
        marginTop: 24,
        paddingHorizontal: 20,
    },
    progressBar: {
        height: 6,
        backgroundColor: '#1a1a1a',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: NEON,
        borderRadius: 3,
    },
    progressText: {
        fontSize: 12,
        fontFamily: 'Montserrat_600SemiBold',
        color: NEON,
        textAlign: 'center',
        marginTop: 8,
    },

    // Section Header
    sectionHeader: {
        marginBottom: 14,
    },
    sectionBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: NEON,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 8,
        gap: 4,
    },
    sectionBadgeManual: {
        backgroundColor: '#FF9500',
    },
    sectionBadgeText: {
        fontSize: 10,
        fontFamily: 'Montserrat_700Bold',
        color: '#000',
        letterSpacing: 0.5,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'Montserrat_700Bold',
        color: '#fff',
    },

    // Permissions Grid
    permissionsGrid: {
        gap: 12,
        marginBottom: 28,
    },
    permissionCard: {
        backgroundColor: '#111',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1.5,
        borderColor: '#222',
    },
    permissionCardGranted: {
        borderColor: 'rgba(201, 226, 101, 0.3)',
        backgroundColor: 'rgba(201, 226, 101, 0.05)',
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    permissionIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: 'rgba(201, 226, 101, 0.12)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    permissionIconGranted: {
        backgroundColor: NEON,
    },
    permissionInfo: {
        flex: 1,
    },
    permissionTitle: {
        fontSize: 15,
        fontFamily: 'Montserrat_700Bold',
        color: '#fff',
        marginBottom: 3,
    },
    permissionSubtitle: {
        fontSize: 12,
        fontFamily: 'Montserrat_500Medium',
        color: '#666',
    },
    checkBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: NEON,
        justifyContent: 'center',
        alignItems: 'center',
    },
    grantButton: {
        backgroundColor: NEON,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },
    grantButtonText: {
        fontSize: 13,
        fontFamily: 'Montserrat_700Bold',
        color: '#000',
    },

    // Manual Section
    manualContainer: {
        gap: 10,
        marginBottom: 20,
    },
    manualCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111',
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: '#222',
    },
    manualIconContainer: {
        width: 42,
        height: 42,
        borderRadius: "50%",
        // backgroundColor: 'rgba(255, 149, 0, 0.12)',
        borderWidth: 1,
        borderColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    manualInfo: {
        flex: 1,
    },
    manualTitle: {
        fontSize: 14,
        fontFamily: 'Montserrat_700Bold',
        color: '#fff',
        marginBottom: 2,
    },
    manualSubtitle: {
        fontSize: 11,
        fontFamily: 'Montserrat_500Medium',
        color: '#666',
    },
    manualArrow: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#1a1a1a',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Info Card
    infoCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: 'rgba(201, 226, 101, 0.08)',
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: 'rgba(201, 226, 101, 0.15)',
        marginBottom: 20,
    },
    infoIconContainer: {
        marginRight: 12,
        marginTop: 2,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        fontFamily: 'Montserrat_500Medium',
        color: '#aaa',
        lineHeight: 19,
    },

    // Bottom CTA
    bottomCta: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#000',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 30,
        borderTopWidth: 1,
        borderTopColor: '#1a1a1a',
    },
    continueButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#222',
        paddingVertical: 16,
        borderRadius: 14,
        gap: 8,
    },
    continueButtonActive: {
        backgroundColor: NEON,
        shadowColor: NEON,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    continueButtonText: {
        fontSize: 16,
        fontFamily: 'Montserrat_700Bold',
        color: '#666',
    },
    continueButtonTextActive: {
        color: '#000',
    },
    footerText: {
        fontSize: 12,
        fontFamily: 'Montserrat_500Medium',
        color: '#555',
        textAlign: 'center',
        marginTop: 10,
    },
});

export default styles;
