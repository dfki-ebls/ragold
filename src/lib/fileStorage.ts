/** Maximum allowed file size in bytes (10 MB). */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

const DB_NAME = "ragold-files";
const DB_VERSION = 1;
const STORE_NAME = "blobs";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = openDb().catch((err) => {
      dbPromise = null;
      throw err;
    });
  }
  return dbPromise;
}

function wrap<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/** Store an ArrayBuffer in IndexedDB, keyed by document UUID. */
export async function putBuffer(id: string, buffer: ArrayBuffer): Promise<void> {
  const db = await getDb();
  await wrap(db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).put(buffer, id));
}

/** Store a file as an ArrayBuffer in IndexedDB, keyed by document UUID. */
export async function putFile(id: string, file: File): Promise<void> {
  await putBuffer(id, await file.arrayBuffer());
}

/** Retrieve a file blob from IndexedDB by document UUID. Returns null if not found. */
export async function getFile(id: string): Promise<Blob | null> {
  const db = await getDb();
  const buffer = await wrap<ArrayBuffer | undefined>(
    db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(id),
  );
  if (!buffer) return null;
  return new Blob([buffer]);
}

/** Retrieve all stored files as a Map of UUID to Blob. */
export async function getAllFiles(): Promise<Map<string, Blob>> {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const keysReq = store.getAllKeys();
    const valsReq = store.getAll();
    transaction.oncomplete = () => {
      const map = new Map<string, Blob>();
      const keys = keysReq.result as string[];
      const vals = valsReq.result as ArrayBuffer[];
      keys.forEach((k, i) => map.set(k, new Blob([vals[i]])));
      resolve(map);
    };
    transaction.onerror = () => reject(transaction.error);
  });
}

/** Delete a single file from IndexedDB by document UUID. */
export async function deleteFile(id: string): Promise<void> {
  const db = await getDb();
  await wrap(db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).delete(id));
}

/** Clear all files from the object store without deleting the database. */
export async function clearAllFiles(): Promise<void> {
  const db = await getDb();
  await wrap(db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).clear());
}

/** Delete the entire IndexedDB database, fully resetting file storage. */
export async function resetIndexedDb(): Promise<void> {
  if (dbPromise) {
    const db = await dbPromise;
    db.close();
    dbPromise = null;
  }
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => resolve();
  });
}

/** Clear all persisted app data (IndexedDB + localStorage) and reload. */
export async function resetApp(): Promise<void> {
  await resetIndexedDb();
  localStorage.removeItem("ragold-store");
  window.location.reload();
}
