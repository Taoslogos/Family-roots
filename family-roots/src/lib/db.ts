/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Person } from '../types';

const DB_NAME = 'FamilyRootsDB';
const DB_VERSION = 1;
const STORE_NAME = 'people';

let dbInstance: IDBDatabase | null = null;

export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = (event) => {
        console.error('IndexedDB error:', event);
        reject(new Error('Failed to open IndexedDB database'));
      };

      request.onsuccess = (event) => {
        dbInstance = (event.target as IDBOpenDBRequest).result;
        resolve(dbInstance);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
    } catch (e) {
      console.warn('IndexedDB is not supported or accessible. Falling back.', e);
      reject(e);
    }
  });
}

export async function getAllPeople(): Promise<Person[]> {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result as Person[]);
      };

      request.onerror = () => {
        reject(new Error('Failed to fetch people from IndexedDB'));
      };
    });
  } catch (e) {
    // Fallback to LocalStorage if IndexedDB fails or is unavailable
    console.warn('IndexedDB getAllPeople failed, falling back to LocalStorage', e);
    const localData = localStorage.getItem('family_roots_people');
    if (localData) {
      try {
        return JSON.parse(localData) as Person[];
      } catch (err) {
        console.error('Failed to parse local stored family data', err);
      }
    }
    return [];
  }
}

export async function savePerson(person: Person): Promise<void> {
  // Update times
  const updatedPerson = {
    ...person,
    updatedAt: Date.now(),
    createdAt: person.createdAt || Date.now(),
  };

  try {
    const db = await initDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(updatedPerson);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error('Failed to save person in IndexedDB'));
      };
    });
  } catch (e) {
    console.warn('IndexedDB savePerson failed, falling back to LocalStorage', e);
  }

  // Always mirror to localStorage as backup/fallback
  const allPeople = await fallbackGetAllPeople();
  const index = allPeople.findIndex((p) => p.id === updatedPerson.id);
  if (index !== -1) {
    allPeople[index] = updatedPerson;
  } else {
    allPeople.push(updatedPerson);
  }
  localStorage.setItem('family_roots_people', JSON.stringify(allPeople));
}

export async function deletePerson(id: string): Promise<void> {
  try {
    const db = await initDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error('Failed to delete person from IndexedDB'));
      };
    });
  } catch (e) {
    console.warn('IndexedDB deletePerson failed, falling back to LocalStorage', e);
  }

  // Mirror to localStorage
  const allPeople = await fallbackGetAllPeople();
  const filtered = allPeople.filter((p) => p.id !== id);
  localStorage.setItem('family_roots_people', JSON.stringify(filtered));
}

export async function clearAllPeople(): Promise<void> {
  try {
    const db = await initDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error('Failed to clear object store'));
      };
    });
  } catch (e) {
    console.warn('IndexedDB clear failed', e);
  }
  localStorage.removeItem('family_roots_people');
}

// Internal local storage fallback fetcher to avoid circular references
async function fallbackGetAllPeople(): Promise<Person[]> {
  const localData = localStorage.getItem('family_roots_people');
  if (localData) {
    try {
      return JSON.parse(localData) as Person[];
    } catch {
      // Ignore
    }
  }
  return [];
}
