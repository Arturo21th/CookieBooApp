import React from 'react';
import {
  ActivityIndicator,
  StatusBar,
  View,
  StyleSheet,
  Image,
  Text,
} from 'react-native';
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
  const [showApp, setShowApp] = React.useState(false);
  const splashStartRef = React.useRef(Date.now());

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

  React.useEffect(() => {
    if (firebaseReady && !authLoading) {
      const elapsed = Date.now() - splashStartRef.current;
      const remaining = Math.max(0, 3000 - elapsed);
      const timer = setTimeout(() => setShowApp(true), remaining);
      return () => clearTimeout(timer);
    }
  }, [firebaseReady, authLoading]);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={styles.container}>
        {showApp ? (
          firebaseReady && !authLoading ? (
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
            <SplashScreen />
          )
        ) : (
          <SplashScreen />
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

const SplashScreen = () => {
  let logoSource: number | null = null;
  try {
    // Si agregas el archivo en ./assets/images/logo.png, se usará aquí.
    // De lo contrario, mostramos el monograma de texto como respaldo.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    logoSource = require('./assets/img/Logo_pantalla.png');
  } catch (err) {
    logoSource = null;
  }

  return (
    <View style={stylesSplash.container}>
      {logoSource ? (
        <Image source={logoSource} style={stylesSplash.logoImage} />
      ) : (
        <View style={stylesSplash.logo}>
          <Text style={stylesSplash.logoText}>CB</Text>
        </View>
      )}
      <ActivityIndicator size="large" color="#63aee0" />
    </View>
  );
};

const stylesSplash = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    gap: 16,
  },
  logo: {
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: '#63aee0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  logoText: {
    color: '#ffffff',
    fontSize: 120,
    fontWeight: '800',
    letterSpacing: 1,
  },
  logoImage: {
    width: 440,
    height: 440,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2933',
  },
});

export default App;
