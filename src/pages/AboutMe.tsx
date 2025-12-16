// ABOUT ME SECTION

// lil piccy pic of moi
// general description
// hobbies
// programming stuff
// github link
// could have a lil "i'm familiar with IT and Apple shtuff"


// My name is Andrew Curtis. I'm graduating from the University of Louisiana with a degree in Computer Science (Cybersecurity)
// I've always been a computer nerd and continue to be one. 
// I'm a cat dad of two wonderful kitties.
// I'm a musician, mainly playing guitar, bass, and drums these days. But I know and occasionally continue to play piano and saxophone. 
// I'm working part time as a Technical Support Specialist at a local elementary/high school. 
// I sometimes like to tinker with small electronic components to learn the basics of how certain hardware works physically. 
// Recently, I've been getting very big into networking such as administration of my own network, and managing different kinds of servers.
// I am currently an Administrator of the official Element Animation Minecraft and Discord servers.

import { Badge, Card, FloatingElements, GradientText, Grid } from '@nindroidsystems/ui';
import { motion } from 'framer-motion';
import { Briefcase, Code2, Coffee, Github, GraduationCap, Heart, Linkedin, Mail, MapPin, Sparkles } from 'lucide-react';
import FooterComponent from '../components/Footer';
import Navbar from '../components/Navbar';

// TODO: Replace with your actual information
const aboutData = {
  name: 'Your Name',
  tagline: 'Developer • Homelab Enthusiast • Builder',
  location: 'Your Location',
  bio: [
    'Hi! I\'m a developer who loves building things and tinkering with technology.',
    'I enjoy working on personal projects, managing my homelab, and learning new technologies.',
    'When I\'m not coding, you can find me exploring new tech or working on side projects.'
  ],
  skills: [
    'React & TypeScript',
    'Three.js',
    'TailwindCSS',
    'Node.js',
    'Python',
    'Docker',
    'Linux',
    'Proxmox'
  ],
  interests: [
    '🏠 Homelabbing',
    '💻 Full-stack Development',
    '🎨 UI/UX Design',
    '🔧 DevOps',
    '🎮 Gaming',
    '📚 Learning'
  ],
  social: {
    github: 'https://github.com/yourusername',
    linkedin: 'https://linkedin.com/in/yourusername',
    email: 'your.email@example.com'
  },
  experience: [
    {
      title: 'Your Job Title',
      company: 'Company Name',
      period: '2023 - Present',
      description: 'Brief description of what you do'
    }
  ],
  education: [
    {
      degree: 'Your Degree',
      school: 'School Name',
      period: '2020 - 2024',
      description: 'Brief description'
    }
  ]
};

export default function AboutMe() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <Navbar />
      <FloatingElements variant="purple" intensity="medium" />

      {/* Main content */}
      <div className="relative z-10 pt-8 pb-20 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <Card padding="lg">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                {/* Profile picture placeholder */}
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl border-4 border-white/20">
                  <span className="text-5xl">👤</span>
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
                    <GradientText variant="primary">
                      {aboutData.name}
                    </GradientText>
                  </h1>
                  <p className="text-xl text-white/70 mb-4">{aboutData.tagline}</p>
                  <div className="flex items-center justify-center md:justify-start gap-2 text-white/60 mb-6">
                    <MapPin className="w-4 h-4" />
                    <span>{aboutData.location}</span>
                  </div>

                  {/* Social links */}
                  <div className="flex gap-3 justify-center md:justify-start">
                    <a
                      href={aboutData.social.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-white/10 hover:bg-white/20 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200 group"
                    >
                      <Github className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                    </a>
                    <a
                      href={aboutData.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-white/10 hover:bg-white/20 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200 group"
                    >
                      <Linkedin className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                    </a>
                    <a
                      href={`mailto:${aboutData.social.email}`}
                      className="p-3 bg-white/10 hover:bg-white/20 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200 group"
                    >
                      <Mail className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                    </a>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Bio section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <Card padding="lg">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-6 h-6 text-purple-300" />
                <h2 className="text-2xl font-bold text-white">About Me</h2>
              </div>
              <div className="space-y-4">
                {aboutData.bio.map((paragraph, index) => (
                  <p key={index} className="text-white/70 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Skills & Interests grid */}
          <Grid cols={2} gap="lg" className="mb-8">
            {/* Skills */}
            <Card delay={0.3} padding="lg">
              <div className="flex items-center gap-3 mb-6">
                <Code2 className="w-6 h-6 text-purple-300" />
                <h2 className="text-2xl font-bold text-white">Skills</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {aboutData.skills.map((skill) => (
                  <Badge key={skill} variant="purple">
                    {skill}
                  </Badge>
                ))}
              </div>
            </Card>

            {/* Interests */}
            <Card delay={0.4} padding="lg">
              <div className="flex items-center gap-3 mb-6">
                <Heart className="w-6 h-6 text-pink-300" />
                <h2 className="text-2xl font-bold text-white">Interests</h2>
              </div>
              <Grid cols={2} gap="sm">
                {aboutData.interests.map((interest) => (
                  <Badge key={interest} variant="default" size="sm">
                    {interest}
                  </Badge>
                ))}
              </Grid>
            </Card>
          </Grid>

          {/* Experience section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mb-8"
          >
            <Card padding="lg">
              <div className="flex items-center gap-3 mb-6">
                <Briefcase className="w-6 h-6 text-cyan-300" />
                <h2 className="text-2xl font-bold text-white">Experience</h2>
              </div>
              <div className="space-y-6">
                {aboutData.experience.map((exp, index) => (
                  <div key={index} className="border-l-2 border-purple-400/30 pl-6">
                    <h3 className="text-xl font-semibold text-white mb-1">{exp.title}</h3>
                    <div className="text-purple-300 mb-2">{exp.company} • {exp.period}</div>
                    <p className="text-white/70">{exp.description}</p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Education section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card padding="lg">
              <div className="flex items-center gap-3 mb-6">
                <GraduationCap className="w-6 h-6 text-emerald-300" />
                <h2 className="text-2xl font-bold text-white">Education</h2>
              </div>
              <div className="space-y-6">
                {aboutData.education.map((edu, index) => (
                  <div key={index} className="border-l-2 border-emerald-400/30 pl-6">
                    <h3 className="text-xl font-semibold text-white mb-1">{edu.degree}</h3>
                    <div className="text-emerald-300 mb-2">{edu.school} • {edu.period}</div>
                    <p className="text-white/70">{edu.description}</p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Fun footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-12 text-center"
          >
            <Badge variant="purple" size="md">
              <Coffee className="w-4 h-4" />
              Powered by coffee and curiosity
            </Badge>
          </motion.div>
        </div>
      </div>

      <FooterComponent />
    </div>
  );
}