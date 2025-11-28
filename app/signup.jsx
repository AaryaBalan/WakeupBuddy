import { Ionicons } from '@expo/vector-icons';
import { useMutation } from "convex/react";
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import ToastManager, { Toast } from 'toastify-react-native';
import { api } from "../convex/_generated/api";
import styles from '../styles/signup.styles';

export default function Signup() {
    const router = useRouter();
    const createUser = useMutation(api.users.createUser);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [bio, setBio] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSignup = async () => {
        const signupData = {
            fullName,
            email,
            password,
            agreed
        };
        console.log('Signup Data:', signupData);
        setIsLoading(true);

        try {
            const userId = await createUser({
                name: fullName,
                email,
                password,
                phone,
                bio
            });
            console.log('Registration Successful:', userId);
            // You might want to navigate to login or home screen here
            Toast.success('Registration Successful!')
            setTimeout(() => {
                router.replace('/login');
            }, 2000);
        } catch (error) {
            console.error('Registration Failed:', error);
            Toast.error(error.message || 'Registration Failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.content}>

                    {/* Header / Back Button */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* Logo */}
                    <View style={styles.logoContainer}>
                        <View style={styles.logoWrapper}>
                            <Ionicons name="flash" size={40} color="#C9E265" />
                        </View>
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>Wake Up Winning</Text>
                    <Text style={styles.subtitle}>Start your journey to better mornings.</Text>

                    {/* Form */}
                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Full Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your name"
                                placeholderTextColor="#666"
                                autoCapitalize="words"
                                value={fullName}
                                onChangeText={setFullName}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email Address</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="name@example.com"
                                placeholderTextColor="#666"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Phone Number</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="+1 234 567 8900"
                                placeholderTextColor="#666"
                                keyboardType="phone-pad"
                                value={phone}
                                onChangeText={setPhone}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Bio (Optional)</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Tell us about yourself"
                                placeholderTextColor="#666"
                                multiline
                                numberOfLines={3}
                                value={bio}
                                onChangeText={setBio}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Password</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={styles.passwordInput}
                                    placeholder="••••••••"
                                    placeholderTextColor="#666"
                                    secureTextEntry={!passwordVisible}
                                    value={password}
                                    onChangeText={setPassword}
                                />
                                <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)} style={styles.eyeIcon}>
                                    <Ionicons name={passwordVisible ? "eye-off" : "eye"} size={20} color="#999" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Terms Checkbox */}
                        <TouchableOpacity style={styles.checkboxContainer} onPress={() => setAgreed(!agreed)}>
                            <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                                {agreed && <Ionicons name="checkmark" size={14} color="#000" />}
                            </View>
                            <Text style={styles.checkboxLabel}>
                                I agree to the <Text style={styles.linkText}>Terms of Service</Text> and <Text style={styles.linkText}>Privacy Policy</Text>.
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.signupButton} onPress={handleSignup} disabled={isLoading}>
                            {isLoading ? (
                                <ActivityIndicator color="#000" />
                            ) : (
                                <Text style={styles.signupButtonText}>Create Account</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Social Login */}
                    <View style={styles.socialSection}>
                        <Text style={styles.orText}>Or sign up with</Text>
                        <View style={styles.socialIcons}>
                            <TouchableOpacity style={styles.iconButton}>
                                <Ionicons name="logo-apple" size={24} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconButton}>
                                <Ionicons name="mail" size={24} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconButton}>
                                <Ionicons name="logo-github" size={24} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <Link href="/login" asChild>
                            <TouchableOpacity>
                                <Text style={styles.footerLink}>Log In</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>

                </View>
            </ScrollView>
            {/* Toast provider should be at the root level */}
            <ToastManager />
        </SafeAreaView>
    );
}