import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';
import { Avatar } from '../components/Avatar';
import { ErrorNotice } from '../components/ErrorNotice';
import {
  ensureConversation,
  markConversationRead,
  sendMessage,
  subscribeMessages,
  subscribePresence,
} from '../services/chatService';
import { colors } from '../theme';
import type { ChatMessage, Presence, RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

function formatMessageTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ChatScreen({ navigation, route }: Props) {
  const user = useContext(AuthContext);
  const { peerId, peerName } = route.params;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [presence, setPresence] = useState<Record<string, Presence>>({});
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const online = presence[peerId]?.state === 'online';
  const renderHeaderStatus = useCallback(
    () => (
      <View style={styles.headerStatus}>
        <View style={[styles.statusDot, online ? styles.onlineDot : styles.offlineDot]} />
        <Text style={styles.headerStatusText}>{online ? 'Online' : 'Offline'}</Text>
      </View>
    ),
    [online],
  );

  useEffect(() => {
    navigation.setOptions({
      headerTitle: peerName,
      headerRight: renderHeaderStatus,
    });
  }, [navigation, peerName, renderHeaderStatus]);

  useEffect(() => {
    const unsubscribePresence = subscribePresence(setPresence, reason => setError(reason.message));
    return unsubscribePresence;
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    let active = true;
    let unsubscribeMessages: (() => void) | undefined;
    const handleMessages = (newMessages: ChatMessage[]) => {
      setMessages(newMessages);
      markConversationRead(user.uid, peerId).catch(reason => {
        if (active) {
          setError(reason instanceof Error ? reason.message : 'Không thể cập nhật tin chưa đọc.');
        }
      });
    };
    ensureConversation(user.uid, peerId)
      .then(() => {
        if (active) {
          unsubscribeMessages = subscribeMessages(user.uid, peerId, handleMessages, reason => {
            setError(reason.message);
          });
        }
      })
      .catch(reason => {
        if (active) {
          setError(reason instanceof Error ? reason.message : 'Không thể mở cuộc trò chuyện.');
        }
      });
    return () => {
      active = false;
      unsubscribeMessages?.();
    };
  }, [peerId, user]);

  const handleSend = useCallback(async () => {
    if (!user || !text.trim() || sending) {
      return;
    }
    const message = text;
    setError('');
    setSending(true);
    try {
      await sendMessage(user.uid, peerId, message);
      setText('');
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : 'Không thể gửi tin nhắn.');
    } finally {
      setSending(false);
    }
  }, [peerId, sending, text, user]);

  if (!user) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <View style={styles.peerBanner}>
        <Avatar name={peerName} online={online} size={40} />
        <View style={styles.peerText}>
          <Text style={styles.peerName}>{peerName}</Text>
          <Text style={[styles.peerStatus, online && styles.onlineText]}>
            {online ? 'Đang hoạt động' : 'Ngoại tuyến'}
          </Text>
        </View>
      </View>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={messages.length ? styles.messageList : styles.emptyList}
        onContentSizeChange={() => {
          if (messages.length) {
            listRef.current?.scrollToEnd({ animated: true });
          }
        }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Hãy gửi lời chào để bắt đầu cuộc trò chuyện.</Text>
        }
        renderItem={({ item }) => {
          const mine = item.senderId === user.uid;
          return (
            <View style={[styles.messageRow, mine ? styles.myRow : styles.theirRow]}>
              <View style={[styles.bubble, mine ? styles.myBubble : styles.theirBubble]}>
                <Text style={[styles.messageText, mine && styles.myMessageText]}>{item.text}</Text>
                <Text style={[styles.time, mine && styles.myTime]}>
                  {formatMessageTime(item.createdAt)}
                </Text>
              </View>
            </View>
          );
        }}
      />
      {error ? <ErrorNotice message={error} /> : null}
      <View style={styles.composer}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Nhập tin nhắn..."
          placeholderTextColor={colors.muted}
          style={styles.input}
          multiline
          maxLength={4000}
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Gửi tin nhắn"
          disabled={!text.trim() || sending}
          onPress={handleSend}
          style={({ pressed }) => [
            styles.sendButton,
            (!text.trim() || sending) && styles.sendDisabled,
            pressed && styles.sendPressed,
          ]}
        >
          <Text style={styles.sendIcon}>↑</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerStatus: { flexDirection: 'row', alignItems: 'center', gap: 5, marginRight: 4 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  onlineDot: { backgroundColor: colors.online },
  offlineDot: { backgroundColor: colors.muted },
  headerStatusText: { color: colors.muted, fontSize: 12 },
  peerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  peerText: { gap: 3 },
  peerName: { color: colors.text, fontSize: 14, fontWeight: '700' },
  peerStatus: { color: colors.muted, fontSize: 12 },
  onlineText: { color: colors.online },
  messageList: { paddingHorizontal: 14, paddingVertical: 18, gap: 10 },
  emptyList: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 25 },
  emptyText: { color: colors.muted, fontSize: 14, textAlign: 'center' },
  messageRow: { flexDirection: 'row', marginVertical: 3 },
  myRow: { justifyContent: 'flex-end' },
  theirRow: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '82%', paddingHorizontal: 13, paddingTop: 10, paddingBottom: 7, borderRadius: 17 },
  myBubble: { borderBottomRightRadius: 5, backgroundColor: colors.outgoing },
  theirBubble: { borderBottomLeftRadius: 5, backgroundColor: colors.incoming },
  messageText: { color: colors.text, fontSize: 15, lineHeight: 21 },
  myMessageText: { color: colors.surface },
  time: { alignSelf: 'flex-end', marginTop: 4, color: colors.muted, fontSize: 10 },
  myTime: { color: '#DDE3FF' },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 9,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    maxHeight: 110,
    minHeight: 44,
    paddingHorizontal: 14,
    paddingTop: 11,
    paddingBottom: 10,
    borderRadius: 22,
    color: colors.text,
    backgroundColor: colors.background,
    fontSize: 15,
  },
  sendButton: {
    width: 43,
    height: 43,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: colors.primary,
  },
  sendDisabled: { opacity: 0.48 },
  sendPressed: { backgroundColor: colors.primaryDark },
  sendIcon: { marginTop: -3, color: colors.surface, fontSize: 25, fontWeight: '700' },
});
