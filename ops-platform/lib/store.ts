// Compatibility wrapper around persistent lib/db
import { readDB, writeDB, DatabaseSchema } from './db';
export * from './db';

// Provide a proxy for any legacy code accessing `db.*` directly
export const db = new Proxy({} as DatabaseSchema, {
  get(_target, prop: keyof DatabaseSchema) {
    const current = readDB();
    return current[prop];
  },
  set(_target, prop: keyof DatabaseSchema, value) {
    const current = readDB();
    (current as any)[prop] = value;
    writeDB(current);
    return true;
  },
});
