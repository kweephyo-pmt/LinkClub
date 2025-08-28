import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import AuthImagePattern from "../components/AuthImagePattern";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, ArrowLeft } from "lucide-react";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { login, isLoggingIn } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    login(formData);
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
          <Link to="/signup" className="btn btn-primary">
            Sign Up
          </Link>
        </div>
      </nav>

      <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2">
        {/* Left Side - Form */}
        <div className="flex flex-col justify-center items-center p-6 sm:p-12">
          <div className="w-full max-w-md space-y-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex flex-col items-center gap-2 group">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold mt-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Welcome Back</h1>
                <p className="text-base-content/60 text-lg">Sign in to continue your conversations</p>
              </div>
            </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-base-content/40" />
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
                <span className="label-text font-medium">Password</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-base-content/40" />
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
                    <EyeOff className="h-5 w-5 text-base-content/40" />
                  ) : (
                    <Eye className="h-5 w-5 text-base-content/40" />
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full btn-lg text-lg" disabled={isLoggingIn}>
              {isLoggingIn ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-base-content/60 text-lg">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="link link-primary font-semibold hover:link-secondary transition-colors">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>

        {/* Right Side - Image/Pattern */}
        <AuthImagePattern
          title={"Welcome back!"}
          subtitle={"Sign in to continue your conversations and catch up with your messages."}
        />
      </div>
    </div>
  );
};
export default LoginPage;
