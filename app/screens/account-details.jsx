import { Ionicons } from '@expo/vector-icons';
import { useMutation } from 'convex/react';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from '../../components/AppText';
import ProfilePic from '../../components/ProfilePic';
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
    const changePasswordMutation = useMutation(api.users.changePassword);

    const [changePasswordModal, setChangePasswordModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [modalMessage, setModalMessage] = useState({ text: '', type: '' });
    const [focusedInput, setFocusedInput] = useState(null);

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    // Copy to clipboard
    const copyToClipboard = async (text) => {
        await Clipboard.setStringAsync(text);
        showPopup('Copied to clipboard!', 'success');
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

        setIsChangingPassword(true);
        try {
            const result = await changePasswordMutation({
                userId: user._id,
                currentPassword: currentPassword,
                newPassword: newPassword
            });

            if (result.success) {
                showModalMessage('Password changed successfully!', 'success');
            } else {
                showModalMessage(result.error, 'error');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            showModalMessage('Failed to change password', 'error');
        } finally {
            setIsChangingPassword(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <AppText style={styles.headerTitle}>Account Details</AppText>
                <View style={{ width: 32 }} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Hero Section */}
                <View style={styles.profileSection}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatarRing}>
                            <ProfilePic user={user} size={80} />
                        </View>
                        <View style={styles.verifiedBadge}>
                            <Ionicons name="checkmark" size={14} color="#000" />
                        </View>
                    </View>
                    <AppText style={styles.profileName}>{user?.name || 'User'}</AppText>
                    <View style={styles.usernameContainer}>
                        <Ionicons name="at" size={14} color={NEON} />
                        <AppText style={styles.profileUsername}>{user?.username || 'username'}</AppText>
                    </View>
                    <AppText style={styles.profileEmail}>{user?.email || 'No email'}</AppText>

                    <View style={styles.memberSinceBadge}>
                        <Ionicons name="calendar-outline" size={12} color={NEON} />
                        <AppText style={styles.memberSinceText}>
                            Member since {formatDate(user?._creationTime)}
                        </AppText>
                    </View>
                </View>

                {/* Account Info Card */}
                <View style={styles.infoCard}>
                    <View style={styles.cardHeader}>
                        <AppText style={styles.cardTitle}>Personal Information</AppText>
                    </View>

                    <View style={styles.infoRow}>
                        <View style={styles.infoLeft}>
                            <View style={styles.iconBg}>
                                <Ionicons name="person-outline" size={18} color={NEON} />
                            </View>
                            <View style={styles.infoTextContainer}>
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
                            <View style={styles.infoTextContainer}>
                                <AppText style={styles.infoLabel}>Email Address</AppText>
                                <AppText style={[styles.infoValue, styles.infoValueSmall]} numberOfLines={1}>
                                    {user?.email || 'Not set'}
                                </AppText>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={styles.copyButton}
                            onPress={() => copyToClipboard(user?.email)}
                        >
                            <Ionicons name="copy-outline" size={16} color={NEON} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.infoRow}>
                        <View style={styles.infoLeft}>
                            <View style={styles.iconBg}>
                                <Ionicons name="call-outline" size={18} color={NEON} />
                            </View>
                            <View style={styles.infoTextContainer}>
                                <AppText style={styles.infoLabel}>Phone Number</AppText>
                                <AppText style={styles.infoValue}>{user?.phone || 'Not set'}</AppText>
                            </View>
                        </View>
                    </View>

                    <View style={[styles.infoRow, styles.infoRowLast]}>
                        <View style={styles.infoLeft}>
                            <View style={styles.iconBg}>
                                <Ionicons name="document-text-outline" size={18} color={NEON} />
                            </View>
                            <View style={styles.infoTextContainer}>
                                <AppText style={styles.infoLabel}>Bio</AppText>
                                <AppText style={[styles.infoValue, styles.infoValueSmall]}>
                                    {user?.bio || 'No bio added'}
                                </AppText>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Profile Code Card */}
                <View style={styles.infoCard}>
                    <View style={styles.cardHeader}>
                        <AppText style={styles.cardTitle}>Profile Code</AppText>
                        <View style={styles.cardBadge}>
                            <AppText style={styles.cardBadgeText}>SHARE</AppText>
                        </View>
                    </View>
                    <View style={styles.codeContainer}>
                        <AppText style={styles.codeLabel}>Your unique code</AppText>
                        <AppText style={styles.codeText}>{user?.profile_code || 'N/A'}</AppText>
                        <AppText style={styles.codeHint}>Share this code with friends to connect</AppText>
                        <TouchableOpacity
                            style={styles.codeCopyBtn}
                            onPress={() => copyToClipboard(user?.profile_code)}
                        >
                            <Ionicons name="copy-outline" size={14} color={NEON} />
                            <AppText style={styles.codeCopyText}>Copy Code</AppText>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Security Section */}
                <View style={[styles.infoCard, styles.dangerCard]}>
                    <View style={styles.cardHeader}>
                        <AppText style={styles.cardTitle}>Security</AppText>
                    </View>

                    <TouchableOpacity
                        style={styles.actionRow}
                        onPress={() => setChangePasswordModal(true)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.infoLeft}>
                            <View style={[styles.iconBg, styles.dangerIconBg]}>
                                <Ionicons name="lock-closed-outline" size={18} color="#FF6B6B" />
                            </View>
                            <AppText style={styles.actionText}>Change Password</AppText>
                        </View>
                        <View style={styles.actionChevron}>
                            <Ionicons name="chevron-forward" size={18} color={GRAY} />
                        </View>
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
                        <View style={styles.modalHandle} />

                        <View style={styles.modalHeader}>
                            <AppText style={styles.modalTitle}>Change Password</AppText>
                            <TouchableOpacity
                                onPress={() => setChangePasswordModal(false)}
                                style={styles.modalCloseBtn}
                            >
                                <Ionicons name="close" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        <AppText style={styles.modalSubtitle}>
                            Create a strong password to secure your account
                        </AppText>

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
                                <View style={[
                                    styles.passwordInputContainer,
                                    focusedInput === 'current' && styles.passwordInputFocused
                                ]}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        value={currentPassword}
                                        onChangeText={setCurrentPassword}
                                        secureTextEntry={!showCurrentPassword}
                                        placeholderTextColor="#666"
                                        placeholder="Enter current password"
                                        onFocus={() => setFocusedInput('current')}
                                        onBlur={() => setFocusedInput(null)}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                                        style={styles.eyeButton}
                                    >
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
                                <View style={[
                                    styles.passwordInputContainer,
                                    focusedInput === 'new' && styles.passwordInputFocused
                                ]}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        value={newPassword}
                                        onChangeText={setNewPassword}
                                        secureTextEntry={!showNewPassword}
                                        placeholderTextColor="#666"
                                        placeholder="Enter new password"
                                        onFocus={() => setFocusedInput('new')}
                                        onBlur={() => setFocusedInput(null)}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowNewPassword(!showNewPassword)}
                                        style={styles.eyeButton}
                                    >
                                        <Ionicons
                                            name={showNewPassword ? "eye-off-outline" : "eye-outline"}
                                            size={20}
                                            color="#666"
                                        />
                                    </TouchableOpacity>
                                </View>
                                <AppText style={styles.passwordHint}>Must be at least 6 characters</AppText>
                            </View>

                            <View style={styles.inputGroup}>
                                <AppText style={styles.inputLabel}>Confirm New Password</AppText>
                                <View style={[
                                    styles.passwordInputContainer,
                                    focusedInput === 'confirm' && styles.passwordInputFocused
                                ]}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        secureTextEntry={!showConfirmPassword}
                                        placeholderTextColor="#666"
                                        placeholder="Confirm new password"
                                        onFocus={() => setFocusedInput('confirm')}
                                        onBlur={() => setFocusedInput(null)}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                        style={styles.eyeButton}
                                    >
                                        <Ionicons
                                            name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                                            size={20}
                                            color="#666"
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={[
                                    styles.changePasswordBtn,
                                    isChangingPassword && styles.changePasswordBtnDisabled
                                ]}
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
        </SafeAreaView>
    );
}
