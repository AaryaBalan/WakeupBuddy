import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';
import { ActivityIndicator, TouchableOpacity, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from './AppText';

const NEON = '#C9E265';
const BG = '#000';

/**
 * ScreenWrapper - A wrapper component that handles loading states and network connectivity
 * 
 * @param {boolean} isLoading - Whether the screen data is still loading
 * @param {React.ReactNode} children - The screen content to render
 * @param {object} style - Additional styles for the container
 * @param {array} edges - SafeAreaView edges (default: ['top'])
 */
export default function ScreenWrapper({ 
    isLoading = false, 
    children, 
    style,
    edges = ['top'],
    backgroundColor = BG 
}) {
    const [isConnected, setIsConnected] = useState(true);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // Subscribe to network state updates
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected);
            setIsChecking(false);
        });

        // Initial check
        NetInfo.fetch().then(state => {
            setIsConnected(state.isConnected);
            setIsChecking(false);
        });

        return () => unsubscribe();
    }, []);

    const handleRetry = async () => {
        setIsChecking(true);
        const state = await NetInfo.fetch();
        setIsConnected(state.isConnected);
        setIsChecking(false);
    };

    // Show loading while checking network
    if (isChecking) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor }]} edges={edges}>
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color={NEON} />
                </View>
            </SafeAreaView>
        );
    }

    // Show no internet screen
    if (!isConnected) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor }]} edges={edges}>
                <View style={styles.centerContent}>
                    <Ionicons name="cloud-offline-outline" size={80} color="#444" />
                    <AppText style={styles.noInternetTitle}>No Internet Connection</AppText>
                    <AppText style={styles.noInternetSubtitle}>
                        Please check your connection and try again
                    </AppText>
                    <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                        <Ionicons name="refresh" size={20} color="#000" />
                        <AppText style={styles.retryButtonText}>Retry</AppText>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // Show loading state while data is being fetched
    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor }]} edges={edges}>
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color={NEON} />
                    <AppText style={styles.loadingText}>Loading...</AppText>
                </View>
            </SafeAreaView>
        );
    }

    // Render actual content
    return (
        <SafeAreaView style={[styles.container, style, { backgroundColor }]} edges={edges}>
            {children}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        color: '#888',
        fontSize: 14,
        marginTop: 12,
    },
    noInternetTitle: {
        color: '#fff',
        fontSize: 20,
        fontFamily: 'Montserrat_700Bold',
        marginTop: 20,
        textAlign: 'center',
    },
    noInternetSubtitle: {
        color: '#888',
        fontSize: 14,
        marginTop: 10,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: NEON,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25,
        marginTop: 30,
        gap: 8,
    },
    retryButtonText: {
        color: '#000',
        fontSize: 16,
        fontFamily: 'Montserrat_700Bold',
    },
});
