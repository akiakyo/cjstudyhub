/** JSON persistence adapter. Storage is injectable for testing. */
export class BrowserStorage {
  constructor(storage) {
    this.available = true;
    try {
      this.storage = storage ?? globalThis.localStorage;
    } catch {
      this.storage = null;
      this.available = false;
    }
  }
  read(key, fallback = {}) {
    try {
      if (!this.storage) throw new Error("Storage unavailable");
      const raw = this.storage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      this.available = false;
      return fallback;
    }
  }
  write(key, value) {
    try {
      if (!this.storage) throw new Error("Storage unavailable");
      this.storage.setItem(key, JSON.stringify(value));
      this.available = true;
      return true;
    } catch {
      this.available = false;
      return false;
    }
  }
}
