// Dispatch jobs onto the queue.
import { queue } from "./queue";

export async function dispatchRender(workspaceId: string, episodeId: string): Promise<string> {
  return queue().enqueue(workspaceId, "render", { episodeId });
}

export async function dispatchTranscribe(workspaceId: string, episodeId: string): Promise<string> {
  return queue().enqueue(workspaceId, "transcribe", { episodeId });
}
