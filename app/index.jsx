import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, useRouter } from "expo-router";
import { useEffect } from 'react';
import { Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await AsyncStorage.getItem('user');
        if (user) {
          router.replace('/(tabs)/home');
        }
      } catch (e) {
        console.error('Failed to load user from storage', e);
      }
    };
    checkUser();
  }, []);

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  profileContainer: {
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImageWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#333', // Dark border
    position: 'relative',
    shadowColor: "#C9E265",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  statusBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#C9E265',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 60,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 40,
  },
  signupButton: {
    backgroundColor: "#C9E265", // Lime green
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    width: '100%',
  },
  signupButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  loginButton: {
    paddingVertical: 12,
    alignItems: "center",
    width: '100%',
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  socialSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  orText: {
    color: "#666",
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
  },
  footerText: {
    color: "#444",
    fontSize: 12,
    position: 'absolute',
    bottom: 40,
  },
});
