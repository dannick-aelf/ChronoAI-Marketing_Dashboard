// Low-level IndexedDB operations

const DB_NAME = 'lumen-marketing-assets';
const DB_VERSION = 1;
const STORE_CANVASES = 'canvases';
const STORE_CANVAS_OBJECTS = 'canvasObjects';

let dbInstance: IDBDatabase | null = null;

export const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_CANVASES)) {
        db.createObjectStore(STORE_CANVASES, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORE_CANVAS_OBJECTS)) {
        db.createObjectStore(STORE_CANVAS_OBJECTS, { keyPath: 'key' });
      }
    };
  });
};

export const saveItem = async <T>(storeName: string, item: T & { id?: string; key?: string }): Promise<void> => {
  const db = await openDB();
  const store = db.transaction(storeName, 'readwrite').objectStore(storeName);
  await store.put(item);
};

export const getItem = async <T>(storeName: string, key: string): Promise<T | undefined> => {
  const db = await openDB();
  const store = db.transaction(storeName, 'readonly').objectStore(storeName);
  return new Promise((resolve, reject) => {
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result as T);
    request.onerror = () => reject(request.error);
  });
};

export const getAllItems = async <T>(storeName: string): Promise<T[]> => {
  const db = await openDB();
  const store = db.transaction(storeName, 'readonly').objectStore(storeName);
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => reject(request.error);
  });
};

export const deleteItem = async (storeName: string, key: string): Promise<void> => {
  const db = await openDB();
  const store = db.transaction(storeName, 'readwrite').objectStore(storeName);
  await store.delete(key);
};

export const clearStore = async (storeName: string): Promise<void> => {
  const db = await openDB();
  const store = db.transaction(storeName, 'readwrite').objectStore(storeName);
  await store.clear();
};

// Store-specific helpers
export const saveCanvases = async (canvases: Record<string, any>): Promise<void> => {
  await saveItem(STORE_CANVASES, { id: 'main', data: canvases });
};

export const getCanvases = async (): Promise<Record<string, any> | undefined> => {
  const item = await getItem<{ id: string; data: Record<string, any> }>(STORE_CANVASES, 'main');
  return item?.data;
};

export const saveCanvasObjects = async (canvasObjects: Record<string, any>): Promise<void> => {
  await saveItem(STORE_CANVAS_OBJECTS, { key: 'main', data: canvasObjects });
};

export const getCanvasObjects = async (): Promise<Record<string, any> | undefined> => {
  const item = await getItem<{ key: string; data: Record<string, any> }>(STORE_CANVAS_OBJECTS, 'main');
  return item?.data;
};

