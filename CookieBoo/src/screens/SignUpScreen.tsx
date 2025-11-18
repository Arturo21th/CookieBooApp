import React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { registerWithEmail } from '../services/authService';
import { createUserProfile } from '../services/userService';

type SignUpScreenProps = {
  onNavigateToLogin: () => void;
};

function SignUpScreen({ onNavigateToLogin }: SignUpScreenProps): React.JSX.Element {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Ingresa tu nombre.');
      return;
    }
    if (!email.includes('@')) {
      setError('Ingresa un correo válido.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const user = await registerWithEmail({
        email: email.trim(),
        password,
        displayName: name.trim(),
      });
      await createUserProfile({
        uid: user.uid,
        displayName: name.trim(),
        email: user.email ?? email.trim(),
      });
    } catch (err) {
      console.error('Sign up error', err);
      setError('No pudimos crear tu cuenta. Intenta con otro correo.');
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
        <Text style={styles.title}>Crear cuenta</Text>
        <Text style={styles.subtitle}>
          Registra tu cuenta CookieBoo y acumula sellos.
        </Text>

        <View style={styles.form}>
          <TextInput
            placeholder="Nombre"
            placeholderTextColor="rgba(0,0,0,0.45)"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
          <TextInput
            placeholder="Correo electrónico"
            placeholderTextColor="rgba(0,0,0,0.45)"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
          <View style={styles.passwordWrapper}>
            <TextInput
              placeholder="Contraseña"
              placeholderTextColor="rgba(0,0,0,0.45)"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              style={[styles.input, styles.passwordInput]}
            />
            <Pressable
              onPress={() => setShowPassword(prev => !prev)}
              style={styles.eyeButton}
            >
              <Text
                style={[
                  styles.eyeText,
                  showPassword ? styles.eyeTextActive : styles.eyeTextInactive,
                ]}
              >
                👁
              </Text>
            </Pressable>
          </View>
          <View style={styles.passwordWrapper}>
            <TextInput
              placeholder="Repite la contraseña"
              placeholderTextColor="rgba(0,0,0,0.45)"
              secureTextEntry={!showConfirm}
              value={confirm}
              onChangeText={setConfirm}
              style={[styles.input, styles.passwordInput]}
            />
            <Pressable
              onPress={() => setShowConfirm(prev => !prev)}
              style={styles.eyeButton}
            >
              <Text
                style={[
                  styles.eyeText,
                  showConfirm ? styles.eyeTextActive : styles.eyeTextInactive,
                ]}
              >
                👁
              </Text>
            </Pressable>
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            onPress={handleSubmit}
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
              <Text style={styles.primaryText}>Crear cuenta</Text>
            )}
          </Pressable>

          <Pressable onPress={onNavigateToLogin} style={styles.secondaryButton}>
            <Text style={styles.secondaryText}>
              ¿Ya tienes cuenta? Inicia sesión
            </Text>
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
    fontSize: 30,
    color: '#000000',
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 8,
    color: '#111827',
    fontSize: 16,
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
  passwordWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    padding: 8,
  },
  eyeText: {
    fontSize: 18,
  },
  eyeTextInactive: {
    color: 'rgba(0,0,0,0.45)',
  },
  eyeTextActive: {
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
  secondaryButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryText: {
    color: '#1f2937',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default SignUpScreen;
