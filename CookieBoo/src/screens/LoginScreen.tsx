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
import { SafeAreaView } from 'react-native-safe-area-context';
import { signInWithPassword } from '../services/authService';

type LoginScreenProps = {
  onNavigateToSignUp: () => void;
  onNavigateToForgotPassword: () => void;
};

function LoginScreen({
  onNavigateToSignUp,
  onNavigateToForgotPassword,
}: LoginScreenProps): React.JSX.Element {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Ingresa tu correo y contraseña.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await signInWithPassword({ email, password });
    } catch (err) {
      console.error('Login error', err);
      setError('Correo o contraseña incorrectos.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <View style={styles.container}>
          <Text style={styles.title}>CookieBoo</Text>
          <Text style={styles.subtitle}>
            Inicia sesión para acceder a tu Cookie Pass.
          </Text>

          <View style={styles.form}>
            <TextInput
              placeholder="Correo electrónico"
              placeholderTextColor="rgba(0,0,0,0.45)"
              value={email}
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={setEmail}
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
                <Text style={styles.primaryText}>Entrar</Text>
              )}
            </Pressable>

            <Pressable
              onPress={onNavigateToForgotPassword}
              style={styles.forgotButton}
            >
              <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
            </Pressable>

            <Pressable
              onPress={onNavigateToSignUp}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryText}>
                ¿Aún no tienes cuenta? Regístrate
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboardContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  title: {
    fontSize: 32,
    color: '#000000',
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 8,
    color: '#111827',
    fontSize: 16,
  },
  form: {
    marginTop: 48,
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
  forgotButton: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  forgotText: {
    color: '#1f2937',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
