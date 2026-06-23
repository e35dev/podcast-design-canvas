"use client";

import { useEditor } from "./store";

// Canvas editor — TODO: react-konva stage with layered frames/captions/overlays.
export function EditorCanvas({ episodeId }: { episodeId: string }) {
  const document = useEditor((s) => s.document);

  return (
    <div className="grid h-full place-items-center bg-[#0f1816] text-white/70">
      <div className="text-center">
        <p className="font-semibold">Canvas editor</p>
        <p className="text-sm">
          {document ? `${document.layers.length} layers` : `Loading episode ${episodeId}…`}
        </p>
        <p className="mt-2 text-xs text-white/40">Canvas (skeleton).</p>
      </div>
    </div>
  );
}
