import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');
const NEON = '#C9E265';
const BG = '#000';
const GRAY = '#BDBDBD';

const styles = StyleSheet.create({
    /* ---------- Container ---------- */
    container: {
        flex: 1,
        backgroundColor: BG,
        padding: 16,
    },

    /* ---------- Header ---------- */
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 16,
        marginBottom: 32,
    },
    headerTitle: {
        color: "#fff",
        fontSize: 16,
        fontFamily: 'Montserrat_700Bold',
    },
    iconButton: {
        padding: 6,
    },

    /* ---------- Content Wrapper ---------- */
    content: {
        flex: 1,
        alignItems: "center",
    },

    /* ---------- Avatars Section ---------- */
    avatarsRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        marginBottom: 40,
    },
    userCol: {
        alignItems: "center",
    },
    avatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 2,
        borderColor: "#333",
    },
    username: {
        color: "#fff",
        marginTop: 7,
        fontFamily: 'Montserrat_600SemiBold',
    },

    /* ---------- Connector Line ---------- */
    connector: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 10,
    },
    line: {
        flex: 1,
        height: 2,
        backgroundColor: "#333",
        position: "absolute",
        left: 0,
        right: 0,
    },
    iconCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: NEON,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1,
    },

    /* ---------- Action Container ---------- */
    actionContainer: {
        width: "100%",
        alignItems: "center",
    },
    promptText: {
        color: GRAY,
        textAlign: "center",
        marginBottom: 20,
        fontSize: 15,
    },
    primaryBtn: {
        backgroundColor: NEON,
        width: "100%",
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: "center",
    },
    primaryBtnText: {
        color: "#000",
        fontSize: 16,
        fontFamily: 'Montserrat_700Bold',
    },

    /* ---------- Success State ---------- */
    successContainer: {
        width: "100%",
        alignItems: "center",
    },
    successBadge: {
        marginBottom: 16,
    },
    successTitle: {
        color: "#fff",
        fontSize: 20,
        fontFamily: 'Montserrat_700Bold',
        marginBottom: 7,
    },
    successText: {
        color: GRAY,
        fontSize: 15,
        lineHeight: 22,
        textAlign: "center",
        marginBottom: 32,
    },

    /* ---------- Streak Comparison ---------- */
    streakComparison: {
        backgroundColor: "#111",
        padding: 16,
        borderRadius: 14,
        width: "100%",
        marginBottom: 24,
    },
    streakTitle: {
        color: GRAY,
        fontSize: 13,
        textAlign: "center",
        marginBottom: 14,
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    streakRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
    },
    streakBox: {
        alignItems: "center",
    },
    streakNum: {
        color: "#fff",
        fontSize: 20,
        fontFamily: 'Montserrat_700Bold',
        marginVertical: 3,
    },
    streakLabel: {
        color: GRAY,
        fontSize: 11,
    },
    vsBadge: {
        backgroundColor: "#222",
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: 3,
    },
    vsText: {
        color: "#666",
        fontSize: 9,
        fontFamily: 'Montserrat_700Bold',
    },

    /* ---------- Secondary Button ---------- */
    secondaryBtn: {
        backgroundColor: "#222",
        width: "100%",
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: "center",
    },
    secondaryBtnText: {
        color: "#fff",
        fontSize: 16,
        fontFamily: 'Montserrat_700Bold',
    },
});

export default styles;