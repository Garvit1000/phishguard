import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useAuthStore } from "../stores/auth-store";
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
    return null;
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
  const { isAuthenticated } = useAuthStore();

  // Move the navigation logic to useEffect to prevent state updates on unmounted components
  useEffect(() => {
    // Check if the user is authenticated
    const inAuthGroup = segments[0] === "auth";
    
    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to the login page if not authenticated
      router.replace("/auth/login");
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to the main app if authenticated
      router.replace("/app/landing");
    }
  }, [isAuthenticated, segments, router]);

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