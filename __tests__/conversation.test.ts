import { getConversationId } from '../src/utils/conversation';

test('conversation id is the same regardless of participant order', () => {
  expect(getConversationId('user-b', 'user-a')).toBe('user-a_user-b');
  expect(getConversationId('user-a', 'user-b')).toBe('user-a_user-b');
});
