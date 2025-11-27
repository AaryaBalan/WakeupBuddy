import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useConvex } from "convex/react";
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import ToastManager, { Toast } from 'toastify-react-native';
import { api } from "../convex/_generated/api";

export default function Login() {
    const router = useRouter();
    const convex = useConvex();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);

    const handleLogin = async () => {
        const loginData = {
            email,
            password
        };
        console.log('Login Data:', loginData);
        try {
            const user = await convex.query(api.users.getUserByEmail, { email });
            console.log('Login Response:', user);
            if (user) {
                if (user.password === password) {
                    await AsyncStorage.setItem('user', JSON.stringify(user));
                    Toast.success('Login Successful!')
                    setTimeout(() => {
                        router.replace('/(tabs)/home');
                    }, 2000);
                } else {
                    Toast.error('Incorrect Password...!',)
                }
            } else {
                Toast.error('User Not Found!')
            }
        } catch (error) {
            console.error('Login Failed:', error);
            Toast.error('Login Failed');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
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
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Sign in to sync your challenges.</Text>

                {/* Form */}
                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email Address</Text>
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
                        <Text style={styles.label}>Password</Text>
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
                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                        <Text style={styles.loginButtonText}>Log In</Text>
                    </TouchableOpacity>
                </View>

                {/* Social Login */}
                <View style={styles.socialSection}>
                    <Text style={styles.orText}>Or continue with</Text>
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
                    <Text style={styles.footerText}>Don't have an account? </Text>
                    <Link href="/signup" asChild>
                        <TouchableOpacity>
                            <Text style={styles.footerLink}>Sign Up</Text>
                        </TouchableOpacity>
                    </Link>
                </View>

            </View>
            <ToastManager />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 20,
    },
    header: {
        marginBottom: 40,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    logoWrapper: {
        width: 80,
        height: 80,
        borderRadius: 25,
        backgroundColor: '#1a1a1a',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333',
        shadowColor: "#C9E265",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 5,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#C9E265',
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
        marginBottom: 40,
    },
    form: {
        marginBottom: 30,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#111',
        borderRadius: 12,
        padding: 16,
        color: '#fff',
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#222',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#222',
    },
    passwordInput: {
        flex: 1,
        padding: 16,
        color: '#fff',
        fontSize: 16,
    },
    eyeIcon: {
        padding: 16,
    },
    forgotPassword: {
        alignItems: 'flex-end',
        marginBottom: 30,
    },
    forgotPasswordText: {
        color: '#888',
        fontSize: 14,
    },
    loginButton: {
        backgroundColor: '#C9E265',
        borderRadius: 30,
        paddingVertical: 16,
        alignItems: 'center',
        shadowColor: "#C9E265",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    loginButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    socialSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    orText: {
        color: '#666',
        marginBottom: 20,
        fontSize: 14,
    },
    socialIcons: {
        flexDirection: 'row',
        gap: 20,
    },
    iconButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#1a1a1a',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#333',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 'auto',
        marginBottom: 20,
    },
    footerText: {
        color: '#888',
        fontSize: 14,
    },
    footerLink: {
        color: '#C9E265',
        fontSize: 14,
        fontWeight: 'bold',
    },
});
