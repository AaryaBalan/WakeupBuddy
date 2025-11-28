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
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        color: '#fff',
        fontSize: 18,
        marginBottom: 60,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#C9E265',
        paddingHorizontal: 50,
        paddingVertical: 18,
        borderRadius: 30,
        elevation: 5,
        shadowColor: '#C9E265',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    buttonText: {
        color: '#000',
        fontSize: 22,
        fontWeight: 'bold',
    },
});

export default styles;
