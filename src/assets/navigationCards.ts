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
    id: 'proxmox-web',
    title: 'Proxmox VE',
    description: 'Virtualization management interface for managing VMs and containers',
    url: '',
    external: true,
    icon: 'server',
    color: 'orange',
    category: 'Infrastructure'
  },
  {
    id: 'pihole',
    title: 'Pi-hole',
    description: 'Network-wide ad blocking and DNS management interface',
    url: '',
    external: true,
    icon: 'shield',
    color: 'green',
    category: 'Security'
  },
  {
    id: 'nextcloud',
    title: 'Nextcloud',
    description: 'Self-hosted cloud storage and collaboration platform',
    url: '',
    external: true,
    icon: 'cloud',
    color: 'indigo',
    category: 'Storage'
  }
];

/*
// organization by category (saving this for later)
export const navigationCardsByCategory = {
  infrastructure: navigationCards.filter(card => card.category === "Infrastructure"),
  containers: navigationCards.filter(card => card.category === "Containers"),
  monitoring: navigationCards.filter(card => card.category === "Monitoring"),
  security: navigationCards.filter(card => card.category === "Security"),
  storage: navigationCards.filter(card => card.category === "Storage"),
  automation: navigationCards.filter(card => card.category === "Automation"),
  devops: navigationCards.filter(card => card.category === "DevOps"),
  media: navigationCards.filter(card => card.category === "Media"),
  management: navigationCards.filter(card => card.category === "Management"),
  network: navigationCards.filter(card => card.category === "Network")
}

// helper function to get cards by category
export const getCardsByCategory = (category: string): NavigationCard[] => {
  return navigationCards.filter(card => card.category === category)
}

// helper function to get featured cards (first 6 for main display)
export const getFeaturedCards = (): NavigationCard[] => {
  return navigationCards.slice(0, 6)
}
*/