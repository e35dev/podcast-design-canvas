// Local-disk object store.
import { promises as fs } from "node:fs";
import path from "node:path";
import type { ObjectStore } from "./storage";

export class LocalStore implements ObjectStore {
  private root = process.env.STORAGE_DIR ?? path.join(process.cwd(), ".data", "media");

  private resolve(key: string) {
    // Prevent path traversal outside the storage root.
    const full = path.resolve(this.root, key);
    if (!full.startsWith(path.resolve(this.root))) {
      throw new Error("Invalid storage key");
    }
    return full;
  }

  async put(key: string, data: Buffer): Promise<void> {
    const full = this.resolve(key);
    await fs.mkdir(path.dirname(full), { recursive: true });
    await fs.writeFile(full, data);
  }

  async get(key: string): Promise<Buffer> {
    return fs.readFile(this.resolve(key));
  }

  url(key: string): string {
    // Served back through the API so the editor's <video> can load it.
    return `/api/media/${key}`;
  }
}
