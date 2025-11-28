import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000000",
    },
    content: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
    },
    profileContainer: {
        marginBottom: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileImageWrapper: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 2,
        borderColor: '#333', // Dark border
        position: 'relative',
        shadowColor: "#C9E265",
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    profileImage: {
        width: '100%',
        height: '100%',
        borderRadius: 60,
    },
    statusBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#C9E265',
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#000',
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: "white",
        marginBottom: 20,
        letterSpacing: 1,
    },
    tagline: {
        fontSize: 16,
        color: "#888",
        textAlign: "center",
        lineHeight: 24,
        marginBottom: 60,
        paddingHorizontal: 20,
    },
    buttonContainer: {
        width: '100%',
        gap: 16,
        marginBottom: 40,
    },
    signupButton: {
        backgroundColor: "#C9E265", // Lime green
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: "center",
        width: '100%',
    },
    signupButtonText: {
        color: "#000",
        fontSize: 16,
        fontWeight: "bold",
    },
    loginButton: {
        paddingVertical: 12,
        alignItems: "center",
        width: '100%',
    },
    loginButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    socialSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    orText: {
        color: "#666",
        marginBottom: 20,
        fontSize: 14,
    },
    socialIcons: {
        flexDirection: 'row',
        gap: 20,
    },
    iconButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#1a1a1a',
        alignItems: 'center',
        justifyContent: 'center',
    },
    footerText: {
        color: "#444",
        fontSize: 12,
        position: 'absolute',
        bottom: 40,
    },
});

export default styles;
