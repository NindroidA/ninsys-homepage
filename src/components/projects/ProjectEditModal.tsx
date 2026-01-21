import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Plus, Star, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { CreateProjectInput, Project, UpdateProjectInput } from '../../types/projects';
import { getLucideIcon, PROJECT_ICONS } from '../../utils/iconUtils';

// Common technology options for the dropdown
const COMMON_TECHNOLOGIES = [
  'React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'Go', 'Rust',
  'Java', 'C#', 'C++', 'Ruby', 'PHP', 'Swift', 'Kotlin',
  'HTML', 'CSS', 'Tailwind CSS', 'SCSS', 'Sass',
  'Next.js', 'Vue.js', 'Angular', 'Svelte', 'Express.js', 'FastAPI', 'Django',
  'PostgreSQL', 'MongoDB', 'MySQL', 'Redis', 'SQLite',
  'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'Vercel', 'Netlify',
  'Git', 'GitHub Actions', 'CI/CD', 'REST API', 'GraphQL', 'WebSocket',
  'Three.js', 'Framer Motion', 'TensorFlow', 'PyTorch',
] as const;

// Month names for date formatting
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
] as const;

// Convert "Month Year" to "YYYY-MM" for storage
function formatDateForStorage(month: string, year: string): string {
  const monthIndex = MONTHS.indexOf(month as typeof MONTHS[number]);
  if (monthIndex === -1) return `${year}-01`;
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
}

