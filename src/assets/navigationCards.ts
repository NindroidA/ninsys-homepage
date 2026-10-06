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
    description: "Explore my current and notable projects",
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
  {
    id: "github",
    title: "GitHub",
    description: "Browse my repositories and recent work",
    url: "https://github.com/NindroidA",
    external: true,
    icon: "github",
    color: "pink",
    category: "Code",
  },
];
