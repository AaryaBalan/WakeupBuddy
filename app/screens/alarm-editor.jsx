
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useMutation } from "convex/react";
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePopup } from '../../contexts/PopupContext';
import { useUser } from '../../contexts/UserContext';
import { api } from "../../convex/_generated/api";
import styles from '../../styles/alarmEditor.styles';
import { requestExactAlarmPermission, scheduleAlarm } from '../native/AlarmNative';

export default function AlarmEditorScreen() {
    const router = useRouter();
    const { user } = useUser();
    const { showPopup } = usePopup();
    const createAlarm = useMutation(api.alarms.createAlarm);
    const updateAlarm = useMutation(api.alarms.updateAlarm);
    const createNotification = useMutation(api.notifications.createNotification);
    const { alarm: alarmParam } = useLocalSearchParams();

    const [date, setDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);
    const [mode, setMode] = useState('buddy'); // 'solo' | 'buddy'
    const [buddyType, setBuddyType] = useState('stranger'); // 'stranger' | 'request'
    const [buddyEmail, setBuddyEmail] = useState('');
    const [repeatDays, setRepeatDays] = useState([false, true, true, true, true, false, false]); // M T W T F S S
    const [wakeMethod, setWakeMethod] = useState('call'); // 'call'
    const [preWake, setPreWake] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    const [alarmId, setAlarmId] = useState(null);
    const [isEnabled, setIsEnabled] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

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

            const payload = {
                time: time,
                ampm: ampm,
                label: 'Work', // Hardcoded for now as per UI
                days: repeatDays.map(day => day ? 1 : 0),
                user_id: user._id,
                solo_mode: mode === 'solo',
                buddy: buddyValue,
                // wake_method: wakeMethod, // Not in schema
                enabled: isEnabled // Use the state variable which is initialized from params or defaults to true
            };

            if (isEditing) {
                await updateAlarm({
                    id: alarmId,
                    ...payload
                });
                showPopup('Alarm Updated Successfully', '#4CAF50');
            } else {
                await createAlarm(payload);
                showPopup('Alarm Saved Successfully', '#4CAF50');
            }

            // Schedule native Android alarm
            const now = new Date();
            let alarmDate = new Date(date);

            // If the time has already passed today, schedule for tomorrow
            if (alarmDate <= now) {
                alarmDate.setDate(alarmDate.getDate() + 1);
            }

            try {
                await scheduleAlarm(alarmDate);
                console.log('Native alarm scheduled successfully for:', alarmDate.toLocaleString());
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
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{isEditing ? 'Edit Alarm' : 'New Alarm'}</Text>
                    <View style={{ width: 50 }} />
                </View>

                {/* Time Display */}
                <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.timeContainer}>
                    <Text style={styles.timeText}>{time}</Text>
                    <Text style={styles.ampmText}>{ampm}</Text>
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

                <Text style={styles.sectionLabel}>WAKE EXPERIENCE</Text>

                {/* Mode Toggle */}
                <View style={styles.modeToggleContainer}>
                    <TouchableOpacity
                        style={[styles.modeButton, mode === 'solo' && styles.modeButtonActive]}
                        onPress={() => setMode('solo')}
                    >
                        <Text style={[styles.modeButtonText, mode === 'solo' && styles.modeButtonTextActive]}>Solo Mode</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.modeButton, mode === 'buddy' && styles.modeButtonActive]}
                        onPress={() => setMode('buddy')}
                    >
                        <Text style={[styles.modeButtonText, mode === 'buddy' && styles.modeButtonTextActive]}>Wake Buddy</Text>
                    </TouchableOpacity>
                </View>

                {/* Wake Buddy Card */}
                {mode === 'buddy' && (
                    <View style={styles.buddyCard}>
                        <View style={styles.buddyRow}>
                            <View style={styles.buddyIconContainer}>
                                <Ionicons name="globe-outline" size={24} color="#fff" />
                            </View>
                            <View style={styles.buddyInfo}>
                                <Text style={styles.buddyTitle}>
                                    {buddyType === 'stranger' ? 'Stranger' : 'Request Pairing'}
                                </Text>
                                <Text style={styles.buddySubtitle}>
                                    {buddyType === 'stranger' ? 'Random match' : 'Enter email'}
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={styles.changeButton}
                                onPress={() => setBuddyType(buddyType === 'stranger' ? 'request' : 'stranger')}
                            >
                                <Text style={styles.changeButtonText}>Change</Text>
                                <Ionicons name="chevron-forward" size={16} color="#C9E265" />
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
                            <Ionicons name="information-circle-outline" size={16} color="#888" />
                            <Text style={styles.buddyFooterText}>
                                We'll pair you with someone in your timezone. If you oversleep, you break the streak for both!
                            </Text>
                        </View>
                    </View>
                )}

                <Text style={styles.sectionLabel}>CONFIGURATION</Text>

                {/* Repeat */}
                <View style={styles.configItem}>
                    <Text style={styles.configLabel}>Repeat</Text>
                    <View style={styles.daysContainer}>
                        {days.map((day, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.dayButton, repeatDays[index] && styles.dayButtonActive]}
                                onPress={() => toggleDay(index)}
                            >
                                <Text style={[styles.dayText, repeatDays[index] && styles.dayTextActive]}>{day}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Wake Method */}
                <View style={styles.configItem}>
                    <Text style={styles.configLabel}>Wake Method</Text>
                    <View style={styles.difficultyContainer}>
                        <TouchableOpacity
                            style={[styles.difficultyButton, styles.difficultyButtonActive]}
                            onPress={() => { }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Ionicons name="call" size={20} color="#000" />
                                <Text style={[styles.difficultyText, styles.difficultyTextActive]}>
                                    Voice Call
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Sound */}
                <TouchableOpacity style={styles.configRow}>
                    <Text style={styles.configLabel}>Sound</Text>
                    <View style={styles.configValueContainer}>
                        <Text style={styles.configValue}>Neon Rise</Text>
                        <Ionicons name="chevron-forward" size={20} color="#666" />
                    </View>
                </TouchableOpacity>

                {/* Label */}
                <TouchableOpacity style={styles.configRow}>
                    <Text style={styles.configLabel}>Label</Text>
                    <View style={styles.configValueContainer}>
                        <Text style={styles.configValue}>Work</Text>
                        <Ionicons name="chevron-forward" size={20} color="#666" />
                    </View>
                </TouchableOpacity>

                {/* Pre-wake Notification */}
                <View style={styles.configRow}>
                    <View>
                        <Text style={styles.configLabel}>Pre-wake Notification</Text>
                        <Text style={styles.configSublabel}>Get notified 5 min before to pair</Text>
                    </View>
                    <Switch
                        trackColor={{ false: "#333", true: "#C9E265" }}
                        thumbColor={preWake ? "#000" : "#f4f3f4"}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={setPreWake}
                        value={preWake}
                    />
                </View>

                {/* Save Button */}
                <TouchableOpacity style={styles.saveButton} onPress={onSetTime} disabled={isLoading}>
                    {isLoading ? (
                        <ActivityIndicator color="#000" />
                    ) : (
                        <Text style={styles.saveButtonText}>Save Alarm</Text>
                    )}
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}