export interface NavigationCard {
  id: string
  title: string
  description: string
  url: string
  external?: boolean
  icon?: string
  color?: string
  category?: string
}

export const navigationCards: NavigationCard[] = [
  {
    id: 'projects',
    title: 'Projects',
    description: 'Explore my current and completed projects',
    url: '/projects',
    external: false,
    icon: 'folder',
    color: 'blue',
    category: 'Portfolio'
  },
  {
    id: 'railways',
    title: 'Railways',
    description: 'Interactive minecart experience - swipe and drag!',
    url: '/railways',
    external: false,
    icon: 'terminal',
    color: 'teal',
    category: 'Fun'
  },
  {
    id: 'about-me',
    title: 'About Me',
    description: 'Learn more about me and my journey',
    url: '/about',
    external: false,
    icon: 'settings',
    color: 'purple',
    category: 'Portfolio'
  },
];

// organization by category (saving this for later)
export const navigationCardsByCategory = {
  portfolio: navigationCards.filter(card => card.category === 'Portfolio'),
  fun: navigationCards.filter(card => card.category === 'Fun'),
  infrastructure: navigationCards.filter(card => card.category === 'Infrastructure'),
  containers: navigationCards.filter(card => card.category === 'Containers'),
  monitoring: navigationCards.filter(card => card.category === 'Monitoring'),
  security: navigationCards.filter(card => card.category === 'Security'),
  storage: navigationCards.filter(card => card.category === 'Storage'),
  automation: navigationCards.filter(card => card.category === 'Automation'),
  devops: navigationCards.filter(card => card.category === 'DevOps'),
  media: navigationCards.filter(card => card.category === 'Media'),
  management: navigationCards.filter(card => card.category === 'Management'),
  network: navigationCards.filter(card => card.category === 'Network')
};

// helper function to get cards by category
export const getCardsByCategory = (category: string): NavigationCard[] => {
  return navigationCards.filter(card => card.category === category);
};

// helper function to get internal cards (non-external)
export const getInternalCards = (): NavigationCard[] => {
  return navigationCards.filter(card => !card.external);
};

// helper function to get external cards
export const getExternalCards = (): NavigationCard[] => {
  return navigationCards.filter(card => card.external);
};

// helper function to get featured cards (first 6 for main display)
export const getFeaturedCards = (): NavigationCard[] => {
  return navigationCards.slice(0, 6);
};