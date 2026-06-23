// Transcribe worker (local Whisper). Polls the queue.
import { queue } from "../../src/lib/queue";
import { asr } from "../../src/lib/asr";

const POLL_MS = 2000;

async function tick() {
  const job = await queue().claim();
  if (!job || job.type !== "transcribe") return;

  console.log(`[transcribe] picked job ${job.id}`, job.payload);
  try {
    // TODO: transcribe media, persist transcript.
    void asr;
    await queue().complete(job.id, { note: "not implemented" });
  } catch (err) {
    await queue().fail(job.id, err instanceof Error ? err.message : String(err));
  }
}

async function main() {
  console.log("[transcribe] worker started; polling queue…");
  // eslint-disable-next-line no-constant-condition
  while (true) {
    await tick();
    await new Promise((r) => setTimeout(r, POLL_MS));
  }
}

void main();
