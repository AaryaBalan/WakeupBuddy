import AppText from '@/components/AppText';
import { Ionicons } from '@expo/vector-icons';
import { useConvex } from "convex/react";
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StatusBar, TextInput, TouchableOpacity, View } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import { usePopup } from "../contexts/PopupContext";
import { useUser } from "../contexts/UserContext";
import { api } from "../convex/_generated/api";
import styles from '../styles/login.styles.js';

export default function Login() {
    const router = useRouter();
    const convex = useConvex();
    const { login } = useUser();
    const { showPopup } = usePopup();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        const loginData = {
            email,
            password
        };
        console.log('Login Data:', loginData);
        setIsLoading(true);
        try {
            const user = await convex.query(api.users.getUserByEmail, { email });
            console.log('Login Response:', user);
            if (user) {
                if (user.password === password) {
                    await login(user);
                    showPopup('Login Successful!', '#4CAF50')
                    setTimeout(() => {
                        router.replace('/(tabs)/home');
                    }, 2000);
                } else {
                    showPopup('Incorrect Password...!', '#FF6B6B')
                }
            } else {
                showPopup('User Not Found!', '#FF6B6B')
            }
        } catch (error) {
            console.error('Login Failed:', error);
            showPopup('Login Failed', '#FF6B6B');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScreenWrapper>
            <StatusBar barStyle="light-content" />
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
                <AppText style={styles.title}>Welcome Back</AppText>
                <AppText style={styles.subtitle}>Sign in to sync your challenges.</AppText>

                {/* Form */}
                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <AppText style={styles.label}>Email Address</AppText>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your email"
                            placeholderTextColor="#666"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <AppText style={styles.label}>Password</AppText>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Enter your password"
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

                    <TouchableOpacity style={styles.forgotPassword}>
                        <AppText style={styles.forgotPasswordText}>Forgot Password?</AppText>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={isLoading}>
                        {isLoading ? (
                            <ActivityIndicator color="#000" />
                        ) : (
                            <AppText style={styles.loginButtonText}>Log In</AppText>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Social Login */}
                <View style={styles.socialSection}>
                    <AppText style={styles.orText}>Or continue with</AppText>
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
                    <AppText style={styles.footerText}>Don't have an account? </AppText>
                    <Link href="/signup" asChild>
                        <TouchableOpacity>
                            <AppText style={styles.footerLink}>Sign Up</AppText>
                        </TouchableOpacity>
                    </Link>
                </View>


            </View>
        </ScreenWrapper>
    );
}