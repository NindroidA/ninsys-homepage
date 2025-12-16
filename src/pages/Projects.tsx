import { Badge, Button, Card, Grid, Section } from '@nindroidsystems/ui';
import { motion } from 'framer-motion';
import { Calendar, ExternalLink, Github, Globe, Tag } from 'lucide-react';
import { useState } from 'react';
import FooterComponent from '../components/Footer';
import Navbar from '../components/Navbar';
import { Project } from '../types/pages';

// TODO: Replace with your actual projects
// cogworks
// this project
// pluginator
// devbass .. when i start it lmao
const projects: Project[] = [
  {
    id: '1',
    title: 'Nindroid Systems Homepage',
    description: 'A modern portfolio website with glassmorphism design, featuring 3D server visualizations and terminal interface.',
    technologies: ['React', 'TypeScript', 'Three.js', 'TailwindCSS', 'Framer Motion'],
    category: 'current',
    date: '2024',
    featured: true,
    githubUrl: 'https://github.com/yourusername/ns-homepage',
    liveUrl: 'https://nindroidsystems.com'
  },
  {
    id: '2',
    title: 'Example Project',
    description: 'Description of another cool project you\'ve worked on.',
    technologies: ['Python', 'FastAPI', 'PostgreSQL'],
    category: 'completed',
    date: '2023'
  }
];

export default function Projects() {
  const [filter, setFilter] = useState<'all' | 'current' | 'completed'>('all');

  const filteredProjects = projects.filter(project => 
    filter === 'all' ? true : project.category === filter
  );

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
        {/* Filter buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
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

        {/* Projects grid */}
        <Grid cols={2} gap="lg">
          {filteredProjects.map((project, index) => (
            <Card key={project.id} delay={index * 0.1} padding="lg">
              {/* Project header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">{project.title}</h3>
                  <div className="flex items-center gap-3 text-sm text-white/60">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {project.date}
                    </div>
                    <Badge variant={project.category === 'current' ? 'success' : 'info'}>
                      {project.category}
                    </Badge>
                  </div>
                </div>
                {project.featured && (
                  <Badge variant="purple">Featured</Badge>
                )}
              </div>

              {/* Description */}
              <p className="text-white/70 mb-6 leading-relaxed">
                {project.description}
              </p>

              {/* Technologies */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4 text-purple-300" />
                  <span className="text-sm font-medium text-white/60">Technologies</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <Badge key={tech} variant="default" size="sm">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Links */}
              <div className="flex gap-3">
                {project.githubUrl && (
                  <Button
                    href={project.githubUrl}
                    target="_blank"
                    variant="secondary"
                    size="sm"
                    icon={<Github className="w-4 h-4" />}
                  >
                    Code
                  </Button>
                )}
                {project.liveUrl && (
                  <Button
                    href={project.liveUrl}
                    target="_blank"
                    variant="glass"
                    size="sm"
                    icon={<Globe className="w-4 h-4" />}
                    iconPosition="right"
                  >
                    Live Demo
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </Grid>

        {/* Empty state */}
        {filteredProjects.length === 0 && (
          <Card padding="xl">
            <div className="text-center">
              <p className="text-white/70 text-lg">No projects found in this category</p>
            </div>
          </Card>
        )}
      </Section>

      <FooterComponent />
    </div>

  );
}