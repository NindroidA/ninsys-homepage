// About page data model - matches backend API spec

export type SkillLevel = 'novice' | 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type SectionType = 'skills' | 'interests' | 'experience' | 'education' | 'custom';
export type SectionSize = 'small' | 'medium' | 'large';

// Skill level to percentage mapping
export const SKILL_LEVEL_PERCENT: Record<SkillLevel, number> = {
  novice: 20,
  beginner: 40,
  intermediate: 60,
  advanced: 80,
  expert: 100,
};

// Skill level display names
export const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  novice: 'Novice',
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Expert',
};

export interface Skill {
  name: string;
  level: SkillLevel;
  category?: string;
}

export interface Interest {
  emoji: string;
  label: string;
}

export interface ExperienceItem {
  title: string;
  company: string;
  period: string;
  description: string;
}

export interface EducationItem {
  degree: string;
  school: string;
  period: string;
  description: string;
}

export interface SkillsContent {
  skills: Skill[];
}

export interface InterestsContent {
  interests: Interest[];
}

export interface ExperienceContent {
  items: ExperienceItem[];
}

export interface EducationContent {
  items: EducationItem[];
}

export interface CustomContent {
  html: string;
}

export type SectionContent =
  | SkillsContent
  | InterestsContent
  | ExperienceContent
  | EducationContent
  | CustomContent;

export interface AboutSection {
  id: string;
  type: SectionType;
  title: string;
  icon?: string; // Lucide icon name
  order: number;
  size: SectionSize;
  content: SectionContent;
}

export interface AboutProfile {
  name: string;
  tagline: string;
  location: string;
  bio: string[];
  avatarUrl?: string;
  social: {
    github?: string;
    linkedin?: string;
    email?: string;
  };
}

export interface AboutData {
  profile: AboutProfile;
  sections: AboutSection[];
}

// API response types
export interface AboutDataResponse {
  success: boolean;
  data: AboutData;
}

// Default empty about data
export const DEFAULT_ABOUT_DATA: AboutData = {
  profile: {
    name: 'Your Name',
    tagline: 'Developer & Creator',
    location: 'Your Location',
    bio: ['Add your bio here...'],
    social: {},
  },
  sections: [],
};

// Type guards
export function isSkillsContent(content: SectionContent): content is SkillsContent {
  return 'skills' in content;
}

export function isInterestsContent(content: SectionContent): content is InterestsContent {
  return 'interests' in content;
}

export function isExperienceContent(content: SectionContent): content is ExperienceContent {
  if (!('items' in content)) return false;
  const items = (content as ExperienceContent).items;
  if (!Array.isArray(items) || items.length === 0) return false;
  const firstItem = items[0];
  return firstItem !== undefined && 'company' in firstItem;
}

export function isEducationContent(content: SectionContent): content is EducationContent {
  if (!('items' in content)) return false;
  const items = (content as EducationContent).items;
  if (!Array.isArray(items) || items.length === 0) return false;
  const firstItem = items[0];
  return firstItem !== undefined && 'school' in firstItem;
}

export function isCustomContent(content: SectionContent): content is CustomContent {
  return 'html' in content;
}
