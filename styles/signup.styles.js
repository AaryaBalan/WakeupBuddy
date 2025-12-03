import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 32,
    },
    header: {
        marginBottom: 16,
    },
    backButton: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    logoWrapper: {
        width: 70,
        height: 70,
        borderRadius: 22,
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
        fontSize: 24,
        fontFamily: 'Montserrat_700Bold',
        color: '#C9E265',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: '#888',
        textAlign: 'center',
        marginBottom: 24,
    },
    form: {
        marginBottom: 24,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        color: '#fff',
        fontSize: 13,
        fontFamily: 'Montserrat_600SemiBold',
        marginBottom: 7,
    },
    input: {
        backgroundColor: '#111',
        borderRadius: 10,
        padding: 14,
        color: '#fff',
        fontSize: 15,
        borderWidth: 1,
        borderColor: '#222',
    },
    textArea: {
        height: 70,
        textAlignVertical: 'top',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#222',
    },
    passwordInput: {
        flex: 1,
        padding: 14,
        color: '#fff',
        fontSize: 15,
    },
    eyeIcon: {
        padding: 14,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    checkbox: {
        width: 18,
        height: 18,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#333',
        backgroundColor: '#111',
        marginRight: 10,
        marginTop: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#C9E265',
        borderColor: '#C9E265',
    },
    checkboxLabel: {
        flex: 1,
        color: '#888',
        fontSize: 14,
        lineHeight: 20,
    },
    linkText: {
        color: '#C9E265',
        fontFamily: 'Montserrat_700Bold',
    },
    signupButton: {
        backgroundColor: '#C9E265',
        borderRadius: 24,
        paddingVertical: 14,
        alignItems: 'center',
        shadowColor: "#C9E265",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    signupButtonText: {
        color: '#000',
        fontSize: 15,
        fontFamily: 'Montserrat_700Bold',
    },
    socialSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    orText: {
        color: '#666',
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
        borderWidth: 1,
        borderColor: '#333',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 'auto',
    },
    footerText: {
        color: '#888',
        fontSize: 14,
    },
    footerLink: {
        color: '#C9E265',
        fontSize: 14,
        fontFamily: 'Montserrat_700Bold',
    },
});

export default styles;
