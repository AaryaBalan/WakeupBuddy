import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from '../../components/AppText';
import styles from "../../styles/permissionsGuide.styles";
import { checkAllPermissions, requestBatteryOptimization, requestCallPhonePermission, requestDrawOverlays, requestExactAlarmPermission, requestFullScreenIntentPermission } from '../native/AlarmNative';

const NEON = '#C9E265';

export default function PermissionsGuide() {
    const router = useRouter();
    const [permissions, setPermissions] = useState({
        canScheduleExactAlarms: false,
        batteryOptimizationDisabled: false,
        canDrawOverlays: false,
        canUseFullScreenIntent: false,
        hasCallPermission: false,
        allGranted: false
    });
    const [isLoading, setIsLoading] = useState(true);
    const [pulseAnim] = useState(new Animated.Value(1));

    const checkPermissions = async () => {
        setIsLoading(true);
        const perms = await checkAllPermissions();
        setPermissions(perms);
        setIsLoading(false);
    };

    useEffect(() => {
        checkPermissions();
        const interval = setInterval(checkPermissions, 2000);
        return () => clearInterval(interval);
    }, []);

    const handleExactAlarmPress = async () => {
        await requestExactAlarmPermission();
    };

    const handleBatteryOptPress = async () => {
        await requestBatteryOptimization();
    };

    const handleOverlayPress = async () => {
        await requestDrawOverlays();
    };

    const handleFullScreenIntentPress = async () => {
        await requestFullScreenIntentPermission();
    };

    const handleCallPhonePress = async () => {
        await requestCallPhonePermission();
        setTimeout(checkPermissions, 500);
    };

    const openAppSettings = () => {
        Linking.openSettings();
    };

    const handleContinue = () => {
        if (permissions.allGranted) {
            router.back();
        }
    };

    const completedCount = (permissions.canScheduleExactAlarms ? 1 : 0) +
        (permissions.batteryOptimizationDisabled ? 1 : 0) +
        (permissions.canDrawOverlays ? 1 : 0) +
        (permissions.canUseFullScreenIntent ? 1 : 0) +
        (permissions.hasCallPermission ? 1 : 0);

    const permissionItems = [
        {
            step: 1,
            title: 'Exact Alarms',
            subtitle: 'Schedule alarms at precise times',
            icon: 'alarm',
            granted: permissions.canScheduleExactAlarms,
            onPress: handleExactAlarmPress,
            buttonText: 'Allow'
        },
        {
            step: 2,
            title: 'Battery Optimization',
            subtitle: 'Keep alarms running in background',
            icon: 'battery-full',
            granted: permissions.batteryOptimizationDisabled,
            onPress: handleBatteryOptPress,
            buttonText: 'Allow'
        },
        {
            step: 3,
            title: 'Overlay Permission',
            subtitle: 'Show alarm over lock screen',
            icon: 'layers',
            granted: permissions.canDrawOverlays,
            onPress: handleOverlayPress,
            buttonText: 'Allow'
        },
        {
            step: 4,
            title: 'Full Screen Intent',
            subtitle: 'Critical for Android 14+ lock screen',
            icon: 'phone-portrait',
            granted: permissions.canUseFullScreenIntent,
            onPress: handleFullScreenIntentPress,
            buttonText: 'Allow'
        },
        {
            step: 5,
            title: 'Phone Calls',
            subtitle: 'Call your buddy when alarm rings',
            icon: 'call',
            granted: permissions.hasCallPermission,
            onPress: handleCallPhonePress,
            buttonText: 'Allow'
        }
    ];

    const manualItems = [
        {
            step: 6,
            title: 'Notifications',
            subtitle: 'Receive alarm alerts',
            icon: 'notifications',
            buttonText: 'Open Settings',
            onPress: openAppSettings
        },
        {
            step: 7,
            title: 'Background Activity',
            subtitle: 'Allow app to run in background',
            icon: 'flash',
            buttonText: 'Open Settings',
            onPress: openAppSettings
        }
    ];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <AppText style={styles.headerTitle}>Setup Permissions</AppText>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <View style={styles.iconWrapper}>
                        <View style={styles.iconGlow} />
                        <View style={styles.iconContainer}>
                            <Ionicons name="shield-checkmark" size={40} color="#000" />
                        </View>
                    </View>
                    <AppText style={styles.heroTitle}>Almost Ready!</AppText>
                    <AppText style={styles.heroSubtitle}>
                        Grant these permissions to ensure your alarms never miss
                    </AppText>

                    {/* Progress Indicator */}
                    <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: `${(completedCount / 4) * 100}%` }]} />
                        </View>
                        <AppText style={styles.progressText}>{completedCount}/4 Complete</AppText>
                    </View>
                </View>

                {/* Required Permissions */}
                <View style={styles.sectionHeader}>
                    <View style={styles.sectionBadge}>
                        <Ionicons name="star" size={12} color="#000" />
                        <AppText style={styles.sectionBadgeText}>REQUIRED</AppText>
                    </View>
                    <AppText style={styles.sectionTitle}>Core Permissions</AppText>
                </View>

                <View style={styles.permissionsGrid}>
                    {permissionItems.map((item, index) => (
                        <Animated.View
                            key={item.step}
                            style={[
                                styles.permissionCard,
                                item.granted && styles.permissionCardGranted,
                                !item.granted && { transform: [{ scale: pulseAnim }] }
                            ]}
                        >
                            <View style={styles.cardContent}>
                                <View style={[
                                    styles.permissionIcon,
                                    item.granted && styles.permissionIconGranted
                                ]}>
                                    <Ionicons
                                        name={item.icon}
                                        size={22}
                                        color={item.granted ? '#000' : NEON}
                                    />
                                </View>
                                <View style={styles.permissionInfo}>
                                    <AppText style={styles.permissionTitle}>{item.title}</AppText>
                                    <AppText style={styles.permissionSubtitle}>{item.subtitle}</AppText>
                                </View>
                                {item.granted ? (
                                    <View style={styles.checkBadge}>
                                        <Ionicons name="checkmark" size={16} color="#000" />
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        style={styles.grantButton}
                                        onPress={item.onPress}
                                        activeOpacity={0.8}
                                    >
                                        <AppText style={styles.grantButtonText}>{item.buttonText}</AppText>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </Animated.View>
                    ))}
                </View>

                {/* Manual Permissions Section */}
                <View style={styles.sectionHeader}>
                    <View style={[styles.sectionBadge, styles.sectionBadgeManual]}>
                        <Ionicons name="hand-left" size={12} color="#000" />
                        <AppText style={styles.sectionBadgeText}>MANUAL</AppText>
                    </View>
                    <AppText style={styles.sectionTitle}>Additional Settings</AppText>
                </View>

                <View style={styles.manualContainer}>
                    {manualItems.map((item) => (
                        <TouchableOpacity
                            key={item.step}
                            style={styles.manualCard}
                            onPress={item.onPress}
                            activeOpacity={0.7}
                        >
                            <View style={styles.manualIconContainer}>
                                <Ionicons name={item.icon} size={20} color={NEON} />
                            </View>
                            <View style={styles.manualInfo}>
                                <AppText style={styles.manualTitle}>{item.title}</AppText>
                                <AppText style={styles.manualSubtitle}>{item.subtitle}</AppText>
                            </View>
                            <View style={styles.manualArrow}>
                                <Ionicons name="chevron-forward" size={18} color="#666" />
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Info Card */}
                <View style={styles.infoCard}>
                    <View style={styles.infoIconContainer}>
                        <Ionicons name="information-circle" size={20} color={NEON} />
                    </View>
                    <AppText style={styles.infoText}>
                        These permissions are essential for reliable wake-up calls. Your data stays private and secure.
                    </AppText>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Bottom CTA */}
            <View style={styles.bottomCta}>
                <TouchableOpacity
                    style={[
                        styles.continueButton,
                        permissions.allGranted && styles.continueButtonActive
                    ]}
                    onPress={handleContinue}
                    activeOpacity={0.8}
                >
                    <AppText style={[
                        styles.continueButtonText,
                        permissions.allGranted && styles.continueButtonTextActive
                    ]}>
                        {permissions.allGranted ? 'Continue' : `Complete ${4 - completedCount} More`}
                    </AppText>
                    {permissions.allGranted && (
                        <Ionicons name="arrow-forward" size={20} color="#000" />
                    )}
                </TouchableOpacity>
                <AppText style={styles.footerText}>
                    {permissions.allGranted
                        ? '✓ All automatic permissions granted'
                        : 'Grant all permissions to continue'}
                </AppText>
            </View>
        </SafeAreaView>
    );
}