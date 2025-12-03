import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from "expo-router";
import { useEffect } from 'react';
import { Image, StatusBar, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppText from '../components/AppText';
import { useUser } from "../contexts/UserContext";
import styles from '../styles/index.styles.js';

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
              source={require('../assets/images/icon.png')}
              style={styles.profileImage}
            />
            <View style={styles.statusBadge}>
              <Ionicons name="flash" size={16} color="black" />
            </View>
          </View>
        </View>

        {/* Title and Tagline */}
        <AppText style={styles.title}>WakeBuddy</AppText>
        <AppText style={styles.tagline}>
          Find your partner, conquer the alarm, and start your day victorious.
        </AppText>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <Link href="/signup" asChild>
            <TouchableOpacity style={styles.signupButton}>
              <AppText style={styles.signupButtonText}>Sign Up Free</AppText>
            </TouchableOpacity>
          </Link>

          <Link href="/login" asChild>
            <TouchableOpacity style={styles.loginButton}>
              <AppText style={styles.loginButtonText}>Log In</AppText>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Social Login */}
        <View style={styles.socialSection}>
          <AppText style={styles.orText}>or continue with</AppText>
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
        <AppText style={styles.footerText}>
          By continuing, you agree to our Terms.
        </AppText>
      </View>
    </SafeAreaView>
  );
}