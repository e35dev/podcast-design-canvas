// Local Whisper driver.
import type { Transcriber, Transcript } from "./asr";

export class WhisperLocal implements Transcriber {
  async transcribe(mediaKey: string): Promise<Transcript> {
    // TODO: run local whisper against the media file.
    void mediaKey;
    throw new Error("WhisperLocal.transcribe not implemented");
  }
}
