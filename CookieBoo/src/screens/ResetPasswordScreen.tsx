import React from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { resetPassword } from '../services/authService';

type ResetPasswordScreenProps = {
  onNavigateBack: () => void;
};

function ResetPasswordScreen({
  onNavigateBack,
}: ResetPasswordScreenProps): React.JSX.Element {
  const [email, setEmail] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const handleReset = async () => {
    if (!email || !email.includes('@')) {
      setError('Ingresa un correo válido.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await resetPassword(email.trim());
      Alert.alert(
        'Revisa tu correo',
        'Te enviamos un enlace para restablecer tu contraseña.',
      );
      onNavigateBack();
    } catch (err) {
      console.error('Reset password error', err);
      setError('No pudimos enviar el correo. Intenta más tarde.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.safeArea}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Cambiar contraseña</Text>
        <Text style={styles.subtitle}>
          Ingresa tu correo y te enviaremos un enlace para cambiar tu contraseña.
        </Text>

        <View style={styles.form}>
          <TextInput
            placeholder="Correo electrónico"
            placeholderTextColor="rgba(0,0,0,0.45)"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            onPress={handleReset}
            disabled={submitting}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed ? styles.primaryButtonPressed : null,
              submitting ? styles.primaryButtonDisabled : null,
            ]}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryText}>Enviar enlace</Text>
            )}
          </Pressable>

          <Pressable onPress={onNavigateBack} style={styles.secondary}>
            <Text style={styles.secondaryText}>Volver al inicio de sesión</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    color: '#000000',
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 8,
    color: '#111827',
    fontSize: 15,
  },
  form: {
    marginTop: 36,
    gap: 16,
  },
  input: {
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: '#f2f4f7',
    color: '#000000',
  },
  error: {
    color: '#b91c1c',
    fontSize: 14,
  },
  primaryButton: {
    backgroundColor: '#63aee0',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonPressed: {
    opacity: 0.85,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondary: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryText: {
    color: '#1f2937',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default ResetPasswordScreen;
