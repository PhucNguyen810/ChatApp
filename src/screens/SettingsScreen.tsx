import React, { useContext, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { Avatar } from '../components/Avatar';
import { ErrorNotice } from '../components/ErrorNotice';
import { PrimaryButton } from '../components/PrimaryButton';
import { signOutUser } from '../services/authService';
import { getAuthErrorMessage } from '../services/authService';
import { colors } from '../theme';

export function SettingsScreen() {
  const user = useContext(AuthContext);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setError('');
    setLoading(true);
    try {
      await signOutUser();
    } catch (signOutError) {
      setError(getAuthErrorMessage(signOutError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.profile}>
        <Avatar name={user?.displayName ?? ''} size={76} />
        <Text style={styles.name}>{user?.displayName || 'Người dùng'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Tài khoản</Text>
        <Text style={styles.description}>Bạn đang đăng nhập bằng Firebase Authentication.</Text>
      </View>
      <ErrorNotice message={error} />
      <PrimaryButton title="Đăng xuất" onPress={handleSignOut} loading={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 18, backgroundColor: colors.background },
  profile: {
    alignItems: 'center',
    padding: 24,
    gap: 8,
    borderRadius: 18,
    backgroundColor: colors.surface,
  },
  name: { marginTop: 5, color: colors.text, fontSize: 19, fontWeight: '700' },
  email: { color: colors.muted, fontSize: 14 },
  card: { padding: 18, gap: 8, borderRadius: 16, backgroundColor: colors.surface },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  description: { color: colors.muted, fontSize: 14, lineHeight: 20 },
});
