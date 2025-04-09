import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useAuthStore } from "@/stores/auth-store";
import { ErrorBoundary } from "./error-boundry";
import { ScreenshotPreventionProvider } from "./ScreenshotPreventionContext";

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    // You can add custom fonts here if needed
  });

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <ScreenshotPreventionProvider>
        <RootLayoutNav />
      </ScreenshotPreventionProvider>
    </ErrorBoundary>
  );
}

function RootLayoutNav() {
  const segments = useSegments();
  const router = useRouter();
  const { isAuthenticated, initAuth } = useAuthStore();
  const [authLoaded, setAuthLoaded] = useState(false);

  // Set up auth state listener
  useEffect(() => {
    console.log('Setting up auth listener...');
    const unsubscribe = initAuth();
    setAuthLoaded(true);

    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // Handle navigation based on auth state
  useEffect(() => {
    if (!authLoaded) return;

    const inAuthGroup = segments[0] === "auth";
    console.log('Auth state:', isAuthenticated ? 'authenticated' : 'not authenticated');
    
    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/auth/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/app/landing");
    }
  }, [isAuthenticated, segments, router, authLoaded]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="auth"
    >
      <Stack.Screen
        name="auth"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="app"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}