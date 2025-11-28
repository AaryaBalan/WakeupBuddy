import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SystemNavigationBar from 'react-native-system-navigation-bar';
import { PopupProvider } from "../contexts/PopupContext";
import { UserProvider } from "../contexts/UserContext";

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL, {
  unsavedChangesWarning: false,
});

export default function RootLayout() {
  // Hide Android navigation bar to prevent collision with app navbar
  useEffect(() => {
    SystemNavigationBar.navigationHide();
  }, []);

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