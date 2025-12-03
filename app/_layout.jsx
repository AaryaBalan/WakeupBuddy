import {
  Montserrat_300Light,
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/montserrat';
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import mobileAds from 'react-native-google-mobile-ads';
import { SafeAreaProvider } from "react-native-safe-area-context";
import SystemNavigationBar from 'react-native-system-navigation-bar';
import { PopupProvider } from "../contexts/PopupContext";
import { UserProvider } from "../contexts/UserContext";

// Keep splash screen visible while loading fonts
SplashScreen.preventAutoHideAsync();

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL, {
  unsavedChangesWarning: false,
});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Montserrat_300Light,
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
  });

  // Hide Android navigation bar to prevent collision with app navbar
  useEffect(() => {
    SystemNavigationBar.navigationHide();
  }, []);

  // Initialize Google Mobile Ads
  useEffect(() => {
    mobileAds()
      .initialize()
      .then(() => console.log('✅ AdMob initialized successfully'))
      .catch((error) => console.error('❌ AdMob initialization failed:', error));
  }, []);

  // Hide splash screen and set default font when fonts are loaded
  useEffect(() => {
    if (fontsLoaded) {
      // Set Montserrat as default font for ALL Text components
      Text.defaultProps = Text.defaultProps || {};
      Text.defaultProps.style = { fontFamily: 'Montserrat_400Regular' };
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Show loading screen while fonts load
  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#C9E265" />
      </View>
    );
  }

  return (
    <ConvexProvider client={convex}>
      <UserProvider>
        <PopupProvider>
          <SafeAreaProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="login" options={{ headerShown: false }} />
              <Stack.Screen name="signup" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
          </SafeAreaProvider>
        </PopupProvider>
      </UserProvider>
    </ConvexProvider>
  );
}