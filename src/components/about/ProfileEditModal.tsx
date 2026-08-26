import { AnimatePresence, motion } from "framer-motion";
import { ImagePlus, Link2, Plus, Trash2, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useModalA11y } from "../../hooks/useModalA11y";
import type { AboutProfile } from "../../types/about";

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: AboutProfile) => Promise<void>;
  profile: AboutProfile;
  saving?: boolean;
}

export function ProfileEditModal({
  isOpen,
  onClose,
  onSave,
  profile,
  saving,
}: ProfileEditModalProps) {
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState<string[]>([]);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarInputMode, setAvatarInputMode] = useState<"url" | "file">("url");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [email, setEmail] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const panelRef = useModalA11y(isOpen, onClose);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName(profile.name);
      setTagline(profile.tagline);
      setLocation(profile.location);
      setBio(profile.bio);
      setAvatarUrl(profile.avatarUrl || "");
      setAvatarPreview(profile.avatarUrl || null);
      setAvatarInputMode("url");
      setGithub(profile.social.github || "");
      setLinkedin(profile.social.linkedin || "");
      setEmail(profile.social.email || "");
    }
  }, [isOpen, profile]);

  // Update preview when URL changes
  useEffect(() => {
    if (avatarInputMode === "url" && avatarUrl) {
      setAvatarPreview(avatarUrl);
    }
  }, [avatarUrl, avatarInputMode]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        console.error("Please select an image file");
        return;
      }
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        console.error("Image must be smaller than 2MB");
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
    setBio([...bio, ""]);
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
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              // Dismiss only when the overlay itself is clicked, never a descendant.
              if (e.target === e.currentTarget) onClose();
            }}
          >
            <div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="profile-edit-title"
              tabIndex={-1}
              className="w-full max-w-2xl max-h-[calc(100dvh-2rem)] overflow-auto bg-[#0d0a16]/95 backdrop-blur-xl rounded-2xl border border-purple-300/12 shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
                <h2
                  id="profile-edit-title"
                  className="font-display text-lg sm:text-xl md:text-2xl font-bold text-white"
                >
                  Edit Profile
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close profile editor"
                  className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Name and Tagline */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="profile-edit-name"
                      className="block text-sm font-medium text-white/70 mb-2"
                    >
                      Name
                    </label>
                    <input
                      id="profile-edit-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-white/4 border border-purple-300/12 rounded-lg text-white placeholder-white/30 focus:outline-hidden focus:border-purple-400/50 focus:ring-1 focus:ring-purple-400/30"
                      placeholder="Your Name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="profile-edit-location"
                      className="block text-sm font-medium text-white/70 mb-2"
                    >
                      Location
                    </label>
                    <input
                      id="profile-edit-location"
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-4 py-3 bg-white/4 border border-purple-300/12 rounded-lg text-white placeholder-white/30 focus:outline-hidden focus:border-purple-400/50 focus:ring-1 focus:ring-purple-400/30"
                      placeholder="City, Country"
                    />
                  </div>
                </div>

                {/* Tagline */}
                <div>
                  <label
                    htmlFor="profile-edit-tagline"
                    className="block text-sm font-medium text-white/70 mb-2"
                  >
                    Tagline
                  </label>
                  <input
                    id="profile-edit-tagline"
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full px-4 py-3 bg-white/4 border border-purple-300/12 rounded-lg text-white placeholder-white/30 focus:outline-hidden focus:border-purple-400/50 focus:ring-1 focus:ring-purple-400/30"
                    placeholder="Developer & Creator"
                  />
                </div>

                {/* Avatar with Preview */}
                {/* biome-ignore lint/a11y/useSemanticElements: fieldset/legend would change the layout */}
                <div role="group" aria-labelledby="profile-edit-avatar-label">
                  <span
                    id="profile-edit-avatar-label"
                    className="block text-sm font-medium text-white/70 mb-2"
                  >
                    Avatar
                  </span>
                  <div className="flex gap-4">
                    {/* Preview */}
                    <div className="shrink-0">
                      <div className="w-24 h-24 rounded-full bg-linear-to-br from-purple-500/20 to-pink-500/20 border-2 border-white/20 overflow-hidden flex items-center justify-center">
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
                          onClick={() => setAvatarInputMode("url")}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                            avatarInputMode === "url"
                              ? "bg-purple-500/20 text-purple-300 border border-purple-500"
                              : "bg-white/4 text-white/60 border border-purple-300/12 hover:border-white/20"
                          }`}
                        >
                          <Link2 className="w-4 h-4" />
                          URL
                        </button>
                        <button
                          type="button"
                          onClick={() => setAvatarInputMode("file")}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                            avatarInputMode === "file"
                              ? "bg-purple-500/20 text-purple-300 border border-purple-500"
                              : "bg-white/4 text-white/60 border border-purple-300/12 hover:border-white/20"
                          }`}
                        >
                          <Upload className="w-4 h-4" />
                          Upload
                        </button>
                      </div>

                      {/* URL input */}
                      {avatarInputMode === "url" && (
                        <input
                          id="profile-edit-avatar-url"
                          type="url"
                          aria-label="Avatar image URL"
                          value={avatarUrl.startsWith("data:") ? "" : avatarUrl}
                          onChange={(e) => setAvatarUrl(e.target.value)}
                          className="w-full px-4 py-2 bg-white/4 border border-purple-300/12 rounded-lg text-white placeholder-white/30 focus:outline-hidden focus:border-purple-400/50 focus:ring-1 focus:ring-purple-400/30 text-sm"
                          placeholder="https://example.com/avatar.jpg"
                        />
                      )}

                      {/* File input */}
                      {avatarInputMode === "file" && (
                        <div>
                          <input
                            id="profile-edit-avatar-file"
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            aria-label="Avatar image file"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full px-4 py-2 bg-white/4 border border-dashed border-white/20 rounded-lg text-white/60 hover:border-purple-500/50 hover:text-purple-300 transition-colors text-sm flex items-center justify-center gap-2"
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
                            setAvatarUrl("");
                            setAvatarPreview(null);
                            if (fileInputRef.current) fileInputRef.current.value = "";
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
                {/* biome-ignore lint/a11y/useSemanticElements: fieldset/legend would change the layout */}
                <div role="group" aria-labelledby="profile-edit-bio-label">
                  <span
                    id="profile-edit-bio-label"
                    className="block text-sm font-medium text-white/70 mb-2"
                  >
                    Bio
                  </span>
                  <div className="space-y-3">
                    {bio.map((paragraph, i) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length positional list that is never reordered - the index is the stable identity
                      <div key={i} className="flex gap-2">
                        <textarea
                          id={`profile-edit-bio-${i}`}
                          aria-label={`Bio paragraph ${i + 1}`}
                          value={paragraph}
                          onChange={(e) => handleUpdateBio(i, e.target.value)}
                          rows={2}
                          className="flex-1 px-4 py-3 bg-white/4 border border-purple-300/12 rounded-lg text-white placeholder-white/30 focus:outline-hidden focus:border-purple-400/50 focus:ring-1 focus:ring-purple-400/30 resize-none"
                          placeholder={`Paragraph ${i + 1}...`}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveBio(i)}
                          aria-label={`Remove bio paragraph ${i + 1}`}
                          className="p-2 h-fit bg-white/4 hover:bg-red-500/20 text-white/40 hover:text-red-400 rounded-lg transition-colors"
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
                {/* biome-ignore lint/a11y/useSemanticElements: fieldset/legend would change the layout */}
                <div role="group" aria-labelledby="profile-edit-social-label">
                  <span
                    id="profile-edit-social-label"
                    className="block text-sm font-medium text-white/70 mb-2"
                  >
                    Social Links
                  </span>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <label htmlFor="profile-edit-github" className="text-white/50 w-20">
                        GitHub
                      </label>
                      <input
                        id="profile-edit-github"
                        type="url"
                        value={github}
                        onChange={(e) => setGithub(e.target.value)}
                        className="flex-1 px-4 py-2 bg-white/4 border border-purple-300/12 rounded-lg text-white placeholder-white/30 focus:outline-hidden focus:border-purple-400/50 focus:ring-1 focus:ring-purple-400/30"
                        placeholder="https://github.com/username"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <label htmlFor="profile-edit-linkedin" className="text-white/50 w-20">
                        LinkedIn
                      </label>
                      <input
                        id="profile-edit-linkedin"
                        type="url"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        className="flex-1 px-4 py-2 bg-white/4 border border-purple-300/12 rounded-lg text-white placeholder-white/30 focus:outline-hidden focus:border-purple-400/50 focus:ring-1 focus:ring-purple-400/30"
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <label htmlFor="profile-edit-email" className="text-white/50 w-20">
                        Email
                      </label>
                      <input
                        id="profile-edit-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-1 px-4 py-2 bg-white/4 border border-purple-300/12 rounded-lg text-white placeholder-white/30 focus:outline-hidden focus:border-purple-400/50 focus:ring-1 focus:ring-purple-400/30"
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
                    className="flex-1 px-6 py-3 bg-white/4 hover:bg-white/10 text-white/70 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !name}
                    className="flex-1 px-6 py-3 bg-linear-to-br from-violet-500 to-pink-500 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all"
                  >
                    {saving ? "Saving..." : "Save Changes"}
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
