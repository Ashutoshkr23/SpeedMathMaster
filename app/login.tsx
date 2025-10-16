import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../firebaseConfig'; // Path to the config file

WebBrowser.maybeCompleteAuthSession();

// -------------------------------------------------------------------------
// !!! IMPORTANT: REPLACE THESE WITH YOUR ACTUAL CLIENT IDs !!!
// You got these from the Google Cloud Console (Phase 2)
// -------------------------------------------------------------------------
const WEB_CLIENT_ID = 'REPLACE_WITH_YOUR_WEB_CLIENT_ID'; 
const ANDROID_CLIENT_ID = 'REPLACE_WITH_YOUR_ANDROID_CLIENT_ID'; 
// -------------------------------------------------------------------------

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);

  // Hook to handle the Google OAuth flow
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: ANDROID_CLIENT_ID, 
    webClientId: WEB_CLIENT_ID, 
  });

  useEffect(() => {
    if (response?.type === 'success' && response.authentication?.idToken) {
      const { idToken } = response.authentication;
      const credential = GoogleAuthProvider.credential(idToken);
      
      setLoading(true);
      
      // Exchange Google token for a Firebase user session
      signInWithCredential(auth, credential)
        .then(() => {
          console.log("Google Sign-in successful. Redirecting...");
          // AuthContext automatically handles navigation to Home screen
        })
        .catch(error => {
          console.error("Firebase Sign-in Error:", error.message);
          Alert.alert("Login Failed", "Check your Google Cloud credentials and SHA-1 key in Firebase.");
        })
        .finally(() => {
          setLoading(false);
        });
    } else if (response?.type === 'error') {
      console.error("Sign-in cancelled or failed:", response);
    }
  }, [response]);

  const handleSignIn = async () => {
    if (!request) {
        Alert.alert("Error", "Authentication request not loaded.");
        return;
    }
    setLoading(true);
    await promptAsync(); 
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.logo}>Speed Math Master</Text>
      <Text style={styles.tagline}>Train your brain. Compete. Conquer Exams.</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 40 }} />
      ) : (
        <TouchableOpacity 
          style={[styles.button, { opacity: request ? 1 : 0.9 }]} 
          onPress={handleSignIn} 
          disabled={!request || loading}
        >
          <Text style={styles.buttonText}>
             G Sign in with Google
          </Text>
        </TouchableOpacity>
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
  }
});
