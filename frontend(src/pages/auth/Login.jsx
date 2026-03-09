// src/pages/auth/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authService } from "../../services/authService";

export default function Login() {
  const nav = useNavigate();
  const location = useLocation();
  
  // Get data from registration if available
  const justRegistered = location.state?.justRegistered;
  const userScore = location.state?.userScore;

  // Set initial success message based on registration state
  const initialSuccess = justRegistered && userScore 
    ? `✨ Welcome! Your B² score is ${userScore}. Ready to improve it?`
    : "";

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(initialSuccess);

  const validate = () => {
    if (!form.email.trim()) return "Please enter your email.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) return "Please enter a valid email address.";
    if (!form.password) return "Please enter your password.";
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(""); // Clear any existing success message

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login(form.email, form.password);
      
      setSuccess("Login successful. Redirecting...");
      setLoading(false);

      setTimeout(() => {
        switch (response.user.role) {
          case "entrepreneur":
            nav("/app/entrepreneur");
            break;
          case "funder":
            nav("/app/funder");
            break;
          case "mentor":
            nav("/app/mentor");
            break;
          default:
            nav("/app/dashboard");
        }
      }, 900);
    } catch (err) {
      console.error(err);
      setError(err.message || "Login failed. Please check your credentials.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070A0F]">
      <div className="max-w-md mx-auto px-4 py-10">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          
          {/* Show motivational message if user has a score */}
          {justRegistered && userScore && (
            <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-gradient-to-r from-purple-900/30 to-[#C7000B]/30 border border-purple-500/30">
              <span className="text-2xl">📈</span>
              <div>
                <div className="text-sm font-semibold text-white">Your B² Score: {userScore}</div>
                <div className="text-xs text-white/60">Let's work on improving it!</div>
              </div>
            </div>
          )}

          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="mt-1 text-sm text-white/60">
            {justRegistered 
              ? "Great to see you again! Continue your journey."
              : "Log in to access your dashboard."}
          </p>

          {error && (
            <div className="mt-4 rounded-lg bg-red-500/20 border border-red-500 text-red-300 text-sm p-3">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 rounded-lg bg-green-500/20 border border-green-500 text-green-100 text-sm p-3">
              {success}
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
            {/* Email */}
            <label className="block">
              <div className="text-xs font-semibold text-white/70">Email</div>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:ring-2 focus:ring-white/20"
                placeholder="Email address"
                autoComplete="email"
              />
            </label>

            {/* Password */}
            <label className="block">
              <div className="text-xs font-semibold text-white/70">Password</div>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:ring-2 focus:ring-white/20"
                placeholder="Password"
                autoComplete="current-password"
              />
            </label>

            {/* Forgot password link (optional) */}
            <div className="text-right">
              <button
                type="button"
                onClick={() => {/* Implement forgot password */}}
                className="text-xs text-white/40 hover:text-white/60"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !form.email || !form.password}
              className="w-full rounded-2xl bg-[#C7000B] py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>

            <div className="text-sm text-white/70">
              Don't have an account?{" "}
              <Link to="/register" className="font-semibold text-white underline">
                Register
              </Link>
            </div>
          </form>

          {/* Quick tip for new users */}
          <div className="mt-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <p className="text-xs text-blue-300/80">
              <span className="font-semibold">💡 Tip:</span> Haven't taken your assessment yet? 
              <Link to="/score-assessment" className="text-blue-300 underline ml-1">
                Get your free B² score first
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}