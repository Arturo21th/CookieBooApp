import React from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { UserProfile } from '../services/firestoreService';
import { fetchAllUserIds } from '../services/userService';
import { sendMessageToUser } from '../services/messagesService';

type TargetMode = 'all' | 'single';

type AdminBroadcastScreenProps = {
  profile: UserProfile | null;
  onClose: () => void;
};

function AdminBroadcastScreen({
  profile,
  onClose,
}: AdminBroadcastScreenProps): React.JSX.Element {
  const [title, setTitle] = React.useState('');
  const [body, setBody] = React.useState('');
  const [userId, setUserId] = React.useState('');
  const [mode, setMode] = React.useState<TargetMode>('all');
  const [sending, setSending] = React.useState(false);
  const [lastSummary, setLastSummary] = React.useState<string | null>(null);

  if (profile?.role !== 'admin') {
    return (
      <View style={styles.blocked}>
        <Text style={styles.blockedText}>
          Esta sección es exclusiva para administradores.
        </Text>
        <Pressable style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeText}>Cerrar</Text>
        </Pressable>
      </View>
    );
  }

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert('Campos incompletos', 'Agrega un título y un mensaje.');
      return;
    }
    if (mode === 'single' && !userId.trim()) {
      Alert.alert('Usuario faltante', 'Ingresa el UID del destinatario.');
      return;
    }
    setSending(true);
    try {
      const payload = { title: title.trim(), body: body.trim() };
      if (mode === 'single') {
        await sendMessageToUser({ ...payload, userId: userId.trim() });
        setLastSummary('Se envió el mensaje al usuario seleccionado.');
      } else {
        const targets = await fetchAllUserIds();
        if (targets.length === 0) {
          Alert.alert(
            'Sin usuarios',
            'Aún no hay usuarios registrados para recibir el mensaje.',
          );
          return;
        }
        await Promise.all(
          targets.map(target =>
            sendMessageToUser({
              ...payload,
              userId: target.id,
            }),
          ),
        );
        setLastSummary(
          `Se envió el mensaje a ${targets.length} usuarios registrados.`,
        );
      }
      setTitle('');
      setBody('');
      setUserId('');
      Alert.alert('Mensaje enviado', 'Los usuarios recibirán la notificación.');
    } catch (error) {
      console.error('send broadcast error', error);
      Alert.alert(
        'Error',
        'No se pudo enviar el mensaje. Intenta nuevamente más tarde.',
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Enviar mensaje</Text>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeText}>Cerrar</Text>
            </Pressable>
          </View>
          <Text style={styles.subtitle}>
            Comparte avisos generales o mensajes personalizados con los usuarios.
          </Text>
        </View>

        <View style={styles.modeRow}>
          {(['all', 'single'] as TargetMode[]).map(option => {
            const active = option === mode;
            return (
              <Pressable
                key={option}
                onPress={() => setMode(option)}
                style={[
                  styles.modeButton,
                  active ? styles.modeButtonActive : null,
                ]}
              >
                <Text
                  style={[
                    styles.modeButtonText,
                    active ? styles.modeButtonTextActive : null,
                  ]}
                >
                  {option === 'all' ? 'Todos los usuarios' : 'Usuario específico'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {mode === 'single' && (
          <View style={styles.field}>
            <Text style={styles.label}>UID del usuario</Text>
            <TextInput
              value={userId}
              onChangeText={setUserId}
              placeholder="Ej. eP0Vx1e9zWkYjs4Aa"
              placeholderTextColor="rgba(0,0,0,0.45)"
              style={styles.input}
              autoCapitalize="none"
            />
            <Text style={styles.helper}>
              Puedes copiar el UID desde la colección users en Firestore.
            </Text>
          </View>
        )}

        <View style={styles.field}>
          <Text style={styles.label}>Título</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Ej. Promo de temporada"
            placeholderTextColor="rgba(0,0,0,0.45)"
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Mensaje</Text>
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder="Comparte aquí el contenido del mensaje…"
            placeholderTextColor="rgba(0,0,0,0.45)"
            style={[styles.input, styles.textarea]}
            multiline
            numberOfLines={6}
          />
        </View>

        <Pressable
          disabled={sending}
          onPress={handleSend}
          style={({ pressed }) => [
            styles.sendButton,
            pressed ? styles.sendButtonPressed : null,
            sending ? styles.sendButtonDisabled : null,
          ]}
        >
          {sending ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.sendButtonText}>Enviar mensaje</Text>
          )}
        </Pressable>

        {lastSummary ? (
          <Text style={styles.summary}>{lastSummary}</Text>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    gap: 20,
  },
  header: {
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#000000',
  },
  subtitle: {
    color: 'rgba(0,0,0,0.65)',
    fontSize: 15,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cdd3da',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#63aee0',
    borderColor: '#63aee0',
  },
  modeButtonText: {
    color: '#000000',
    fontWeight: '600',
    textAlign: 'center',
  },
  modeButtonTextActive: {
    color: '#ffffff',
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '600',
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#000000',
    backgroundColor: '#f5f5f7',
  },
  helper: {
    fontSize: 13,
    color: 'rgba(0,0,0,0.5)',
  },
  textarea: {
    minHeight: 140,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: '#63aee0',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  sendButtonPressed: {
    opacity: 0.9,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  summary: {
    color: 'rgba(0,0,0,0.65)',
    fontSize: 14,
    textAlign: 'center',
  },
  blocked: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#ffffff',
    gap: 16,
  },
  blockedText: {
    color: '#000000',
    fontSize: 16,
    textAlign: 'center',
  },
  closeButton: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#63aee0',
  },
  closeText: {
    color: '#63aee0',
    fontWeight: '600',
  },
});

export default AdminBroadcastScreen;
