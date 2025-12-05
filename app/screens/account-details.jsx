import { Ionicons } from '@expo/vector-icons';
import { useMutation } from 'convex/react';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import AppText from '../../components/AppText';
import ProfilePic from '../../components/ProfilePic';
import ScreenWrapper from '../../components/ScreenWrapper';
import { usePopup } from '../../contexts/PopupContext';
import { useUser } from '../../contexts/UserContext';
import { api } from '../../convex/_generated/api';
import styles from '../../styles/accountDetails.styles';

const NEON = '#C9E265';
const GRAY = '#BDBDBD';

export default function AccountDetailsScreen() {
    const router = useRouter();
    const { user, updateUser } = useUser();
    const { showPopup } = usePopup();
    const updateUserMutation = useMutation(api.users.updateUser);

    const [changePasswordModal, setChangePasswordModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [modalMessage, setModalMessage] = useState({ text: '', type: '' }); // 'error' or 'success'

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // Clear modal message after delay
    const showModalMessage = (text, type) => {
        setModalMessage({ text, type });
        if (type === 'success') {
            setTimeout(() => {
                setModalMessage({ text: '', type: '' });
                setChangePasswordModal(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            }, 1500);
        } else {
            setTimeout(() => {
                setModalMessage({ text: '', type: '' });
            }, 3000);
        }
    };

    // Handle change password
    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            showModalMessage('Please fill all fields', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            showModalMessage('New passwords do not match', 'error');
            return;
        }

        if (newPassword.length < 6) {
            showModalMessage('Password must be at least 6 characters', 'error');
            return;
        }

        if (currentPassword !== user?.password) {
            showModalMessage('Current password is incorrect', 'error');
            return;
        }

        setIsChangingPassword(true);
        try {
            // Update password in Convex database
            await updateUserMutation({
                id: user._id,
                password: newPassword
            });
            // Also update local state
            await updateUser({ password: newPassword });
            showModalMessage('Password changed successfully!', 'success');
        } catch (error) {
            console.error('Error changing password:', error);
            showModalMessage('Failed to change password', 'error');
        } finally {
            setIsChangingPassword(false);
        }
    };

    // Determine if screen is loading
    const isScreenLoading = user === undefined;

    return (
        <ScreenWrapper isLoading={isScreenLoading}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color="#fff" />
                </TouchableOpacity>
                <AppText style={styles.headerTitle}>Account Details</AppText>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Profile Section */}
                <View style={styles.profileSection}>
                    <ProfilePic user={user} size={80} />
                    <AppText style={styles.profileName}>{user?.name || 'User'}</AppText>
                    <AppText style={styles.profileEmail}>{user?.email || 'No email'}</AppText>
                </View>

                {/* Account Info Card */}
                <View style={styles.infoCard}>
                    <AppText style={styles.cardTitle}>Account Information</AppText>

                    <View style={styles.infoRow}>
                        <View style={styles.infoLeft}>
                            <View style={styles.iconBg}>
                                <Ionicons name="person-outline" size={18} color={NEON} />
                            </View>
                            <View>
                                <AppText style={styles.infoLabel}>Full Name</AppText>
                                <AppText style={styles.infoValue}>{user?.name || 'Not set'}</AppText>
                            </View>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <View style={styles.infoLeft}>
                            <View style={styles.iconBg}>
                                <Ionicons name="mail-outline" size={18} color={NEON} />
                            </View>
                            <View>
                                <AppText style={styles.infoLabel}>Email Address</AppText>
                                <AppText style={styles.infoValue}>{user?.email || 'Not set'}</AppText>
                            </View>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <View style={styles.infoLeft}>
                            <View style={styles.iconBg}>
                                <Ionicons name="call-outline" size={18} color={NEON} />
                            </View>
                            <View>
                                <AppText style={styles.infoLabel}>Phone Number</AppText>
                                <AppText style={styles.infoValue}>{user?.phone || 'Not set'}</AppText>
                            </View>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <View style={styles.infoLeft}>
                            <View style={styles.iconBg}>
                                <Ionicons name="document-text-outline" size={18} color={NEON} />
                            </View>
                            <View>
                                <AppText style={styles.infoLabel}>Bio</AppText>
                                <AppText style={styles.infoValue}>{user?.bio || 'No bio added'}</AppText>
                            </View>
                        </View>
                    </View>

                    <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                        <View style={styles.infoLeft}>
                            <View style={styles.iconBg}>
                                <Ionicons name="calendar-outline" size={18} color={NEON} />
                            </View>
                            <View>
                                <AppText style={styles.infoLabel}>Member Since</AppText>
                                <AppText style={styles.infoValue}>{formatDate(user?._creationTime)}</AppText>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Profile Code Card */}
                <View style={styles.infoCard}>
                    <AppText style={styles.cardTitle}>Profile Code</AppText>
                    <View style={styles.codeContainer}>
                        <AppText style={styles.codeText}>{user?.profileCode || 'N/A'}</AppText>
                        <AppText style={styles.codeHint}>Share this code with friends to connect</AppText>
                    </View>
                </View>

                {/* Security Section */}
                <View style={styles.infoCard}>
                    <AppText style={styles.cardTitle}>Security</AppText>

                    <TouchableOpacity
                        style={styles.actionRow}
                        onPress={() => setChangePasswordModal(true)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.infoLeft}>
                            <View style={[styles.iconBg, { backgroundColor: 'rgba(255, 107, 107, 0.15)' }]}>
                                <Ionicons name="lock-closed-outline" size={18} color="#FF6B6B" />
                            </View>
                            <AppText style={styles.actionText}>Change Password</AppText>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={GRAY} />
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Change Password Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={changePasswordModal}
                onRequestClose={() => setChangePasswordModal(false)}
            >
                <KeyboardAvoidingView
                    style={styles.modalOverlay}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <AppText style={styles.modalTitle}>Change Password</AppText>
                            <TouchableOpacity onPress={() => setChangePasswordModal(false)}>
                                <Ionicons name="close" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        {/* Message Display */}
                        {modalMessage.text !== '' && (
                            <View style={[
                                styles.messageBox,
                                modalMessage.type === 'error' ? styles.errorBox : styles.successBox
                            ]}>
                                <Ionicons
                                    name={modalMessage.type === 'error' ? "alert-circle" : "checkmark-circle"}
                                    size={18}
                                    color={modalMessage.type === 'error' ? "#FF6B6B" : "#4CAF50"}
                                />
                                <AppText style={[
                                    styles.messageText,
                                    modalMessage.type === 'error' ? styles.errorText : styles.successText
                                ]}>
                                    {modalMessage.text}
                                </AppText>
                            </View>
                        )}

                        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                            <View style={styles.inputGroup}>
                                <AppText style={styles.inputLabel}>Current Password</AppText>
                                <View style={styles.passwordInputContainer}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        value={currentPassword}
                                        onChangeText={setCurrentPassword}
                                        secureTextEntry={!showCurrentPassword}
                                        placeholderTextColor="#666"
                                        placeholder="Enter current password"
                                    />
                                    <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                                        <Ionicons
                                            name={showCurrentPassword ? "eye-off-outline" : "eye-outline"}
                                            size={20}
                                            color="#666"
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <AppText style={styles.inputLabel}>New Password</AppText>
                                <View style={styles.passwordInputContainer}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        value={newPassword}
                                        onChangeText={setNewPassword}
                                        secureTextEntry={!showNewPassword}
                                        placeholderTextColor="#666"
                                        placeholder="Enter new password"
                                    />
                                    <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                                        <Ionicons
                                            name={showNewPassword ? "eye-off-outline" : "eye-outline"}
                                            size={20}
                                            color="#666"
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <AppText style={styles.inputLabel}>Confirm New Password</AppText>
                                <View style={styles.passwordInputContainer}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        secureTextEntry={!showConfirmPassword}
                                        placeholderTextColor="#666"
                                        placeholder="Confirm new password"
                                    />
                                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                        <Ionicons
                                            name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                                            size={20}
                                            color="#666"
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.changePasswordBtn}
                                onPress={handleChangePassword}
                                disabled={isChangingPassword}
                                activeOpacity={0.8}
                            >
                                {isChangingPassword ? (
                                    <ActivityIndicator color="#000" />
                                ) : (
                                    <AppText style={styles.changePasswordBtnText}>Update Password</AppText>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </ScreenWrapper>
    );
}
