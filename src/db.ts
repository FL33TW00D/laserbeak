import { DBSchema, IDBPDatabase, openDB } from 'idb';

interface StoredModel {
    bytes: Blob;
}

interface ModelDBSchema extends DBSchema {
  models: {
    value: StoredModel; 
    key: string;
  };
}

export default class ModelDB {
 private db: IDBPDatabase<ModelDBSchema> | null;

  constructor() {
    this.db = null;
  }

  async init() {
    this.db = await openDB<ModelDBSchema>('models', 1, {
      upgrade(db) {
        db.createObjectStore('models');
      },
    });
  }

  async get(key: string): Promise<StoredModel | undefined>{
    if (!this.db) {
      throw new Error('DB not initialized');
    }
    return await this.db.get('models', key);
  }

  async set(model_name: string, value: Blob) {
    if (!this.db) {
      throw new Error('DB not initialized');
    }
    await this.db.put('models', { bytes: value }, model_name);
  }
}
