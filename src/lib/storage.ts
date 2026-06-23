// Object storage behind a driver. Default: local disk.
import { LocalStore } from "./storage.local";

export interface ObjectStore {
  put(key: string, data: Buffer, contentType?: string): Promise<void>;
  get(key: string): Promise<Buffer>;
  url(key: string): string;
}

let store: ObjectStore | undefined;

export function storage(): ObjectStore {
  if (store) return store;
  const driver = process.env.STORAGE_DRIVER ?? "local";
  switch (driver) {
    case "local":
      store = new LocalStore();
      return store;
    // TODO: case "s3"
    default:
      throw new Error(`Unknown STORAGE_DRIVER: ${driver}`);
  }
}
