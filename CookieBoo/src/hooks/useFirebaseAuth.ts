import React from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

export function useFirebaseAuth(enabled: boolean) {
  const [user, setUser] = React.useState<FirebaseAuthTypes.User | null>(null);
  const [initializing, setInitializing] = React.useState(true);

  React.useEffect(() => {
    if (!enabled) {
      setInitializing(true);
      setUser(null);
      return;
    }

    const unsubscribe = auth().onAuthStateChanged(nextUser => {
      setUser(nextUser);
      setInitializing(false);
    });

    return unsubscribe;
  }, [enabled]);

  return { user, initializing };
}

export type UseFirebaseAuthReturn = ReturnType<typeof useFirebaseAuth>;
