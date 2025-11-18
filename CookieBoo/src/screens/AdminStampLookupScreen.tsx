import React from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { UserProfile } from '../services/firestoreService';
import { fetchAllUserIds, MinimalUser } from '../services/userService';
import { fetchStampCard, StampCard } from '../services/stampsService';

type StampState = {
  loading: boolean;
  card: StampCard | null;
};

type AdminStampLookupScreenProps = {
  profile: UserProfile | null;
  onClose: () => void;
};

function AdminStampLookupScreen({
  profile,
  onClose,
}: AdminStampLookupScreenProps): React.JSX.Element {
  const [users, setUsers] = React.useState<MinimalUser[]>([]);
  const [queryText, setQueryText] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [stampMap, setStampMap] = React.useState<Record<string, StampState>>({});

  React.useEffect(() => {
    if (profile?.role !== 'admin') {
      setLoading(false);
      return;
    }
    let mounted = true;
    setLoading(true);
    fetchAllUserIds()
      .then(list => {
        if (mounted) {
          setUsers(list);
          console.log('Usuarios cargados', list.length);
        }
      })
      .catch(error => {
        console.error('fetchAllUserIds error', error);
        Alert.alert(
          'Error',
          'No pudimos obtener usuarios para consultar sus sellos.',
        );
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [profile?.role]);

  const filteredUsers = React.useMemo(() => {
    const q = queryText.trim().toLowerCase();
    if (!q) {
      return users;
    }
    return users.filter(user => {
      const name = user.displayName?.toLowerCase() ?? '';
      const email = user.email?.toLowerCase() ?? '';
      return name.includes(q) || email.includes(q);
    });
  }, [users, queryText]);

  const ensureStampLoaded = React.useCallback(
    (userId: string, force = false) => {
      const currentEntry = stampMap[userId];
      if (!force) {
        if (currentEntry?.loading) {
          console.log('Fetch already in progress for', userId);
          return;
        }
        if (currentEntry?.card) {
          console.log('Stamp already cached', userId);
          return;
        }
      }

      setStampMap(prev => ({
        ...prev,
        [userId]: { loading: true, card: prev[userId]?.card ?? null },
      }));

      console.log('fetching stamp for', userId);
      fetchStampCard(userId)
        .then(card => {
          setStampMap(prev => ({
            ...prev,
            [userId]: { loading: false, card },
          }));
          console.log('stamp loaded', userId, card);
        })
        .catch(error => {
          console.error('fetchStampCard error', error);
          setStampMap(prev => ({
            ...prev,
            [userId]: { loading: false, card: null },
          }));
        });
    },
    [stampMap],
  );

  React.useEffect(() => {
    console.log('filtered users visible', filteredUsers.length);
    filteredUsers.forEach(user => {
      console.log('requesting stamps for', user.id);
      ensureStampLoaded(user.id);
    });
  }, [filteredUsers, ensureStampLoaded]);

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

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#63aee0" />
        <Text style={styles.loaderText}>Cargando usuarios...</Text>
        <Pressable style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeText}>Cerrar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Consultar sellos</Text>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>Cerrar</Text>
          </Pressable>
        </View>
        <Text style={styles.subtitle}>
          Busca por nombre o correo para revisar los sellos acumulados.
        </Text>
      </View>
      <TextInput
        placeholder="Ej. Ana o ana@email.com"
        placeholderTextColor="rgba(0,0,0,0.45)"
        value={queryText}
        onChangeText={setQueryText}
        style={styles.search}
      />

      <FlatList
        data={filteredUsers}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const stampState = stampMap[item.id];
          const isLoadingStamp = !stampState || stampState.loading;
          const completed = stampState?.card?.completedScans ?? 0;
          const total = stampState?.card?.totalScans ?? 8;
          return (
            <View style={styles.card}>
              <View>
                <Text style={styles.name}>{item.displayName}</Text>
                <Text style={styles.email}>{item.email}</Text>
              </View>
              <View style={styles.stampInfo}>
                {isLoadingStamp ? (
                  <ActivityIndicator size="small" color="#63aee0" />
                ) : (
                  <>
                    <Text style={styles.stampLabel}>Sellos</Text>
                    <Text style={styles.stampCount}>
                      {completed}/{total}
                    </Text>
                    <Text style={styles.stampHint}>
                      {completed >= total ? 'Premio listo 🎉' : 'Sigue acumulando'}
                    </Text>
                  </>
                )}
              </View>
              {!isLoadingStamp && (
                <Pressable
                  onPress={() => ensureStampLoaded(item.id, true)}
                  style={styles.refreshButton}
                >
                  <Text style={styles.refreshText}>Actualizar</Text>
                </Pressable>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              No encontramos usuarios con ese criterio.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  header: {
    flexDirection: 'column',
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#000000',
  },
  subtitle: {
    marginTop: 8,
    color: 'rgba(0,0,0,0.65)',
    fontSize: 15,
    maxWidth: 240,
  },
  search: {
    marginTop: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f5f5f7',
    color: '#000000',
  },
  list: {
    marginTop: 24,
    paddingBottom: 48,
    gap: 16,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    backgroundColor: '#ffffff',
    gap: 12,
  },
  name: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '700',
  },
  email: {
    color: 'rgba(0,0,0,0.6)',
    fontSize: 14,
    marginTop: 2,
  },
  stampInfo: {
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(72, 184, 236, 0.1)',
    alignItems: 'flex-start',
    gap: 4,
  },
  stampLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(0,0,0,0.65)',
  },
  stampCount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000000',
  },
  stampHint: {
    fontSize: 13,
    color: 'rgba(0,0,0,0.6)',
  },
  refreshButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  refreshText: {
    color: '#63aee0',
    fontWeight: '600',
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    gap: 12,
    paddingHorizontal: 24,
  },
  loaderText: {
    color: '#000000',
  },
  blocked: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
    backgroundColor: '#ffffff',
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
    fontWeight: '700',
  },
  empty: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    color: 'rgba(0,0,0,0.6)',
  },
});

export default AdminStampLookupScreen;
