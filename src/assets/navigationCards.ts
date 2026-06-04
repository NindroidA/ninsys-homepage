export interface NavigationCard {
  id: string;
  title: string;
  description: string;
  url: string;
  external?: boolean;
  icon?: string;
  color?: string;
  category?: string;
}

export const navigationCards: NavigationCard[] = [
  {
    id: "projects",
    title: "Projects",
    description: "Explore my current and completed projects",
    url: "/projects",
    external: false,
    icon: "folder",
    color: "blue",
    category: "Portfolio",
  },
  {
    id: "about-me",
    title: "About Me",
    description: "Learn more about me and my journey",
    url: "/about",
    external: false,
    icon: "settings",
    color: "purple",
    category: "Portfolio",
  },
];
