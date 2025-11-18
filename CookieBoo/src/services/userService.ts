import firestore from '@react-native-firebase/firestore';

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
      stampsGoal: 8,
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
    };
  });
}
