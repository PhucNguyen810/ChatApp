import {
  onValue,
  orderByChild,
  push,
  query,
  ref,
  runTransaction,
  set,
} from 'firebase/database';
import { database } from './firebase';
import type { ChatMessage, ChatSummary, Presence, UserProfile } from '../types';
import { getConversationId } from '../utils/conversation';

export { getConversationId } from '../utils/conversation';

export function subscribeUsers(
  callback: (users: UserProfile[]) => void,
  onError: (error: Error) => void,
): () => void {
  return onValue(
    ref(database, 'users'),
    snapshot => {
      const users = snapshot.val() as Record<string, UserProfile> | null;
      callback(users ? Object.values(users) : []);
    },
    onError,
  );
}

export function subscribePresence(
  callback: (presence: Record<string, Presence>) => void,
  onError: (error: Error) => void,
): () => void {
  return onValue(
    ref(database, 'status'),
    snapshot => {
      callback((snapshot.val() as Record<string, Presence> | null) ?? {});
    },
    onError,
  );
}

export function subscribeConversations(
  uid: string,
  callback: (summaries: ChatSummary[]) => void,
  onError: (error: Error) => void,
): () => void {
  return onValue(
    ref(database, `userChats/${uid}`),
    snapshot => {
      const summaries = snapshot.val() as Record<string, ChatSummary> | null;
      callback(summaries ? Object.values(summaries) : []);
    },
    onError,
  );
}

export function subscribeMessages(
  firstUid: string,
  secondUid: string,
  callback: (messages: ChatMessage[]) => void,
  onError: (error: Error) => void,
): () => void {
  const messagesQuery = query(
    ref(database, `chats/${getConversationId(firstUid, secondUid)}/messages`),
    orderByChild('createdAt'),
  );

  return onValue(
    messagesQuery,
    snapshot => {
      const values = snapshot.val() as Record<string, Omit<ChatMessage, 'id'>> | null;
      const messages = values
        ? Object.entries(values).map(([id, message]) => ({ id, ...message }))
        : [];
      callback(messages);
    },
    onError,
  );
}

export async function markConversationRead(uid: string, peerId: string): Promise<void> {
  const summaryRef = ref(database, `userChats/${uid}/${peerId}`);
  await runTransaction(summaryRef, current => {
    if (!current) {
      return;
    }
    return { ...current, unreadCount: 0 };
  });
}

export async function ensureConversation(firstUid: string, secondUid: string): Promise<void> {
  const conversationId = getConversationId(firstUid, secondUid);
  await set(ref(database, `chats/${conversationId}/participants`), {
    [firstUid]: true,
    [secondUid]: true,
  });
}

export async function sendMessage(
  senderId: string,
  recipientId: string,
  rawText: string,
): Promise<void> {
  const text = rawText.trim();
  if (!text) {
    return;
  }

  const conversationId = getConversationId(senderId, recipientId);
  const createdAt = Date.now();
  const message: Omit<ChatMessage, 'id'> = { senderId, text, createdAt };
  await ensureConversation(senderId, recipientId);
  const messageRef = push(ref(database, `chats/${conversationId}/messages`));

  if (!messageRef.key) {
    throw new Error('Không thể tạo mã tin nhắn.');
  }

  await set(messageRef, message);

  const summaryForSender = ref(database, `userChats/${senderId}/${recipientId}`);
  const summaryForRecipient = ref(database, `userChats/${recipientId}/${senderId}`);
  const updateSummary = (
    summaryRef: typeof summaryForSender,
    unreadIncrement: number,
  ) =>
    runTransaction(summaryRef, current => ({
      ...(current ?? {}),
      peerId: unreadIncrement === 0 ? recipientId : senderId,
      lastMessage: text,
      lastMessageAt: createdAt,
      unreadCount: Math.max(0, Number(current?.unreadCount ?? 0) + unreadIncrement),
    }));

  await Promise.all([updateSummary(summaryForSender, 0), updateSummary(summaryForRecipient, 1)]);
}
