// Job queue behind a driver. Default: Postgres `Job` table.
import { PostgresQueue } from "./queue.postgres";

export type JobType = "render" | "transcribe";

export interface Job {
  id: string;
  type: JobType;
  payload: Record<string, unknown>;
}

export interface Queue {
  enqueue(workspaceId: string, type: JobType, payload: Record<string, unknown>): Promise<string>;
  claim(): Promise<Job | null>;
  progress(id: string, progress: number): Promise<void>;
  complete(id: string, result: Record<string, unknown>): Promise<void>;
  fail(id: string, error: string): Promise<void>;
}

let queueInstance: Queue | undefined;

export function queue(): Queue {
  if (queueInstance) return queueInstance;
  const driver = process.env.QUEUE_DRIVER ?? "postgres";
  switch (driver) {
    case "postgres":
      queueInstance = new PostgresQueue();
      return queueInstance;
    // TODO: case "redis"
    default:
      throw new Error(`Unknown QUEUE_DRIVER: ${driver}`);
  }
}
