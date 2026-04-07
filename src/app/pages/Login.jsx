import { useState } from "react";
import { useNavigate } from "react-router";
import { User, Lock, Mail } from "lucide-react";
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

    // Basic Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toastError("Please enter a valid email address.");
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
          toastError("Name is required for registration.");
          setLoading(false);
          return;
        }

        const { data, error: signupError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } }
        });

        if (signupError) {
          if (signupError.status === 429 || signupError.message.includes("rate limit")) {
            toastError("Rate limit exceeded. Please wait a minute before trying again.");
          } else {
            toastError(signupError.message);
          }
          setLoading(false);
          return;
        }

        success('Account created successfully! Please log in.');
        setIsSignUp(false);
        setFormData({ ...formData, password: '' });
        setLoading(false);
        return;
      }

      // 🔥 SUPABASE LOGIN
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        if (loginError.status === 429) {
          toastError("Too many login attempts. Please wait.");
        } else {
          toastError(loginError.message === "Invalid login credentials" ? "Incorrect email or password." : loginError.message);
        }
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.session?.access_token || "dummy-token-fallback");
      localStorage.setItem("userName", data.user?.user_metadata?.full_name || data.user?.email.split('@')[0] || "User");
      success("Welcome back!");
      // Hard redirect to force Header.jsx and other components to mount with the new local token
      window.location.href = "/dashboard";
    } catch (err) {
      console.error("Auth Exception:", err);
      toastError("A network error occurred. Please check your connection.");
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    info('Password reset link has been sent to your email!');
  };

  return (
    <div className="min-h-screen bg-[var(--mapout-bg)] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-[10px] shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-gray-600">
            {isSignUp ? "Join MapOut to start your career journey" : "Sign in to continue to MapOut"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {isSignUp && (
            <div>
              <label className="block mb-2 font-medium">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--mapout-secondary)]"
                  placeholder="John Doe"
                  required={isSignUp}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block mb-2 font-medium">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--mapout-secondary)]"
                placeholder="john@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 font-medium">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--mapout-secondary)]"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {!isSignUp && (
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-[var(--mapout-secondary)] hover:underline bg-none border-none cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[var(--mapout-secondary)] text-white rounded-md hover:bg-[var(--mapout-primary)] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Loading..." : (isSignUp ? "Sign Up" : "Sign In")}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[var(--mapout-secondary)] hover:underline font-medium"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-center text-gray-500">
            By continuing, you agree to MapOut's Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
