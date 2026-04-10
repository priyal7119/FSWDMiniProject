import { useState } from "react";
import { useNavigate } from "react-router";
import { User, Lock, Mail, ShieldCheck, ChevronRight, ArrowLeft, Phone } from "lucide-react";
import { supabase } from "../utils/supabaseClient.js";
import { useToast } from "../components/Toast.jsx";

export function Login() {
  const navigate = useNavigate();
  const { success, error: toastError, info } = useToast();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;
    const name = formData.name.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toastError("Invalid email format.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      toastError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        if (!name) {
          toastError("Name is required.");
          setLoading(false);
          return;
        }

        const { data, error: signupError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name, phone: formData.phone } }
        });

        if (signupError) {
          toastError(signupError.message);
          setLoading(false);
          return;
        }

        success('Successfully signed up! You can now log in.');
        setIsSignUp(false);
        setFormData({ ...formData, password: '' });
        setLoading(false);
        return;
      }

      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        toastError(loginError.message === "Invalid login credentials" ? "Invalid email or password." : loginError.message);
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.session?.access_token || "dummy-token-fallback");
      localStorage.setItem("userName", data.user?.user_metadata?.full_name || data.user?.email.split('@')[0] || "User");
      success("Logged in successfully!");
      window.location.href = "/dashboard";
    } catch (err) {
      console.error("Auth Exception:", err);
      toastError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      
      {/* Visual Identity Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0a0f1c] relative overflow-hidden items-center justify-center p-24">
         {/* Premium Background Layers */}
         <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-[var(--mapout-primary)] to-[#0f172a] opacity-90" />
         
         {/* Animated Glass Orbs */}
         <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-teal-500/20 rounded-full blur-[120px] animate-pulse" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[35rem] h-[35rem] bg-indigo-500/10 rounded-full blur-[120px]" />
         
         {/* Abstract Mesh Pattern */}
         <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>

         <div className="absolute top-0 left-0 p-12 w-full flex justify-between items-center bg-gradient-to-b from-black/20 to-transparent">
            <h2 onClick={() => navigate('/')} className="text-white text-2xl font-black tracking-tight cursor-pointer flex items-center gap-3">
               <div className="w-10 h-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl flex items-center justify-center">
                  <ShieldCheck size={20} className="text-teal-400" />
               </div>
               MapOut.
            </h2>
         </div>
         
         <div className="relative z-10 max-w-lg p-12 bg-white/5 backdrop-blur-2xl rounded-[3rem] border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-primary rounded-2xl flex items-center justify-center mb-10 shadow-2xl shadow-teal-500/20 transform -rotate-6">
               <ShieldCheck size={32} className="text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-black mb-8 tracking-tighter leading-[0.9] text-white">
               Scale Your <br />
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-teal-100">Future.</span>
            </h1>
            <p className="text-teal-50/60 text-lg font-medium leading-relaxed italic border-l-2 border-teal-500/30 pl-6">
               "The best way to predict the future is to architect it yourself with MapOut's advanced career engineering tools."
            </p>
            
            <div className="mt-12 flex items-center gap-6">
               <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[8px] font-black text-white">U{i}</div>
                  ))}
               </div>
               <p className="text-[10px] font-black text-teal-400 uppercase tracking-widest">Joined by 10k+ Architects</p>
            </div>
         </div>

         <div className="absolute bottom-12 left-12 right-12 flex justify-between items-center text-teal-100/20 font-black text-[8px] uppercase tracking-[0.4em]">
            <div className="flex gap-8">
               <span>AES_256_ENCRYPTED</span>
               <span>TLS_v1.3_ACTIVE</span>
            </div>
            <span>© 2026_MAPOUT_SYSTEMS</span>
         </div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.02),transparent)] pointer-events-none" />
        
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
           
           <button onClick={() => navigate('/')} className="lg:hidden flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-12">
              <ArrowLeft size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
           </button>

           <div className="mb-12">
              <h2 className="text-3xl font-black text-foreground tracking-tight mb-3">
                 {isSignUp ? "Sign Up" : "Log In"}
              </h2>
              <p className="text-muted-foreground font-medium">Enter your details to continue.</p>
           </div>

           <form onSubmit={handleSubmit} className="space-y-6">
              {isSignUp && (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block ml-1">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" size={18} />
                      <input 
                        type="text" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange} 
                        className="w-full pl-12 pr-6 py-4 bg-muted/30 border border-border rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none font-bold transition-all" 
                        placeholder="John Doe" 
                        required={isSignUp}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block ml-1">Mobile ID</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" size={18} />
                      <input 
                        type="tel" 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleChange} 
                        className="w-full pl-12 pr-6 py-4 bg-muted/30 border border-border rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none font-bold transition-all" 
                        placeholder="+1 (555) 000-0000" 
                        required={isSignUp}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block ml-1">Email Address</label>
                 <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" size={18} />
                    <input 
                      type="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleChange} 
                      className="w-full pl-12 pr-6 py-4 bg-muted/30 border border-border rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none font-bold transition-all" 
                      placeholder="email@example.com" 
                      required
                    />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block ml-1">Password</label>
                 <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" size={18} />
                    <input 
                      type="password" 
                      name="password" 
                      value={formData.password} 
                      onChange={handleChange} 
                      className="w-full pl-12 pr-6 py-4 bg-muted/30 border border-border rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none font-bold transition-all" 
                      placeholder="••••••••" 
                      required
                    />
                 </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-5 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-teal-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                  {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Log In')}
                 <ChevronRight size={16} />
              </button>
           </form>

           <div className="mt-12 text-center">
              <p className="text-xs text-muted-foreground font-medium">
                 {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                 <button 
                   onClick={() => setIsSignUp(!isSignUp)} 
                   className="text-primary font-black uppercase tracking-widest ml-2 hover:underline"
                 >
                    {isSignUp ? "Log In" : "Sign Up"}
                 </button>
              </p>
           </div>
        </div>
      </div>

    </div>
  );
}
