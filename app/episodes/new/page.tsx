export default function NewEpisodePage() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <h1 className="mb-2 text-3xl font-bold">New episode</h1>
      <p className="mb-8 max-w-2xl text-muted">
        Paste a Riverside share link or upload separate synced speaker files, then assign
        each to a speaker bucket (Host, Guest 1, …).
      </p>
      {/* TODO: ingest form -> POST /api/upload + POST /api/episodes */}
      <p className="text-sm text-muted">Ingest form not implemented yet (skeleton).</p>
    </main>
  );
}
