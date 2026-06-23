import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <h1 className="mb-2 text-3xl font-bold">Podcast Design Canvas</h1>
      <p className="mb-8 max-w-2xl text-muted">
        Self-serve visual podcast production workspace. Import synced speaker tracks,
        choose a preset, refine on the canvas, and publish a polished long-form episode.
      </p>

      <div className="flex gap-3">
        <Link
          href="/episodes/new"
          className="rounded-md bg-accent px-4 py-2 font-semibold text-white"
        >
          New episode
        </Link>
      </div>

      <p className="mt-10 text-sm text-muted">Skeleton scaffold.</p>
    </main>
  );
}
