import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, User, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

import AuthImagePattern from "../components/AuthImagePattern";
import toast from "react-hot-toast";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
  });

  const { signup, isSigningUp } = useAuthStore();

  const validateForm = () => {
    if (!formData.fullName.trim()) return toast.error("Full name is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
    if (!formData.username.trim()) return toast.error("Username is required");
    if (formData.username.length < 3) return toast.error("Username must be at least 3 characters");
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) return toast.error("Username can only contain letters, numbers, and underscores");
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 6) return toast.error("Password must be at least 6 characters");

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const success = validateForm();

    if (success === true) signup(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-base-100 to-secondary/5">
      {/* Navigation */}
      <nav className="navbar bg-base-100/80 backdrop-blur-md border-b border-base-300/50">
        <div className="navbar-start">
          <Link to="/" className="btn btn-ghost text-xl font-bold">
            <ArrowLeft className="w-5 h-5" />
            Back
          </Link>
        </div>
        <div className="navbar-center">
          <Link to="/" className="btn btn-ghost text-xl font-bold">
            <MessageSquare className="w-6 h-6 text-primary" />
            LinkClub
          </Link>
        </div>
        <div className="navbar-end">
          <Link to="/login" className="btn btn-outline">
            Sign In
          </Link>
        </div>
      </nav>

      <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2">
        {/* left side */}
        <div className="flex flex-col justify-center items-center p-6 sm:p-12">
          <div className="w-full max-w-md space-y-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex flex-col items-center gap-2 group">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold mt-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Create Account</h1>
                <p className="text-base-content/60 text-lg">Get started with your free account</p>
              </div>
            </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Full Name</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="size-5 text-base-content/40" />
                </div>
                <input
                  type="text"
                  className={`input input-bordered w-full pl-10`}
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="size-5 text-base-content/40" />
                </div>
                <input
                  type="email"
                  className={`input input-bordered w-full pl-10`}
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Username</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="size-5 text-base-content/40" />
                </div>
                <input
                  type="text"
                  className={`input input-bordered w-full pl-10`}
                  placeholder="username123"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="size-5 text-base-content/40" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className={`input input-bordered w-full pl-10`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="size-5 text-base-content/40" />
                  ) : (
                    <Eye className="size-5 text-base-content/40" />
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full btn-lg text-lg" disabled={isSigningUp}>
              {isSigningUp ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-base-content/60 text-lg">
              Already have an account?{" "}
              <Link to="/login" className="link link-primary font-semibold hover:link-secondary transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

        {/* right side */}
        <AuthImagePattern
          title="Join our community"
          subtitle="Connect with friends, share moments, and stay in touch with your loved ones."
        />
      </div>
    </div>
  );
};
export default SignUpPage;
