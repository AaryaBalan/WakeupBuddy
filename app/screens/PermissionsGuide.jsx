import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from '../../components/AppText';
import styles from "../../styles/permissionsGuide.styles";
import { checkAllPermissions, requestBatteryOptimization, requestCallPhonePermission, requestDrawOverlays, requestExactAlarmPermission } from '../native/AlarmNative';

export default function PermissionsGuide() {
    const router = useRouter();
    const [permissions, setPermissions] = useState({
        canScheduleExactAlarms: false,
        batteryOptimizationDisabled: false,
        canDrawOverlays: false,
        hasCallPermission: false,
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

    const handleCallPhonePress = async () => {
        await requestCallPhonePermission();
        // Refresh permissions after requesting
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
                    <AppText style={styles.title}>Setup Alarm Permissions</AppText>
                    <AppText style={styles.subtitle}>
                        To ensure your alarms work reliably, we need a couple of permissions.
                    </AppText>
                </View>

                {/* Permission Steps */}
                <View style={styles.permissionsContainer}>
                    {/* Step 1: Exact Alarms */}
                    <View style={styles.permissionCard}>
                        <View style={styles.cardHeader}>
                            <View style={styles.stepNumber}>
                                <AppText style={styles.stepNumberText}>1</AppText>
                            </View>
                            <View style={styles.cardTitleContainer}>
                                <AppText style={styles.cardTitle}>Allow Exact Alarms</AppText>
                                <AppText style={styles.cardSubtitle}>
                                    Required to schedule alarms at the exact time you set
                                </AppText>
                            </View>
                            {permissions.canScheduleExactAlarms ? (
                                <Ionicons name="checkmark-circle" size={32} color="#C9E265" />
                            ) : (
                                <Ionicons name="ellipse-outline" size={32} color="#666" />
                            )}
                        </View>
                        {!permissions.canScheduleExactAlarms && (
                            <TouchableOpacity style={styles.actionButton} onPress={handleExactAlarmPress}>
                                <AppText style={styles.actionButtonText}>Open Settings</AppText>
                                <Ionicons name="arrow-forward" size={20} color="#000" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Step 2: Battery Optimization */}
                    <View style={styles.permissionCard}>
                        <View style={styles.cardHeader}>
                            <View style={styles.stepNumber}>
                                <AppText style={styles.stepNumberText}>2</AppText>
                            </View>
                            <View style={styles.cardTitleContainer}>
                                <AppText style={styles.cardTitle}>Disable Battery Optimization</AppText>
                                <AppText style={styles.cardSubtitle}>
                                    Ensures alarms work even when app is closed
                                </AppText>
                            </View>
                            {permissions.batteryOptimizationDisabled ? (
                                <Ionicons name="checkmark-circle" size={32} color="#C9E265" />
                            ) : (
                                <Ionicons name="ellipse-outline" size={32} color="#666" />
                            )}
                        </View>
                        {!permissions.batteryOptimizationDisabled && (
                            <TouchableOpacity style={styles.actionButton} onPress={handleBatteryOptPress}>
                                <AppText style={styles.actionButtonText}>Open Settings</AppText>
                                <Ionicons name="arrow-forward" size={20} color="#000" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Step 3: Display Over Other Apps */}
                    <View style={styles.permissionCard}>
                        <View style={styles.cardHeader}>
                            <View style={styles.stepNumber}>
                                <AppText style={styles.stepNumberText}>3</AppText>
                            </View>
                            <View style={styles.cardTitleContainer}>
                                <AppText style={styles.cardTitle}>Display Over Other Apps</AppText>
                                <AppText style={styles.cardSubtitle}>
                                    Allows alarm screen to appear over lock screen
                                </AppText>
                            </View>
                            {permissions.canDrawOverlays ? (
                                <Ionicons name="checkmark-circle" size={32} color="#C9E265" />
                            ) : (
                                <Ionicons name="ellipse-outline" size={32} color="#666" />
                            )}
                        </View>
                        {!permissions.canDrawOverlays && (
                            <TouchableOpacity style={styles.actionButton} onPress={handleOverlayPress}>
                                <AppText style={styles.actionButtonText}>Open Settings</AppText>
                                <Ionicons name="arrow-forward" size={20} color="#000" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Step 4: Call Phone Permission */}
                    <View style={styles.permissionCard}>
                        <View style={styles.cardHeader}>
                            <View style={styles.stepNumber}>
                                <AppText style={styles.stepNumberText}>4</AppText>
                            </View>
                            <View style={styles.cardTitleContainer}>
                                <AppText style={styles.cardTitle}>Allow Phone Calls</AppText>
                                <AppText style={styles.cardSubtitle}>
                                    Required to call your buddy when alarm is dismissed
                                </AppText>
                            </View>
                            {permissions.hasCallPermission ? (
                                <Ionicons name="checkmark-circle" size={32} color="#C9E265" />
                            ) : (
                                <Ionicons name="ellipse-outline" size={32} color="#666" />
                            )}
                        </View>
                        {!permissions.hasCallPermission && (
                            <TouchableOpacity style={styles.actionButton} onPress={handleCallPhonePress}>
                                <AppText style={styles.actionButtonText}>Grant Permission</AppText>
                                <Ionicons name="arrow-forward" size={20} color="#000" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Manual Steps Section */}
                <View style={styles.manualSection}>
                    <View style={styles.manualHeader}>
                        <Ionicons name="warning" size={24} color="#C9E265" />
                        <AppText style={styles.manualHeaderText}>Additional Manual Steps Required</AppText>
                    </View>
                    <AppText style={styles.manualDescription}>
                        The following settings must be enabled manually in Android Settings:
                    </AppText>

                    {/* Step 5: Notifications */}
                    <View style={styles.manualCard}>
                        <View style={styles.manualCardHeader}>
                            <View style={[styles.stepNumber, styles.manualStepNumber]}>
                                <AppText style={styles.stepNumberText}>5</AppText>
                            </View>
                            <View style={styles.cardTitleContainer}>
                                <AppText style={styles.cardTitle}>Enable Notifications</AppText>
                                <AppText style={styles.cardSubtitle}>
                                    Allow notifications so the alarm can alert you
                                </AppText>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.manualButton} onPress={openAppSettings}>
                            <Ionicons name="notifications-outline" size={18} color="#000" />
                            <AppText style={styles.manualButtonText}>Open Notification Settings</AppText>
                            <Ionicons name="arrow-forward" size={18} color="#000" />
                        </TouchableOpacity>
                    </View>

                    {/* Step 6: Background Activity */}
                    <View style={styles.manualCard}>
                        <View style={styles.manualCardHeader}>
                            <View style={[styles.stepNumber, styles.manualStepNumber]}>
                                <AppText style={styles.stepNumberText}>6</AppText>
                            </View>
                            <View style={styles.cardTitleContainer}>
                                <AppText style={styles.cardTitle}>Allow Background Activity</AppText>
                                <AppText style={styles.cardSubtitle}>
                                    Enable background activity and disable battery optimization
                                </AppText>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.manualButton} onPress={openAppSettings}>
                            <Ionicons name="battery-charging" size={18} color="#000" />
                            <AppText style={styles.manualButtonText}>Open Battery Settings</AppText>
                            <Ionicons name="arrow-forward" size={18} color="#000" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Info Box */}
                <View style={styles.infoBox}>
                    <Ionicons name="information-circle" size={24} color="#C9E265" />
                    <AppText style={styles.infoText}>
                        All 6 permissions are essential for WakeBuddy to wake you up reliably and call your buddy, even when the app isn't open.
                    </AppText>
                </View>

                {/* Continue Button */}
                <TouchableOpacity
                    style={[styles.continueButton, permissions.allGranted && styles.continueButtonActive]}
                    onPress={handleContinue}
                    disabled={!permissions.allGranted}
                >
                    <AppText style={[styles.continueButtonText, permissions.allGranted && styles.continueButtonTextActive]}>
                        {permissions.allGranted ? "Continue (Complete steps 5-6 manually)" : "Complete Steps 1-4 First"}
                    </AppText>
                </TouchableOpacity>

                {/* Status Indicator */}
                <View style={styles.statusContainer}>
                    <AppText style={styles.statusText}>
                        {permissions.allGranted
                            ? "Steps 1-4 complete ✓ Now complete steps 5-6 in Android Settings"
                            : `${(permissions.canScheduleExactAlarms ? 1 : 0) + (permissions.batteryOptimizationDisabled ? 1 : 0) + (permissions.canDrawOverlays ? 1 : 0) + (permissions.hasCallPermission ? 1 : 0)}/4 automatic permissions granted`
                        }
                    </AppText>
                </View>
            </ScrollView>
        </SafeAreaView >
    );
}