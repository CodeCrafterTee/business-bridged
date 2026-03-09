// src/pages/auth/Register.jsx
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authService } from "../../services/authService";

export default function Register() {
  const nav = useNavigate();
  const location = useLocation();
  
  // Get pre-filled data from score assessment
  const preFillScore = location.state?.preFillScore;
  const preFillEmail = location.state?.email;

  // Initialize success message based on preFillScore
  const initialSuccess = preFillScore 
    ? `✨ Great job! Your estimated score is ${preFillScore}. Complete registration to unlock your full improvement plan.`
    : "";

  const [form, setForm] = useState({
    fullName: "",
    email: preFillEmail || "", // Pre-fill email if available
    password: "",
    role: "entrepreneur",
    phone: "",
    // Entrepreneur fields
    businessName: "",
    industry: "",
    cicpNumber: "",
    // Funder fields
    organizationName: "",
    investmentBudget: "",
    preferredIndustry: "",
    minimumReadinessScore: 0
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(initialSuccess);

  const validate = () => {
    if (!form.fullName.trim()) return "Please enter your full name.";
    if (!form.email.trim()) return "Please enter your email.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) return "Please enter a valid email address.";
    if (!form.password || form.password.length < 6) return "Password must be at least 6 characters.";
    
    // Role-specific validation
    if (form.role === 'entrepreneur') {
      if (!form.businessName) return "Please enter your business name.";
      if (!form.industry) return "Please enter your industry.";
      if (!form.cicpNumber) return "Please enter your CICP number.";
    }
    
    if (form.role === 'funder') {
      if (!form.organizationName) return "Please enter your organization name.";
      if (!form.investmentBudget) return "Please enter your investment budget.";
    }
    
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      // Prepare data in the format authService expects
      const registerData = {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        role: form.role,
        phone: form.phone || undefined,
      };

      // Add role-specific fields
      if (form.role === 'entrepreneur') {
        registerData.businessName = form.businessName;
        registerData.industry = form.industry;
        registerData.cicpNumber = form.cicpNumber;
        
        // If they came from assessment, include their preliminary score
        if (preFillScore) {
          registerData.preliminaryScore = preFillScore;
        }
      } else if (form.role === 'funder') {
        registerData.organizationName = form.organizationName;
        registerData.investmentBudget = form.investmentBudget;
        registerData.preferredIndustry = form.preferredIndustry;
        registerData.minimumReadinessScore = form.minimumReadinessScore;
        registerData.requirements = {};
      }

      console.log('Registering with data:', registerData);
      
      // Register the user
      await authService.register(registerData);
      
      // Auto-login after successful registration
      await authService.login(form.email, form.password);

      setSuccess("Account created successfully! Redirecting to your dashboard...");
      setLoading(false);

      // 👇 UPDATED: Pass user score to the destination page
      setTimeout(() => {
        switch (form.role) {
          case "entrepreneur":
            nav("/app/entrepreneur", { 
              state: { 
                justRegistered: true,
                userScore: preFillScore || null 
              } 
            });
            break;
          case "funder":
            nav("/app/funder", { 
              state: { 
                justRegistered: true 
              } 
            });
            break;
          case "mentor":
            nav("/app/mentor", { 
              state: { 
                justRegistered: true 
              } 
            });
            break;
          default:
            nav("/app/dashboard");
        }
      }, 1500);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || "Registration failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070A0F]">
      <div className="max-w-md mx-auto px-4 py-10">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          
          {/* Show score badge if coming from assessment */}
          {preFillScore && (
            <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-gradient-to-r from-purple-900/30 to-[#C7000B]/30 border border-purple-500/30">
              <span className="text-2xl">📊</span>
              <div>
                <div className="text-sm font-semibold text-white">Your estimated score: {preFillScore}</div>
                <div className="text-xs text-white/60">Complete registration to unlock your personalized improvement plan</div>
              </div>
            </div>
          )}

          <h1 className="text-2xl font-bold">Create account</h1>
          <p className="mt-1 text-sm text-white/60">
            {preFillScore 
              ? "Almost there! Complete your profile to access your full readiness report."
              : "Set up your profile to receive your business score."}
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
            {/* Full Name */}
            <label className="block">
              <div className="text-xs font-semibold text-white/70">Full name</div>
              <input
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:ring-2 focus:ring-white/20"
                placeholder="Full name"
                autoComplete="name"
              />
            </label>

            {/* Email - pre-filled if from assessment */}
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
              {preFillEmail && (
                <p className="mt-1 text-xs text-green-400">✓ Email from your assessment</p>
              )}
            </label>

            {/* Password */}
            <label className="block">
              <div className="text-xs font-semibold text-white/70">Password</div>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:ring-2 focus:ring-white/20"
                placeholder="Password (min. 6 characters)"
                autoComplete="new-password"
              />
            </label>

            {/* Phone (Optional) */}
            <label className="block">
              <div className="text-xs font-semibold text-white/70">Phone (optional)</div>
              <input
                type="tel"
                value={form.phone || ""}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:ring-2 focus:ring-white/20"
                placeholder="Phone number"
                autoComplete="tel"
              />
            </label>

            {/* Role */}
            <label className="block">
              <div className="text-xs font-semibold text-white/70">Account type</div>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none"
              >
                <option value="entrepreneur">Entrepreneur</option>
                <option value="mentor">Mentor</option>
                <option value="funder">Funder</option>
              </select>
            </label>

            {/* Entrepreneur-specific fields */}
            {form.role === 'entrepreneur' && (
              <>
                <label className="block">
                  <div className="text-xs font-semibold text-white/70">Business name</div>
                  <input
                    value={form.businessName}
                    onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"
                    placeholder="Business name"
                  />
                </label>

                <label className="block">
                  <div className="text-xs font-semibold text-white/70">Industry</div>
                  <input
                    value={form.industry}
                    onChange={(e) => setForm({ ...form, industry: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"
                    placeholder="e.g., Technology, Retail, Healthcare"
                  />
                </label>

                <label className="block">
                  <div className="text-xs font-semibold text-white/70">CICP number</div>
                  <input
                    value={form.cicpNumber}
                    onChange={(e) => setForm({ ...form, cicpNumber: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"
                    placeholder="Your CICP number"
                  />
                </label>

                {/* Show score preview for entrepreneurs from assessment */}
                {preFillScore && (
                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <div className="text-xs text-blue-300">
                      <span className="font-semibold">📈 Your estimated score:</span> {preFillScore}
                    </div>
                    <div className="text-xs text-blue-300/70 mt-1">
                      Complete your profile to see detailed breakdown and improvement steps.
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Funder-specific fields */}
            {form.role === 'funder' && (
              <>
                <label className="block">
                  <div className="text-xs font-semibold text-white/70">Organization name</div>
                  <input
                    value={form.organizationName}
                    onChange={(e) => setForm({ ...form, organizationName: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"
                    placeholder="Organization name"
                  />
                </label>

                <label className="block">
                  <div className="text-xs font-semibold text-white/70">Investment budget</div>
                  <input
                    type="number"
                    value={form.investmentBudget}
                    onChange={(e) => setForm({ ...form, investmentBudget: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"
                    placeholder="Investment budget"
                  />
                </label>

                <label className="block">
                  <div className="text-xs font-semibold text-white/70">Preferred industry</div>
                  <input
                    value={form.preferredIndustry}
                    onChange={(e) => setForm({ ...form, preferredIndustry: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"
                    placeholder="Preferred industry"
                  />
                </label>

                <label className="block">
                  <div className="text-xs font-semibold text-white/70">Minimum readiness score</div>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.minimumReadinessScore}
                    onChange={(e) => setForm({ ...form, minimumReadinessScore: parseInt(e.target.value) || 0 })}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"
                    placeholder="Minimum readiness score (0-100)"
                  />
                </label>
              </>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[#C7000B] py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {loading ? "Creating account..." : preFillScore ? "Complete Registration & View Report" : "Continue"}
            </button>

            <div className="text-sm text-white/70">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-white underline">
                Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}