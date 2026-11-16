import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ErrorNotice } from '../components/ErrorNotice';
import { FormField } from '../components/FormField';
import { PrimaryButton } from '../components/PrimaryButton';
import { getAuthErrorMessage, registerWithEmail } from '../services/authService';
import { colors } from '../theme';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

export function SignUpScreen(_props: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    setError('');
    if (!name.trim()) {
      setError('Vui lòng nhập họ tên.');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu cần có ít nhất 6 ký tự.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp.');
      return;
    }

    setLoading(true);
    try {
      await registerWithEmail(name, email, password);
    } catch (registrationError) {
      setError(getAuthErrorMessage(registrationError));
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
        <Text style={styles.heading}>Tạo tài khoản mới</Text>
        <Text style={styles.subtitle}>Bắt đầu kết nối với bạn bè của bạn</Text>
        <FormField
          label="Họ và tên"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          textContentType="name"
          placeholder="Nguyễn Văn An"
        />
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
          textContentType="newPassword"
          placeholder="Tối thiểu 6 ký tự"
        />
        <FormField
          label="Nhập lại mật khẩu"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          textContentType="newPassword"
          placeholder="Nhập lại mật khẩu"
        />
        <ErrorNotice message={error} />
        <PrimaryButton title="Đăng ký" onPress={handleSignUp} loading={loading} />
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
    gap: 18,
  },
  heading: { color: colors.text, fontSize: 26, fontWeight: '800' },
  subtitle: { marginTop: -10, marginBottom: 8, color: colors.muted, fontSize: 15 },
});
