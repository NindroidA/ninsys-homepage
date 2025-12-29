import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  AboutSection,
  EducationContent,
  EducationItem,
  ExperienceContent,
  ExperienceItem,
  Interest,
  InterestsContent,
  isEducationContent,
  isExperienceContent,
  isInterestsContent,
  isSkillsContent,
  SectionSize,
  SectionType,
  Skill,
  SkillLevel,
  SkillsContent,
  SKILL_LEVEL_LABELS,
  SKILL_LEVEL_PERCENT,
} from '../../types/about';
import { getLucideIcon, SECTION_ICONS } from '../../utils/iconUtils';

interface SectionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (section: Omit<AboutSection, 'id' | 'order'> & { id?: string }) => Promise<void>;
  section?: AboutSection | null;
  saving?: boolean;
}

type PartialSection = {
  type: SectionType;
  title: string;
  icon: string;
  size: SectionSize;
  content: unknown;
};

const DEFAULT_SECTION: PartialSection = {
  type: 'skills',
  title: '',
  icon: 'Code2',
  size: 'medium',
  content: { skills: [] },
};

export function SectionEditModal({ isOpen, onClose, onSave, section, saving }: SectionEditModalProps) {
  const [formData, setFormData] = useState<PartialSection>(DEFAULT_SECTION);

  // Skills specific state
  const [skills, setSkills] = useState<Skill[]>([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState<SkillLevel>('intermediate');

  // Interests specific state
  const [interests, setInterests] = useState<Interest[]>([]);
  const [newInterestEmoji, setNewInterestEmoji] = useState('');
  const [newInterestLabel, setNewInterestLabel] = useState('');

  // Experience specific state
  const [experienceItems, setExperienceItems] = useState<ExperienceItem[]>([]);

  // Education specific state
  const [educationItems, setEducationItems] = useState<EducationItem[]>([]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && section) {
      setFormData({
        type: section.type,
        title: section.title,
        icon: section.icon || 'Code2',
        size: section.size,
        content: section.content,
      });

      // Set type-specific content
      if (isSkillsContent(section.content)) {
        setSkills(section.content.skills);
      } else if (isInterestsContent(section.content)) {
        setInterests(section.content.interests);
      } else if (isExperienceContent(section.content)) {
        setExperienceItems(section.content.items);
      } else if (isEducationContent(section.content)) {
        setEducationItems(section.content.items);
      }
    } else if (isOpen && !section) {
      setFormData(DEFAULT_SECTION);
      setSkills([]);
      setInterests([]);
      setExperienceItems([]);
      setEducationItems([]);
    }
  }, [isOpen, section]);

  const handleTypeChange = (newType: SectionType) => {
    setFormData((prev) => ({
      ...prev,
      type: newType,
      title: prev.title || getDefaultTitle(newType),
      icon: getDefaultIcon(newType),
    }));
  };

  const handleAddSkill = () => {
    if (newSkillName.trim()) {
      setSkills([...skills, { name: newSkillName.trim(), level: newSkillLevel }]);
      setNewSkillName('');
      setNewSkillLevel('intermediate');
    }
  };

  const handleAddInterest = () => {
    if (newInterestEmoji && newInterestLabel.trim()) {
      setInterests([...interests, { emoji: newInterestEmoji, label: newInterestLabel.trim() }]);
      setNewInterestEmoji('');
      setNewInterestLabel('');
    }
  };

  const handleAddExperience = () => {
    setExperienceItems([
      ...experienceItems,
      { title: '', company: '', period: '', description: '' },
    ]);
  };

  const handleAddEducation = () => {
    setEducationItems([
      ...educationItems,
      { degree: '', school: '', period: '', description: '' },
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let content: AboutSection['content'];
    switch (formData.type) {
      case 'skills':
        content = { skills } as SkillsContent;
        break;
      case 'interests':
        content = { interests } as InterestsContent;
        break;
      case 'experience':
        content = { items: experienceItems } as ExperienceContent;
        break;
      case 'education':
        content = { items: educationItems } as EducationContent;
        break;
      default:
        content = { html: '' };
    }

    await onSave({
      id: section?.id,
      type: formData.type,
      title: formData.title,
      icon: formData.icon,
      size: formData.size,
      content,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="w-full max-w-2xl max-h-[90vh] overflow-auto bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-2xl font-bold text-white">
                {section ? 'Edit Section' : 'New Section'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Section Type */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Section Type
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {(['skills', 'interests', 'experience', 'education'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleTypeChange(type)}
                      className={`px-4 py-2 rounded-lg border transition-colors capitalize ${
                        formData.type === type
                          ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                          : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  placeholder="Section Title"
                />
              </div>

              {/* Icon and Size */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Icon
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SECTION_ICONS.slice(0, 10).map(({ name }) => {
                      const Icon = getLucideIcon(name);
                      return Icon ? (
                        <button
                          key={name}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, icon: name }))}
                          className={`p-2 rounded-lg border transition-colors ${
                            formData.icon === name
                              ? 'bg-purple-500/20 border-purple-500'
                              : 'bg-white/5 border-white/10 hover:border-white/20'
                          }`}
                        >
                          <Icon className="w-5 h-5 text-white/70" />
                        </button>
                      ) : null;
                    })}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Size
                  </label>
                  <select
                    value={formData.size}
                    onChange={(e) => setFormData((prev) => ({ ...prev, size: e.target.value as SectionSize }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  >
                    <option value="small" className="bg-slate-900">Small</option>
                    <option value="medium" className="bg-slate-900">Medium</option>
                    <option value="large" className="bg-slate-900">Large (Full Width)</option>
                  </select>
                </div>
              </div>

              {/* Type-specific content editors */}
              {formData.type === 'skills' && (
                <SkillsEditor
                  skills={skills}
                  setSkills={setSkills}
                  newSkillName={newSkillName}
                  setNewSkillName={setNewSkillName}
                  newSkillLevel={newSkillLevel}
                  setNewSkillLevel={setNewSkillLevel}
                  onAdd={handleAddSkill}
                />
              )}

              {formData.type === 'interests' && (
                <InterestsEditor
                  interests={interests}
                  setInterests={setInterests}
                  newEmoji={newInterestEmoji}
                  setNewEmoji={setNewInterestEmoji}
                  newLabel={newInterestLabel}
                  setNewLabel={setNewInterestLabel}
                  onAdd={handleAddInterest}
                />
              )}

              {formData.type === 'experience' && (
                <ExperienceEditor
                  items={experienceItems}
                  setItems={setExperienceItems}
                  onAdd={handleAddExperience}
                />
              )}

              {formData.type === 'education' && (
                <EducationEditor
                  items={educationItems}
                  setItems={setEducationItems}
                  onAdd={handleAddEducation}
                />
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
                  disabled={saving || !formData.title}
                  className="flex-1 px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/30 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                >
                  {saving ? 'Saving...' : section ? 'Save Changes' : 'Create Section'}
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

// Helper functions
function getDefaultTitle(type: SectionType): string {
  const titles: Record<SectionType, string> = {
    skills: 'Skills',
    interests: 'Interests',
    experience: 'Experience',
    education: 'Education',
    custom: 'Custom Section',
  };
  return titles[type];
}

function getDefaultIcon(type: SectionType): string {
  const icons: Record<SectionType, string> = {
    skills: 'Code2',
    interests: 'Heart',
    experience: 'Briefcase',
    education: 'GraduationCap',
    custom: 'Sparkles',
  };
  return icons[type];
}

// Skill level order for slider mapping
const SKILL_LEVELS: SkillLevel[] = ['novice', 'beginner', 'intermediate', 'advanced', 'expert'];

// Color gradient based on level
const LEVEL_COLORS: Record<SkillLevel, string> = {
  novice: '#ef4444',      // red
  beginner: '#f97316',    // orange
  intermediate: '#eab308', // yellow
  advanced: '#84cc16',     // lime
  expert: '#22c55e',       // green
};

function SkillSlider({
  level,
  onChange,
}: {
  level: SkillLevel;
  onChange: (level: SkillLevel) => void;
}) {
  const currentIndex = SKILL_LEVELS.indexOf(level);
  const percent = SKILL_LEVEL_PERCENT[level];
  const color = LEVEL_COLORS[level];

  return (
    <div className="flex-1 flex items-center gap-3">
      <input
        type="range"
        min="0"
        max="4"
        value={currentIndex}
        onChange={(e) => {
          const idx = parseInt(e.target.value);
          const newLevel = SKILL_LEVELS[idx];
          if (newLevel) onChange(newLevel);
        }}
        className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, ${color} 0%, ${color} ${(currentIndex / 4) * 100}%, rgba(255,255,255,0.1) ${(currentIndex / 4) * 100}%, rgba(255,255,255,0.1) 100%)`,
        }}
      />
      <div className="flex items-center gap-2 min-w-[100px]">
        <span className="text-sm font-medium" style={{ color }}>{SKILL_LEVEL_LABELS[level]}</span>
        <span className="text-xs text-white/40">{percent}%</span>
      </div>
    </div>
  );
}

// Sub-editors for each type
function SkillsEditor({
  skills,
  setSkills,
  newSkillName,
  setNewSkillName,
  newSkillLevel,
  setNewSkillLevel,
  onAdd,
}: {
  skills: Skill[];
  setSkills: (s: Skill[]) => void;
  newSkillName: string;
  setNewSkillName: (s: string) => void;
  newSkillLevel: SkillLevel;
  setNewSkillLevel: (l: SkillLevel) => void;
  onAdd: () => void;
}) {
  const updateSkillLevel = (index: number, newLevel: SkillLevel) => {
    setSkills(skills.map((skill, i) => i === index ? { ...skill, level: newLevel } : skill));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-white/70 mb-2">Skills</label>
      <div className="space-y-3 mb-4">
        {skills.map((skill, i) => (
          <div key={i} className="p-3 bg-white/5 rounded-lg space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-white">{skill.name}</span>
              <button
                type="button"
                onClick={() => setSkills(skills.filter((_, idx) => idx !== i))}
                className="p-1 hover:bg-red-500/20 rounded text-white/40 hover:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <SkillSlider
              level={skill.level}
              onChange={(newLevel) => updateSkillLevel(i, newLevel)}
            />
          </div>
        ))}
      </div>

      {/* Add new skill */}
      <div className="p-3 border border-dashed border-white/20 rounded-lg space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            placeholder="New skill name..."
            className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), onAdd())}
          />
          <button
            type="button"
            onClick={onAdd}
            disabled={!newSkillName.trim()}
            className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 disabled:bg-white/5 disabled:text-white/30 text-purple-300 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <SkillSlider
          level={newSkillLevel}
          onChange={setNewSkillLevel}
        />
      </div>
    </div>
  );
}

function InterestsEditor({
  interests,
  setInterests,
  newEmoji,
  setNewEmoji,
  newLabel,
  setNewLabel,
  onAdd,
}: {
  interests: Interest[];
  setInterests: (i: Interest[]) => void;
  newEmoji: string;
  setNewEmoji: (s: string) => void;
  newLabel: string;
  setNewLabel: (s: string) => void;
  onAdd: () => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-white/70 mb-2">Interests</label>
      <div className="flex flex-wrap gap-2 mb-4">
        {interests.map((interest, i) => (
          <div key={i} className="flex items-center gap-1 px-3 py-1 bg-white/10 rounded-full">
            <span>{interest.emoji}</span>
            <span className="text-white text-sm">{interest.label}</span>
            <button
              type="button"
              onClick={() => setInterests(interests.filter((_, idx) => idx !== i))}
              className="p-0.5 hover:bg-red-500/20 rounded-full text-white/40 hover:text-red-400"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={newEmoji}
          onChange={(e) => setNewEmoji(e.target.value)}
          placeholder="Emoji"
          className="w-16 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-center"
          maxLength={4}
        />
        <input
          type="text"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="Interest label"
          className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), onAdd())}
        />
        <button
          type="button"
          onClick={onAdd}
          className="px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function ExperienceEditor({
  items,
  setItems,
  onAdd,
}: {
  items: ExperienceItem[];
  setItems: (i: ExperienceItem[]) => void;
  onAdd: () => void;
}) {
  const updateItem = (index: number, field: keyof ExperienceItem, value: string) => {
    setItems(items.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-white/70 mb-2">Experience</label>
      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="p-4 bg-white/5 rounded-lg space-y-3">
            <div className="flex justify-between">
              <span className="text-xs text-white/40">Experience #{i + 1}</span>
              <button
                type="button"
                onClick={() => setItems(items.filter((_, idx) => idx !== i))}
                className="text-white/40 hover:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <input
              type="text"
              value={item.title}
              onChange={(e) => updateItem(i, 'title', e.target.value)}
              placeholder="Job Title"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={item.company}
                onChange={(e) => updateItem(i, 'company', e.target.value)}
                placeholder="Company"
                className="px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm"
              />
              <input
                type="text"
                value={item.period}
                onChange={(e) => updateItem(i, 'period', e.target.value)}
                placeholder="Period (e.g., 2020 - Present)"
                className="px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm"
              />
            </div>
            <textarea
              value={item.description}
              onChange={(e) => updateItem(i, 'description', e.target.value)}
              placeholder="Description"
              rows={2}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm resize-none"
            />
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="mt-3 flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg text-sm"
      >
        <Plus className="w-4 h-4" />
        Add Experience
      </button>
    </div>
  );
}

function EducationEditor({
  items,
  setItems,
  onAdd,
}: {
  items: EducationItem[];
  setItems: (i: EducationItem[]) => void;
  onAdd: () => void;
}) {
  const updateItem = (index: number, field: keyof EducationItem, value: string) => {
    setItems(items.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-white/70 mb-2">Education</label>
      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="p-4 bg-white/5 rounded-lg space-y-3">
            <div className="flex justify-between">
              <span className="text-xs text-white/40">Education #{i + 1}</span>
              <button
                type="button"
                onClick={() => setItems(items.filter((_, idx) => idx !== i))}
                className="text-white/40 hover:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <input
              type="text"
              value={item.degree}
              onChange={(e) => updateItem(i, 'degree', e.target.value)}
              placeholder="Degree"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={item.school}
                onChange={(e) => updateItem(i, 'school', e.target.value)}
                placeholder="School"
                className="px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm"
              />
              <input
                type="text"
                value={item.period}
                onChange={(e) => updateItem(i, 'period', e.target.value)}
                placeholder="Period (e.g., 2018 - 2022)"
                className="px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm"
              />
            </div>
            <textarea
              value={item.description}
              onChange={(e) => updateItem(i, 'description', e.target.value)}
              placeholder="Description"
              rows={2}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm resize-none"
            />
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="mt-3 flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg text-sm"
      >
        <Plus className="w-4 h-4" />
        Add Education
      </button>
    </div>
  );
}
