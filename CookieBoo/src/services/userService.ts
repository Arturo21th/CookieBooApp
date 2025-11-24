import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

type CreateUserProfilePayload = {
  uid: string;
  displayName: string;
  email: string;
  role?: 'admin' | 'courier' | 'user';
};

export type MinimalUser = {
  id: string;
  displayName: string;
  email: string;
  role?: 'admin' | 'courier' | 'user';
};

export async function createUserProfile({
  uid,
  displayName,
  email,
  role = 'user',
}: CreateUserProfilePayload) {
  const now = firestore.FieldValue.serverTimestamp();
  const docRef = firestore().collection('users').doc(uid);
  await docRef.set(
    {
      displayName,
      email,
      role,
      tier: 'Cliente Cookie Lover',
      stampsGoal: 10,
      stampsCompleted: 0,
      qrCodeData: uid,
      lastScanAt: null,
      createdAt: now,
      updatedAt: now,
    },
    { merge: true },
  );
}

export async function fetchAllUserIds(): Promise<MinimalUser[]> {
  const snapshot = await firestore()
    .collection('users')
    .orderBy('displayName', 'asc')
    .get();
  return snapshot.docs.map(doc => {
    const data = doc.data() ?? {};
    return {
      id: doc.id,
      displayName: (data.displayName as string) ?? 'Usuario sin nombre',
      email: (data.email as string) ?? 'Sin correo',
      role: (data.role as 'admin' | 'courier' | 'user' | undefined) ?? 'user',
    };
  });
}

export async function updateUserRole(
  uid: string,
  role: 'admin' | 'courier' | 'user',
) {
  if (!uid) {
    throw new Error('Missing uid');
  }
  await firestore().collection('users').doc(uid).update({
    role,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
}

export async function updateDisplayName(uid: string, displayName: string) {
  const trimmedName = displayName.trim();
  if (!uid || !trimmedName) {
    throw new Error('Missing uid or display name');
  }
  const now = firestore.FieldValue.serverTimestamp();
  await firestore().collection('users').doc(uid).set(
    {
      displayName: trimmedName,
      updatedAt: now,
    },
    {merge: true},
  );

  const currentUser = auth().currentUser;
  if (currentUser && currentUser.uid === uid) {
    await currentUser.updateProfile({displayName: trimmedName});
  }
}
