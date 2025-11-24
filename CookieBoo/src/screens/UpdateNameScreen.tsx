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
import {updateDisplayName} from '../services/userService';

type UpdateNameScreenProps = {
  userId: string;
  currentName?: string | null;
  onClose: () => void;
};

const UpdateNameScreen = ({
  userId,
  currentName,
  onClose,
}: UpdateNameScreenProps): React.JSX.Element => {
  const [name, setName] = React.useState(currentName ?? '');
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Nombre requerido', 'Ingresa tu nombre para continuar.');
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      await updateDisplayName(userId, trimmed);
      setMessage('Tu nombre se actualizó correctamente.');
    } catch (err) {
      console.error('updateDisplayName error', err);
      Alert.alert(
        'No se pudo actualizar',
        'Revisa tu conexión e inténtalo nuevamente.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Actualiza tu nombre</Text>
        <Text style={styles.subtitle}>
          Este nombre aparecerá en tu perfil y en tu código QR.
        </Text>

        <View style={styles.field}>
          <Text style={styles.label}>Nombre</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Ej. Ana Cookie Lover"
            placeholderTextColor="rgba(0,0,0,0.45)"
            style={styles.input}
            autoCapitalize="words"
            editable={!saving}
          />
        </View>

        <Pressable
          disabled={saving}
          onPress={handleSave}
          style={({pressed}) => [
            styles.primaryButton,
            pressed ? styles.primaryButtonPressed : null,
            saving ? styles.primaryButtonDisabled : null,
          ]}>
          {saving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.primaryButtonText}>Guardar</Text>
          )}
        </Pressable>

        <Pressable onPress={onClose} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Cerrar</Text>
        </Pressable>

        {message ? <Text style={styles.message}>{message}</Text> : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    gap: 18,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000000',
  },
  subtitle: {
    color: 'rgba(0,0,0,0.65)',
    fontSize: 15,
  },
  field: {
    gap: 8,
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
  primaryButton: {
    backgroundColor: '#63aee0',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonPressed: {
    opacity: 0.9,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: '#1f2933',
    fontSize: 15,
    fontWeight: '600',
  },
  message: {
    color: 'rgba(0,0,0,0.65)',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default UpdateNameScreen;
