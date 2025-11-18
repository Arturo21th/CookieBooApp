import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

type SignInPayload = {
  email: string;
  password: string;
};

type RegisterPayload = {
  email: string;
  password: string;
  displayName?: string;
};

export async function signInWithPassword({ email, password }: SignInPayload) {
  const trimmedEmail = email.trim().toLowerCase();
  if (!trimmedEmail || !password) {
    throw new Error('Missing credentials');
  }
  await auth().signInWithEmailAndPassword(trimmedEmail, password);
  return auth().currentUser;
}

export async function registerWithEmail({
  email,
  password,
  displayName,
}: RegisterPayload): Promise<FirebaseAuthTypes.User> {
  const trimmedEmail = email.trim().toLowerCase();
  if (!trimmedEmail || !password) {
    throw new Error('Missing registration data');
  }
  const userCredential = await auth().createUserWithEmailAndPassword(
    trimmedEmail,
    password,
  );
  if (displayName) {
    await userCredential.user.updateProfile({ displayName });
  }
  return userCredential.user;
}

export async function resetPassword(email: string) {
  const trimmedEmail = email.trim().toLowerCase();
  if (!trimmedEmail) {
    throw new Error('Missing email');
  }
  await auth().sendPasswordResetEmail(trimmedEmail);
}
