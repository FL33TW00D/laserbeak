import { openDB, DBSchema } from 'idb';

interface ModelDB extends DBSchema {
  models: {
    value: {
      name: string;
      definition: 
    };
    key: string;
  };
  tensors: {
    value: {
        name: string;
        hash: string;

    };
    key: string;
  };
}

export async function demo() {
  const db = await openDB<ModelDB>('model-db', 1, {
    upgrade(db) {
      db.createObjectStore('favourite-number');

      const productStore = db.createObjectStore('products', {
        keyPath: 'productCode',
      });
      productStore.createIndex('by-price', 'price');
    },
  });

  // This works
  await db.put('favourite-number', 7, 'Jen');
  console.log(await db.get('favourite-number', 'Jen'));
}
