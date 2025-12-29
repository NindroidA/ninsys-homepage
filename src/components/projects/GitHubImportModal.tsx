import { AnimatePresence, motion } from 'framer-motion';
import { ExternalLink, Github, Import, Loader2, RefreshCw, Search, Star, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { GitHubRepo } from '../../types/projects';

/**
 * GitHub's official language colors for repository language indicators.
 * Used to display colored dots next to language names in the repo list.
 * Colors sourced from GitHub's linguist library.
 */
const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Rust: '#dea584',
  Go: '#00ADD8',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Scala: '#c22d40',
  Shell: '#89e051',
  HTML: '#e34c26',
  CSS: '#563d7c',
  SCSS: '#c6538c',
  Vue: '#41b883',
  Svelte: '#ff3e00',
  Dart: '#00B4AB',
  Elixir: '#6e4a7e',
  Haskell: '#5e5086',
  Lua: '#000080',
  R: '#198CE7',
  Jupyter: '#DA5B0B',
  Dockerfile: '#384d54',
};

/**
 * Props for the GitHubImportModal component
 * @property isOpen - Controls modal visibility
 * @property onClose - Called when modal should close
 * @property repos - Array of GitHub repositories to display
 * @property loading - Show loading spinner while fetching repos
 * @property error - Error message to display, or null
 * @property onRefresh - Called when refresh button is clicked
 * @property onImport - Called with the full GitHubRepo object when import is clicked
 * @property existingProjectUrls - Array of GitHub URLs already imported (to show "Already Imported" badge)
 */
interface GitHubImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  repos: GitHubRepo[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onImport: (repo: GitHubRepo) => void;
  existingProjectUrls: string[];
}

export function GitHubImportModal({
  isOpen,
  onClose,
  repos,
  loading,
  error,
  onRefresh,
  onImport,
  existingProjectUrls,
}: GitHubImportModalProps) {
  const [search, setSearch] = useState('');

  // Clear search when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearch('');
    }
  }, [isOpen]);

  const filteredRepos = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return repos;
    return repos.filter(
      (repo) =>
        repo.name.toLowerCase().includes(query) ||
        repo.description?.toLowerCase().includes(query) ||
        repo.language?.toLowerCase().includes(query) ||
        repo.topics.some((t) => t.toLowerCase().includes(query))
    );
  }, [repos, search]);

  // Check if repo is already imported as a project
  const isImported = (repo: GitHubRepo) => {
    return existingProjectUrls.some((url) => {
      if (!url) return false;
      // Match exact repo path: github.com/owner/repo-name
      const repoPath = `/${repo.full_name}`;
      return url.includes(repoPath) || url.endsWith(`/${repo.name}`);
    });
  };

  const handleImport = (repo: GitHubRepo) => {
    onImport(repo);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[53] flex items-center justify-center p-4"
          >
            <div
              className="w-full max-w-3xl h-[80vh] flex flex-col bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <Github className="w-6 h-6 text-white" />
                <h2 className="text-2xl font-bold text-white">Import from GitHub</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onRefresh}
                  disabled={loading}
                  className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors disabled:opacity-50"
                  title="Refresh repos"
                >
                  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-white/10 shrink-0">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search repositories..."
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                />
              </div>
            </div>

            {/* Repo list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full text-white/60">
                  <Loader2 className="w-8 h-8 animate-spin mb-4" />
                  <p>Loading repositories...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-full text-red-400">
                  <p className="mb-4">{error}</p>
                  <button
                    onClick={onRefresh}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : filteredRepos.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-white/60">
                  <p>No repositories found</p>
                </div>
              ) : (
                filteredRepos.map((repo) => {
                  const imported = isImported(repo);

                  return (
                    <div
                      key={repo.id}
                      className={`p-4 rounded-xl border transition-colors ${
                        imported
                          ? 'bg-green-500/5 border-green-500/20'
                          : 'bg-white/5 border-white/10 hover:border-purple-500/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-white truncate">{repo.name}</h3>
                            <span className="flex items-center gap-1 text-xs text-yellow-400">
                              <Star className="w-3 h-3 fill-current" />
                              {repo.stargazers_count}
                            </span>
                          </div>
                          {repo.description && (
                            <p className="text-sm text-white/60 mb-2 line-clamp-2">
                              {repo.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-white/40">
                            {repo.language && (
                              <span className="flex items-center gap-1">
                                <span
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: LANGUAGE_COLORS[repo.language] || '#6b7280' }}
                                />
                                {repo.language}
                              </span>
                            )}
                            <span>
                              Updated {new Date(repo.pushed_at).toLocaleDateString()}
                            </span>
                          </div>
                          {repo.topics.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {repo.topics.slice(0, 5).map((topic) => (
                                <span
                                  key={topic}
                                  className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs"
                                >
                                  {topic}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 shrink-0">
                          {imported ? (
                            <span className="px-3 py-1.5 bg-green-500/20 text-green-300 rounded-lg text-sm font-medium">
                              Already Imported
                            </span>
                          ) : (
                            <button
                              onClick={() => handleImport(repo)}
                              className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg text-sm font-medium transition-colors"
                            >
                              <Import className="w-4 h-4" />
                              Import
                            </button>
                          )}
                          <a
                            href={repo.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/60 rounded-lg text-sm transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            View
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 shrink-0">
              <p className="text-center text-xs text-white/40">
                Showing {filteredRepos.length} of {repos.length} repositories
              </p>
            </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