// Parse "YYYY-MM" or "YYYY" to { month, year }
function parseDateFromStorage(date: string): { month: string; year: string } {
  const parts = date.split('-');
  const year = parts[0] || String(new Date().getFullYear());
  const monthIndex = parts[1] ? parseInt(parts[1], 10) - 1 : 0;
  const month = MONTHS[monthIndex] || 'January';
  return { month, year };
}

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
  /** Optional: Repository created date in YYYY-MM format */
  createdAt?: string;
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
  const [showTechDropdown, setShowTechDropdown] = useState(false);
  const [category, setCategory] = useState<'current' | 'completed'>('current');
  const [icon, setIcon] = useState<string>('Folder');
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [githubUrl, setGithubUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [dateMonth, setDateMonth] = useState('January');
  const [dateYear, setDateYear] = useState(String(new Date().getFullYear()));
  const [useRepoCreatedDate, setUseRepoCreatedDate] = useState(false);
  const [featured, setFeatured] = useState(false);

  // Refs for click-outside handling
  const iconPickerRef = useRef<HTMLDivElement>(null);
  const techDropdownRef = useRef<HTMLDivElement>(null);

  // Click-outside handler for icon picker
  useEffect(() => {
    if (!showIconPicker) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (iconPickerRef.current && !iconPickerRef.current.contains(event.target as Node)) {
        setShowIconPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showIconPicker]);

  // Click-outside handler for tech dropdown
  useEffect(() => {
    if (!showTechDropdown) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (techDropdownRef.current && !techDropdownRef.current.contains(event.target as Node)) {
        setShowTechDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTechDropdown]);

  // Reset form when modal opens/closes or project changes
  useEffect(() => {
    if (isOpen && project) {
      // Editing existing project
      setTitle(project.title);
      setDescription(project.description);
      setTechnologies(project.technologies);
      setCategory(project.category);
      setIcon(project.icon || 'Folder');
      setGithubUrl(project.githubUrl || '');
      setLiveUrl(project.liveUrl || '');
      const parsed = parseDateFromStorage(project.date);
      setDateMonth(parsed.month);
      setDateYear(parsed.year);
      setFeatured(project.featured || false);
      setUseRepoCreatedDate(false);
    } else if (isOpen && initialData) {
      // Creating new project with pre-filled data from GitHub import
      setTitle(initialData.title);
      setDescription(initialData.description);
      setTechnologies(initialData.technologies);
      setCategory('current');
      setIcon('Folder');
      setGithubUrl(initialData.githubUrl);
      setLiveUrl('');
      const parsed = parseDateFromStorage(initialData.date);
      setDateMonth(parsed.month);
      setDateYear(parsed.year);
      setFeatured(false);
      setUseRepoCreatedDate(false);
    } else if (isOpen && !project) {
      // New project - reset to defaults
      setTitle('');
      setDescription('');
      setTechnologies([]);
      setCategory('current');
      setIcon('Folder');
      setGithubUrl('');
      setLiveUrl('');
      setDateMonth(MONTHS[new Date().getMonth()] || 'January');
      setDateYear(String(new Date().getFullYear()));
      setFeatured(false);
      setUseRepoCreatedDate(false);
    }
    setTechInput('');
    setShowTechDropdown(false);
    setShowIconPicker(false);
  }, [isOpen, project, initialData]);

  // Handle using repo created date
  useEffect(() => {
    if (useRepoCreatedDate && initialData?.createdAt) {
      const parsed = parseDateFromStorage(initialData.createdAt);
      setDateMonth(parsed.month);
      setDateYear(parsed.year);
    } else if (!useRepoCreatedDate && initialData) {
      const parsed = parseDateFromStorage(initialData.date);
      setDateMonth(parsed.month);
      setDateYear(parsed.year);
    }
  }, [useRepoCreatedDate, initialData]);

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

  const handleAddTechFromDropdown = (tech: string) => {
    if (!technologies.includes(tech)) {
      setTechnologies([...technologies, tech]);
    }
    setShowTechDropdown(false);
    setTechInput('');
  };

  const filteredTechOptions = COMMON_TECHNOLOGIES.filter(
    tech => !technologies.includes(tech) && tech.toLowerCase().includes(techInput.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data: CreateProjectInput | UpdateProjectInput = {
      title,
      description,
      technologies,
      category,
      icon: icon || 'Folder',
      githubUrl: githubUrl || undefined,
      liveUrl: liveUrl || undefined,
      date: formatDateForStorage(dateMonth, dateYear),
      featured,
    };

    await onSave(data);
    onClose();
  };

  // Get the selected icon component
  const SelectedIcon = getLucideIcon(icon);

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

              {/* Icon Picker */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Icon
                </label>
                <div className="relative" ref={iconPickerRef}>
                  <button
                    type="button"
                    onClick={() => setShowIconPicker(!showIconPicker)}
                    className="flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white hover:border-white/20 transition-colors w-full"
                  >
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      {SelectedIcon && <SelectedIcon className="w-5 h-5 text-purple-300" />}
                    </div>
                    <span className="flex-1 text-left">{PROJECT_ICONS.find(i => i.name === icon)?.label || 'Folder'}</span>
                    <ChevronDown className={`w-4 h-4 text-white/50 transition-transform ${showIconPicker ? 'rotate-180' : ''}`} />
                  </button>
                  {showIconPicker && (
                    <div className="absolute z-10 mt-2 w-full p-3 bg-slate-800 border border-white/10 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                      <div className="grid grid-cols-5 gap-2">
                        {PROJECT_ICONS.map(({ name, label }) => {
                          const Icon = getLucideIcon(name);
                          if (!Icon) return null;
                          return (
                            <button
                              key={name}
                              type="button"
                              onClick={() => {
                                setIcon(name);
                                setShowIconPicker(false);
                              }}
                              title={label}
                              className={`p-2 rounded-lg border transition-colors ${
                                icon === name
                                  ? 'bg-purple-500/20 border-purple-500'
                                  : 'bg-white/5 border-white/10 hover:border-white/20'
                              }`}
                            >
                              <Icon className="w-5 h-5 text-white/70 mx-auto" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Technologies with dropdown */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Technologies
                </label>
                <div className="relative" ref={techDropdownRef}>
                  <div className="flex gap-2 mb-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={techInput}
                        onChange={(e) => {
                          setTechInput(e.target.value);
                          setShowTechDropdown(true);
                        }}
                        onFocus={() => setShowTechDropdown(true)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const firstOption = filteredTechOptions[0];
                            if (firstOption) {
                              handleAddTechFromDropdown(firstOption);
                            } else {
                              handleAddTech();
                            }
                          }
                          if (e.key === 'Escape') {
                            setShowTechDropdown(false);
                          }
                        }}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                        placeholder="Search or add technology..."
                      />
                      {showTechDropdown && filteredTechOptions.length > 0 && (
                        <div className="absolute z-[100] mt-1 w-full max-h-48 overflow-y-auto bg-slate-800 border border-white/10 rounded-lg shadow-xl">
                          {filteredTechOptions.slice(0, 10).map((tech) => (
                            <button
                              key={tech}
                              type="button"
                              onClick={() => handleAddTechFromDropdown(tech)}
                              className="w-full px-4 py-2 text-left text-white/80 hover:bg-purple-500/20 transition-colors first:rounded-t-lg last:rounded-b-lg"
                            >
                              {tech}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleAddTech}
                      className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
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

              {/* Category, Date row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    Month
                  </label>
                  <select
                    value={dateMonth}
                    onChange={(e) => setDateMonth(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                  >
                    {MONTHS.map((month) => (
                      <option key={month} value={month} className="bg-slate-900">{month}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Year
                  </label>
                  <input
                    type="number"
                    value={dateYear}
                    onChange={(e) => setDateYear(e.target.value)}
                    min="2000"
                    max="2100"
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                    placeholder="2025"
                  />
                </div>
              </div>

              {/* Use repo created date option - only show when importing from GitHub */}
              {initialData?.createdAt && (
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={useRepoCreatedDate}
                      onChange={(e) => setUseRepoCreatedDate(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className={`w-10 h-6 rounded-full transition-colors ${
                        useRepoCreatedDate ? 'bg-purple-500' : 'bg-white/10'
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                          useRepoCreatedDate ? 'left-5' : 'left-1'
                        }`}
                      />
                    </div>
                  </div>
                  <span className="text-white/70 text-sm">
                    Use repository creation date instead of last push date
                  </span>
                </label>
              )}

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
