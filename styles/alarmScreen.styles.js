import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    emoji: {
        fontSize: 80,
        marginBottom: 20,
    },
    title: {
        color: '#C9E265',
        fontSize: 48,
        fontFamily: 'Montserrat_700Bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        color: '#fff',
        fontSize: 16,
        marginBottom: 60,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#C9E265',
        paddingHorizontal: 44,
        paddingVertical: 16,
        borderRadius: 24,
        elevation: 5,
        shadowColor: '#C9E265',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    buttonText: {
        color: '#000',
        fontSize: 20,
        fontFamily: 'Montserrat_700Bold',
    },
});

export default styles;
