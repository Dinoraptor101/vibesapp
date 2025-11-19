import { openDB, type IDBPDatabase } from 'idb';

interface QueueItem {
  id?: number;
  action: string;
  data: unknown;
  timestamp: number;
  retries: number;
  status: 'pending' | 'processing' | 'failed';
}

class OfflineQueue {
  private db: IDBPDatabase | null = null;
  private readonly DB_NAME = 'vibesapp-queue';
  private readonly STORE_NAME = 'actions';
  private readonly VERSION = 1;

  async init() {
    if (this.db) return;

    this.db = await openDB(this.DB_NAME, this.VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('actions')) {
          const store = db.createObjectStore('actions', {
            keyPath: 'id',
            autoIncrement: true,
          });
          store.createIndex('status', 'status');
          store.createIndex('timestamp', 'timestamp');
        }
      },
    });
  }

  async add(action: string, data: unknown): Promise<number> {
    await this.init();
    const key = await this.db!.add(this.STORE_NAME, {
      action,
      data,
      timestamp: Date.now(),
      retries: 0,
      status: 'pending',
    });
    return key as number;
  }

  async getAll(): Promise<QueueItem[]> {
    await this.init();
    return this.db!.getAll(this.STORE_NAME);
  }

  async getPending(): Promise<QueueItem[]> {
    await this.init();
    return this.db!.getAllFromIndex(this.STORE_NAME, 'status', 'pending');
  }

  async update(id: number, updates: Partial<QueueItem>): Promise<void> {
    await this.init();
    const item = await this.db!.get(this.STORE_NAME, id);
    if (item) {
      await this.db!.put(this.STORE_NAME, { ...item, ...updates });
    }
  }

  async remove(id: number): Promise<void> {
    await this.init();
    await this.db!.delete(this.STORE_NAME, id);
  }

  async clear(): Promise<void> {
    await this.init();
    await this.db!.clear(this.STORE_NAME);
  }

  async cleanup(maxAge: number = 24 * 60 * 60 * 1000): Promise<void> {
    await this.init();
    const items = await this.getAll();
    const now = Date.now();

    for (const item of items) {
      if (item.id && now - item.timestamp > maxAge) {
        await this.remove(item.id);
      }
    }
  }
}

export const offlineQueue = new OfflineQueue();
export type { QueueItem };
