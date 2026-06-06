import { ExternalLink, KeyRound, Loader2, RefreshCw, Star, Trash2 } from "lucide-react";
import { type JSX, useState } from "react";
import { GithubIcon } from "../../components/icons/BrandIcons";
import { GlassPanel } from "../../components/ui/GlassPanel";
import { IS_DEV } from "../../context/AuthContext";
import { useAuth } from "../../hooks/useAuth";
import { useGitHubRepos } from "../../hooks/useGithubRepos";
import { useSiteConfig } from "../../hooks/useSiteConfig";
import { queryClient } from "../../lib/queryClient";

function maskToken(token: string | null): string {
  if (!token) return "—";
  if (token.length <= 12) return "••••••";
  return `${token.slice(0, 6)}…${token.slice(-4)}`;
}

function Row({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/4 py-2 last:border-0">
      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/40">
        {label}
      </span>
      <span className="truncate font-mono text-xs text-white/75">{value}</span>
    </div>
  );
}

export function AdminUtilities(): JSX.Element {
  const { user, token, expiresAt } = useAuth();
  const { repos, loading, error, refresh } = useGitHubRepos();
  const { reset } = useSiteConfig();
  const [cleared, setCleared] = useState(false);

  const clearCache = () => {
    queryClient.clear();
    setCleared(true);
    setTimeout(() => setCleared(false), 1500);
    refresh();
  };

  return (
    <div>
      <header className="mb-8">
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-white/40">
          {"// tools"}
        </span>
        <h1 className="mt-1 font-display text-3xl font-bold text-white sm:text-4xl">Utilities</h1>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* session */}
        <GlassPanel className="rounded-2xl p-5">
          <div className="mb-3 flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-purple-200" />
            <h2 className="font-display text-lg font-semibold text-white">Session</h2>
          </div>
          <Row label="User" value={user ?? "—"} />
          <Row label="Token" value={maskToken(token)} />
          <Row label="Expires" value={expiresAt ? new Date(expiresAt).toLocaleString() : "—"} />
          <Row label="Mode" value={IS_DEV ? "development" : "production"} />
        </GlassPanel>

        {/* cache tools */}
        <GlassPanel className="rounded-2xl p-5">
          <div className="mb-3 flex items-center gap-2">
            <Trash2 className="h-4 w-4 text-purple-200" />
            <h2 className="font-display text-lg font-semibold text-white">Maintenance</h2>
          </div>
          <p className="mb-4 text-sm text-white/45">
            Clear the in-memory data cache (forces a fresh fetch) or reset the local site config to
            its defaults.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={clearCache}
              className="inline-flex items-center gap-2 rounded-lg border border-purple-300/12 bg-white/4 px-3 py-2 text-sm text-white/80 transition-colors hover:bg-white/8"
            >
              <RefreshCw className="h-4 w-4" /> {cleared ? "Cleared!" : "Clear data cache"}
            </button>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-lg border border-purple-300/12 bg-white/4 px-3 py-2 text-sm text-white/80 transition-colors hover:bg-white/8"
            >
              <Trash2 className="h-4 w-4" /> Reset site config
            </button>
          </div>
        </GlassPanel>
      </div>

      {/* github repos */}
      <GlassPanel className="mt-5 rounded-2xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GithubIcon className="h-4 w-4 text-purple-200" />
            <h2 className="font-display text-lg font-semibold text-white">GitHub repositories</h2>
          </div>
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="rounded-lg border border-purple-300/12 bg-white/4 p-2 text-white/70 transition-colors hover:bg-white/8 disabled:opacity-50"
            aria-label="Refresh repositories"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 py-6 text-white/50">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading repos…
          </div>
        ) : error ? (
          <p className="py-2 text-sm text-rose-300">{error}</p>
        ) : repos.length === 0 ? (
          <p className="py-2 text-sm text-white/45">No repositories.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {repos.map((repo) => (
              <li
                key={repo.id}
                className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/2 px-3 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-white/85">{repo.name}</span>
                    {repo.stargazers_count > 0 && (
                      <span className="flex items-center gap-0.5 font-mono text-[10px] text-white/35">
                        <Star className="h-3 w-3" /> {repo.stargazers_count}
                      </span>
                    )}
                  </div>
                  {repo.description && (
                    <p className="mt-0.5 truncate text-xs text-white/45">{repo.description}</p>
                  )}
                  {repo.language && (
                    <span className="mt-1 inline-block font-mono text-[10px] text-white/35">
                      {repo.language}
                    </span>
                  )}
                </div>
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-white/40 transition-colors hover:text-white"
                  aria-label={`Open ${repo.name} on GitHub`}
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </li>
            ))}
          </ul>
        )}
      </GlassPanel>
    </div>
  );
}
