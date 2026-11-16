export function getConversationId(firstUid: string, secondUid: string): string {
  return [firstUid, secondUid].sort().join('_');
}
