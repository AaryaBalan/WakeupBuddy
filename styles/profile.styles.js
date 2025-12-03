import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');
const NEON = '#C9E265';
const BG = '#000';
const GRAY = '#BDBDBD';

const profileStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BG,
    },
    scroll: {
        padding: 16,
        paddingBottom: 40,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '700',
    },
    iconButton: {
        padding: 6,
    },
    card: {
        backgroundColor: '#070707',
        borderRadius: 16,
        padding: 18,
        alignItems: 'center',
        marginBottom: 14,
        shadowColor: '#000',
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 4,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 12,
    },
    avatarRing: {
        width: 108,
        height: 108,
        borderRadius: 54,
        borderWidth: 3,
        borderColor: NEON,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 2,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        overflow: 'hidden',
    },
    badge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: NEON,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#070707',
    },
    name: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '700',
    },
    username: {
        color: GRAY,
        fontSize: 15,
        marginTop: 4,
    },
    bio: {
        color: '#9f9f9f',
        fontSize: 13,
        marginTop: 8,
        textAlign: 'center',
    },
    shareButton: {
        marginTop: 12,
        backgroundColor: NEON,
        paddingVertical: 10,
        paddingHorizontal: 22,
        borderRadius: 999,
        flexDirection: 'row',
        alignItems: 'center',
    },
    shareText: {
        color: '#000',
        fontWeight: '700',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 12,
    },
    statBox: {
        flex: 1,
        marginHorizontal: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: NEON,
        paddingVertical: 12,
        alignItems: 'center',
        backgroundColor: '#050505',
    },
    statNumber: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    statLabel: {
        color: GRAY,
        fontSize: 13,
        marginTop: 4,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 12,
    },
    sectionTitle: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },
    viewAllText: {
        color: NEON,
        fontSize: 12,
        fontWeight: '600',
    },
    historySubHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    monthText: {
        color: GRAY,
        fontSize: 13,
    },
    legend: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    legendText: {
        color: GRAY,
        fontSize: 11,
    },
    legendSquare1: {
        width: 12,
        height: 12,
        borderRadius: 2,
        backgroundColor: '#1a2a1a',
    },
    legendSquare2: {
        width: 12,
        height: 12,
        borderRadius: 2,
        backgroundColor: '#2d4a2d',
    },
    legendSquare3: {
        width: 12,
        height: 12,
        borderRadius: 2,
        backgroundColor: '#6a9a3d',
    },
    legendSquare4: {
        width: 12,
        height: 12,
        borderRadius: 2,
        backgroundColor: NEON,
    },
    achCount: {
        color: GRAY,
        fontSize: 12,
    },
    gridContainer: {
        marginTop: 10,
        width: '100%',
        flexDirection: 'column',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        gap: 3,
        paddingHorizontal: 4,
        height: (7 * 24) + (6 * 3), // 7 rows * height + gaps
    },
    gridSquare: {
        width: (width - 32) / 13 - 3, // 13 columns to fit 90 days (90/7 ≈ 13 weeks)
        height: 24,
        borderRadius: 3,
        backgroundColor: '#1a1a1a',
    },
    gridSquareLight: {
        backgroundColor: '#1a2a1a',
    },
    gridSquareMedium: {
        backgroundColor: '#2d4a2d',
    },
    gridSquareHigh: {
        backgroundColor: '#6a9a3d',
    },
    gridSquareFilled: {
        backgroundColor: NEON,
    },
    achRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 18,
    },
    achItem: {
        alignItems: 'center',
        width: (width - 32) / 4,
    },
    achCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#0b0b0b',
        justifyContent: 'center',
        alignItems: 'center',
    },
    achievedRing: {
        borderWidth: 2,
        borderColor: NEON,
    },
    achLabel: {
        color: GRAY,
        fontSize: 11,
        marginTop: 8,
        textAlign: 'center',
    },
    settingsHeader: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
        marginTop: 20,
        marginBottom: 12,
    },
    settingsCard: {
        borderRadius: 12,
        backgroundColor: '#070707',
        overflow: 'hidden',
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 14,
        borderBottomColor: '#121212',
        borderBottomWidth: 1,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    settingLabel: {
        color: '#fff',
        marginLeft: 12,
    },
    premiumRow: {
        marginTop: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 14,
        borderRadius: 12,
        backgroundColor: '#070707',
    },
    premiumText: {
        color: '#fff',
        marginLeft: 12,
    },
    logoutButton: {
        marginTop: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 14,
        borderRadius: 12,
        backgroundColor: NEON,
    },
    logoutText: {
        color: '#000',
        fontSize: 15,
        fontWeight: '700',
    },
    versionText: {
        color: GRAY,
        fontSize: 12,
        textAlign: 'center',
        marginTop: 16,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    modalContent: {
        backgroundColor: '#111',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        height: '80%',
        borderTopWidth: 1,
        borderColor: '#333',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    modalForm: {
        flex: 1,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        color: '#888',
        fontSize: 14,
        marginBottom: 8,
        fontWeight: '600',
    },
    input: {
        backgroundColor: '#222',
        borderRadius: 12,
        padding: 16,
        color: '#fff',
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#333',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    saveButton: {
        backgroundColor: NEON,
        borderRadius: 30,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40,
    },
    saveButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    actionButtons: {
        marginTop: 24,
        gap: 12,
    },
    primaryBtn: {
        backgroundColor: NEON,
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    primaryBtnText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '700',
    },
    secondaryBtn: {
        backgroundColor: '#222',
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333',
    },
    secondaryBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default profileStyles;
