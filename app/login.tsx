import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import { GoogleAuthProvider, signInWithCredential, signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig'; // Path to your Firebase initialization file
import { useAuth } from '@/src/context/AuthContext'; // Custom hook to get user state

WebBrowser.maybeCompleteAuthSession();

// --- CRITICAL: REPLACE THESE WITH YOUR ACTUAL, WORKING CLIENT IDs ---
// These keys must be registered in the Google Cloud Console for the OAuth flow.
const WEB_CLIENT_ID = '43153381867-msp8bp7ph2f7b7e7j60kt2ld5oum1qv1.apps.googleusercontent.com';
const ANDROID_CLIENT_ID = '43153381867-fe13ab9rquaorqq7pknf1f1d90le0auh.apps.googleusercontent.com';
// --- END CLIENT ID SETUP ---

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth(); // Get current authentication state
  
  // Calculate the redirect URI explicitly to force the secure HTTPS proxy URL
  // This ensures the URL sent to Google matches the whitelisted proxy URI in the Cloud Console.
  const redirectUri = AuthSession.makeRedirectUri(
      { 
        // The scheme must match the one in app.json (speedmathmaster)
        native: 'speedmathmaster://', 
        useProxy: true, // Forces the secure 'https://auth.expo.io' proxy URL
      } as any
  );

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: ANDROID_CLIENT_ID, 
    webClientId: WEB_CLIENT_ID, 
    redirectUri: redirectUri, // Use the explicitly calculated URI
  });

  // Effect runs whenever the OAuth response changes (after the browser window closes)
  useEffect(() => {
    if (response?.type === 'success' && response.authentication?.idToken) {
      const { idToken } = response.authentication;
      const credential = GoogleAuthProvider.credential(idToken);
      
      setLoading(true);
      
      // Exchange the Google token for a Firebase session
      signInWithCredential(auth, credential)
        .then(() => {
          console.log("User successfully signed in to Firebase.");
        })
        .catch(error => {
          console.error("Firebase Sign-in Error:", error.message);
          Alert.alert("Login Failed", "There was an issue linking Google to Firebase.");
        })
        .finally(() => {
          setLoading(false);
        });
    } else if (response?.type === 'error') {
      console.warn("Sign-in process was canceled or failed:", response.error?.message);
    }
  }, [response]);


  const handleSignIn = async () => {
    if (!request) {
        Alert.alert("Error", "Authentication request not loaded. Check internet or Client IDs.");
        return;
    }
    setLoading(true);
    // This opens the browser/modal for the Google login flow
    await promptAsync();
  };

  const handleSignOut = () => {
    signOut(auth).then(() => {
        Alert.alert("Signed Out", "You have been successfully signed out.");
    }).catch(error => {
        Alert.alert("Sign Out Error", error.message);
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.logo}>Speed Math Master</Text>
      <Text style={styles.tagline}>Train your brain. Compete. Conquer Exams.</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 40 }} />
      ) : (
        <>
          <TouchableOpacity 
            style={[styles.button, { opacity: request ? 1 : 0.7 }]} 
            onPress={handleSignIn} 
            disabled={!request}
          >
            <Text style={styles.buttonText}>
               G Sign in with Google
            </Text>
          </TouchableOpacity>

          {/* Test Sign Out Button (Visible after a successful login) */}
          {isAuthenticated && (
            <TouchableOpacity 
              style={styles.signOutButton} 
              onPress={handleSignOut}
            >
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F7F9',
    padding: 30,
  },
  logo: {
    fontSize: 38,
    fontWeight: '900',
    color: '#4F46E5',
    marginBottom: 10,
  },
  tagline: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 60,
    textAlign: 'center',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#4285F4',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signOutButton: {
    marginTop: 20,
    padding: 10
  },
  signOutText: {
    color: '#4F46E5',
    fontSize: 14
  }
});
