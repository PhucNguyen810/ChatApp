import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ErrorNotice } from '../components/ErrorNotice';
import { FormField } from '../components/FormField';
import { PrimaryButton } from '../components/PrimaryButton';
import { signInWithEmail, getAuthErrorMessage } from '../services/authService';
import { colors } from '../theme';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'SignIn'>;

export function SignInScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithEmail(email, password);
    } catch (signInError) {
      setError(getAuthErrorMessage(signInError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.brand}>ChatFlow</Text>
          <Text style={styles.subtitle}>Kết nối và trò chuyện theo thời gian thực</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.title}>Chào mừng trở lại</Text>
          <Text style={styles.hint}>Đăng nhập để tiếp tục trò chuyện</Text>
          <FormField
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            textContentType="emailAddress"
            placeholder="ban@email.com"
          />
          <FormField
            label="Mật khẩu"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="password"
            placeholder="Nhập mật khẩu"
          />
          <ErrorNotice message={error} />
          <PrimaryButton title="Đăng nhập" onPress={handleSignIn} loading={loading} />
          <View style={styles.footer}>
            <Text style={styles.hint}>Chưa có tài khoản? </Text>
            <Pressable onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.link}>Đăng ký</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 30,
  },
  header: { alignItems: 'center', gap: 8 },
  brand: { color: colors.primary, fontSize: 36, fontWeight: '800', letterSpacing: -1 },
  subtitle: { color: colors.muted, fontSize: 15, textAlign: 'center' },
  card: {
    padding: 24,
    gap: 18,
    borderRadius: 22,
    backgroundColor: colors.surface,
  },
  title: { color: colors.text, fontSize: 23, fontWeight: '700' },
  hint: { color: colors.muted, fontSize: 14 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  link: { color: colors.primary, fontSize: 14, fontWeight: '700' },
});
