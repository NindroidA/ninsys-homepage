import { motion } from "framer-motion";
import { Edit2, Plus, X } from "lucide-react";
import { useCallback, useState } from "react";
import FooterComponent from "../components/Footer";
import { GithubIcon } from "../components/icons/BrandIcons";
import Navbar from "../components/Navbar";
import {
  DeleteConfirmModal,
  GitHubImportModal,
  ProjectDragList,
  ProjectEditModal,
} from "../components/projects";
import type { ProjectInitialData } from "../components/projects/ProjectEditModal";
import { Seo } from "../components/Seo";
import { Button, Card, Section } from "../components/shared/ui";
import { BrandLoader } from "../components/ui/BrandLoader";
import { useAdminVisible } from "../hooks/useAuth";
import { useGitHubRepos } from "../hooks/useGithubRepos";
import { useProjects } from "../hooks/useProjects";
import type {
  CreateProjectInput,
  GitHubRepo,
  Project,
  UpdateProjectInput,
} from "../types/projects";
import { projectSections } from "../utils/projectCategories";

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
  const [isEditing, setIsEditing] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [importInitialData, setImportInitialData] = useState<ProjectInitialData | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [githubModalOpen, setGithubModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Current, then Notable (the API's "completed"), each in admin order; empty ones are left out
  const sections = projectSections(projects);

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
    [editingProject, updateProject, createProject],
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
      title: repo.name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), // Convert kebab-case to Title Case
      description: repo.description || "",
      technologies: repo.language
        ? [repo.language, ...repo.topics.slice(0, 4)]
        : repo.topics.slice(0, 5),
      githubUrl: repo.html_url,
      date: new Date(repo.pushed_at).toISOString().slice(0, 7), // YYYY-MM
    };

    // Close GitHub modal and open edit modal with pre-filled data
    setGithubModalOpen(false);
    setEditingProject(null); // Not editing existing project
    setImportInitialData(initialData);
    setEditModalOpen(true);
  }, []);

  const existingProjectUrls = projects.map((p) => p.githubUrl).filter(Boolean) as string[];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Seo
        title="Projects"
        description="Things I've built and shipped — projects, experiments, and self-hosted systems by NindroidA."
        path="/projects"
      />
      <Navbar />

      <Section
        title="Projects"
        subtitle="A showcase of things I've built and am currently working on"
        padding="lg"
        maxWidth="6xl"
        className="pt-6 md:pt-8"
      >
        {/* Admin controls */}
        {isAdminVisible && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-2 sm:gap-3 justify-center mb-6 sm:mb-8"
          >
            <Button
              onClick={handleToggleEdit}
              variant={isEditing ? "primary" : "secondary"}
              size="sm"
              icon={isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
            >
              {isEditing ? "Done Editing" : "Edit Projects"}
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
                  icon={<GithubIcon className="w-4 h-4" />}
                >
                  Import from GitHub
                </Button>
              </>
            )}
          </motion.div>
        )}

        {/* Loading state */}
        {loading ? (
          <Card padding="xl">
            <BrandLoader label="loading projects" />
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
        ) : sections.length === 0 ? (
          <Card padding="xl">
            <div className="flex flex-col items-center text-center">
              <p className="text-white/70 text-lg">No projects to show yet</p>
              <p className="mt-2 text-sm text-white/45">
                In the meantime, everything I'm building is on GitHub.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2 sm:gap-3">
                <Button
                  href="https://github.com/NindroidA"
                  target="_blank"
                  variant="secondary"
                  size="sm"
                  icon={<GithubIcon className="w-4 h-4" />}
                >
                  GitHub
                </Button>
                {isEditing && (
                  <Button onClick={handleNewProject} variant="glass" size="sm">
                    Add your first project
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ) : (
          <div className="space-y-10 sm:space-y-14">
            {sections.map((section) => (
              <section key={section.category} aria-labelledby={`projects-${section.category}`}>
                <div className="mb-4 flex items-center gap-3 sm:mb-6">
                  <h3
                    id={`projects-${section.category}`}
                    className="font-display text-xl font-bold text-white sm:text-2xl"
                  >
                    {section.label}
                  </h3>
                  <span className="rounded-full border border-purple-300/15 bg-white/4 px-2 py-0.5 font-mono text-[11px] text-white/50">
                    {section.projects.length}
                  </span>
                  <span
                    aria-hidden="true"
                    className="h-px flex-1 bg-linear-to-r from-purple-300/25 to-transparent"
                  />
                </div>
                <ProjectDragList
                  projects={section.projects}
                  allProjects={projects}
                  isEditing={isEditing}
                  onReorder={reorderProjects}
                  onEdit={handleEditProject}
                  onDelete={handleDeleteClick}
                  setLocalProjects={setLocalProjects}
                />
              </section>
            ))}
          </div>
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
        title={deletingProject?.title || ""}
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
