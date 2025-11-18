import React from 'react';
import { ActivityIndicator, StatusBar, View, StyleSheet } from 'react-native';
import firebase from '@react-native-firebase/app';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { firebaseOptions } from './src/config/firebaseOptions';
import { useFirebaseAuth } from './src/hooks/useFirebaseAuth';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';

function App(): React.JSX.Element {
  const [firebaseReady, setFirebaseReady] = React.useState(false);
  const { user, initializing: authLoading } = useFirebaseAuth(firebaseReady);
  const [authScreen, setAuthScreen] = React.useState<'login' | 'signup' | 'forgot'>('login');

  React.useEffect(() => {
    async function initialize() {
      if (!firebase.apps.length) {
        await firebase.initializeApp(firebaseOptions);
      } else {
        firebase.app();
      }
      setFirebaseReady(true);
    }

    initialize();
  }, []);

  React.useEffect(() => {
    if (user) {
      setAuthScreen('login');
    }
  }, [user]);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={styles.container}>
        {firebaseReady && !authLoading ? (
          user ? (
            <HomeScreen user={user} />
          ) : (
            authScreen === 'login' ? (
              <LoginScreen
                onNavigateToSignUp={() => setAuthScreen('signup')}
                onNavigateToForgotPassword={() => setAuthScreen('forgot')}
              />
            ) : authScreen === 'signup' ? (
              <SignUpScreen onNavigateToLogin={() => setAuthScreen('login')} />
            ) : (
              <ResetPasswordScreen onNavigateBack={() => setAuthScreen('login')} />
            )
          )
        ) : (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#63aee0" />
          </View>
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;
