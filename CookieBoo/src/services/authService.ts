import auth from '@react-native-firebase/auth';

type SignInPayload = {
  email: string;
  password: string;
};

export async function signInWithPassword({ email, password }: SignInPayload) {
  const trimmedEmail = email.trim().toLowerCase();
  if (!trimmedEmail || !password) {
    throw new Error('Missing credentials');
  }
  await auth().signInWithEmailAndPassword(trimmedEmail, password);
  return auth().currentUser;
}
