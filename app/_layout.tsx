import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useSegments, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

// --- Imports for Auth/Context ---
// NOTE: You must ensure 'src/context/AuthContext.tsx' exists and exports AuthProvider and useAuth.
import { AuthProvider, useAuth } from '@/src/context/AuthContext'; 
import { useColorScheme } from '@/hooks/use-color-scheme';

// The function that determines where the user should go
function RootNavigator() {
  const { isAuthenticated, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // Define the public routes (routes accessible without login)
  const isPublicRoute = segments[0] === 'login'; 

  // --- Redirect Logic ---
  useEffect(() => {
    // Wait until loading is complete before deciding where to route
    if (!loading) {
      // If the user is authenticated, but trying to access the login page, redirect to the main app tabs.
      if (isAuthenticated && isPublicRoute) {
        router.replace('/(tabs)');
      } 
      // If the user is NOT authenticated, but trying to access the main app (tabs), redirect to the login page.
      else if (!isAuthenticated && !isPublicRoute) {
        router.replace('/login');
      }
    }
  }, [isAuthenticated, loading, segments]);

  // Show a global loading screen while the Firebase session is initializing
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  // --- Render Navigation Stack ---
  return (
    <Stack>
      {/* If the user is NOT authenticated, only the login screen is available */}
      {!isAuthenticated ? (
        <Stack.Screen name="login" options={{ headerShown: false }} />
      ) : (
        // If the user IS authenticated, render the main app structure
        <>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          {/* Add more authenticated screens here later (e.g., Quiz, Leaderboard) */}
        </>
      )}
    </Stack>
  );
}

// The main component wrapped with the Theme and Auth Providers
export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <RootNavigator />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#F7F7F9' 
    }
});
