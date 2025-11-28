import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 20,
    },
    header: {
        marginBottom: 40,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    logoWrapper: {
        width: 80,
        height: 80,
        borderRadius: 25,
        backgroundColor: '#1a1a1a',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333',
        shadowColor: "#C9E265",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 5,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#C9E265',
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
        marginBottom: 40,
    },
    form: {
        marginBottom: 30,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#111',
        borderRadius: 12,
        padding: 16,
        color: '#fff',
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#222',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#222',
    },
    passwordInput: {
        flex: 1,
        padding: 16,
        color: '#fff',
        fontSize: 16,
    },
    eyeIcon: {
        padding: 16,
    },
    forgotPassword: {
        alignItems: 'flex-end',
        marginBottom: 30,
    },
    forgotPasswordText: {
        color: '#888',
        fontSize: 14,
    },
    loginButton: {
        backgroundColor: '#C9E265',
        borderRadius: 30,
        paddingVertical: 16,
        alignItems: 'center',
        shadowColor: "#C9E265",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    loginButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    socialSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    orText: {
        color: '#666',
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
        borderWidth: 1,
        borderColor: '#333',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 'auto',
        marginBottom: 20,
    },
    footerText: {
        color: '#888',
        fontSize: 14,
    },
    footerLink: {
        color: '#C9E265',
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default styles;
