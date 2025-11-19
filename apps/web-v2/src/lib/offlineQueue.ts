/**
 * Offline Queue - IndexedDB-based queue for offline actions
 * 
 * This module provides a persistent queue for storing actions while offline.
 * Actions are automatically synced when the connection is restored.
 */

import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

const DB_NAME = 'vibesapp-offline-queue';
const DB_VERSION = 1;
const STORE_NAME = 'actions';

export interface QueueItem {
  id?: number;
  action: string;
  data: any;
  timestamp: number;
  retries: number;
}

interface OfflineQueueDB extends DBSchema {
  actions: {
    key: number;
    value: QueueItem;
    indexes: { 'by-action': string; 'by-timestamp': number };
  };
}

let dbPromise: Promise<IDBPDatabase<OfflineQueueDB>> | null = null;

function getDB(): Promise<IDBPDatabase<OfflineQueueDB>> {
  if (!dbPromise) {
    dbPromise = openDB<OfflineQueueDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, {
            keyPath: 'id',
            autoIncrement: true,
          });
          store.createIndex('by-action', 'action');
          store.createIndex('by-timestamp', 'timestamp');
        }
      },
    });
  }
  return dbPromise;
}

export const offlineQueue = {
  /**
   * Add an action to the offline queue
   */
  async add(action: string, data: any): Promise<number> {
    const db = await getDB();
    const item: QueueItem = {
      action,
      data,
      timestamp: Date.now(),
      retries: 0,
    };
    return db.add(STORE_NAME, item);
  },

  /**
   * Get all queued actions
   */
  async getAll(): Promise<QueueItem[]> {
    const db = await getDB();
    return db.getAll(STORE_NAME);
  },

  /**
   * Get queued actions by action type
   */
  async getByAction(action: string): Promise<QueueItem[]> {
    const db = await getDB();
    return db.getAllFromIndex(STORE_NAME, 'by-action', action);
  },

  /**
   * Update a queued action (for retry count)
   */
  async update(id: number, updates: Partial<QueueItem>): Promise<void> {
    const db = await getDB();
    const item = await db.get(STORE_NAME, id);
    if (item) {
      await db.put(STORE_NAME, { ...item, ...updates });
    }
  },

  /**
   * Remove an action from the queue
   */
  async remove(id: number): Promise<void> {
    const db = await getDB();
    await db.delete(STORE_NAME, id);
  },

  /**
   * Clear all queued actions
   */
  async clear(): Promise<void> {
    const db = await getDB();
    await db.clear(STORE_NAME);
  },

  /**
   * Get the count of queued actions
   */
  async count(): Promise<number> {
    const db = await getDB();
    return db.count(STORE_NAME);
  },

  /**
   * Clean up old queue items (older than 24 hours)
   */
  async cleanup(): Promise<number> {
    const db = await getDB();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    const cutoff = Date.now() - maxAge;
    
    const allItems = await db.getAll(STORE_NAME);
    let removedCount = 0;
    
    for (const item of allItems) {
      if (item.timestamp < cutoff) {
        await db.delete(STORE_NAME, item.id!);
        removedCount++;
      }
    }
    
    return removedCount;
  },
};
