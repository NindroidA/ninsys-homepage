import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { Button, Card, FloatingElements, GradientText } from '../components/shared/ui';
import { motion } from 'framer-motion';
import { Edit2, Github, Linkedin, Loader2, Mail, MapPin, Plus, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { ProfileEditModal, SectionCard, SectionEditModal } from '../components/about';
import { DeleteConfirmModal } from '../components/projects';
import FooterComponent from '../components/Footer';
import Navbar from '../components/Navbar';
import { useAboutData } from '../hooks/useAboutData';
import { useAdminVisible } from '../hooks/useAuth';
import { AboutProfile, AboutSection } from '../types/about';

export default function AboutMe() {
  const isAdminVisible = useAdminVisible();
  const {
    data,
    loading,
    error,
    updateProfile,
    updateSections,
    setLocalSections,
  } = useAboutData();

  // UI State
  const [isEditing, setIsEditing] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<AboutSection | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingSection, setDeletingSection] = useState<AboutSection | null>(null);
  const [saving, setSaving] = useState(false);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Handlers
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const oldIndex = data.sections.findIndex((s) => s.id === active.id);
        const newIndex = data.sections.findIndex((s) => s.id === over.id);

        const newSections = arrayMove(data.sections, oldIndex, newIndex).map((s, i) => ({
          ...s,
          order: i,
        }));

        // Optimistic update
        setLocalSections(newSections);

        // Persist
        updateSections(newSections);
      }
    },
    [data.sections, setLocalSections, updateSections]
  );

  const handleMoveUp = useCallback(
    (index: number) => {
      if (index === 0) return;
      const newSections = arrayMove(data.sections, index, index - 1).map((s, i) => ({
        ...s,
        order: i,
      }));
      setLocalSections(newSections);
      updateSections(newSections);
    },
    [data.sections, setLocalSections, updateSections]
  );

  const handleMoveDown = useCallback(
    (index: number) => {
      if (index === data.sections.length - 1) return;
      const newSections = arrayMove(data.sections, index, index + 1).map((s, i) => ({
        ...s,
        order: i,
      }));
      setLocalSections(newSections);
      updateSections(newSections);
    },
    [data.sections, setLocalSections, updateSections]
  );

  const handleSaveProfile = useCallback(
    async (profile: AboutProfile) => {
      setSaving(true);
      await updateProfile(profile);
      setSaving(false);
    },
    [updateProfile]
  );

  const handleSaveSection = useCallback(
    async (sectionData: Omit<AboutSection, 'id' | 'order'> & { id?: string }) => {
      setSaving(true);
      try {
        if (sectionData.id) {
          // Update existing section
          const updatedSections = data.sections.map((s) =>
            s.id === sectionData.id ? { ...s, ...sectionData } : s
          );
          await updateSections(updatedSections);
        } else {
          // Add new section
          const newSection: AboutSection = {
            ...sectionData,
            id: `sec_${Date.now()}`,
            order: data.sections.length,
          } as AboutSection;
          await updateSections([...data.sections, newSection]);
        }
      } finally {
        setSaving(false);
      }
    },
    [data.sections, updateSections]
  );

  const handleDeleteSection = useCallback(async () => {
    if (!deletingSection) return;
    setSaving(true);
    try {
      const updatedSections = data.sections
        .filter((s) => s.id !== deletingSection.id)
        .map((s, i) => ({ ...s, order: i }));
      await updateSections(updatedSections);
    } finally {
      setSaving(false);
    }
  }, [deletingSection, data.sections, updateSections]);

  const handleEditSection = (section: AboutSection) => {
    setEditingSection(section);
    setSectionModalOpen(true);
  };

  const handleDeleteClick = (section: AboutSection) => {
    setDeletingSection(section);
    setDeleteModalOpen(true);
  };

  const handleNewSection = () => {
    setEditingSection(null);
    setSectionModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        <Navbar />
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin mb-4" />
          <p className="text-white/70">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        <Navbar />
        <Card padding="xl">
          <div className="text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <p className="text-white/60 text-sm">Failed to load about data.</p>
          </div>
        </Card>
      </div>
    );
  }

  const { profile, sections } = data;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Navbar />
      <FloatingElements variant="purple" intensity="medium" />

      {/* Main content */}
      <div className="relative z-10 pt-8 pb-20 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Admin controls */}
          {isAdminVisible && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 justify-center mb-8"
            >
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant={isEditing ? 'primary' : 'secondary'}
                size="sm"
                icon={isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
              >
                {isEditing ? 'Done Editing' : 'Edit Page'}
              </Button>
              {isEditing && (
                <Button
                  onClick={handleNewSection}
                  variant="glass"
                  size="sm"
                  icon={<Plus className="w-4 h-4" />}
                >
                  Add Section
                </Button>
              )}
            </motion.div>
          )}

          {/* Header section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mb-12"
          >
            <Card padding="lg">
              {/* Edit profile button */}
              {isEditing && (
                <div className="flex justify-end mb-4">
                  <button
                    onClick={() => setProfileModalOpen(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-purple-500/20 text-white/60 hover:text-purple-300 rounded-lg transition-colors text-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </button>
                </div>
              )}

              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                {/* Profile picture */}
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl border-4 border-white/20 overflow-hidden">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-5xl">👤</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
                    <GradientText variant="primary">{profile.name}</GradientText>
                  </h1>
                  <p className="text-xl text-white/70 mb-4">{profile.tagline}</p>
                  <div className="flex items-center justify-center md:justify-start gap-2 text-white/60 mb-6">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.location}</span>
                  </div>

                  {/* Social links */}
                  <div className="flex gap-3 justify-center md:justify-start">
                    {profile.social.github && (
                      <a
                        href={profile.social.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-white/10 hover:bg-white/20 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200 group"
                      >
                        <Github className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                      </a>
                    )}
                    {profile.social.linkedin && (
                      <a
                        href={profile.social.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-white/10 hover:bg-white/20 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200 group"
                      >
                        <Linkedin className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                      </a>
                    )}
                    {profile.social.email && (
                      <a
                        href={`mailto:${profile.social.email}`}
                        className="p-3 bg-white/10 hover:bg-white/20 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200 group"
                      >
                        <Mail className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio */}
              {profile.bio.length > 0 && (
                <div className="mt-8 pt-8 border-t border-white/10 space-y-4">
                  {profile.bio.map((paragraph, index) => (
                    <p key={index} className="text-white/70 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>

          {/* Sections grid with drag-and-drop */}
          {sections.length > 0 && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sections.map((s) => s.id)}
                strategy={rectSortingStrategy}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {sections.map((section, index) => (
                    <SectionCard
                      key={section.id}
                      section={section}
                      index={index}
                      isEditing={isEditing}
                      onEdit={handleEditSection}
                      onDelete={handleDeleteClick}
                      onMoveUp={() => handleMoveUp(index)}
                      onMoveDown={() => handleMoveDown(index)}
                      isFirst={index === 0}
                      isLast={index === sections.length - 1}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          {/* Empty state */}
          {sections.length === 0 && isEditing && (
            <Card padding="xl">
              <div className="text-center">
                <p className="text-white/70 mb-4">No sections yet. Add your first section!</p>
                <Button onClick={handleNewSection} variant="glass" size="sm">
                  Add Section
                </Button>
              </div>
            </Card>
          )}

        </div>
      </div>

      <FooterComponent />

      {/* Modals */}
      <ProfileEditModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onSave={handleSaveProfile}
        profile={profile}
        saving={saving}
      />

      <SectionEditModal
        isOpen={sectionModalOpen}
        onClose={() => {
          setSectionModalOpen(false);
          setEditingSection(null);
        }}
        onSave={handleSaveSection}
        section={editingSection}
        saving={saving}
      />

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeletingSection(null);
        }}
        onConfirm={handleDeleteSection}
        title={deletingSection?.title || ''}
        deleting={saving}
      />
    </div>
  );
}
