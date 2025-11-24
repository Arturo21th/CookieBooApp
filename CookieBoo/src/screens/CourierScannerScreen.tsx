import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  NativeModules,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import CameraKit, { Camera } from 'react-native-camera-kit';
import { recordScan } from '../services/stampsService';

type CameraPermissionModule = {
  requestDeviceCameraAuthorization?: () => Promise<boolean>;
  checkDeviceCameraAuthorizationStatus?: () => Promise<boolean>;
};

type CourierScannerScreenProps = {
  onClose?: () => void;
  role?: 'admin' | 'courier' | 'user' | null;
  currentUserId?: string | null;
};

const CourierScannerScreen = ({
  onClose,
  role,
  currentUserId,
}: CourierScannerScreenProps): React.JSX.Element => {
  const isDarkMode = useColorScheme() === 'dark';
  const [cameraPermission, setCameraPermission] = React.useState<
    'pending' | 'granted' | 'denied'
  >('pending');
  const [processing, setProcessing] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [manualUserId, setManualUserId] = React.useState('');
  const lastScannedRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const cameraModule =
          (CameraKit as CameraPermissionModule | undefined) ??
          ((NativeModules as unknown as { CameraKit?: CameraPermissionModule })
            .CameraKit);
        const requester =
          cameraModule?.requestDeviceCameraAuthorization ??
          cameraModule?.checkDeviceCameraAuthorizationStatus;

        if (typeof requester === 'function') {
          const granted = await requester();
          mounted && setCameraPermission(granted ? 'granted' : 'denied');
        } else {
          console.warn(
            'CameraKit requestDeviceCameraAuthorization no disponible. Verifica la instalación nativa.',
          );
          mounted && setCameraPermission('denied');
        }
      } catch (err) {
        console.error('Camera permission error', err);
        mounted && setCameraPermission('denied');
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const handleScan = React.useCallback(
    async (userId: string, source: 'scan' | 'manual') => {
      if (!userId || processing) {
        return;
      }

      const trimmedId = userId.trim();

      if (!trimmedId) {
        return;
      }

      if (source === 'scan' && lastScannedRef.current === trimmedId) {
        return;
      }

      setProcessing(true);
      lastScannedRef.current = trimmedId;
      setStatusMessage(null);

      try {
        await recordScan({
          userId: trimmedId,
          scannedBy: currentUserId ?? 'anonymous-courier',
        });
        setStatusMessage({
          type: 'success',
          text: `Sello registrado para ${trimmedId}.`,
        });
        setManualUserId('');
        if (source === 'scan') {
          setTimeout(() => {
            lastScannedRef.current = null;
          }, 1500);
        }
      } catch (err) {
        console.error('Error recording scan', err);
        setStatusMessage({
          type: 'error',
          text:
            'No se pudo registrar el sello. Verifica la conexión y los permisos.',
        });
        lastScannedRef.current = null;
      } finally {
        setProcessing(false);
      }
    },
    [processing, currentUserId],
  );

  const renderCamera = () => {
    if (role !== 'courier' && role !== 'admin') {
      return (
        <View style={styles.permissionBox}>
          <Text style={styles.permissionTitle}>Permiso requerido</Text>
          <Text style={styles.permissionText}>
            Solo los repartidores o administradores pueden escanear códigos.
          </Text>
        </View>
      );
    }
    if (cameraPermission === 'pending') {
      return (
        <View style={styles.permissionBox}>
          <ActivityIndicator size="small" color="#48bbecff" />
          <Text style={styles.permissionText}>
            Solicitando permiso de cámara...
          </Text>
        </View>
      );
    }

    if (cameraPermission === 'denied') {
      return (
        <View style={styles.permissionBox}>
          <Text style={styles.permissionTitle}>Permiso requerido</Text>
          <Text style={styles.permissionText}>
            Necesitamos acceso a la cámara para leer los códigos QR. Ve a Ajustes
            y habilita el permiso para CookieBooApp.
          </Text>
        </View>
      );
    }

    return (
      <Camera
        style={styles.camera}
        cameraType="Back"
        scanBarcode
        showFrame
        laserColor="#48cbecff"
        frameColor="#f2f2f7"
        onReadCode={event => {
          const value = event?.nativeEvent?.codeStringValue;
          if (value) {
            handleScan(value, 'scan');
          }
        }}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerTexts}>
          <Text style={styles.title}>Escáner del repartidor</Text>
          <Text style={styles.subtitle}>
            Escanea el código del cliente o ingresa el identificador manualmente.
          </Text>
        </View>
        {onClose ? (
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </Pressable>
        ) : null}
      </View>

      {renderCamera()}

      <View style={styles.statusWrapper}>
        {statusMessage ? (
          <View
            style={[
              styles.statusBox,
              statusMessage.type === 'success'
                ? styles.statusSuccess
                : styles.statusError,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                statusMessage.type === 'success'
                  ? styles.statusTextSuccess
                  : styles.statusTextError,
              ]}
            >
              {statusMessage.text}
            </Text>
          </View>
        ) : (
          <Text style={styles.infoText}>
            Tip: El código QR contiene el identificador único del cliente.
          </Text>
        )}
      </View>

      <View style={styles.manualSection}>
        <Text style={styles.manualTitle}>Ingreso manual</Text>
        <TextInput
          placeholder="ID de cliente (userId)"
          placeholderTextColor={
            isDarkMode ? '#e2e8f0' : 'rgba(15, 23, 42, 0.5)'
          }
          value={manualUserId}
          onChangeText={setManualUserId}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.manualInput}
        />
        <Pressable
          disabled={!manualUserId || processing}
          onPress={() => {
            Keyboard.dismiss();
            handleScan(manualUserId, 'manual');
          }}
          style={({ pressed }) => [
            styles.manualButton,
            (!manualUserId || processing) && styles.manualButtonDisabled,
            pressed && !(processing || !manualUserId)
              ? styles.manualButtonPressed
              : null,
          ]}
        >
          {processing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.manualButtonText}>Registrar sello</Text>
          )}
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.historyButton,
            pressed ? styles.historyButtonPressed : null,
          ]}
          onPress={() =>
            Alert.alert('Historial', 'Funcionalidad en construcción.')
          }
        >
          <Text style={styles.historyButtonText}>
            Ver historial reciente →
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    backgroundColor: '#ffffff',
    gap: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  headerTexts: {
    flex: 1,
    gap: 8,
  },
  closeButton: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#63aee0',
  },
  closeButtonText: {
    color: '#63aee0',
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: '#475569',
  },
  camera: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  permissionBox: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: '#f4f6fb',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 22,
  },
  statusWrapper: {
    minHeight: 56,
    justifyContent: 'center',
  },
  statusBox: {
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  statusSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  statusError: {
    backgroundColor: 'rgba(248, 113, 113, 0.12)',
  },
  statusText: {
    fontSize: 15,
    textAlign: 'center',
  },
  statusTextSuccess: {
    color: '#34d399',
  },
  statusTextError: {
    color: '#f87171',
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  manualSection: {
    borderRadius: 20,
    padding: 20,
    backgroundColor: '#f8fafc',
    gap: 12,
  },
  manualTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  manualInput: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#edf2f7',
    color: '#0f172a',
    fontSize: 15,
  },
  manualButton: {
    borderRadius: 14,
    paddingVertical: 14,
    backgroundColor: '#48e9ecff',
    alignItems: 'center',
  },
  manualButtonPressed: {
    opacity: 0.8,
  },
  manualButtonDisabled: {
    backgroundColor: 'rgba(99, 174, 224, 0.45)',
  },
  manualButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f8fafc',
  },
  historyButton: {
    marginTop: 4,
    paddingVertical: 10,
    alignItems: 'center',
  },
  historyButtonPressed: {
    opacity: 0.7,
  },
  historyButtonText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
});

export default CourierScannerScreen;
