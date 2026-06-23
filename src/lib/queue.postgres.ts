// Postgres-backed queue. Workers poll the `Job` table.
import { db } from "./db";
import type { Job, JobType, Queue } from "./queue";

export class PostgresQueue implements Queue {
  async enqueue(workspaceId: string, type: JobType, payload: Record<string, unknown>): Promise<string> {
    const job = await db.job.create({
      data: { workspaceId, type, payload: payload as object },
    });
    return job.id;
  }

  async claim(): Promise<Job | null> {
    const rows = await db.$queryRaw<{ id: string; type: string; payload: unknown }[]>`
      UPDATE "Job" SET status = 'running', "updatedAt" = now()
      WHERE id = (
        SELECT id FROM "Job"
        WHERE status = 'pending'
        ORDER BY "createdAt"
        FOR UPDATE SKIP LOCKED
        LIMIT 1
      )
      RETURNING id, type, payload;
    `;
    const row = rows[0];
    if (!row) return null;
    return { id: row.id, type: row.type as JobType, payload: row.payload as Record<string, unknown> };
  }

  async progress(id: string, progress: number): Promise<void> {
    await db.job.update({ where: { id }, data: { progress } });
  }

  async complete(id: string, result: Record<string, unknown>): Promise<void> {
    await db.job.update({
      where: { id },
      data: { status: "done", progress: 100, result: result as object },
    });
  }

  async fail(id: string, error: string): Promise<void> {
    await db.job.update({ where: { id }, data: { status: "failed", error } });
  }
}
