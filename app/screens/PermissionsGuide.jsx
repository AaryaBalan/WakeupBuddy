import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { checkAllPermissions, requestBatteryOptimization, requestDrawOverlays, requestExactAlarmPermission } from '../native/AlarmNative';
import styles from "../../styles/permissionsGuide.styles"

export default function PermissionsGuide() {
    const router = useRouter();
    const [permissions, setPermissions] = useState({
        canScheduleExactAlarms: false,
        batteryOptimizationDisabled: false,
        canDrawOverlays: false,
        allGranted: false
    });
    const [isLoading, setIsLoading] = useState(true);

    const checkPermissions = async () => {
        setIsLoading(true);
        const perms = await checkAllPermissions();
        setPermissions(perms);
        setIsLoading(false);
    };

    useEffect(() => {
        checkPermissions();

        // Refresh permissions when app comes to foreground
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

    const openAppSettings = () => {
        Linking.openSettings();
    };

    const handleContinue = () => {
        if (permissions.allGranted) {
            router.back();
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Title Section */}
                <View style={styles.titleSection}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="notifications" size={48} color="#C9E265" />
                    </View>
                    <Text style={styles.title}>Setup Alarm Permissions</Text>
                    <Text style={styles.subtitle}>
                        To ensure your alarms work reliably, we need a couple of permissions.
                    </Text>
                </View>

                {/* Permission Steps */}
                <View style={styles.permissionsContainer}>
                    {/* Step 1: Exact Alarms */}
                    <View style={styles.permissionCard}>
                        <View style={styles.cardHeader}>
                            <View style={styles.stepNumber}>
                                <Text style={styles.stepNumberText}>1</Text>
                            </View>
                            <View style={styles.cardTitleContainer}>
                                <Text style={styles.cardTitle}>Allow Exact Alarms</Text>
                                <Text style={styles.cardSubtitle}>
                                    Required to schedule alarms at the exact time you set
                                </Text>
                            </View>
                            {permissions.canScheduleExactAlarms ? (
                                <Ionicons name="checkmark-circle" size={32} color="#C9E265" />
                            ) : (
                                <Ionicons name="ellipse-outline" size={32} color="#666" />
                            )}
                        </View>
                        {!permissions.canScheduleExactAlarms && (
                            <TouchableOpacity style={styles.actionButton} onPress={handleExactAlarmPress}>
                                <Text style={styles.actionButtonText}>Open Settings</Text>
                                <Ionicons name="arrow-forward" size={20} color="#000" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Step 2: Battery Optimization */}
                    <View style={styles.permissionCard}>
                        <View style={styles.cardHeader}>
                            <View style={styles.stepNumber}>
                                <Text style={styles.stepNumberText}>2</Text>
                            </View>
                            <View style={styles.cardTitleContainer}>
                                <Text style={styles.cardTitle}>Disable Battery Optimization</Text>
                                <Text style={styles.cardSubtitle}>
                                    Ensures alarms work even when app is closed
                                </Text>
                            </View>
                            {permissions.batteryOptimizationDisabled ? (
                                <Ionicons name="checkmark-circle" size={32} color="#C9E265" />
                            ) : (
                                <Ionicons name="ellipse-outline" size={32} color="#666" />
                            )}
                        </View>
                        {!permissions.batteryOptimizationDisabled && (
                            <TouchableOpacity style={styles.actionButton} onPress={handleBatteryOptPress}>
                                <Text style={styles.actionButtonText}>Open Settings</Text>
                                <Ionicons name="arrow-forward" size={20} color="#000" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Step 3: Display Over Other Apps */}
                    <View style={styles.permissionCard}>
                        <View style={styles.cardHeader}>
                            <View style={styles.stepNumber}>
                                <Text style={styles.stepNumberText}>3</Text>
                            </View>
                            <View style={styles.cardTitleContainer}>
                                <Text style={styles.cardTitle}>Display Over Other Apps</Text>
                                <Text style={styles.cardSubtitle}>
                                    Allows alarm screen to appear over lock screen
                                </Text>
                            </View>
                            {permissions.canDrawOverlays ? (
                                <Ionicons name="checkmark-circle" size={32} color="#C9E265" />
                            ) : (
                                <Ionicons name="ellipse-outline" size={32} color="#666" />
                            )}
                        </View>
                        {!permissions.canDrawOverlays && (
                            <TouchableOpacity style={styles.actionButton} onPress={handleOverlayPress}>
                                <Text style={styles.actionButtonText}>Open Settings</Text>
                                <Ionicons name="arrow-forward" size={20} color="#000" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Manual Steps Section */}
                <View style={styles.manualSection}>
                    <View style={styles.manualHeader}>
                        <Ionicons name="warning" size={24} color="#FFA500" />
                        <Text style={styles.manualHeaderText}>Additional Manual Steps Required</Text>
                    </View>
                    <Text style={styles.manualDescription}>
                        The following settings must be enabled manually in Android Settings:
                    </Text>

                    {/* Step 4: Notifications */}
                    <View style={styles.manualCard}>
                        <View style={styles.manualCardHeader}>
                            <View style={[styles.stepNumber, styles.manualStepNumber]}>
                                <Text style={styles.stepNumberText}>4</Text>
                            </View>
                            <View style={styles.cardTitleContainer}>
                                <Text style={styles.cardTitle}>Enable Notifications</Text>
                                <Text style={styles.cardSubtitle}>
                                    Allow notifications so the alarm can alert you
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.manualButton} onPress={openAppSettings}>
                            <Ionicons name="notifications-outline" size={18} color="#000" />
                            <Text style={styles.manualButtonText}>Open Notification Settings</Text>
                            <Ionicons name="arrow-forward" size={18} color="#000" />
                        </TouchableOpacity>
                    </View>

                    {/* Step 5: Background Activity */}
                    <View style={styles.manualCard}>
                        <View style={styles.manualCardHeader}>
                            <View style={[styles.stepNumber, styles.manualStepNumber]}>
                                <Text style={styles.stepNumberText}>5</Text>
                            </View>
                            <View style={styles.cardTitleContainer}>
                                <Text style={styles.cardTitle}>Allow Background Activity</Text>
                                <Text style={styles.cardSubtitle}>
                                    Enable background activity and disable battery optimization
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.manualButton} onPress={openAppSettings}>
                            <Ionicons name="battery-charging" size={18} color="#000" />
                            <Text style={styles.manualButtonText}>Open Battery Settings</Text>
                            <Ionicons name="arrow-forward" size={18} color="#000" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Info Box */}
                <View style={styles.infoBox}>
                    <Ionicons name="information-circle" size={24} color="#C9E265" />
                    <Text style={styles.infoText}>
                        All 5 permissions are essential for WakeBuddy to wake you up reliably, even when the app isn't open.
                    </Text>
                </View>

                {/* Continue Button */}
                <TouchableOpacity
                    style={[styles.continueButton, permissions.allGranted && styles.continueButtonActive]}
                    onPress={handleContinue}
                    disabled={!permissions.allGranted}
                >
                    <Text style={[styles.continueButtonText, permissions.allGranted && styles.continueButtonTextActive]}>
                        {permissions.allGranted ? "Continue (Complete steps 4-5 manually)" : "Complete Steps 1-3 First"}
                    </Text>
                </TouchableOpacity>

                {/* Status Indicator */}
                <View style={styles.statusContainer}>
                    <Text style={styles.statusText}>
                        {permissions.allGranted
                            ? "Steps 1-3 complete ✓ Now complete steps 4-5 in Android Settings"
                            : `${(permissions.canScheduleExactAlarms ? 1 : 0) + (permissions.batteryOptimizationDisabled ? 1 : 0) + (permissions.canDrawOverlays ? 1 : 0)}/3 automatic permissions granted`
                        }
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView >
    );
}