import { StyleSheet } from 'react-native';

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
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a1a',
    },
    headerTitle: {
        fontSize: 15,
        fontFamily: 'Montserrat_700Bold',
        color: '#fff',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 40,
        alignItems: 'center',
    },
    iconContainer: {
        position: 'relative',
        marginBottom: 32,
    },
    iconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(201, 226, 101, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(201, 226, 101, 0.3)',
    },
    sparkle1: {
        position: 'absolute',
        top: 0,
        right: -5,
    },
    sparkle2: {
        position: 'absolute',
        bottom: 10,
        left: -10,
        opacity: 0.6,
    },
    title: {
        fontSize: 24,
        fontFamily: 'Montserrat_700Bold',
        color: '#fff',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        fontFamily: 'Montserrat_500Medium',
        color: GRAY,
        marginBottom: 32,
    },
    messageCard: {
        backgroundColor: '#111',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        alignItems: 'center',
        marginBottom: 32,
        borderWidth: 1,
        borderColor: 'rgba(201, 226, 101, 0.2)',
    },
    messageIconRow: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(201, 226, 101, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    messageTitle: {
        fontSize: 18,
        fontFamily: 'Montserrat_700Bold',
        color: NEON,
        marginBottom: 12,
    },
    messageText: {
        fontSize: 14,
        fontFamily: 'Montserrat_500Medium',
        color: GRAY,
        textAlign: 'center',
        lineHeight: 22,
    },
    featuresContainer: {
        width: '100%',
        backgroundColor: '#0a0a0a',
        borderRadius: 14,
        padding: 16,
        marginBottom: 24,
    },
    featuresTitle: {
        fontSize: 12,
        fontFamily: 'Montserrat_700Bold',
        color: '#666',
        letterSpacing: 1,
        marginBottom: 16,
        textTransform: 'uppercase',
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a1a',
    },
    featureIconBg: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: 'rgba(201, 226, 101, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    featureText: {
        flex: 1,
        fontSize: 14,
        fontFamily: 'Montserrat_600SemiBold',
        color: '#fff',
    },
    footerNote: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    footerText: {
        fontSize: 12,
        fontFamily: 'Montserrat_500Medium',
        color: '#666',
        marginLeft: 8,
    },
});

export default styles;
