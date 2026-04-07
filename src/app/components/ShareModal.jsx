import { useState } from "react";
import { Share2, Copy, CheckCircle, Linkedin, Twitter, Mail, Link } from "lucide-react";

export function ShareModal({ isOpen, onClose, title = "Check this out!", description = "I'm using MapOut to advance my career" }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = "https://mapout.com/platform";
  const fullShareText = `${title} - ${description}`;

  const shareLinks = {
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullShareText)}&url=${encodeURIComponent(shareUrl)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(fullShareText + "\n\n" + shareUrl)}`,
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform) => {
    window.open(shareLinks[platform], "_blank", "width=600,height=400");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-[10px] shadow-lg max-w-sm w-full">
        {/* Header */}
        <div className="border-b p-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Share2 size={24} className="text-[var(--mapout-primary)]" />
            Share
          </h2>
          <p className="text-sm text-gray-600 mt-1">{title}</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Social Share Buttons */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-600 uppercase">Share on</p>

            <button
              onClick={() => handleShare("linkedin")}
              className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors"
              aria-label="Share on LinkedIn"
            >
              <Linkedin size={20} className="text-blue-600" />
              <div className="text-left">
                <p className="font-semibold text-sm">LinkedIn</p>
                <p className="text-xs text-gray-600">Share with your network</p>
              </div>
            </button>

            <button
              onClick={() => handleShare("twitter")}
              className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors"
              aria-label="Share on Twitter"
            >
              <Twitter size={20} className="text-blue-400" />
              <div className="text-left">
                <p className="font-semibold text-sm">Twitter</p>
                <p className="text-xs text-gray-600">Tweet about it</p>
              </div>
            </button>

            <button
              onClick={() => handleShare("email")}
              className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              aria-label="Share via email"
            >
              <Mail size={20} className="text-gray-600" />
              <div className="text-left">
                <p className="font-semibold text-sm">Email</p>
                <p className="text-xs text-gray-600">Send to friends</p>
              </div>
            </button>
          </div>

          {/* Copy Link */}
          <div className="pt-4 border-t">
            <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Or copy link</p>
            <div className="flex gap-2">
              <div className="flex-1 bg-gray-100 rounded-lg p-3 flex items-center gap-2 overflow-hidden">
                <Link size={16} className="text-gray-600 flex-shrink-0" />
                <span className="text-xs text-gray-700 truncate">{shareUrl}</span>
              </div>
              <button
                onClick={handleCopyLink}
                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  copied
                    ? "bg-green-100 text-green-700"
                    : "bg-[var(--mapout-primary)] text-white hover:shadow-lg"
                }`}
                aria-label="Copy link to clipboard"
              >
                {copied ? (
                  <>
                    <CheckCircle size={16} />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Share Stats */}
          <div className="pt-4 border-t bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
            <p className="font-semibold mb-2">🎯 Sharing Impact</p>
            <p className="text-xs">When you share MapOut, you help friends discover career growth opportunities and help us reach more people!</p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 font-semibold hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close share modal"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export function CollaborationCard({ projectId, projectTitle }) {
  const [showInvite, setShowInvite] = useState(false);
  const [email, setEmail] = useState("");
  const [invited, setInvited] = useState([]);

  const handleInvite = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setInvited([...invited, { email, joinedAt: new Date().toLocaleDateString() }]);
      setEmail("");
    }
  };

  return (
    <div className="bg-white rounded-[10px] p-6 shadow-md">
      <h3 className="text-lg font-bold mb-4">👥 Collaboration</h3>

      {/* Invite Section */}
      <div className="mb-6">
        {showInvite ? (
          <form onSubmit={handleInvite} className="space-y-3">
            <input
              type="email"
              placeholder="friend@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mapout-primary)]"
              required
              aria-label="Invite collaborator email"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-[var(--mapout-primary)] text-white py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Send Invite
              </button>
              <button
                type="button"
                onClick={() => setShowInvite(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowInvite(true)}
            className="w-full bg-blue-50 text-blue-700 py-3 rounded-lg font-semibold hover:bg-blue-100 transition-colors border border-blue-200"
            aria-label="Invite collaborators"
          >
            Invite Collaborators
          </button>
        )}
      </div>

      {/* Invited Users */}
      {invited.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-600 uppercase mb-3">Collaborators</p>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {invited.map((collaborator, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">{collaborator.email}</p>
                  <p className="text-xs text-gray-600">Invited {collaborator.joinedAt}</p>
                </div>
                <button
                  onClick={() => setInvited(invited.filter((_, i) => i !== idx))}
                  className="text-red-600 hover:text-red-800 text-xs font-semibold"
                  aria-label={`Remove ${collaborator.email}`}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Permissions Info */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
        <p className="font-semibold text-yellow-900 mb-1">⚙️ Collaboration Settings</p>
        <p className="text-xs text-yellow-800">
          Collaborators can view, comment, and edit documents. They'll receive access via email.
        </p>
      </div>
    </div>
  );
}

export default ShareModal;
