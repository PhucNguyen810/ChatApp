export type RootStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  Tabs: undefined;
  Chat: {
    peerId: string;
    peerName: string;
  };
};

export type TabParamList = {
  Home: undefined;
  Contacts: undefined;
  Settings: undefined;
};

export type UserProfile = {
  uid: string;
  name: string;
  email: string;
  createdAt?: number;
};

export type Presence = {
  state: 'online' | 'offline';
  lastChanged?: number;
};

export type ChatSummary = {
  peerId: string;
  lastMessage: string;
  lastMessageAt: number;
  unreadCount: number;
};

export type ChatMessage = {
  id: string;
  senderId: string;
  text: string;
  createdAt: number;
};
