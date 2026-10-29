/** Maximum allowed file size in bytes (50 MB). */
export const MAX_FILE_SIZE = 50 * 1024 * 1024;

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

function done(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

/** Lowercase hex SHA-256 digest of file content. */
export async function sha256(data: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/** Store files keyed by document id in a single transaction, so either all or none are written. */
export async function putFiles(files: ReadonlyMap<string, ArrayBuffer>): Promise<void> {
  const db = await getDb();
  const transaction = db.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);

  for (const [id, buffer] of files) {
    store.put(buffer, id);
  }

  await done(transaction);
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

/** Delete a single file from IndexedDB by document UUID. */
export async function deleteFile(id: string): Promise<void> {
  const db = await getDb();
  await wrap(db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).delete(id));
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
