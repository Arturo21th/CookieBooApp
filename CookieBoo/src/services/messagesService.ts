import firestore from '@react-native-firebase/firestore';

type SendMessagePayload = {
  userId: string;
  title: string;
  body: string;
};

export async function sendMessageToUser({
  userId,
  title,
  body,
}: SendMessagePayload) {
  if (!userId) {
    throw new Error('Missing userId');
  }
  await firestore()
    .collection('users')
    .doc(userId)
    .collection('messages')
    .add({
      title,
      body,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
}
