import { useState } from "react";
import { Share2, Copy, CheckCircle, Linkedin, Twitter, Mail, Link, X, Globe, UserPlus, Users } from "lucide-react";

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
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      <div className="bg-card border border-border rounded-[3rem] shadow-2xl max-w-lg w-full overflow-hidden relative z-10 animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-8 border-b border-border flex justify-between items-center bg-muted/30">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-teal-500/20">
                <Share2 size={24} />
             </div>
             <div>
                <h2 className="text-xl font-black tracking-tight text-foreground">Distribute Vector</h2>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Institutional Sharing protocol</p>
             </div>
          </div>
          <button onClick={onClose} className="p-3 rounded-full hover:bg-muted transition-colors text-muted-foreground"><X size={24} /></button>
        </div>

        {/* Content */}
        <div className="p-10 space-y-10">
          
          <div className="grid grid-cols-1 gap-4">
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Network Channels</h3>
            {[
              { id: 'linkedin', label: 'LinkedIn Professional', icon: Linkedin, color: 'text-primary' },
              { id: 'twitter', label: 'Twitter Feed', icon: Twitter, color: 'text-sky-500' },
              { id: 'email', label: 'Secure Email Dispatch', icon: Mail, color: 'text-muted-foreground' }
            ].map((platform) => (
              <button
                key={platform.id}
                onClick={() => handleShare(platform.id)}
                className="w-full flex items-center justify-between p-5 bg-muted/30 border border-transparent rounded-[2rem] hover:border-border hover:bg-white transition-all group"
              >
                <div className="flex items-center gap-4">
                   <div className={`w-12 h-12 rounded-xl bg-white border border-border flex items-center justify-center ${platform.color} shadow-sm group-hover:scale-110 transition-transform`}>
                      <platform.icon size={20} />
                   </div>
                   <span className="font-bold text-foreground">{platform.label}</span>
                </div>
                <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
            ))}
          </div>

          <div className="space-y-4">
             <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Direct Link Vector</h3>
             <div className="flex gap-4 p-2 bg-muted/30 border border-border rounded-2xl pr-2">
                <div className="flex-1 px-4 flex items-center gap-3 overflow-hidden">
                   <Globe size={16} className="text-muted-foreground flex-shrink-0" />
                   <span className="text-xs font-bold text-muted-foreground truncate italic">{shareUrl}</span>
                </div>
                <button
                  onClick={handleCopyLink}
                  className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                    copied ? "bg-teal-500 text-white shadow-xl shadow-teal-500/20" : "bg-primary text-white"
                  }`}
                >
                  {copied ? "Synchronized" : "Copy Vector"}
                </button>
             </div>
          </div>

          <div className="p-8 bg-primary/5 border border-primary/10 rounded-[2rem] flex items-start gap-4">
             <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary flex-shrink-0"><Users size={20} /></div>
             <div>
                <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Collaborative Pulse</h4>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed">Distributing MapOut blueprints helps synchronize elite-tier skills across your professional network.</p>
             </div>
          </div>
        </div>

        <div className="p-8 bg-muted/30 border-t border-border flex justify-end">
           <button onClick={onClose} className="px-10 py-4 bg-white border border-border rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-muted transition-all">Close Protocol</button>
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
    <div className="bg-card border border-border rounded-[2.5rem] p-10 shadow-sm">
      <div className="flex items-center gap-4 mb-10">
         <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20"><UserPlus size={24} /></div>
         <h3 className="text-xl font-black tracking-tight">Team Synchronization</h3>
      </div>

      <div className="mb-10">
        {showInvite ? (
          <form onSubmit={handleInvite} className="space-y-4">
            <input
              type="email"
              placeholder="vector@network.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 bg-muted/30 border border-border rounded-xl focus:ring-4 focus:ring-primary/10 outline-none font-bold"
              required
            />
            <div className="flex gap-4">
              <button type="submit" className="flex-1 py-4 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-teal-500/20">Send Invite</button>
              <button type="button" onClick={() => setShowInvite(false)} className="flex-1 py-4 bg-muted border border-border text-foreground rounded-xl font-black text-[10px] uppercase tracking-widest">Abort</button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowInvite(true)}
            className="w-full py-5 bg-primary/10 text-primary border border-primary/20 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm"
          >
            Invite External Vectors
          </button>
        )}
      </div>

      {invited.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Network Collaborators</h4>
          <div className="space-y-2">
            {invited.map((collaborator, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-muted/30 border border-border/50 rounded-2xl">
                <div>
                  <p className="text-xs font-black text-foreground">{collaborator.email}</p>
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mt-1">Authorized {collaborator.joinedAt}</p>
                </div>
                <button onClick={() => setInvited(invited.filter((_, i) => i !== idx))} className="text-[8px] font-black text-rose-500 uppercase tracking-widest hover:underline">Revoke Access</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {!invited.length && (
         <div className="p-8 bg-muted/30 border border-dashed border-border rounded-[2rem] text-center">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">No Collaborators Sync'd</p>
         </div>
      )}
    </div>
  );
}

export default ShareModal;
