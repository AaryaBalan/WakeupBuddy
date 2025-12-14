import AppText from '@/components/AppText';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StatusBar, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '../../contexts/UserContext';
import { api } from '../../convex/_generated/api';

export default function AppealScreen() {
    const { user } = useUser();
    const router = useRouter();
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submitAppeal = useMutation(api.appeals.submitAppeal);
    const appealStatus = useQuery(
        api.appeals.getAppealStatus,
        user?.email ? { userEmail: user.email } : 'skip'
    );

    const handleSubmit = async () => {
        if (!reason.trim()) {
            alert('Please provide a reason for your appeal');
            return;
        }

        setIsSubmitting(true);
        try {
            await submitAppeal({
                userEmail: user.email,
                reason: reason.trim(),
            });
            alert('Appeal submitted successfully! We will review it shortly.');
            setReason('');
        } catch (error) {
            alert(error.message || 'Failed to submit appeal');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return '#FFA500';
            case 'approved': return '#4CAF50';
            case 'rejected': return '#FF6B6B';
            default: return '#888';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return 'time-outline';
            case 'approved': return 'checkmark-circle';
            case 'rejected': return 'close-circle';
            default: return 'help-circle-outline';
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#050505' }} edges={['top']}>
            <StatusBar barStyle="light-content" />
            <ScrollView contentContainerStyle={{ padding: 20 }}>
                {/* Header */}
                <View style={{ alignItems: 'center', marginBottom: 30, marginTop: 20 }}>
                    <View style={{
                        width: 80,
                        height: 80,
                        borderRadius: 40,
                        backgroundColor: '#FF6B6B',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 16
                    }}>
                        <Ionicons name="ban" size={40} color="white" />
                    </View>
                    <AppText style={{ fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 8 }}>
                        Account Suspended
                    </AppText>
                    <AppText style={{ fontSize: 14, color: '#999', textAlign: 'center' }}>
                        Your account has been suspended due to multiple reports ({user?.reportCount || 0} reports)
                    </AppText>
                </View>

                {/* Existing Appeal Status */}
                {appealStatus && (
                    <View style={{
                        backgroundColor: '#1a1a1a',
                        borderRadius: 16,
                        padding: 20,
                        marginBottom: 24,
                        borderWidth: 1,
                        borderColor: getStatusColor(appealStatus.status)
                    }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                            <Ionicons
                                name={getStatusIcon(appealStatus.status)}
                                size={24}
                                color={getStatusColor(appealStatus.status)}
                            />
                            <AppText style={{ fontSize: 18, fontWeight: '600', color: 'white', marginLeft: 12 }}>
                                Appeal Status: {appealStatus.status.charAt(0).toUpperCase() + appealStatus.status.slice(1)}
                            </AppText>
                        </View>
                        <AppText style={{ fontSize: 14, color: '#ccc', marginBottom: 8 }}>
                            Submitted: {new Date(appealStatus.submittedAt).toLocaleString()}
                        </AppText>
                        <AppText style={{ fontSize: 14, color: '#ccc' }}>
                            Reason: {appealStatus.reason}
                        </AppText>
                        {appealStatus.status === 'pending' && (
                            <AppText style={{ fontSize: 12, color: '#FFA500', marginTop: 12, fontStyle: 'italic' }}>
                                Your appeal is being reviewed. Please wait for admin response.
                            </AppText>
                        )}
                        {appealStatus.status === 'rejected' && (
                            <AppText style={{ fontSize: 12, color: '#FF6B6B', marginTop: 12 }}>
                                Your appeal was rejected. You may submit a new appeal with additional information.
                            </AppText>
                        )}
                    </View>
                )}

                {/* Appeal Form */}
                {(!appealStatus || appealStatus.status !== 'pending') && (
                    <View style={{
                        backgroundColor: '#1a1a1a',
                        borderRadius: 16,
                        padding: 20,
                        borderWidth: 1,
                        borderColor: '#333'
                    }}>
                        <AppText style={{ fontSize: 18, fontWeight: '600', color: 'white', marginBottom: 16 }}>
                            Submit an Appeal
                        </AppText>
                        <AppText style={{ fontSize: 14, color: '#ccc', marginBottom: 16 }}>
                            Please explain why your account should be unbanned. Our team will review your appeal.
                        </AppText>

                        <TextInput
                            style={{
                                backgroundColor: '#0a0a0a',
                                borderRadius: 12,
                                padding: 16,
                                color: 'white',
                                fontSize: 16,
                                minHeight: 150,
                                textAlignVertical: 'top',
                                borderWidth: 1,
                                borderColor: '#333',
                                marginBottom: 20
                            }}
                            placeholder="Enter your reason here..."
                            placeholderTextColor="#666"
                            multiline
                            numberOfLines={6}
                            value={reason}
                            onChangeText={setReason}
                        />

                        <TouchableOpacity
                            style={{
                                backgroundColor: isSubmitting ? '#666' : '#C9E265',
                                paddingVertical: 16,
                                borderRadius: 12,
                                alignItems: 'center',
                            }}
                            onPress={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#000" />
                            ) : (
                                <AppText style={{ color: '#000', fontSize: 16, fontWeight: '600' }}>
                                    Submit Appeal
                                </AppText>
                            )}
                        </TouchableOpacity>
                    </View>
                )}

                {/* Help Text */}
                <View style={{ marginTop: 32, padding: 16, backgroundColor: '#1a1a1a', borderRadius: 12 }}>
                    <AppText style={{ fontSize: 14, color: '#ccc', lineHeight: 20 }}>
                        <AppText style={{ fontWeight: '600', color: 'white' }}>Why was I banned?{'\n'}</AppText>
                        Accounts are suspended when they receive more than 3 reports from other users. This is to ensure a safe and respectful community.
                        {'\n\n'}
                        <AppText style={{ fontWeight: '600', color: 'white' }}>What happens next?{'\n'}</AppText>
                        Our team will review your appeal and make a decision. If approved, your account will be restored.
                    </AppText>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
