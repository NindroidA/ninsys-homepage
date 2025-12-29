import { Button, Card, Section } from '../components/shared/ui';
import { motion } from 'framer-motion';
import { Edit2, Github, Loader2, Plus, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import FooterComponent from '../components/Footer';
import Navbar from '../components/Navbar';
import {
  DeleteConfirmModal,
  GitHubImportModal,
  ProjectDragList,
  ProjectEditModal,
} from '../components/projects';
import { ProjectInitialData } from '../components/projects/ProjectEditModal';
import { useAdminVisible } from '../hooks/useAuth';
import { useGitHubRepos } from '../hooks/useGithubRepos';
import { useProjects } from '../hooks/useProjects';
import { CreateProjectInput, GitHubRepo, Project, UpdateProjectInput } from '../types/projects';

export default function Projects() {
  const isAdminVisible = useAdminVisible();
  const {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    reorderProjects,
    setLocalProjects,
  } = useProjects();

  const {
    repos,
    loading: reposLoading,
    error: reposError,
    refresh: refreshRepos,
  } = useGitHubRepos();

  // UI State
  const [filter, setFilter] = useState<'all' | 'current' | 'completed'>('all');
  const [isEditing, setIsEditing] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [importInitialData, setImportInitialData] = useState<ProjectInitialData | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [githubModalOpen, setGithubModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Filter projects
  const filteredProjects = projects.filter((project) =>
    filter === 'all' ? true : project.category === filter
  );

  // Handlers
  const handleToggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleNewProject = () => {
    setEditingProject(null);
    setEditModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (project: Project) => {
    setDeletingProject(project);
    setDeleteModalOpen(true);
  };

  const handleSaveProject = useCallback(
    async (data: CreateProjectInput | UpdateProjectInput) => {
      setSaving(true);
      try {
        if (editingProject) {
          await updateProject(editingProject.id, data);
        } else {
          await createProject(data as CreateProjectInput);
        }
      } finally {
        setSaving(false);
      }
    },
    [editingProject, updateProject, createProject]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingProject) return;
    setDeleting(true);
    try {
      await deleteProject(deletingProject.id);
    } finally {
      setDeleting(false);
    }
  }, [deletingProject, deleteProject]);

  // Convert GitHub repo to initial data for the edit modal
  const handleImportRepo = useCallback((repo: GitHubRepo) => {
    // Convert repo data to initial form data (project is NOT created until save)
    const initialData: ProjectInitialData = {
      title: repo.name.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()), // Convert kebab-case to Title Case
      description: repo.description || '',
      technologies: repo.language ? [repo.language, ...repo.topics.slice(0, 4)] : repo.topics.slice(0, 5),
      githubUrl: repo.html_url,
      date: new Date(repo.pushed_at).toISOString().slice(0, 7), // YYYY-MM
    };

    // Close GitHub modal and open edit modal with pre-filled data
    setGithubModalOpen(false);
    setEditingProject(null); // Not editing existing project
    setImportInitialData(initialData);
    setEditModalOpen(true);
  }, []);

  const existingProjectUrls = projects
    .map((p) => p.githubUrl)
    .filter(Boolean) as string[];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Navbar />

      <Section
        title="Projects"
        subtitle="A showcase of things I've built and am currently working on"
        padding="lg"
        maxWidth="6xl"
        className="pt-8"
      >
        {/* Admin controls */}
        {isAdminVisible && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 justify-center mb-8"
          >
            <Button
              onClick={handleToggleEdit}
              variant={isEditing ? 'primary' : 'secondary'}
              size="sm"
              icon={isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
            >
              {isEditing ? 'Done Editing' : 'Edit Projects'}
            </Button>
            {isEditing && (
              <>
                <Button
                  onClick={handleNewProject}
                  variant="glass"
                  size="sm"
                  icon={<Plus className="w-4 h-4" />}
                >
                  New Project
                </Button>
                <Button
                  onClick={() => setGithubModalOpen(true)}
                  variant="glass"
                  size="sm"
                  icon={<Github className="w-4 h-4" />}
                >
                  Import from GitHub
                </Button>
              </>
            )}
          </motion.div>
        )}

        {/* Filter buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="flex gap-4 justify-center flex-wrap mb-12"
        >
          {(['all', 'current', 'completed'] as const).map((category) => (
            <Button
              key={category}
              onClick={() => setFilter(category)}
              variant={filter === category ? 'primary' : 'secondary'}
              size="md"
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Button>
          ))}
        </motion.div>

        {/* Loading state */}
        {loading ? (
          <Card padding="xl">
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin mb-4" />
              <p className="text-white/70">Loading projects...</p>
            </div>
          </Card>
        ) : error ? (
          <Card padding="xl">
            <div className="text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <p className="text-white/60 text-sm">
                Failed to load projects. Please try again later.
              </p>
            </div>
          </Card>
        ) : filteredProjects.length === 0 ? (
          <Card padding="xl">
            <div className="text-center">
              <p className="text-white/70 text-lg">No projects found in this category</p>
              {isEditing && (
                <Button onClick={handleNewProject} variant="glass" size="sm" className="mt-4">
                  Add your first project
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <ProjectDragList
            projects={filteredProjects}
            isEditing={isEditing}
            onReorder={reorderProjects}
            onEdit={handleEditProject}
            onDelete={handleDeleteClick}
            setLocalProjects={setLocalProjects}
          />
        )}
      </Section>

      <FooterComponent />

      {/* Modals */}
      <ProjectEditModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingProject(null);
          setImportInitialData(null);
        }}
        onSave={handleSaveProject}
        project={editingProject}
        initialData={importInitialData}
        saving={saving}
      />

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeletingProject(null);
        }}
        onConfirm={handleConfirmDelete}
        title={deletingProject?.title || ''}
        deleting={deleting}
      />

      <GitHubImportModal
        isOpen={githubModalOpen}
        onClose={() => setGithubModalOpen(false)}
        repos={repos}
        loading={reposLoading}
        error={reposError}
        onRefresh={refreshRepos}
        onImport={handleImportRepo}
        existingProjectUrls={existingProjectUrls}
      />
    </div>
  );
}
