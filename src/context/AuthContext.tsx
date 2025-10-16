import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
// Assumes firebaseConfig.ts is in the project root (one directory up from src/context)
import { auth } from '../../firebaseConfig'; 
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  // signOutUser is added for completeness, needed for the UI later
  signOutUser: () => Promise<void>; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => useContext(AuthContext)!;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null); 
  const [loading, setLoading] = useState(true); 

  // Function to sign out the user (for a logout button later)
  const signOutUser = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
      // Optional: Show an error alert
    }
  };

  useEffect(() => {
    // Listener watches for changes in the Firebase auth state
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = { user, loading, isAuthenticated: !!user, signOutUser };

  // Show a loading indicator while Firebase initializes and checks session
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={{ marginTop: 10, color: '#6B7280' }}>Checking user session...</Text>
      </View>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

const styles = StyleSheet.create({
    loadingContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#fff' 
    }
});