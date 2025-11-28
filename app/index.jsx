import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from "expo-router";
import { useEffect } from 'react';
import { Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "../contexts/UserContext";
import styles from '../styles/index.styles.js'

export default function Index() {
  const router = useRouter();
  const { user, loading } = useUser();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/(tabs)/home');
    }
  }, [user, loading]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.content}>

        {/* Profile Image Section */}
        <View style={styles.profileContainer}>
          <View style={styles.profileImageWrapper}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80' }}
              style={styles.profileImage}
            />
            <View style={styles.statusBadge}>
              <Ionicons name="flash" size={16} color="black" />
            </View>
          </View>
        </View>

        {/* Title and Tagline */}
        <Text style={styles.title}>WakeBuddy</Text>
        <Text style={styles.tagline}>
          Find your partner, conquer the alarm, and start your day victorious.
        </Text>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <Link href="/signup" asChild>
            <TouchableOpacity style={styles.signupButton}>
              <Text style={styles.signupButtonText}>Sign Up Free</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/login" asChild>
            <TouchableOpacity style={styles.loginButton}>
              <Text style={styles.loginButtonText}>Log In</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Social Login */}
        <View style={styles.socialSection}>
          <Text style={styles.orText}>or continue with</Text>
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
        <Text style={styles.footerText}>
          By continuing, you agree to our Terms.
        </Text>
      </View>
    </SafeAreaView>
  );
}