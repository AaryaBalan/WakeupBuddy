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
        padding: 20,
    },

    /* ---------- Header ---------- */
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 20,
        marginBottom: 40,
    },
    headerTitle: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "700",
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
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: "#333",
    },
    username: {
        color: "#fff",
        marginTop: 8,
        fontWeight: "600",
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
        width: 32,
        height: 32,
        borderRadius: 16,
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
        marginBottom: 24,
        fontSize: 16,
    },
    primaryBtn: {
        backgroundColor: NEON,
        width: "100%",
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    primaryBtnText: {
        color: "#000",
        fontSize: 16,
        fontWeight: "700",
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
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 8,
    },
    successText: {
        color: GRAY,
        fontSize: 16,
        lineHeight: 24,
        textAlign: "center",
        marginBottom: 40,
    },

    /* ---------- Streak Comparison ---------- */
    streakComparison: {
        backgroundColor: "#111",
        padding: 20,
        borderRadius: 16,
        width: "100%",
        marginBottom: 30,
    },
    streakTitle: {
        color: GRAY,
        fontSize: 14,
        textAlign: "center",
        marginBottom: 16,
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
        fontSize: 24,
        fontWeight: "700",
        marginVertical: 4,
    },
    streakLabel: {
        color: GRAY,
        fontSize: 12,
    },
    vsBadge: {
        backgroundColor: "#222",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    vsText: {
        color: "#666",
        fontSize: 10,
        fontWeight: "700",
    },

    /* ---------- Secondary Button ---------- */
    secondaryBtn: {
        backgroundColor: "#222",
        width: "100%",
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    secondaryBtnText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
});

export default styles;