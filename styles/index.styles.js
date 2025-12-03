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
        paddingHorizontal: 20,
    },
    profileContainer: {
        marginBottom: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileImageWrapper: {
        width: 100,
        height: 100,
        borderRadius: 50,
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
        borderRadius: 50,
    },
    statusBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#C9E265',
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#000',
    },
    title: {
        fontSize: 28,
        // fontFamily: 'Montserrat_700Bold',
        color: "white",
        marginBottom: 16,
        letterSpacing: 1,
    },
    tagline: {
        fontSize: 15,
        color: "#888",
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 48,
        paddingHorizontal: 16,
    },
    buttonContainer: {
        width: '100%',
        gap: 14,
        marginBottom: 32,
    },
    signupButton: {
        backgroundColor: "#C9E265", // Lime green
        paddingVertical: 14,
        borderRadius: 24,
        alignItems: "center",
        width: '100%',
    },
    signupButtonText: {
        color: "#000",
        fontSize: 15,
        fontFamily: 'Montserrat_700Bold',
    },
    loginButton: {
        paddingVertical: 10,
        alignItems: "center",
        width: '100%',
    },
    loginButtonText: {
        color: "#fff",
        fontSize: 15,
        fontFamily: 'Montserrat_700Bold',
    },
    socialSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    orText: {
        color: "#666",
        marginBottom: 16,
        fontSize: 13,
    },
    socialIcons: {
        flexDirection: 'row',
        gap: 16,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
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
