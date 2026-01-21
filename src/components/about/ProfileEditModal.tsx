import { AnimatePresence, motion } from 'framer-motion';
import { ImagePlus, Link2, Plus, Trash2, Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
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
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarInputMode, setAvatarInputMode] = useState<'url' | 'file'>('url');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [email, setEmail] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName(profile.name);
      setTagline(profile.tagline);
      setLocation(profile.location);
      setBio(profile.bio);
      setAvatarUrl(profile.avatarUrl || '');
      setAvatarPreview(profile.avatarUrl || null);
      setAvatarInputMode('url');
      setGithub(profile.social.github || '');
      setLinkedin(profile.social.linkedin || '');
      setEmail(profile.social.email || '');
    }
  }, [isOpen, profile]);

  // Update preview when URL changes
  useEffect(() => {
    if (avatarInputMode === 'url' && avatarUrl) {
      setAvatarPreview(avatarUrl);
    }
  }, [avatarUrl, avatarInputMode]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Image must be smaller than 2MB');
        return;
      }
      // Create preview using FileReader
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setAvatarPreview(base64);
        setAvatarUrl(base64); // Store base64 as the URL
      };
      reader.readAsDataURL(file);
    }
  };

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

              {/* Avatar with Preview */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Avatar
                </label>
                <div className="flex gap-4">
                  {/* Preview */}
                  <div className="shrink-0">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-white/20 overflow-hidden flex items-center justify-center">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Avatar preview"
                          className="w-full h-full object-cover"
                          onError={() => setAvatarPreview(null)}
                        />
                      ) : (
                        <ImagePlus className="w-8 h-8 text-white/30" />
                      )}
                    </div>
                  </div>

                  {/* Input controls */}
                  <div className="flex-1 space-y-3">
                    {/* Mode toggle */}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setAvatarInputMode('url')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          avatarInputMode === 'url'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500'
                            : 'bg-white/5 text-white/60 border border-white/10 hover:border-white/20'
                        }`}
                      >
                        <Link2 className="w-4 h-4" />
                        URL
                      </button>
                      <button
                        type="button"
                        onClick={() => setAvatarInputMode('file')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          avatarInputMode === 'file'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500'
                            : 'bg-white/5 text-white/60 border border-white/10 hover:border-white/20'
                        }`}
                      >
                        <Upload className="w-4 h-4" />
                        Upload
                      </button>
                    </div>

                    {/* URL input */}
                    {avatarInputMode === 'url' && (
                      <input
                        type="url"
                        value={avatarUrl.startsWith('data:') ? '' : avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
                        placeholder="https://example.com/avatar.jpg"
                      />
                    )}

                    {/* File input */}
                    {avatarInputMode === 'file' && (
                      <div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full px-4 py-2 bg-white/5 border border-dashed border-white/20 rounded-lg text-white/60 hover:border-purple-500/50 hover:text-purple-300 transition-colors text-sm flex items-center justify-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          Choose image (max 2MB)
                        </button>
                      </div>
                    )}

                    {/* Clear button */}
                    {avatarPreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setAvatarUrl('');
                          setAvatarPreview(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="text-xs text-red-400 hover:text-red-300 transition-colors"
                      >
                        Remove avatar
                      </button>
                    )}
                  </div>
                </div>
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
