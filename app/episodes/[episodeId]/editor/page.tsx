import { EditorCanvas } from "@/editor/Canvas";

export default async function EditorPage({
  params,
}: {
  params: Promise<{ episodeId: string }>;
}) {
  const { episodeId } = await params;
  return (
    <main className="flex h-screen flex-col">
      <header className="border-b border-line px-5 py-3">
        <h1 className="font-semibold">Editor — {episodeId}</h1>
      </header>
      <div className="min-h-0 flex-1">
        <EditorCanvas episodeId={episodeId} />
      </div>
    </main>
  );
}
