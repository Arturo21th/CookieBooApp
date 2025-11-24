import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export type UserProfile = {
  id: string;
  displayName: string;
  tier: string;
  stampsGoal: number;
  stampsCompleted: number;
  qrCodeData: string;
  lastScanAt: Date | null;
  role?: 'admin' | 'courier' | 'user';
};

export type UserMessage = {
  id: string;
  title: string;
  body: string;
  createdAt: Date | null;
};

type ListenerErrorCallback = (error: Error) => void;

const DEFAULT_GOAL = 10;

function toDate(value?: unknown): Date | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'string') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  if (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in (value as FirebaseFirestoreTypes.Timestamp)
  ) {
    return (value as FirebaseFirestoreTypes.Timestamp).toDate();
  }

  return null;
}

const parseNumber = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

const usersCollection = () => firestore().collection('users');

export function listenToUserProfile(
  userId: string,
  onData: (profile: UserProfile | null) => void,
  onError?: ListenerErrorCallback,
) {
  return usersCollection()
    .doc(userId)
    .onSnapshot(
      snapshot => {
        if (!snapshot.exists) {
          onData(null);
          return;
        }

        const data = snapshot.data() ?? {};
        const record = data as Record<string, unknown>;
        const goal =
          parseNumber(record.stampsGoal) ??
          parseNumber(record.totalScans) ??
          DEFAULT_GOAL;
        const completed =
          parseNumber(record.stampsCompleted) ??
          parseNumber(record.completedScans) ??
          0;

        const profile: UserProfile = {
          id: snapshot.id,
          displayName: record.displayName?.toString() ?? 'Cookie Lover',
          tier: record.tier?.toString() ?? 'Cliente Cookie Lover',
          stampsGoal: goal && goal > 0 ? goal : DEFAULT_GOAL,
          stampsCompleted:
            completed && goal ? Math.min(completed, goal) : completed ?? 0,
          qrCodeData:
            record.qrCodeData?.toString() ??
            record.qrData?.toString() ??
            snapshot.id,
          lastScanAt: toDate(record.lastScanAt),
          role:
            (record.role as 'admin' | 'courier' | 'user' | undefined) ?? 'user',
        };

        onData(profile);
      },
      error => {
        console.error('listenToUserProfile error', error);
        onError?.(error);
      },
    );
}

export function listenToUserMessages(
  userId: string,
  limit: number,
  onData: (messages: UserMessage[]) => void,
  onError?: ListenerErrorCallback,
) {
  return usersCollection()
    .doc(userId)
    .collection('messages')
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .onSnapshot(
      snapshot => {
        const messages = snapshot.docs.map(doc => {
          const data = doc.data() ?? {};
          const record = data as Record<string, unknown>;
          return {
            id: doc.id,
            title: record.title?.toString() ?? 'Actualización CookieBoo',
            body: record.body?.toString() ?? 'Pronto verás novedades aquí.',
            createdAt: toDate(record.createdAt),
          };
        });
        onData(messages);
      },
      error => {
        console.error('listenToUserMessages error', error);
        onError?.(error);
      },
    );
}
