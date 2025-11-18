import React from 'react';
import { ActivityIndicator, StatusBar, View, StyleSheet } from 'react-native';
import firebase from '@react-native-firebase/app';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { firebaseOptions } from './src/config/firebaseOptions';

function App(): React.JSX.Element {
  const [firebaseReady, setFirebaseReady] = React.useState(false);
  const [authenticated, setAuthenticated] = React.useState(false);

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

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={styles.container}>
        {firebaseReady ? (
          authenticated ? (
            <HomeScreen />
          ) : (
            <LoginScreen
              onLoginSuccess={() => {
                setAuthenticated(true);
              }}
            />
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
