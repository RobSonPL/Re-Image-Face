
import { Project, CustomPreset, UserProfile } from '../types';

const DB_NAME = 'ProHeadshotDB';
const PROJECT_STORE = 'projects';
const PRESET_STORE = 'presets';
const USER_STORE = 'user_profile';
const DB_VERSION = 3;

export const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      reject('Error opening database');
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(PROJECT_STORE)) {
        db.createObjectStore(PROJECT_STORE, { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(PRESET_STORE)) {
        db.createObjectStore(PRESET_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(USER_STORE)) {
        db.createObjectStore(USER_STORE, { keyPath: 'id' });
      }
    };
  });
};

export const saveProject = async (project: Omit<Project, 'id'>): Promise<number> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PROJECT_STORE], 'readwrite');
    const store = transaction.objectStore(PROJECT_STORE);
    const request = store.add(project);

    request.onsuccess = () => {
      resolve(request.result as number);
    };

    request.onerror = () => {
      reject('Error saving project');
    };
  });
};

export const getProjects = async (): Promise<Project[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PROJECT_STORE], 'readonly');
    const store = transaction.objectStore(PROJECT_STORE);
    const request = store.getAll();

    request.onsuccess = () => {
      // Return reversed array to show newest first
      resolve((request.result as Project[]).reverse());
    };

    request.onerror = () => {
      reject('Error fetching projects');
    };
  });
};

export const deleteProject = async (id: number): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PROJECT_STORE], 'readwrite');
    const store = transaction.objectStore(PROJECT_STORE);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject('Error deleting project');
    };
  });
};

export const savePreset = async (preset: CustomPreset): Promise<string> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PRESET_STORE], 'readwrite');
    const store = transaction.objectStore(PRESET_STORE);
    const request = store.put(preset);

    request.onsuccess = () => {
      resolve(request.result as string);
    };

    request.onerror = () => {
      reject('Error saving preset');
    };
  });
};

export const getPresets = async (): Promise<CustomPreset[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PRESET_STORE], 'readonly');
    const store = transaction.objectStore(PRESET_STORE);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve((request.result as CustomPreset[]).reverse());
    };

    request.onerror = () => {
      reject('Error fetching presets');
    };
  });
};

// User Profile & Credits
export const getUserProfile = async (): Promise<UserProfile> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([USER_STORE], 'readwrite');
    const store = transaction.objectStore(USER_STORE);
    const request = store.get('user');

    request.onsuccess = () => {
      if (request.result) {
        resolve(request.result as UserProfile);
      } else {
        // Create default profile with 2 free credits
        // isAdmin is false by default
        const defaultProfile: UserProfile = {
          id: 'user',
          credits: 2,
          isSubscribed: false,
          isAdmin: false 
        };
        store.put(defaultProfile);
        resolve(defaultProfile);
      }
    };

    request.onerror = () => {
      reject('Error fetching user profile');
    };
  });
};

export const updateUserProfile = async (profile: UserProfile): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([USER_STORE], 'readwrite');
    const store = transaction.objectStore(USER_STORE);
    const request = store.put(profile);

    request.onsuccess = () => {
      resolve();
    };
    
    request.onerror = () => reject('Error updating profile');
  });
};
