import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export type StampCard = {
  userId: string;
  displayName: string;
  email: string;
  totalScans: number;
  completedScans: number;
  lastScanAt: Date | null;
};

const toDate = (value?: unknown): Date | null => {
  if (!value) {
    return null;
  }
  if (value instanceof Date) {
    return value;
  }
  if (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in (value as FirebaseFirestoreTypes.Timestamp)
  ) {
    return (value as FirebaseFirestoreTypes.Timestamp).toDate();
  }
  if (typeof value === 'number' || typeof value === 'string') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
};

export async function fetchStampCard(userId: string): Promise<StampCard | null> {
  if (!userId) {
    return null;
  }

  const doc = await firestore().collection('users').doc(userId).get();
  if (!doc.exists) {
    return null;
  }

  const data = doc.data() ?? {};
  const total = typeof data.stampsGoal === 'number' ? data.stampsGoal : 10;
  const completed =
    typeof data.stampsCompleted === 'number' ? data.stampsCompleted : 0;

  return {
    userId: doc.id,
    displayName: (data.displayName as string) ?? 'Usuario',
    email: (data.email as string) ?? 'Sin correo',
    totalScans: total,
    completedScans: Math.min(completed, total),
    lastScanAt: toDate(data.lastScanAt),
  };
}

type RecordScanPayload = {
  userId: string;
  scannedBy: string;
};

export async function recordScan({ userId, scannedBy }: RecordScanPayload) {
  if (!userId) {
    throw new Error('Missing userId');
  }
  const userRef = firestore().collection('users').doc(userId);

  await firestore().runTransaction(async transaction => {
    const snapshot = await transaction.get(userRef);
    if (!snapshot.exists) {
      throw new Error('Usuario no encontrado');
    }
    const data = snapshot.data() ?? {};
    const goal =
      typeof data.stampsGoal === 'number' && data.stampsGoal > 0
        ? data.stampsGoal
        : 10;
    const completed =
      typeof data.stampsCompleted === 'number' ? data.stampsCompleted : 0;
    const nextCompleted = Math.min(goal, completed + 1);

    transaction.update(userRef, {
      stampsCompleted: nextCompleted,
      lastScanAt: firestore.FieldValue.serverTimestamp(),
      lastScannedBy: scannedBy,
    });
  });
}
