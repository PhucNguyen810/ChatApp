import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { Avatar } from '../components/Avatar';
import {
  subscribeConversations,
  subscribeUsers,
} from '../services/chatService';
import { colors } from '../theme';
import type { ChatSummary, RootStackParamList, UserProfile } from '../types';

type HomeNavigation = NativeStackNavigationProp<RootStackParamList>;

function formatConversationTime(timestamp: number): string {
  if (!timestamp) {
    return '';
  }
  const date = new Date(timestamp);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
}

export function HomeScreen() {
  const user = useContext(AuthContext);
  const navigation = useNavigation<HomeNavigation>();
  const [summaries, setSummaries] = useState<ChatSummary[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      return;
    }

    const handleError = (reason: Error) => setError(reason.message);
    const unsubscribeConversations = subscribeConversations(user.uid, setSummaries, handleError);
    const unsubscribeUsers = subscribeUsers(setUsers, handleError);
    return () => {
      unsubscribeConversations();
      unsubscribeUsers();
    };
  }, [user]);

  const usersById = useMemo(
    () => new Map(users.map(profile => [profile.uid, profile])),
    [users],
  );
  const conversations = useMemo(
    () =>
      [...summaries]
        .filter(summary => usersById.has(summary.peerId))
        .sort((first, second) => second.lastMessageAt - first.lastMessageAt),
    [summaries, usersById],
  );

  return (
    <View style={styles.container}>
      <View style={styles.intro}>
        <Text style={styles.heading}>Trò chuyện</Text>
        <Text style={styles.subtitle}>Những cuộc trò chuyện gần đây của bạn</Text>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        data={conversations}
        keyExtractor={item => item.peerId}
        contentContainerStyle={conversations.length ? styles.list : styles.emptyList}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Chưa có cuộc trò chuyện</Text>
            <Text style={styles.emptyHint}>Mở Danh bạ để bắt đầu nhắn tin với bạn bè.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const peer = usersById.get(item.peerId);
          if (!peer) {
            return null;
          }

          return (
            <Pressable
              onPress={() =>
                navigation.navigate('Chat', { peerId: peer.uid, peerName: peer.name })
              }
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            >
              <Avatar name={peer.name} size={54} />
              <View style={styles.rowBody}>
                <View style={styles.rowHeading}>
                  <Text style={styles.name} numberOfLines={1}>{peer.name}</Text>
                  <Text style={styles.time}>{formatConversationTime(item.lastMessageAt)}</Text>
                </View>
                <View style={styles.previewRow}>
                  <Text style={styles.preview} numberOfLines={1}>{item.lastMessage}</Text>
                  {item.unreadCount > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {item.unreadCount > 99 ? '99+' : item.unreadCount}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  intro: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8, gap: 5 },
  heading: { color: colors.text, fontSize: 26, fontWeight: '800' },
  subtitle: { color: colors.muted, fontSize: 14 },
  list: { paddingHorizontal: 16, paddingVertical: 8 },
  emptyList: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 30 },
  empty: { alignItems: 'center', gap: 8 },
  emptyTitle: { color: colors.text, fontSize: 17, fontWeight: '700' },
  emptyHint: { color: colors.muted, fontSize: 14, lineHeight: 20, textAlign: 'center' },
  row: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  pressed: { opacity: 0.75 },
  rowBody: { flex: 1, gap: 8 },
  rowHeading: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  name: { flex: 1, color: colors.text, fontSize: 16, fontWeight: '700' },
  time: { color: colors.muted, fontSize: 12 },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  preview: { flex: 1, color: colors.muted, fontSize: 14 },
  badge: {
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderRadius: 11,
    backgroundColor: colors.primary,
  },
  badgeText: { color: colors.surface, fontSize: 11, fontWeight: '700' },
  error: { paddingHorizontal: 20, paddingBottom: 8, color: colors.danger },
});
