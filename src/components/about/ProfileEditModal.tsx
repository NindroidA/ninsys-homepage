import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AboutProfile } from '../../types/about';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: AboutProfile) => Promise<void>;
  profile: AboutProfile;
  saving?: boolean;
}

export function ProfileEditModal({ isOpen, onClose, onSave, profile, saving }: ProfileEditModalProps) {
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState<string[]>([]);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [email, setEmail] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName(profile.name);
      setTagline(profile.tagline);
      setLocation(profile.location);
      setBio(profile.bio);
      setAvatarUrl(profile.avatarUrl || '');
      setGithub(profile.social.github || '');
      setLinkedin(profile.social.linkedin || '');
      setEmail(profile.social.email || '');
    }
  }, [isOpen, profile]);

  const handleAddBioParagraph = () => {
    setBio([...bio, '']);
  };

  const handleUpdateBio = (index: number, value: string) => {
    setBio(bio.map((p, i) => (i === index ? value : p)));
  };

  const handleRemoveBio = (index: number) => {
    setBio(bio.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await onSave({
      name,
      tagline,
      location,
      bio: bio.filter((p) => p.trim()), // Remove empty paragraphs
      avatarUrl: avatarUrl || undefined,
      social: {
        github: github || undefined,
        linkedin: linkedin || undefined,
        email: email || undefined,
      },
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
              <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Name and Tagline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    placeholder="Your Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    placeholder="City, Country"
                  />
                </div>
              </div>

              {/* Tagline */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Tagline
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  placeholder="Developer & Creator"
                />
              </div>

              {/* Avatar URL */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Avatar URL (optional)
                </label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>

              {/* Bio paragraphs */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Bio
                </label>
                <div className="space-y-3">
                  {bio.map((paragraph, i) => (
                    <div key={i} className="flex gap-2">
                      <textarea
                        value={paragraph}
                        onChange={(e) => handleUpdateBio(i, e.target.value)}
                        rows={2}
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                        placeholder={`Paragraph ${i + 1}...`}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveBio(i)}
                        className="p-2 h-fit bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleAddBioParagraph}
                  className="mt-3 flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Paragraph
                </button>
              </div>

              {/* Social links */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Social Links
                </label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-white/50 w-20">GitHub</span>
                    <input
                      type="url"
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      placeholder="https://github.com/username"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white/50 w-20">LinkedIn</span>
                    <input
                      type="url"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white/50 w-20">Email</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>
              </div>

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
                  disabled={saving || !name}
                  className="flex-1 px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/30 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
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
