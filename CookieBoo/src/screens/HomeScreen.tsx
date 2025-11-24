import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import {
  listenToUserMessages,
  listenToUserProfile,
  UserMessage,
  UserProfile,
} from '../services/firestoreService';
import AdminStampLookupScreen from './AdminStampLookupScreen';
import AdminRoleManagerScreen from './AdminRoleManagerScreen';
import AdminBroadcastScreen from './AdminBroadcastScreen';
import CourierScannerScreen from './CourierScannerScreen';
import UpdateNameScreen from './UpdateNameScreen';
import firestore from '@react-native-firebase/firestore';

const Colors = {
  white: '#ffffff',
  black: '#0f172a',
  light: '#a7d8ff',
  dark: '#1f2933',
  darker: '#080b12',
  lighter: '#f7f3ef',
};

const defaultProfile = {
  tier: 'Cliente Cookie Lover',
  totalScans: 10,
  completedScans: 3,
};

const logoImage = require('../../assets/img/Logo_pantalla.png');

const settingsIconUri =
  'https://img.icons8.com/ios-filled/100/ffffff/settings.png';

const qrIconUri = 'https://img.icons8.com/ios-filled/100/ffffff/qr-code.png';
const cardIconUri =
  'https://img.icons8.com/ios-filled/100/ffffff/bank-card-back-side.png';
const chatIconUri =
  'https://img.icons8.com/ios-filled/100/ffffff/filled-chat.png';
const cardBg = require('../../assets/img/Tarjeta_bg.png');
const stampIcon = require('../../assets/img/stamp.png');
const stampPositions: Array<{x: number; y: number}> = [
  {x: 0.18, y: 0.42},
  {x: 0.32, y: 0.42},
  {x: 0.47, y: 0.42},
  {x: 0.62, y: 0.42},
  {x: 0.76, y: 0.42},
  {x: 0.18, y: 0.70},
  {x: 0.32, y: 0.70},
  {x: 0.47, y: 0.70},
  {x: 0.62, y: 0.70},
  {x: 0.76, y: 0.70},
];

