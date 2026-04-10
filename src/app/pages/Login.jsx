import { useState } from "react";
import { useNavigate } from "react-router";
import { User, Lock, Mail, ShieldCheck, ChevronRight, ArrowLeft } from "lucide-react";
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
          options: { data: { full_name: name } }
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
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden items-center justify-center p-24">
         <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
         <div className="absolute -bottom-32 -right-32 w-[40rem] h-[40rem] bg-teal-400/10 rounded-full blur-[120px]" />
         <div className="absolute top-0 left-0 p-12">
            <h2 onClick={() => navigate('/')} className="text-white text-2xl font-black tracking-tight cursor-pointer">MapOut.</h2>
         </div>
         
         <div className="relative z-10 text-white max-w-lg">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-10 border border-white/20">
               <ShieldCheck size={32} />
            </div>
            <h1 className="text-5xl font-black mb-8 tracking-tight leading-tight">Welcome to MapOut.</h1>
            <p className="text-teal-50/70 text-lg font-medium leading-relaxed">
               Log in to access your dashboard, build your resume, and plan your career path with our easy-to-use tools.
            </p>
         </div>

         <div className="absolute bottom-12 left-12 flex gap-12 text-teal-100/40 font-black text-[10px] uppercase tracking-[0.3em]">
            <span>Security v4.2.0</span>
            <span>Auth Protocol: Supabase</span>
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
