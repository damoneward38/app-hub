import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ChatHistoryEntry {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  createdAt: number;
}

export interface SavedChatSummary {
  botId: string;
  messageCount: number;
  lastMessageRole: 'user' | 'assistant';
  lastMessageText: string;
  lastMessageAt: number;
}

const HISTORY_KEY_PREFIX = 'chat_history_';
const MAX_HISTORY_ENTRIES = 200;

const historyKey = (botId: string): string => `${HISTORY_KEY_PREFIX}${botId}`;

/** Loads the auto-saved conversation for a bot (empty array when none exists). */
export async function loadChatHistory(botId: string): Promise<ChatHistoryEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(historyKey(botId));
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as ChatHistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.log('Failed to load chat history', error);
    return [];
  }
}

/**
 * Merges new/updated entries into the saved conversation (matched by message id)
 * and persists it, keeping only the most recent MAX_HISTORY_ENTRIES entries.
 */
export async function appendChatHistory(
  botId: string,
  updates: ChatHistoryEntry[]
): Promise<ChatHistoryEntry[]> {
  const existing = await loadChatHistory(botId);
  const merged = new Map<string, ChatHistoryEntry>();

  for (const entry of existing) {
    merged.set(entry.id, entry);
  }
  for (const entry of updates) {
    merged.set(entry.id, entry);
  }

  const all = Array.from(merged.values()).slice(-MAX_HISTORY_ENTRIES);
  await AsyncStorage.setItem(historyKey(botId), JSON.stringify(all));
  return all;
}

/** Deletes the auto-saved conversation for a bot. */
export async function clearChatHistory(botId: string): Promise<void> {
  await AsyncStorage.removeItem(historyKey(botId));
}

/** Loads a summary of every auto-saved conversation, most recent first. */
export async function getAllChatSummaries(): Promise<SavedChatSummary[]> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const historyKeys = keys.filter((key) => key.startsWith(HISTORY_KEY_PREFIX));
    const summaries: SavedChatSummary[] = [];

    for (const key of historyKeys) {
      const botId = key.slice(HISTORY_KEY_PREFIX.length);
      const entries = await loadChatHistory(botId);

      if (entries.length === 0) {
        continue;
      }

      const lastEntry = entries[entries.length - 1];
      summaries.push({
        botId,
        messageCount: entries.length,
        lastMessageRole: lastEntry.role,
        lastMessageText: lastEntry.text,
        lastMessageAt: lastEntry.createdAt,
      });
    }

    return summaries.sort((a, b) => b.lastMessageAt - a.lastMessageAt);
  } catch (error) {
    console.log('Failed to load chat summaries', error);
    return [];
  }
}
