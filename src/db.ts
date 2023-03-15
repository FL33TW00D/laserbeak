import { openDB, DBSchema } from 'idb';

interface ModelDB extends DBSchema {
  models: {
    value: {
      name: string;
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
