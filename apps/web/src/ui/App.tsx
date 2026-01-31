import { useMemo, useState } from 'react';

const API = 'http://localhost:3001';

export function App() {
  const [file, setFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filename = useMemo(() => file?.name ?? 'No file selected', [file]);

  async function submit() {
    setError(null);
    if (!file) return;
    setBusy(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`${API}/api/jobs`, {
        method: 'POST',
        body: form
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? 'Upload failed');
      setJobId(body.jobId);
    } catch (e: any) {
      setError(e.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="text-3xl font-semibold tracking-tight">pixpipe</h1>
        <p className="mt-2 text-zinc-300">
          Upload an image, get a jobId, process it asynchronously.
        </p>

        <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
          <label className="block text-sm font-medium text-zinc-200">
            Image
          </label>
          <input
            className="mt-2 block w-full text-sm text-zinc-200 file:mr-4 file:rounded-lg file:border-0 file:bg-zinc-800 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-zinc-100 hover:file:bg-zinc-700"
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <div className="mt-2 text-xs text-zinc-400">{filename}</div>

          <button
            className="mt-4 inline-flex items-center justify-center rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-50"
            disabled={!file || busy}
            onClick={submit}
          >
            {busy ? 'Uploading…' : 'Create job'}
          </button>

          {error && (
            <div className="mt-4 rounded-lg border border-red-900/60 bg-red-950/40 p-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {jobId && (
            <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950/40 p-3 text-sm text-zinc-100">
              <div className="text-zinc-400">jobId</div>
              <div className="font-mono">{jobId}</div>
              <div className="mt-2 text-zinc-400">
                Status endpoint: <span className="font-mono">GET /api/jobs/{jobId}</span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-10 text-xs text-zinc-500">
          MVP skeleton: worker creates a thumbnail in S3, status is not wired to DB yet.
        </div>
      </div>
    </div>
  );
}
