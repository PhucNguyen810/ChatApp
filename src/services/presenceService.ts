import { onDisconnect, onValue, ref, serverTimestamp, set } from 'firebase/database';
import { database } from './firebase';

export function watchPresence(uid: string): () => void {
  const connectionRef = ref(database, '.info/connected');
  const statusRef = ref(database, `status/${uid}`);
  const unsubscribe = onValue(
    connectionRef,
    snapshot => {
      if (snapshot.val() === true) {
        onDisconnect(statusRef)
          .set({ state: 'offline', lastChanged: serverTimestamp() })
          .then(() =>
            set(statusRef, { state: 'online', lastChanged: serverTimestamp() }),
          )
          .catch(error => {
            console.error('Không thể cập nhật trạng thái online:', error);
          });
      }
    },
    error => {
      console.error('Không thể theo dõi kết nối Firebase:', error);
    },
  );

  return unsubscribe;
}

export async function markPresenceOffline(uid: string): Promise<void> {
  await set(ref(database, `status/${uid}`), {
    state: 'offline',
    lastChanged: serverTimestamp(),
  });
}
