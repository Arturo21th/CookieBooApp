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
import {
  fetchAllUserIds,
  MinimalUser,
  updateUserRole,
} from '../services/userService';

type AdminRoleManagerScreenProps = {
  profile: UserProfile | null;
  onClose: () => void;
};

type RoleFilterUser = MinimalUser & {
  role: 'admin' | 'courier' | 'user';
};

const AdminRoleManagerScreen = ({
  profile,
  onClose,
}: AdminRoleManagerScreenProps): React.JSX.Element => {
  const [users, setUsers] = React.useState<RoleFilterUser[]>([]);
  const [queryText, setQueryText] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (profile?.role !== 'admin') {
      setLoading(false);
      return;
    }
    let mounted = true;
    setLoading(true);
    fetchAllUserIds()
      .then(list => {
        if (!mounted) {
          return;
        }
        setUsers(
          list.map(item => ({
            ...item,
            role: item.role ?? 'user',
          })),
        );
      })
      .catch(error => {
        console.error('fetchAllUserIds roles error', error);
        Alert.alert(
          'Error',
          'No pudimos cargar los usuarios. Intenta de nuevo más tarde.',
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

  const handleToggleRole = async (user: RoleFilterUser) => {
    if (user.role === 'admin') {
      Alert.alert(
        'Acción no permitida',
        'No puedes modificar el rol de otro administrador desde esta pantalla.',
      );
      return;
    }
    const targetRole = user.role === 'courier' ? 'user' : 'courier';
    setUpdatingId(user.id);
    try {
      await updateUserRole(user.id, targetRole);
      setUsers(prev =>
        prev.map(item =>
          item.id === user.id ? { ...item, role: targetRole } : item,
        ),
      );
      Alert.alert('Rol actualizado', `Nuevo rol: ${targetRole}`);
    } catch (error) {
      console.error('updateUserRole error', error);
      Alert.alert(
        'Error',
        'No se pudo actualizar el rol. Revisa tu conexión e intenta de nuevo.',
      );
    } finally {
      setUpdatingId(null);
    }
  };

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
        <Pressable style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeText}>Cerrar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Administrar roles</Text>
        <Text style={styles.subtitle}>
          Asigna o quita el rol de repartidor para cada usuario.
        </Text>
      </View>
      <Pressable style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeText}>Cerrar</Text>
      </Pressable>
      <TextInput
        placeholder="Buscar por nombre o correo"
        placeholderTextColor="rgba(0,0,0,0.45)"
        value={queryText}
        onChangeText={setQueryText}
        style={styles.search}
      />

      <FlatList
        data={filteredUsers}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.name}>{item.displayName}</Text>
              <Text style={styles.email}>{item.email}</Text>
              <Text style={styles.role}>
                Rol actual:{' '}
                {item.role === 'courier'
                  ? 'Repartidor'
                  : item.role === 'admin'
                    ? 'Administrador'
                    : 'Usuario'}
              </Text>
            </View>
            {item.role === 'admin' ? (
              <Text style={styles.adminHint}>
                Este usuario es administrador.
              </Text>
            ) : (
              <Pressable
                disabled={updatingId === item.id}
                onPress={() => handleToggleRole(item)}
                style={({ pressed }) => [
                  styles.toggleButton,
                  pressed ? styles.toggleButtonPressed : null,
                  updatingId === item.id ? styles.toggleButtonDisabled : null,
                ]}
              >
                {updatingId === item.id ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.toggleButtonText}>
                    {item.role === 'courier'
                      ? 'Quitar rol de repartidor'
                      : 'Convertir en repartidor'}
                  </Text>
                )}
              </Pressable>
            )}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'column',
    gap: 8,
  },
  title: {
    fontSize: 26,
    color: '#000000',
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 8,
    color: 'rgba(0,0,0,0.65)',
    fontSize: 15,
  },
  search: {
    marginTop: 16,
    borderRadius: 14,
    backgroundColor: '#f5f5f7',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#000000',
  },
  list: {
    marginTop: 24,
    paddingBottom: 24,
    gap: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  name: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '700',
  },
  email: {
    color: 'rgba(0,0,0,0.7)',
    fontSize: 14,
  },
  role: {
    color: 'rgba(0,0,0,0.6)',
    fontSize: 13,
  },
  adminHint: {
    marginTop: 8,
    color: '#f97316',
    fontWeight: '600',
  },
  toggleButton: {
    backgroundColor: '#63aee0',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  toggleButtonPressed: {
    opacity: 0.85,
  },
  toggleButtonDisabled: {
    opacity: 0.6,
  },
  toggleButtonText: {
    color: '#f8fafc',
    fontWeight: '600',
    textAlign: 'center',
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    backgroundColor: '#ffffff',
  },
  closeButton: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#63aee0',
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  closeText: {
    color: '#63aee0',
    fontWeight: '700',
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
});

export default AdminRoleManagerScreen;
