const memoryValues = new Map<string, string>();

const memoryStorage: Storage = {
  get length() {
    return memoryValues.size;
  },
  clear: () => memoryValues.clear(),
  getItem: (key) => memoryValues.get(key) ?? null,
  key: (index) => [...memoryValues.keys()][index] ?? null,
  removeItem: (key) => memoryValues.delete(key),
  setItem: (key, value) => memoryValues.set(key, value),
};

export const getBrowserStorage = (): Storage =>
  typeof window === "undefined" ? memoryStorage : window.localStorage;
