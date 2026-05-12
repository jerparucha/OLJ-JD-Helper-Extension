import { Logger } from './logger.js';

const STORAGE_KEY = 'ojpSavedJobDescription';
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export const Storage = {
  get() {
    return new Promise((resolve, reject) => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
          resolve({ [STORAGE_KEY]: null });
          return;
        }
        const data = JSON.parse(raw);
        if (data.savedAt && Date.now() - data.savedAt > MAX_AGE_MS) {
          Logger.log('Saved description expired — clearing');
          localStorage.removeItem(STORAGE_KEY);
          resolve({ [STORAGE_KEY]: null });
          return;
        }
        resolve({ [STORAGE_KEY]: data });
      } catch (e) {
        Logger.error('localStorage read error:', e);
        reject(e);
      }
    });
  },

  set(value) {
    return new Promise((resolve, reject) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
        Logger.log('✓ Saved to localStorage');
        resolve();
      } catch (e) {
        if (e.name === 'QuotaExceededError') {
          Logger.error('localStorage quota exceeded — description too large to save');
        } else {
          Logger.error('localStorage write error:', e);
        }
        reject(e);
      }
    });
  },

  clear() {
    return new Promise((resolve, reject) => {
      try {
        localStorage.removeItem(STORAGE_KEY);
        resolve();
      } catch (e) {
        Logger.error('localStorage clear error:', e);
        reject(e);
      }
    });
  },

  getKey() {
    return STORAGE_KEY;
  }
};
