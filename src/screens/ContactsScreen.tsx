import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Avatar } from '../components/Avatar';
import { AuthContext } from '../context/AuthContext';
import {
  subscribePresence,
  subscribeUsers,
} from '../services/chatService';
import { colors } from '../theme';
import type { Presence, RootStackParamList, UserProfile } from '../types';

type ContactsNavigation = NativeStackNavigationProp<RootStackParamList>;

export function ContactsScreen() {
  const user = useContext(AuthContext);
  const navigation = useNavigation<ContactsNavigation>();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [presence, setPresence] = useState<Record<string, Presence>>({});
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const handleError = (reason: Error) => setError(reason.message);
    const unsubscribeUsers = subscribeUsers(setUsers, handleError);
    const unsubscribePresence = subscribePresence(setPresence, handleError);
    return () => {
      unsubscribeUsers();
      unsubscribePresence();
    };
  }, []);

  const contacts = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    return users
      .filter(profile => profile.uid !== user?.uid)
      .filter(profile => !term || profile.name.toLocaleLowerCase().includes(term) ||
        profile.email.toLocaleLowerCase().includes(term))
      .sort((first, second) => first.name.localeCompare(second.name, 'vi'));
  }, [search, user?.uid, users]);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Danh bạ</Text>
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Tìm theo tên hoặc email"
        placeholderTextColor={colors.muted}
        style={styles.search}
        returnKeyType="search"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        data={contacts}
        keyExtractor={item => item.uid}
        contentContainerStyle={contacts.length ? styles.list : styles.emptyList}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {search ? 'Không tìm thấy người dùng.' : 'Chưa có người dùng nào khác.'}
          </Text>
        }
        renderItem={({ item }) => {
          const online = presence[item.uid]?.state === 'online';
          return (
            <Pressable
              onPress={() =>
                navigation.navigate('Chat', { peerId: item.uid, peerName: item.name })
              }
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            >
              <Avatar name={item.name} online={online} size={52} />
              <View style={styles.details}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <Text style={[styles.status, online && styles.online]}>
                  {online ? 'Đang hoạt động' : 'Ngoại tuyến'}
                </Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 18, backgroundColor: colors.background },
  heading: { marginHorizontal: 20, marginBottom: 14, color: colors.text, fontSize: 26, fontWeight: '800' },
  search: {
    height: 48,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 15,
    borderRadius: 13,
    color: colors.text,
    backgroundColor: colors.surface,
    fontSize: 15,
  },
  list: { paddingHorizontal: 16, paddingBottom: 8 },
  emptyList: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyText: { color: colors.muted, fontSize: 14, textAlign: 'center' },
  row: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 7,
    borderRadius: 15,
    backgroundColor: colors.surface,
  },
  pressed: { opacity: 0.75 },
  details: { flex: 1, gap: 5 },
  name: { color: colors.text, fontSize: 15, fontWeight: '700' },
  status: { color: colors.muted, fontSize: 13 },
  online: { color: colors.online },
  arrow: { marginRight: 4, color: colors.muted, fontSize: 26 },
  error: { marginHorizontal: 20, marginBottom: 8, color: colors.danger },
});
