import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const NEON = '#C8FF00';
const BG = '#000';
const GRAY = '#999';

export default function Welcome() {
  const router = useRouter();

  const handleSignUp = () => {
    router.push('/signup');
  };

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <View style={styles.container}>
      {/* Profile Image with Badge */}
      <View style={styles.imageContainer}>
        <View style={styles.avatarWrapper}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' }}
            style={styles.avatar}
          />
          <View style={styles.badge}>
            <Ionicons name="alarm" size={16} color="#000" />
          </View>
        </View>
      </View>

      {/* Tagline */}
      <Text style={styles.tagline}>
        Find your partner, conquer the{'\n'}alarm, and start your day{'\n'}victorious.
      </Text>

      {/* Sign Up Button */}
      <TouchableOpacity style={styles.signUpButton} activeOpacity={0.8} onPress={handleSignUp}>
        <Text style={styles.signUpText}>Sign Up Free</Text>
      </TouchableOpacity>

      {/* Log In Link */}
      <TouchableOpacity style={styles.loginButton} activeOpacity={0.7} onPress={handleLogin}>
        <Text style={styles.loginText}>Log In</Text>
      </TouchableOpacity>

      {/* Social Login */}
      <Text style={styles.orText}>or continue with</Text>
      <View style={styles.socialIcons}>
        <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
          <Ionicons name="logo-apple" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
          <Ionicons name="mail-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
          <Ionicons name="logo-github" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Terms */}
      <Text style={styles.terms}>
        By continuing, you agree to our Terms.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
    alignItems: 'center',
  },
  imageContainer: {
    marginBottom: 40,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#222',
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: NEON,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: BG,
  },
  tagline: {
    color: GRAY,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 60,
  },
  signUpButton: {
    backgroundColor: NEON,
    width: '100%',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
  },
  signUpText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
  loginButton: {
    marginBottom: 30,
  },
  loginText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  orText: {
    color: GRAY,
    fontSize: 14,
    marginBottom: 20,
  },
  socialIcons: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 50,
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  terms: {
    color: GRAY,
    fontSize: 12,
    textAlign: 'center',
  },
});
