// src/pages/app/EntrepreneurPortal.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../../services/api";

export default function EntrepreneurPortal() {
  const nav = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboardData, setDashboardData] = useState(null);
  
  // Check if user just registered
  const justRegistered = location.state?.justRegistered;
  const userScore = location.state?.userScore;
  const [showWelcome, setShowWelcome] = useState(justRegistered);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Try multiple endpoints in case one doesn't exist
      let data;
      try {
        // First try the dashboard endpoint
        data = await api.get('/entrepreneur/dashboard');
      } catch (error) {
        console.log('Dashboard endpoint not found, trying profile...', error.message);
        
        // If dashboard fails, try getting profile data
        try {
          const profile = await api.get('/auth/profile');
          
          // Then try to get entrepreneur-specific data
          try {
            const entrepreneurData = await api.get('/entrepreneur');
            data = { ...profile, ...entrepreneurData };
          } catch {
            data = profile;
          }
        } catch (profileError) {
          console.log('Profile endpoint also failed:', profileError.message);
          throw new Error('Could not load your profile data');
        }
      }
      
      console.log('Entrepreneur portal data:', data);
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to determine stage based on progress
  const getStage = (data) => {
    if (!data) return { label: "Stage 1 — Onboarding", color: "blue" };
    
    if (data.stress_test_passed && data.grooming_completed && data.verified) {
      return { label: "Stage 3 — Investment Ready", color: "green" };
    } else if (data.grooming_completed && data.compliance_completed) {
      return { label: "Stage 2 — Structured", color: "yellow" };
    } else if (data.compliance_completed) {
      return { label: "Stage 2 — In Progress", color: "yellow" };
    } else {
      return { label: "Stage 1 — Onboarding", color: "blue" };
    }
  };

  // Helper function to determine risk level
  const getRiskLevel = (score) => {
    if (score >= 80) return { level: "Low", color: "text-green-400" };
    if (score >= 60) return { level: "Medium", color: "text-yellow-400" };
    if (score >= 40) return { level: "Medium-High", color: "text-orange-400" };
    return { level: "High", color: "text-red-400" };
  };

  // Helper function to get next steps based on progress
  const getNextSteps = (data) => {
    const steps = [];
    
    if (!data) return [{ text: "Complete your profile", to: "/app/intake" }];
    
    if (!data.compliance_completed) {
      steps.push({ text: "Complete compliance verification", to: "/app/intake" });
      steps.push({ text: "Upload business documents", to: "/app/vault" });
    }
    
    if (data.compliance_completed && !data.grooming_completed) {
      steps.push({ text: "Complete grooming program", to: "/app/grooming" });
      steps.push({ text: "Take the business quiz", to: "/app/grooming" });
    }
    
    if (data.grooming_completed && !data.stress_test_passed) {
      steps.push({ text: "Complete stress test simulation", to: "/app/stress-test" });
    }
    
    if (data.stress_test_passed && !data.verified) {
      steps.push({ text: "Await admin verification", to: "/app/verification" });
    }
    
    if (data.verified && data.readiness_score < 70) {
      steps.push({ text: "Improve your readiness score", to: "/app/score" });
      steps.push({ text: "Connect with mentors", to: "/app/mentor-search" });
    }
    
    if (data.verified && data.readiness_score >= 70) {
      steps.push({ text: "Review funder matches", to: "/app/funder-matches" });
      steps.push({ text: "Prepare your pitch", to: "/app/final-stage" });
    }
    
    // Add default steps if none are generated
    if (steps.length === 0) {
      steps.push({ text: "Update business financials", to: "/app/intake" });
      steps.push({ text: "Review mentor feedback", to: "/app/mentor-sessions" });
    }
    
    return steps.slice(0, 4);
  };

  // Calculate document progress
  const getDocumentProgress = (data) => {
    let uploaded = 0;
    const total = 3;
    
    if (data?.business_plan_url) uploaded++;
    if (data?.compliance_completed) uploaded++;
    if (data?.verified) uploaded++;
    
    return { uploaded, total, percentage: Math.round((uploaded / total) * 100) || 0 };
  };

  // Calculate readiness progress
  const getReadinessProgress = (data) => {
    let completed = 0;
    const total = 6;
    
    if (data?.compliance_completed) completed++;
    if (data?.grooming_completed) completed++;
    if (data?.stress_test_passed) completed++;
    if (data?.mentor_vouches > 0) completed = Math.min(completed + data.mentor_vouches, total);
    if (data?.business_plan_url) completed++;
    if (data?.verified) completed++;
    
    return { completed, total, percentage: Math.round((completed / total) * 100) || 0 };
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-center h-64">
            <div className="text-white/60">Loading your business profile...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="text-red-400">{error}</div>
            <button
              onClick={fetchDashboardData}
              className="rounded-2xl bg-[#C7000B] px-6 py-2 text-sm font-semibold text-white hover:opacity-95"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const businessName = dashboardData?.business_name || 
                      dashboardData?.businessName || 
                      dashboardData?.user?.business_name || 
                      "Your Business";

  const stage = getStage(dashboardData);
  const risk = getRiskLevel(dashboardData?.readiness_score || 0);
  const nextSteps = getNextSteps(dashboardData);
  const docs = getDocumentProgress(dashboardData);
  const readiness = getReadinessProgress(dashboardData);

  const stageColor = {
    blue: "bg-blue-500/20 text-blue-300",
    yellow: "bg-yellow-500/20 text-yellow-300",
    green: "bg-green-500/20 text-green-300"
  }[stage.color];

  return (
    <div className="space-y-4 pb-20">
      {/* Welcome Banner */}
      {showWelcome && (
        <div className="rounded-3xl border border-green-500/30 bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-5 animate-fadeIn">
          <div className="flex items-start gap-3">
            <span className="text-3xl">🎉</span>
            <div>
              <h2 className="text-lg font-bold text-white">Welcome to Your Entrepreneur Portal!</h2>
              <p className="text-sm text-white/70 mt-1">
                {userScore 
                  ? `Your estimated score is ${userScore}. Let's work on improving it!`
                  : "Complete your profile to unlock all features and start your journey!"}
              </p>
              <button
                onClick={() => setShowWelcome(false)}
                className="mt-2 text-xs text-white/40 hover:text-white/60"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-white/60">Entrepreneur Portal</div>
            <h1 className="mt-1 text-xl font-bold text-white">{businessName}</h1>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${stageColor}`}>
            {stage.label}
          </div>
        </div>

        {/* Score Card */}
        <div className="mt-4 rounded-3xl border border-white/10 bg-black/25 p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-white/60">Business Readiness Score</div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-5xl font-extrabold text-white">
                  {dashboardData?.readiness_score || 0}
                </span>
                <span className="text-white/40">/100</span>
              </div>
            </div>
            <button
              onClick={() => nav("/app/score")}
              className="rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white/85 hover:bg-white/10"
            >
              View Details →
            </button>
          </div>

          {/* Progress Bars */}
          <div className="mt-4 space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-white/60">Documents</span>
                <span className="text-white font-semibold">{docs.uploaded}/{docs.total}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/10">
                <div
                  className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${docs.percentage}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-white/60">Readiness Steps</span>
                <span className="text-white font-semibold">{readiness.completed}/{readiness.total}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/10">
                <div
                  className="h-2 rounded-full bg-green-500 transition-all duration-300"
                  style={{ width: `${readiness.percentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <StatBox
            label="Risk Level"
            value={risk.level}
            valueColor={risk.color}
            onClick={() => nav("/app/score")}
          />
          <StatBox
            label="Mentor Vouches"
            value={dashboardData?.mentor_vouches || 0}
            onClick={() => nav("/app/mentor-search")}
          />
          <StatBox
            label="Funder Matches"
            value={dashboardData?.funder_matches || 0}
            onClick={() => nav("/app/apply-funding")}
          />
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <h2 className="text-sm font-semibold text-white/60 mb-3">QUICK ACTIONS</h2>
        <div className="grid grid-cols-2 gap-3">
          <ActionCard
            icon="📋"
            title="Intake Form"
            description="Complete your business profile"
            to="/app/intake"
            completed={dashboardData?.compliance_completed}
          />
          <ActionCard
            icon="📚"
            title="Grooming"
            description="Business readiness program"
            to="/app/grooming"
            progress={readiness.percentage}
          />
          <ActionCard
            icon="📊"
            title="Stress Test"
            description="Test your resilience"
            to="/app/stress-test"
            completed={dashboardData?.stress_test_passed}
          />
          <ActionCard
            icon="💼"
            title="Documents"
            description="Upload business documents"
            to="/app/vault"
            progress={docs.percentage}
          />
        </div>
      </div>

      {/* Funding & Matching Section */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <h2 className="text-sm font-semibold text-white/60 mb-3">FUNDING & MATCHES</h2>
        <div className="space-y-3">
          <ActionCard
            icon="💝"
            title="Find Funding Matches"
            description="Discover funders that match your profile"
            to="/app/apply-funding"
            highlight={dashboardData?.verified && dashboardData?.readiness_score >= 70}
          />
          <ActionCard
            icon="🤝"
            title="Funder Matches"
            description={`You have ${dashboardData?.funder_matches || 0} potential matches`}
            to="/app/funder-matches"
          />
          <ActionCard
            icon="🎯"
            title="Final Stage"
            description="Apply for funding opportunities"
            to="/app/final-stage"
          />
        </div>
      </div>

      {/* Mentorship Section */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <h2 className="text-sm font-semibold text-white/60 mb-3">MENTORSHIP</h2>
        <div className="space-y-3">
          <ActionCard
            icon="👥"
            title="Find a Mentor"
            description="Connect with experienced mentors"
            to="/app/mentor-search"
          />
          <ActionCard
            icon="📝"
            title="Mentor Sessions"
            description={`${dashboardData?.total_mentor_visits || 0} sessions completed`}
            to="/app/mentor-sessions"
          />
        </div>
      </div>

      {/* Next Steps */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-purple-900/20 to-blue-900/20 p-5">
        <h2 className="text-sm font-semibold text-white/60 mb-3">NEXT STEPS</h2>
        <div className="space-y-2">
          {nextSteps.map((step, index) => (
            <button
              key={index}
              onClick={() => nav(step.to)}
              className="w-full text-left rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white/80 hover:bg-white/5 transition"
            >
              {step.text}
            </button>
          ))}
        </div>
      </div>

      {/* Support & Settings */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <h2 className="text-sm font-semibold text-white/60 mb-3">SUPPORT & SETTINGS</h2>
        <div className="grid grid-cols-2 gap-3">
          <ActionCard
            icon="♿"
            title="Accessibility"
            description="Customize your experience"
            to="/app/accessibility"
          />
          <ActionCard
            icon="⚙️"
            title="Settings"
            description="Account preferences"
            to="/app/settings"
          />
        </div>
      </div>
    </div>
  );
}

// Helper Components
function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="text-[11px] font-semibold text-white/70">{label}</div>
      <div className="mt-1 text-xs text-white/85">{value}</div>
    </div>
  );
}

function StatBox({ label, value, valueColor = "text-white", onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl border border-white/10 bg-black/25 p-3 text-left hover:bg-white/5 transition"
    >
      <div className="text-[11px] text-white/40">{label}</div>
      <div className={`mt-1 text-lg font-bold ${valueColor}`}>{value}</div>
    </button>
  );
}

function ActionCard({ icon, title, description, to, progress, completed, highlight }) {
  const nav = useNavigate();
  
  let bgColor = "bg-black/25";
  if (highlight) bgColor = "bg-gradient-to-r from-pink-600/20 to-[#C7000B]/20 border-pink-500/30";
  else if (completed) bgColor = "bg-green-500/10 border-green-500/30";
  
  return (
    <button
      onClick={() => nav(to)}
      className={`w-full text-left rounded-2xl border border-white/10 ${bgColor} p-4 hover:bg-white/5 transition`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white">{title}</span>
            {completed && <span className="text-xs text-green-400">✓</span>}
          </div>
          <p className="mt-1 text-xs text-white/50">{description}</p>
          {progress !== undefined && (
            <div className="mt-2 h-1 w-full rounded-full bg-white/10">
              <div
                className="h-1 rounded-full bg-[#C7000B]"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </button>
  );
}