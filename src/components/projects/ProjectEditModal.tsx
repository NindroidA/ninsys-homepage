import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Star, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CreateProjectInput, Project, UpdateProjectInput } from '../../types/projects';

/**
 * Pre-fill data for the project form when importing from GitHub.
 * Used to populate the form before the project is actually created.
 */
export interface ProjectInitialData {
  /** Project title (converted from repo name to Title Case) */
  title: string;
  /** Project description from GitHub repo */
  description: string;
  /** Technologies list (repo language + topics) */
  technologies: string[];
  /** GitHub repository URL */
  githubUrl: string;
  /** Date in YYYY-MM format (from repo's last push date) */
  date: string;
}

/**
 * Props for the ProjectEditModal component
 * @property isOpen - Controls modal visibility
 * @property onClose - Called when modal should close
 * @property onSave - Called with form data when save button is clicked
 * @property project - Existing project to edit, or null/undefined for create mode
 * @property initialData - Pre-fill data from GitHub import (only used when project is null)
 * @property saving - Show loading state on save button
 * @property error - Error message to display in the form
 */
interface ProjectEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateProjectInput | UpdateProjectInput) => Promise<void>;
  project?: Project | null;
  initialData?: ProjectInitialData | null;
  saving?: boolean;
  error?: string | null;
}

export function ProjectEditModal({ isOpen, onClose, onSave, project, initialData, saving, error }: ProjectEditModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [techInput, setTechInput] = useState('');
  const [category, setCategory] = useState<'current' | 'completed'>('current');
  const [githubUrl, setGithubUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [date, setDate] = useState('');
  const [featured, setFeatured] = useState(false);

  // Reset form when modal opens/closes or project changes
  useEffect(() => {
    if (isOpen && project) {
      // Editing existing project
      setTitle(project.title);
      setDescription(project.description);
      setTechnologies(project.technologies);
      setCategory(project.category);
      setGithubUrl(project.githubUrl || '');
      setLiveUrl(project.liveUrl || '');
      setDate(project.date);
      setFeatured(project.featured || false);
    } else if (isOpen && initialData) {
      // Creating new project with pre-filled data from GitHub import
      setTitle(initialData.title);
      setDescription(initialData.description);
      setTechnologies(initialData.technologies);
      setCategory('current');
      setGithubUrl(initialData.githubUrl);
      setLiveUrl('');
      setDate(initialData.date);
      setFeatured(false);
    } else if (isOpen && !project) {
      // New project - reset to defaults
      setTitle('');
      setDescription('');
      setTechnologies([]);
      setCategory('current');
      setGithubUrl('');
      setLiveUrl('');
      setDate(new Date().toISOString().slice(0, 7)); // YYYY-MM
      setFeatured(false);
    }
    setTechInput('');
  }, [isOpen, project, initialData]);

  const handleAddTech = () => {
    const tech = techInput.trim();
    if (tech && !technologies.includes(tech)) {
      setTechnologies([...technologies, tech]);
      setTechInput('');
    }
  };

  const handleRemoveTech = (tech: string) => {
    setTechnologies(technologies.filter((t) => t !== tech));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data: CreateProjectInput | UpdateProjectInput = {
      title,
      description,
      technologies,
      category,
      githubUrl: githubUrl || undefined,
      liveUrl: liveUrl || undefined,
      date,
      featured,
    };

    await onSave(data);
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
            className="fixed inset-0 z-[52] flex items-center justify-center p-4"
          >
            <div
              className="w-full max-w-2xl max-h-[90vh] overflow-auto bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-2xl font-bold text-white">
                {project ? 'Edit Project' : initialData ? 'Import Project' : 'New Project'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                  placeholder="My Awesome Project"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all resize-none"
                  placeholder="A brief description of the project..."
                />
              </div>

              {/* Technologies */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Technologies
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTech();
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                    placeholder="Add technology..."
                  />
                  <button
                    type="button"
                    onClick={handleAddTech}
                    className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {technologies.map((tech) => (
                    <span
                      key={tech}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-white/10 rounded-full text-sm text-white/80"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => handleRemoveTech(tech)}
                        className="p-0.5 hover:bg-white/10 rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Category and Date row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as 'current' | 'completed')}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                  >
                    <option value="current" className="bg-slate-900">Current</option>
                    <option value="completed" className="bg-slate-900">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Date (YYYY-MM)
                  </label>
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    pattern="\d{4}(-\d{2})?"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                    placeholder="2024-12"
                  />
                </div>
              </div>

              {/* URLs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    GitHub URL (optional)
                  </label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                    placeholder="https://github.com/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Live URL (optional)
                  </label>
                  <input
                    type="url"
                    value={liveUrl}
                    onChange={(e) => setLiveUrl(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* Featured toggle */}
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-10 h-6 rounded-full transition-colors ${
                      featured ? 'bg-purple-500' : 'bg-white/10'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                        featured ? 'left-5' : 'left-1'
                      }`}
                    />
                  </div>
                </div>
                <span className="flex items-center gap-2 text-white/70">
                  <Star className="w-4 h-4" />
                  Featured Project
                </span>
              </label>

              {/* Error display */}
              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 text-white/70 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !title || !description}
                  className="flex-1 px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/30 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                >
                  {saving ? 'Saving...' : project ? 'Save Changes' : initialData ? 'Import & Create' : 'Create Project'}
                </button>
              </div>
            </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
