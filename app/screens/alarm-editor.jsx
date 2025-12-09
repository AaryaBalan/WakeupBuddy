
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useMutation } from "convex/react";
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, ScrollView, StatusBar, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from '../../components/AppText';
import { usePopup } from '../../contexts/PopupContext';
import { useUser } from '../../contexts/UserContext';
import { api } from "../../convex/_generated/api";
import styles from '../../styles/alarmEditor.styles';
import { generateRequestCode, requestExactAlarmPermission, scheduleAlarm } from '../native/AlarmNative';

const NEON = '#C9E265';

export default function AlarmEditorScreen() {
    const router = useRouter();
    const { user } = useUser();
    const { showPopup } = usePopup();
    const createAlarm = useMutation(api.alarms.createAlarm);
    const updateAlarm = useMutation(api.alarms.updateAlarm);
    const createNotification = useMutation(api.notifications.createNotification);
    const { alarm: alarmParam, buddyEmail: buddyEmailParam, buddyName: buddyNameParam } = useLocalSearchParams();

    const [date, setDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);
    const [mode, setMode] = useState('buddy'); // 'solo' | 'buddy'
    const [buddyType, setBuddyType] = useState(buddyEmailParam ? 'request' : 'stranger'); // 'stranger' | 'request'
    const [buddyEmail, setBuddyEmail] = useState(buddyEmailParam || '');
    const [repeatDays, setRepeatDays] = useState([false, true, true, true, true, false, false]); // M T W T F S S
    const [wakeMethod, setWakeMethod] = useState('call'); // 'call'
    const [preWake, setPreWake] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    const [alarmId, setAlarmId] = useState(null);
    const [isEnabled, setIsEnabled] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [label, setLabel] = useState('Work');
    const [showLabelModal, setShowLabelModal] = useState(false);
    const [customLabel, setCustomLabel] = useState('');

    const defaultLabels = ['Work', 'Exercise', 'Meeting', 'Study', 'Wake Up'];

    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    useEffect(() => {
        if (alarmParam) {
            try {
                const alarm = JSON.parse(alarmParam);
                setIsEditing(true);

                setAlarmId(alarm._id);
                setIsEnabled(alarm.enabled !== undefined ? alarm.enabled : true);

                // Parse time (e.g., "07:00", "AM") back to Date object
                const [hoursStr, minutesStr] = alarm.time.split(':');
                let hours = parseInt(hoursStr);
                const minutes = parseInt(minutesStr);

                // Adjust for AM/PM if needed, assuming stored time is 12h format based on previous code
                // Actually, let's check how we stored it. We stored "07:00" and "AM".
                // If it's PM and not 12, add 12. If it's AM and 12, set to 0.
                if (alarm.ampm === 'PM' && hours !== 12) hours += 12;
                if (alarm.ampm === 'AM' && hours === 12) hours = 0;

                const newDate = new Date();
                newDate.setHours(hours);
                newDate.setMinutes(minutes);
                setDate(newDate);

                // Set days
                // alarm.days might be a string "[0,1...]" or array depending on backend response
                let daysArray = alarm.days;
                if (typeof daysArray === 'string') {
                    try { daysArray = JSON.parse(daysArray); } catch (e) { }
                }
                if (Array.isArray(daysArray)) {
                    setRepeatDays(daysArray.map(d => d === 1 || d === true));
                }

                // Set Mode & Buddy
                if (alarm.solo_mode) {
                    setMode('solo');
                } else {
                    setMode('buddy');
                    if (alarm.buddy) {
                        setBuddyType('request');
                        setBuddyEmail(alarm.buddy);
                    } else {
                        setBuddyType('stranger');
                    }
                }

                // Set Label
                if (alarm.label) {
                    setLabel(alarm.label);
                }

            } catch (e) {
                console.error("Error parsing alarm param", e);
            }
        }
    }, [alarmParam]);

    const onSetTime = async () => {
        setIsLoading(true);
        try {
            if (!user) {
                console.error('No user found');
                showPopup('Please login to set an alarm', '#FF6B6B');
                return;
            }

            let buddyValue = null;
            if (mode === 'buddy') {
                if (buddyType === 'request') {
                    buddyValue = buddyEmail;
                }
                // If stranger, buddyValue remains null
            }

            // For known buddy alarms, force days to all zeros (no repeat)
            const isKnownBuddy = mode === 'buddy' && buddyType === 'request';

            const payload = {
                time: time,
                ampm: ampm,
                label: label, // Use selected label
                days: isKnownBuddy ? [0, 0, 0, 0, 0, 0, 0] : repeatDays.map(day => day ? 1 : 0),
                user_id: user._id,
                solo_mode: mode === 'solo',
                buddy: buddyValue,
                // wake_method: wakeMethod, // Not in schema
                enabled: isEnabled // Use the state variable which is initialized from params or defaults to true
            };

            let savedAlarmId = alarmId; // For editing, use existing ID

            if (isEditing) {
                await updateAlarm({
                    id: alarmId,
                    ...payload
                });
                showPopup('Alarm Updated Successfully', '#4CAF50');
            } else {
                // Create alarm and get the returned ID
                savedAlarmId = await createAlarm(payload);
                showPopup('Alarm Saved Successfully', '#4CAF50');
            }

            // Schedule native Android alarm with the alarm ID
            const now = new Date();
            let alarmDate = new Date(date);

            // If the time has already passed today, schedule for tomorrow
            if (alarmDate <= now) {
                alarmDate.setDate(alarmDate.getDate() + 1);
            }

            try {
                // Pass the alarm ID (as string) to native scheduler with unique request code
                const requestCode = generateRequestCode(savedAlarmId.toString());
                await scheduleAlarm(alarmDate, buddyValue, savedAlarmId.toString(), requestCode);
                console.log('Native alarm scheduled successfully for:', alarmDate.toLocaleString(), 'with alarmId:', savedAlarmId, 'requestCode:', requestCode);
            } catch (alarmError) {
                console.error('Failed to schedule native alarm:', alarmError);

                // If permission error, show helpful alert
                if ((alarmError && alarmError.message === 'PERMISSION_REQUIRED') ||
                    (alarmError && alarmError.toString && alarmError.toString().includes('PERMISSION_REQUIRED')) ||
                    (alarmError && alarmError.toString && alarmError.toString().includes('SCHEDULE_EXACT_ALARM'))) {
                    showPopup('Please enable Alarms permission in Settings', '#FF6B6B');
                    await requestExactAlarmPermission();
                } else {
                    console.log('Alarm saved to database, native alarm scheduling skipped');
                }
            }

            // Send pair request notification if in buddy mode with a specific email
            if (mode === 'buddy' && buddyType === 'request' && buddyEmail) {
                try {
                    await createNotification({
                        alarm_time: time,
                        created_by: user._id,
                        with_whom: buddyEmail,
                        ampm: ampm,
                        status: 0 // Pending
                    });
                } catch (notifyError) {
                    console.error('Error sending pair request:', notifyError);
                }
            }

            router.back();
        } catch (error) {
            console.error('Error saving alarm:', error);
            showPopup('Failed to save alarm', '#FF6B6B');
        } finally {
            setIsLoading(false);
        }
    }

    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShowPicker(Platform.OS === 'ios');
        setDate(currentDate);
    };

    const toggleDay = (index) => {
        const newDays = [...repeatDays];
        newDays[index] = !newDays[index];
        setRepeatDays(newDays);
    };

    const formatTime = (date) => {
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'AM' : 'AM'; // Logic fix needed for PM
        // Actually, let's use proper formatting
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).replace(' ', '');
    };

    // Custom formatter to separate AM/PM
    const getTimeParts = (date) => {
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        const strMinutes = minutes < 10 ? '0' + minutes : minutes;
        return { time: `${hours}:${strMinutes}`, ampm };
    }

    const { time, ampm } = getTimeParts(date);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor="#050505" />
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <AppText style={styles.cancelText}>Cancel</AppText>
                    </TouchableOpacity>
                    <AppText style={styles.headerTitle}>{isEditing ? 'Edit Alarm' : 'New Alarm'}</AppText>
                    <View style={{ width: 50 }} />
                </View>

                {/* Time Display */}
                <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.timeContainer}>
                    <AppText style={styles.timeText}>{time}</AppText>
                    <AppText style={styles.ampmText}>{ampm}</AppText>
                </TouchableOpacity>

                {showPicker && (
                    <DateTimePicker
                        testID="dateTimePicker"
                        value={date}
                        mode="time"
                        is24Hour={false}
                        display="spinner"
                        onChange={onChange}
                        textColor="white"
                    />
                )}

                <AppText style={styles.sectionLabel}>WAKE EXPERIENCE</AppText>

                {/* Mode Toggle */}
                <View style={styles.modeToggleContainer}>
                    <TouchableOpacity
                        style={[styles.modeButton, mode === 'solo' && styles.modeButtonActive]}
                        onPress={() => setMode('solo')}
                    >
                        <AppText style={[styles.modeButtonText, mode === 'solo' && styles.modeButtonTextActive]}>Solo Mode</AppText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.modeButton, mode === 'buddy' && styles.modeButtonActive]}
                        onPress={() => setMode('buddy')}
                    >
                        <AppText style={[styles.modeButtonText, mode === 'buddy' && styles.modeButtonTextActive]}>Wake Buddy</AppText>
                    </TouchableOpacity>
                </View>

                {/* Solo Mode Card */}
                {mode === 'solo' && (
                    <View style={styles.buddyCard}>
                        <View style={styles.buddyRow}>
                            <View style={[styles.buddyIconContainer, { backgroundColor: '#1A1A1A', borderColor: '#333' }]}>
                                <Ionicons name="alarm-outline" size={20} color="#fff" />
                            </View>
                            <View style={styles.buddyInfo}>
                                <AppText style={styles.buddyTitle}>Personal Alarm</AppText>
                                <AppText style={styles.buddySubtitle}>Wake up on your own</AppText>
                            </View>
                        </View>

                        <View style={styles.buddyFooter}>
                            <Ionicons name="information-circle-outline" size={14} color="#666" />
                            <AppText style={styles.buddyFooterText}>
                                Solo mode sets a traditional alarm without a buddy. You'll wake up to an alarm sound without voice call or accountability partner.
                            </AppText>
                        </View>
                    </View>
                )}

                {/* Wake Buddy Card */}
                {mode === 'buddy' && (
                    <View style={styles.buddyCard}>
                        <View style={styles.buddyRow}>
                            <View style={styles.buddyIconContainer}>
                                <Ionicons name="globe-outline" size={20} color="#fff" />
                            </View>
                            <View style={styles.buddyInfo}>
                                <AppText style={styles.buddyTitle}>
                                    {buddyType === 'stranger' ? 'Stranger' : 'Request Pairing'}
                                </AppText>
                                <AppText style={styles.buddySubtitle}>
                                    {buddyType === 'stranger' ? 'Random match' : 'Enter email'}
                                </AppText>
                            </View>
                            <TouchableOpacity
                                style={styles.changeButton}
                                onPress={() => setBuddyType(buddyType === 'stranger' ? 'request' : 'stranger')}
                            >
                                <AppText style={styles.changeButtonText}>Change</AppText>
                                <Ionicons name="chevron-forward" size={12} color={NEON} />
                            </TouchableOpacity>
                        </View>

                        {buddyType === 'request' && (
                            <TextInput
                                style={styles.usernameInput}
                                placeholder="Enter email to pair"
                                placeholderTextColor="#666"
                                value={buddyEmail}
                                onChangeText={setBuddyEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        )}

                        <View style={styles.buddyFooter}>
                            <Ionicons name="information-circle-outline" size={14} color="#666" />
                            <AppText style={styles.buddyFooterText}>
                                We'll pair you with someone in your timezone. If you oversleep, you break the streak for both!
                            </AppText>
                        </View>
                    </View>
                )}

                <AppText style={styles.sectionLabel}>CONFIGURATION</AppText>

                {/* Repeat - Hidden for known buddy alarms */}
                {!(mode === 'buddy' && buddyType === 'request') && (
                    <View style={styles.configItem}>
                        <AppText style={styles.configLabel}>Repeat</AppText>
                        <View style={styles.daysContainer}>
                            {days.map((day, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[styles.dayButton, repeatDays[index] && styles.dayButtonActive]}
                                    onPress={() => toggleDay(index)}
                                >
                                    <AppText style={[styles.dayText, repeatDays[index] && styles.dayTextActive]}>{day}</AppText>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {/* Wake Method */}
                <View style={styles.configRow}>
                    <AppText style={styles.configLabel}>Wake Method</AppText>
                    <TouchableOpacity
                        style={[styles.wakeMethodButton]}
                        onPress={() => { }}
                    >
                        <Ionicons name={mode === 'solo' ? "alarm-outline" : "call-outline"} size={16} color="#fff" />
                        <AppText style={styles.wakeMethodText}>
                            {mode === 'solo' ? 'Alarm' : 'Voice Call'}
                        </AppText>
                    </TouchableOpacity>
                </View>

                {/* Label */}
                <TouchableOpacity style={styles.configRow} onPress={() => setShowLabelModal(true)}>
                    <AppText style={styles.configLabel}>Label</AppText>
                    <View style={styles.configValueContainer}>
                        <AppText style={styles.configValue}>{label}</AppText>
                        <Ionicons name="chevron-forward" size={16} color="#666" />
                    </View>
                </TouchableOpacity>

                {/* Save Button */}
                <TouchableOpacity style={styles.saveButton} onPress={onSetTime} disabled={isLoading}>
                    {isLoading ? (
                        <ActivityIndicator color="#000" />
                    ) : (
                        <AppText style={styles.saveButtonText}>Save Alarm</AppText>
                    )}
                </TouchableOpacity>

            </ScrollView>

            {/* Label Selection Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showLabelModal}
                onRequestClose={() => setShowLabelModal(false)}
            >
                <KeyboardAvoidingView
                    style={styles.labelModalOverlay}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <View style={styles.labelModalContent}>
                        <View style={styles.labelModalHeader}>
                            <AppText style={styles.labelModalTitle}>Select Label</AppText>
                            <TouchableOpacity onPress={() => setShowLabelModal(false)}>
                                <Ionicons name="close" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        {/* Default Labels */}
                        <View style={styles.defaultLabelsContainer}>
                            {defaultLabels.map((defaultLabel, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.defaultLabelChip,
                                        label === defaultLabel && styles.defaultLabelChipActive
                                    ]}
                                    onPress={() => {
                                        setLabel(defaultLabel);
                                        setCustomLabel('');
                                        setShowLabelModal(false);
                                    }}
                                >
                                    <AppText style={[
                                        styles.defaultLabelText,
                                        label === defaultLabel && styles.defaultLabelTextActive
                                    ]}>
                                        {defaultLabel}
                                    </AppText>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Custom Label Input */}
                        <View style={styles.customLabelContainer}>
                            <AppText style={styles.customLabelTitle}>Or create custom label</AppText>
                            <View style={styles.customLabelInputRow}>
                                <TextInput
                                    style={styles.customLabelInput}
                                    placeholder="Enter custom label..."
                                    placeholderTextColor="#666"
                                    value={customLabel}
                                    onChangeText={setCustomLabel}
                                    maxLength={20}
                                />
                                <TouchableOpacity
                                    style={[
                                        styles.customLabelSaveBtn,
                                        !customLabel.trim() && styles.customLabelSaveBtnDisabled
                                    ]}
                                    onPress={() => {
                                        if (customLabel.trim()) {
                                            setLabel(customLabel.trim());
                                            setShowLabelModal(false);
                                            setCustomLabel('');
                                        }
                                    }}
                                    disabled={!customLabel.trim()}
                                >
                                    <AppText style={styles.customLabelSaveBtnText}>Save</AppText>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}