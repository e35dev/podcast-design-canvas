// Transcription behind a driver. Default: local Whisper.
import { WhisperLocal } from "./asr.whisper";

export interface TranscriptWord {
  text: string;
  startMs: number;
  endMs: number;
  confidence: number; // 0..1
}

export interface Transcript {
  speakerId?: string;
  words: TranscriptWord[];
}

export interface Transcriber {
  transcribe(mediaKey: string): Promise<Transcript>;
}

let transcriber: Transcriber | undefined;

export function asr(): Transcriber {
  if (transcriber) return transcriber;
  const driver = process.env.ASR_DRIVER ?? "whisper-local";
  switch (driver) {
    case "whisper-local":
      transcriber = new WhisperLocal();
      return transcriber;
    // TODO: case "openai" | "deepgram"
    default:
      throw new Error(`Unknown ASR_DRIVER: ${driver}`);
  }
}