const getQrUri = (userId: string) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(
    userId,
  )}`;

const formatDate = (value?: Date | null) => {
  if (!value) {
    return null;
  }
  return value.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const settingsOptions: Array<{
  id: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
  roles?: Array<'admin' | 'courier' | 'user'>;
}> = [
  {
    id: 'update-name',
    label: 'Actualizar tu nombre',
    icon: 'https://img.icons8.com/ios-filled/50/000000/edit.png',
  },
  {
    id: 'change-password',
    label: 'Cambiar contraseña',
    icon: 'https://img.icons8.com/ios-filled/50/000000/password.png',
  },
  {
    id: 'help',
    label: 'Ayuda',
    icon: 'https://img.icons8.com/ios-filled/50/000000/help.png',
  },
  {
    id: 'courier-scanner',
    label: 'Escanear QR',
    icon: 'https://img.icons8.com/ios-filled/50/1f2933/qr-code.png',
    roles: ['admin', 'courier'],
  },
  {
    id: 'admin-stamps',
    label: 'Consultar sellos',
    icon: 'https://img.icons8.com/ios-filled/50/1f2933/stamp.png',
    adminOnly: true,
  },
  {
    id: 'admin-roles',
    label: 'Administrar roles',
    icon: 'https://img.icons8.com/ios-filled/50/1f2933/conference-call.png',
    adminOnly: true,
  },
  {
    id: 'admin-broadcast',
    label: 'Enviar mensaje',
    icon: 'https://img.icons8.com/ios-filled/50/1f2933/paper-plane.png',
    adminOnly: true,
  },
  {
    id: 'logout',
    label: 'Cerrar sesión',
    icon: 'https://img.icons8.com/ios-filled/50/000000/exit.png',
  },
  {
    id: 'delete-account',
    label: 'Eliminar cuenta',
    icon: 'https://img.icons8.com/ios-filled/50/000000/delete-forever.png',
  },
];

type HomeScreenProps = {
  user: FirebaseAuthTypes.User;
};

function HomeScreen({ user }: HomeScreenProps): React.JSX.Element {
  // For now force light mode across the app
  const isDarkMode = false;
  const accent = isDarkMode ? Colors.light : '#63aee0';
  const [tab, setTab] = React.useState<'qr' | 'card' | 'messages'>('qr');
  const [settingsVisible, setSettingsVisible] = React.useState(false);
  const [adminView, setAdminView] = React.useState<
    'stamps' | 'roles' | 'broadcast' | 'scanner' | 'update-name' | null
  >(null);
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [messages, setMessages] = React.useState<UserMessage[]>([]);
  const [loadingProfile, setLoadingProfile] = React.useState(true);
  const [loadingMessages, setLoadingMessages] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [boardSize, setBoardSize] = React.useState({ width: 0, height: 0 });
  const [lastRewardShown, setLastRewardShown] = React.useState<number | null>(null);
  const [rewardMessage, setRewardMessage] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [resettingPassword, setResettingPassword] = React.useState(false);

  React.useEffect(() => {
    setLoadingProfile(true);
    const unsubscribe = listenToUserProfile(
      user.uid,
      (nextProfile: UserProfile | null) => {
        setProfile(nextProfile);
        setLoadingProfile(false);
        if (!nextProfile) {
          setError('No pudimos encontrar tu Cookie Pass.');
        } else {
          setError(null);
        }
      },
      (err: Error) => {
        setError('Hubo un problema al cargar tu Cookie Pass.');
        console.error('listenToUserProfile', err);
        setLoadingProfile(false);
      },
    );

    return unsubscribe;
  }, [user.uid]);

  React.useEffect(() => {
    auth()
      .currentUser?.getIdTokenResult(true)
      .then(result => {
        console.log('claims', result.claims);
      })
      .catch(err => {
        console.error('claims error', err);
      });
  }, []);

  React.useEffect(() => {
    setLoadingMessages(true);
    const unsubscribe = listenToUserMessages(
      user.uid,
      10,
      (nextMessages: UserMessage[]) => {
        setMessages(nextMessages);
        setLoadingMessages(false);
      },
      (err: Error) => {
        console.error('listenToUserMessages', err);
        setLoadingMessages(false);
      },
    );

    return unsubscribe;
  }, [user.uid]);

  const totalScans = profile?.stampsGoal ?? defaultProfile.totalScans;
  const completedScans = Math.min(
    profile?.stampsCompleted ?? defaultProfile.completedScans,
    totalScans,
  );
  const stampItems = React.useMemo(
    () =>
      Array.from({ length: totalScans }, (_, index) => ({
        id: index,
        filled: index < completedScans,
      })),
    [totalScans, completedScans],
  );
  const lastScanLabel =
    formatDate(profile?.lastScanAt) ?? formatDate(new Date()) ?? '';
  const qrData = profile?.qrCodeData ?? user.uid;
  const displayName = profile?.displayName ?? user.displayName ?? 'Cookie Lover';
  const tier = profile?.tier ?? defaultProfile.tier;
  const loading = loadingProfile;

  React.useEffect(() => {
    // Mostrar aviso cuando llega a 5 o 10 sellos
    const milestones: Array<{ value: number; message: string }> = [
      { value: 5, message: '¡Tienes un 25% de descuento!' },
      { value: 10, message: '¡Tienes un 50% de descuento!' },
    ];

    const hit = milestones.find(m => completedScans === m.value);
    if (hit && lastRewardShown !== hit.value) {
      setRewardMessage(hit.message);
      setLastRewardShown(hit.value);
    }

    if (completedScans < 5 && lastRewardShown !== null) {
      setLastRewardShown(null);
      setRewardMessage(null);
    }
  }, [completedScans, lastRewardShown]);

  const handleSettingsSelect = React.useCallback(
    async (id: string) => {
      if (id === 'logout') {
        try {
          await auth().signOut();
        } catch (signOutError) {
          console.error('signOut error', signOutError);
          Alert.alert(
            'Ups',
            'No pudimos cerrar sesión. Inténtalo de nuevo en un momento.',
          );
        }
        setSettingsVisible(false);
        return;
      }

      if (id === 'admin-stamps') {
        setAdminView('stamps');
        setSettingsVisible(false);
        return;
      }

      if (id === 'admin-roles') {
        setAdminView('roles');
        setSettingsVisible(false);
        return;
      }

      if (id === 'admin-broadcast') {
        setAdminView('broadcast');
        setSettingsVisible(false);
        return;
      }

      if (id === 'courier-scanner') {
        setAdminView('scanner');
        setSettingsVisible(false);
        return;
      }

      if (id === 'update-name') {
        setAdminView('update-name');
        setSettingsVisible(false);
        return;
      }

      if (id === 'change-password') {
        if (!user.email) {
          Alert.alert(
            'Correo no disponible',
            'No encontramos tu correo. Vuelve a iniciar sesión e inténtalo otra vez.',
          );
          setSettingsVisible(false);
          return;
        }
        if (resettingPassword) {
          return;
        }
        setResettingPassword(true);
        try {
          await auth().sendPasswordResetEmail(user.email);
          Alert.alert(
            'Revisa tu correo',
            'Te enviamos un enlace para que cambies tu contraseña.',
          );
        } catch (err) {
          console.error('password reset error', err);
          Alert.alert(
            'No se pudo enviar',
            'Inténtalo nuevamente o verifica tu conexión.',
          );
        } finally {
          setResettingPassword(false);
          setSettingsVisible(false);
        }
        return;
      }

      if (id === 'delete-account') {
        Alert.alert(
          'Eliminar cuenta',
          '¿Seguro que quieres eliminar tu cuenta? Esta acción no se puede deshacer.',
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Eliminar',
              style: 'destructive',
              onPress: async () => {
                if (deleting) {
                  return;
                }
                setDeleting(true);
                try {
                  const uid = user.uid;
                  await firestore().collection('users').doc(uid).delete().catch(() => {});
                  await auth().currentUser?.delete();
                } catch (err) {
                  console.error('delete account error', err);
                  Alert.alert(
                    'No pudimos eliminar tu cuenta',
                    'Inténtalo de nuevo. Puede que necesites volver a iniciar sesión para confirmar.',
                  );
                } finally {
                  setDeleting(false);
                }
              },
            },
          ],
        );
        setSettingsVisible(false);
        return;
      }

      Alert.alert('Acción seleccionada', id);
      setSettingsVisible(false);
    },
    [deleting, user.uid],
  );

  if (adminView === 'update-name') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <UpdateNameScreen
          userId={user.uid}
          currentName={displayName}
          onClose={() => setAdminView(null)}
        />
      </SafeAreaView>
    );
  }

  if (adminView === 'stamps') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AdminStampLookupScreen
          profile={profile}
          onClose={() => setAdminView(null)}
        />
      </SafeAreaView>
    );
  }

  if (adminView === 'roles') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AdminRoleManagerScreen
          profile={profile}
          onClose={() => setAdminView(null)}
        />
      </SafeAreaView>
    );
  }

  if (adminView === 'broadcast') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AdminBroadcastScreen
          profile={profile}
          onClose={() => setAdminView(null)}
        />
      </SafeAreaView>
    );
  }

  if (adminView === 'scanner') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <CourierScannerScreen
          onClose={() => setAdminView(null)}
          role={profile?.role ?? null}
          currentUserId={user?.uid ?? null}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: isDarkMode ? Colors.darker : Colors.lighter },
      ]}
    >
      <View
        style={[
          styles.screen,
          { backgroundColor: isDarkMode ? Colors.darker : Colors.lighter },
        ]}
      >
      <View style={styles.header}>
        <View style={styles.profile}>
          <Image
            accessibilityLabel="Avatar CookieBoo"
            source={logoImage}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
              <Text
                style={[
                  styles.username,
                  { color: isDarkMode ? Colors.white : Colors.black },
                ]}
              >
                ¡Hola, {displayName}!
              </Text>
            <Text
              style={[
                styles.tier,
                { color: isDarkMode ? Colors.light : Colors.dark },
              ]}
            >
                {tier}
              </Text>
          </View>
        </View>
        <Pressable
          accessibilityLabel="Abrir ajustes"
          onPress={() => setSettingsVisible(true)}
          style={styles.settingsButton}
        >
          <Image
            source={{ uri: settingsIconUri }}
            style={[styles.settingsIcon, { tintColor: '#000000' }]}
          />
        </Pressable>
      </View>

      <View style={styles.content}>
        {error ? (
          <View
            style={[
              styles.errorBox,
              { backgroundColor: isDarkMode ? Colors.black : '#fee2e2' },
            ]}
          >
            <Text
              style={[
                styles.errorText,
                { color: isDarkMode ? Colors.light : '#63aee0' },
              ]}
            >
              {error}
            </Text>
          </View>
        ) : null}

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="small" color={accent} />
            <Text
              style={[
                styles.loadingText,
                { color: isDarkMode ? Colors.light : Colors.dark },
              ]}
            >
              Cargando tus datos...
            </Text>
          </View>
        ) : null}

        {tab === 'qr' && (
          <View style={styles.qrWrapper}>
            <View
              style={[
                styles.qrCard,
                { backgroundColor: isDarkMode ? Colors.black : Colors.white },
              ]}
            >
              <Text
                style={[
                  styles.sectionTitle,
                  { color: isDarkMode ? Colors.white : Colors.black },
                ]}
              >
                Tu código Cookie Pass
              </Text>
              <Image
                accessibilityLabel="Código QR personal"
                source={{ uri: getQrUri(qrData) }}
                style={styles.qr}
              />
              <Text
                style={[
                  styles.qrHint,
                  { color: isDarkMode ? Colors.light : Colors.dark },
                ]}
              >
                Muéstrale este QR al repartidor para sumar un sello.
              </Text>
            </View>
          </View>
        )}

        {tab === 'card' && (
          <>
            <ImageBackground
              source={cardBg}
              style={styles.stampBoardBg}
              imageStyle={styles.cardImage}
              onLayout={event => {
                const {width, height} = event.nativeEvent.layout;
                setBoardSize({width, height});
              }}>
              <View style={styles.boardContent}>
              <View style={styles.stampLayer}>
                {stampItems.map((item, index) => {
                  const pos = stampPositions[index] ?? {x: 0, y: 0};
                  const isTransparentStamp = index === 4 || index === 9;
                  const sizePx =
                    boardSize.width > 0 ? boardSize.width * 0.13 : 70;
                  const leftPx = pos.x * boardSize.width - sizePx / 2;
                  const topPx = pos.y * boardSize.height - sizePx / 2;
                  return (
                    <View
                      key={item.id}
                      style={[
                        styles.stampSlot,
                        {
                          width: sizePx,
                          height: sizePx,
                          left: leftPx,
                          top: topPx,
                          borderRadius: sizePx / 2,
                        },
                      ]}>
                      {item.filled ? (
                        <Image
                          source={stampIcon}
                          style={styles.stampImage}
                          resizeMode="contain"
                        />
                      ) : (
                        <View
                          style={[
                            styles.stampOutline,
                            {
                              borderColor: isTransparentStamp
                                ? 'transparent'
                                : accent,
                              backgroundColor: isTransparentStamp
                                ? 'transparent'
                                : 'rgba(255,255,255,0.92)',
                            },
                          ]}
                        />
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          </ImageBackground>
            <View style={styles.progressFooter}>
              <Text style={styles.progressTitle}>Progreso</Text>
              <Text style={styles.progressCount}>
                {completedScans}/{totalScans}
              </Text>
            </View>
            {rewardMessage ? (
              <View style={styles.rewardBanner}>
                <Text style={styles.rewardBannerText}>{rewardMessage}</Text>
              </View>
            ) : null}
          </>
        )}

        {tab === 'messages' && (
          <View
            style={[
              styles.messagesCard,
              { backgroundColor: isDarkMode ? Colors.black : Colors.white },
            ]}
          >
            <Text
              style={[
                styles.messagesTitle,
                { color: isDarkMode ? Colors.white : Colors.black },
              ]}
            >
              Mensajes
            </Text>
            {loadingMessages ? (
              <View style={styles.messagesLoading}>
                <ActivityIndicator size="small" color={accent} />
                <Text
                  style={[
                    styles.loadingText,
                    { color: isDarkMode ? Colors.light : Colors.dark },
                  ]}
                >
                  Buscando mensajes...
                </Text>
              </View>
            ) : messages.length > 0 ? (
              <ScrollView contentContainerStyle={styles.messagesList}>
                {messages.map(message => (
                  <View
                    key={message.id}
                    style={[
                      styles.messageItem,
                      {
                        borderColor: isDarkMode
                          ? 'rgba(255,255,255,0.2)'
                          : 'rgba(0,0,0,0.08)',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageTitle,
                        { color: isDarkMode ? Colors.white : Colors.black },
                      ]}
                    >
                      {message.title}
                    </Text>
                    <Text
                      style={[
                        styles.messageBody,
                        { color: isDarkMode ? Colors.light : Colors.dark },
                      ]}
                    >
                      {message.body}
                    </Text>
                    <Text
                      style={[
                        styles.messageDate,
                        { color: isDarkMode ? Colors.light : Colors.dark },
                      ]}
                    >
                      {formatDate(message.createdAt) ?? 'Reciente'}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <Text
                style={[
                  styles.messagesText,
                  { color: isDarkMode ? Colors.light : Colors.dark },
                ]}
              >
                Aquí verás avisos y promociones especiales cuando estén disponibles.
              </Text>
            )}
          </View>
        )}
      </View>

      <View
        style={[
          styles.menu,
          { backgroundColor: isDarkMode ? Colors.black : Colors.white },
        ]}
      >
        {[
          { id: 'qr' as const, label: 'QR Code', icon: qrIconUri },
          { id: 'card' as const, label: 'Card', icon: cardIconUri },
          { id: 'messages' as const, label: 'Messages', icon: chatIconUri },
        ].map(item => {
          const isActive = tab === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => setTab(item.id)}
              style={[
                styles.menuButton,
                {
                  backgroundColor: isActive ? accent : 'transparent',
                },
              ]}
            >
              <Image
                source={{ uri: item.icon }}
                style={[
                  styles.menuIcon,
                  { tintColor: isActive ? '#ffffff' : accent },
                ]}
              />
              <Text
                style={[
                  styles.menuLabel,
                  { color: isActive ? '#ffffff' : accent },
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <SettingsSheet
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        onSelect={handleSettingsSelect}
        role={profile?.role}
      />
      </View>
    </SafeAreaView>
  );
}

type SettingsSheetProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  role?: string | null;
};

function SettingsSheet({ visible, onClose, onSelect, role }: SettingsSheetProps) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.sheetOverlay}>
        <Pressable style={styles.sheetBackdrop} onPress={onClose} />
        <View style={styles.sheetPanel}>
          <Text style={styles.sheetTitle}>Configuración</Text>
          {settingsOptions
            .filter(option => {
              const currentRole = role ?? 'user';
              if (option.adminOnly && currentRole !== 'admin') {
                return false;
              }
              if (option.roles && !option.roles.includes(currentRole as 'admin' | 'courier' | 'user')) {
                return false;
              }
              return true;
            })
            .map(option => (
              <Pressable
                key={option.id}
                onPress={() => onSelect(option.id)}
                style={styles.sheetButton}
              >
                <Image source={{ uri: option.icon }} style={styles.sheetButtonIcon} />
                <Text
                  style={[
                    styles.sheetButtonText,
                    option.id === 'delete-account' ? styles.dangerText : null,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  screen: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 18,
  },
  profileInfo: {
    marginLeft: 12,
  },
  username: {
    fontSize: 20,
    fontWeight: '700',
  },
  tier: {
    fontSize: 14,
    opacity: 0.8,
  },
  settingsButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  settingsIcon: {
    width: 22,
    height: 22,
  },
  content: {
    flex: 1,
    gap: 16,
  },
  qrWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
  },
  qrCard: {
    alignItems: 'center',
    borderRadius: 28,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  qr: {
    width: 230,
    height: 230,
    borderRadius: 18,
  },
  qrHint: {
    marginTop: 16,
    fontSize: 15,
    textAlign: 'center',
  },
  stampBoardBg: {
    width: '100%',
    aspectRatio: 1181 / 675,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  cardImage: {
    borderRadius: 24,
    opacity: 1,
  },
  boardContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 14,
    alignItems: 'stretch',
  },
  progressHeaderCompact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  progressCount: {
    fontSize: 18,
    fontWeight: '700',
  },
  progressFooter: {
    marginTop: 8,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  rewardBanner: {
    marginTop: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#fef3c7',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#f59e0b',
    alignItems: 'center',
  },
  rewardBannerText: {
    color: '#92400e',
    fontWeight: '700',
  },
  stampLayer: {
    flex: 1,
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  stampSlot: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stampOutline: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    borderWidth: 3,
    borderStyle: 'solid',
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  stampFilled: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  stampEmoji: {
    fontSize: 18,
  },
  stampImage: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
  },
  rewards: {
    marginTop: 20,
  },
  rewardText: {
    fontSize: 15,
    fontWeight: '500',
  },
  metaText: {
    marginTop: 6,
    fontSize: 13,
    opacity: 0.7,
  },
  messagesCard: {
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  messagesTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  messagesText: {
    fontSize: 15,
    lineHeight: 22,
  },
  messagesLoading: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  messagesList: {
    marginTop: 8,
    gap: 12,
  },
  messageItem: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.08)',
    gap: 4,
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  messageBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageDate: {
    fontSize: 12,
    opacity: 0.7,
  },
  menu: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 28,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  menuButton: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  menuIcon: {
    width: 20,
    height: 20,
  },
  menuLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  errorBox: {
    borderRadius: 16,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#fca5a5',
  },
  errorText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sheetOverlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'flex-end',
    paddingTop: 60,
    paddingBottom: 40,
  },
  sheetBackdrop: {
    flex: 1,
  },
  sheetPanel: {
    width: '70%',
    maxWidth: 320,
    backgroundColor: '#ffffff',
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2933',
    marginBottom: 8,
  },
  sheetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  sheetButtonIcon: {
    width: 20,
    height: 20,
    tintColor: '#1f2933',
  },
  sheetButtonText: {
    color: '#1f2933',
    fontSize: 16,
    fontWeight: '600',
  },
  dangerText: {
    color: '#b91c1c',
  },
});

export default HomeScreen;
