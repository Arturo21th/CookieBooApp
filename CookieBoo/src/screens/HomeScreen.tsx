import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  totalScans: 8,
  completedScans: 3,
};

const logoUri =
  'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?auto=format&w=120&q=80';

const settingsIconUri =
  'https://img.icons8.com/ios-filled/100/ffffff/settings.png';

const qrIconUri = 'https://img.icons8.com/ios-filled/100/ffffff/qr-code.png';
const cardIconUri =
  'https://img.icons8.com/ios-filled/100/ffffff/bank-card-back-side.png';
const chatIconUri =
  'https://img.icons8.com/ios-filled/100/ffffff/filled-chat.png';

const getQrUri = (userId: string) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(
    userId,
  )}`;

const formatDate = (value: Date) =>
  value.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const settingsOptions = [
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

function HomeScreen(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const accent = isDarkMode ? Colors.light : '#63aee0';
  const [tab, setTab] = React.useState<'qr' | 'card' | 'messages'>('qr');
  const [settingsVisible, setSettingsVisible] = React.useState(false);
  const [loading] = React.useState(false);
  const [error] = React.useState<string | null>(null);
  const stampItems = React.useMemo(
    () =>
      Array.from({ length: defaultProfile.totalScans }, (_, index) => ({
        id: index,
        filled: index < defaultProfile.completedScans,
      })),
    [],
  );
  const lastScanLabel = formatDate(new Date());

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
            source={{ uri: logoUri }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text
              style={[
                styles.username,
                { color: isDarkMode ? Colors.white : Colors.black },
              ]}
            >
              ¡Hola, Cookie Lover!
            </Text>
            <Text
              style={[
                styles.tier,
                { color: isDarkMode ? Colors.light : Colors.dark },
              ]}
            >
              {defaultProfile.tier}
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
                source={{ uri: getQrUri('cookie-lover') }}
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
          <View
            style={[
              styles.progressCard,
              { backgroundColor: isDarkMode ? Colors.black : Colors.white },
            ]}
          >
            <View style={styles.progressHeader}>
              <Text
                style={[
                  styles.progressTitle,
                  { color: isDarkMode ? Colors.white : Colors.black },
                ]}
              >
                Tu boleta de sellos
              </Text>
              <Text style={[styles.progressCount, { color: accent }]}>
                {defaultProfile.completedScans}/{defaultProfile.totalScans}
              </Text>
            </View>

            <View style={styles.stampsGrid}>
              {stampItems.map(item => (
                <View key={item.id} style={styles.stampSlot}>
                  {item.filled ? (
                    <View style={[styles.stampFilled, { backgroundColor: accent }]}>
                      <Text style={styles.stampEmoji}>🍪</Text>
                    </View>
                  ) : (
                    <View
                      style={[
                        styles.stampOutline,
                        {
                          borderColor: accent,
                        },
                      ]}
                    />
                  )}
                </View>
              ))}
            </View>

            <View style={styles.rewards}>
              <Text
                style={[
                  styles.rewardText,
                  { color: isDarkMode ? Colors.light : Colors.dark },
                ]}
              >
                Completa los 8 sellos y obtén 20% de descuento en tu próxima compra.
              </Text>
              <Text
                style={[
                  styles.metaText,
                  { color: isDarkMode ? Colors.light : Colors.dark },
                ]}
              >
                {lastScanLabel}
              </Text>
            </View>
          </View>
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
            <Text
              style={[
                styles.messagesText,
                { color: isDarkMode ? Colors.light : Colors.dark },
              ]}
            >
              Aquí verás avisos y promociones especiales cuando estén disponibles.
            </Text>
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
        onSelect={id => {
          Alert.alert('Acción seleccionada', id);
          setSettingsVisible(false);
        }}
      />
      </View>
    </SafeAreaView>
  );
}

type SettingsSheetProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
};

function SettingsSheet({ visible, onClose, onSelect }: SettingsSheetProps) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.sheetOverlay}>
        <Pressable style={styles.sheetBackdrop} onPress={onClose} />
        <View style={styles.sheetPanel}>
          <Text style={styles.sheetTitle}>Configuración</Text>
          {settingsOptions.map(option => (
            <Pressable
              key={option.id}
              onPress={() => onSelect(option.id)}
              style={styles.sheetButton}
            >
              <Image source={{ uri: option.icon }} style={styles.sheetButtonIcon} />
              <Text style={styles.sheetButtonText}>{option.label}</Text>
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
    width: 52,
    height: 52,
    borderRadius: 14,
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
  progressCard: {
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
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
  stampsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  stampSlot: {
    width: '22%',
    aspectRatio: 1,
  },
  stampOutline: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  stampFilled: {
    flex: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stampEmoji: {
    fontSize: 18,
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
});

export default HomeScreen;
