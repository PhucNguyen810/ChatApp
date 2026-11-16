import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
} from 'firebase/auth';
import { ref, serverTimestamp, set } from 'firebase/database';
import { auth, database } from './firebase';
import { markPresenceOffline } from './presenceService';

export function subscribeToAuthState(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

export async function registerWithEmail(
  name: string,
  email: string,
  password: string,
): Promise<void> {
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  await updateProfile(credential.user, { displayName: name.trim() });
  await set(ref(database, `users/${credential.user.uid}`), {
    uid: credential.user.uid,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    createdAt: serverTimestamp(),
  });
}

export async function signInWithEmail(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function signOutUser(): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (uid) {
    await markPresenceOffline(uid);
  }
  await signOut(auth);
}

export function getAuthErrorMessage(error: unknown): string {
  const code =
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
      ? error.code
      : '';

  const messages: Record<string, string> = {
    'auth/email-already-in-use': 'Email này đã được đăng ký.',
    'auth/invalid-email': 'Email không hợp lệ.',
    'auth/invalid-credential': 'Email hoặc mật khẩu không chính xác.',
    'auth/user-not-found': 'Email hoặc mật khẩu không chính xác.',
    'auth/wrong-password': 'Email hoặc mật khẩu không chính xác.',
    'auth/weak-password': 'Mật khẩu cần có ít nhất 6 ký tự.',
    'auth/network-request-failed': 'Không thể kết nối. Vui lòng kiểm tra mạng.',
    'auth/too-many-requests': 'Bạn đã thử quá nhiều lần. Hãy thử lại sau.',
    'database/permission-denied': 'Firebase Database từ chối thao tác. Hãy kiểm tra Database Rules.',
  };

  if (messages[code]) {
    return messages[code];
  }

  return error instanceof Error ? error.message : 'Đã xảy ra lỗi. Vui lòng thử lại.';
}
