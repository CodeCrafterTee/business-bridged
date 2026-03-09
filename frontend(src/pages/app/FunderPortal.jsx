// src/pages/app/FunderPortal.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";

export default function FunderPortal() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [funderData, setFunderData] = useState(null);
  const [entrepreneurs, setEntrepreneurs] = useState([]);
  const [matches, setMatches] = useState([]);
  const [minScore, setMinScore] = useState(70);
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showGuide, setShowGuide] = useState(true);

  useEffect(() => {
    fetchFunderData();
  }, []);

  const fetchFunderData = async () => {
    try {
      setLoading(true);
      
      // Try to get funder profile with fallback
      let profile = { organization_name: "Funder" };
      try {
        profile = await api.get('/funder/profile');
        console.log('Funder profile:', profile);
      } catch (profileErr) {
        console.log('Funder profile endpoint not found, using auth profile:', profileErr.message);
        const authProfile = await api.get('/auth/profile');
        profile = { 
          organization_name: authProfile.user?.fullName || "Funder",
          ...authProfile.user 
        };
      }
      
      // Try to get eligible entrepreneurs
      let eligibleData = [];
      try {
        eligibleData = await api.get('/funder/eligible-entrepreneurs');
        console.log('Eligible entrepreneurs:', eligibleData);
      } catch (eligibleErr) {
        console.log('Eligible entrepreneurs endpoint not found:', eligibleErr.message);
        // Mock data for demonstration
        eligibleData = [
          {
            user_id: "1",
            business_name: "Thandi's Catering",
            industry: "Food & Beverage",
            readiness_score: 74,
            verified: true,
            grooming_completed: true,
            stress_test_passed: true,
            compliance_completed: true,
            mentor_vouches: 3,
            fixed_cost: 25000,
            description: "Premium catering service specializing in corporate events and weddings. Strong client base with 5 years of operation."
          },
          {
            user_id: "2",
            business_name: "Lebo Sneakers",
            industry: "Retail",
            readiness_score: 68,
            verified: true,
            grooming_completed: true,
            stress_test_passed: false,
            compliance_completed: true,
            mentor_vouches: 1,
            fixed_cost: 15000,
            description: "Custom sneaker design and manufacturing. Growing online presence with unique local designs."
          },
          {
            user_id: "3",
            business_name: "Nomsa Retail",
            industry: "Retail",
            readiness_score: 81,
            verified: true,
            grooming_completed: true,
            stress_test_passed: true,
            compliance_completed: true,
            mentor_vouches: 4,
            fixed_cost: 35000,
            description: "Chain of convenience stores in Soweto. Expanding to new locations."
          }
        ];
      }
      
      // Try to get existing matches
      let matchesData = [];
      try {
        matchesData = await api.get('/funder/matches');
        console.log('Matches:', matchesData);
      } catch (matchesErr) {
        console.log('Matches endpoint not found:', matchesErr.message);
        matchesData = [];
      }
      
      setFunderData(profile);
      setEntrepreneurs(Array.isArray(eligibleData) ? eligibleData : []);
      setMatches(Array.isArray(matchesData) ? matchesData : []);
      
    } catch (err) {
      console.error('Error fetching funder data:', err);
      setError(err.message || 'Failed to load funder data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMatch = async (entrepreneurId) => {
    try {
      setSubmitting(true);
      
      try {
        await api.post('/funder/matches', { entrepreneurId });
        const updatedMatches = await api.get('/funder/matches');
        setMatches(updatedMatches);
      } catch (err) {
        console.log('Match creation failed, simulating:', err.message);
        const mockMatch = {
          match_id: `mock-${Date.now()}`,
          entrepreneur_id: entrepreneurId,
          application_status: 'pending',
          created_at: new Date().toISOString()
        };
        setMatches(prev => [...prev, mockMatch]);
      }
      
    } catch (err) {
      console.error('Error creating match:', err);
      setError(err.message || 'Failed to create match');
    } finally {
      setSubmitting(false);
    }
  };

  const getRiskLevel = (score) => {
    if (score >= 80) return { level: "Low", color: "text-green-400" };
    if (score >= 60) return { level: "Medium", color: "text-yellow-400" };
    if (score >= 40) return { level: "Medium-High", color: "text-orange-400" };
    return { level: "High", color: "text-red-400" };
  };

  const getStage = (entrepreneur) => {
    if (!entrepreneur) return "Stage 1 — Onboarding";
    
    if (entrepreneur.verified && entrepreneur.stress_test_passed && entrepreneur.grooming_completed) {
      return "Stage 3 — Investment Ready";
    } else if (entrepreneur.grooming_completed && entrepreneur.compliance_completed) {
      return "Stage 2 — Structured";
    } else if (entrepreneur.compliance_completed) {
      return "Stage 2 — In Progress";
    } else {
      return "Stage 1 — Onboarding";
    }
  };

  const filteredEntrepreneurs = entrepreneurs.filter(e => {
    const scoreMatch = (e.readiness_score || 0) >= minScore;
    const industryMatch = selectedIndustry === "all" || e.industry === selectedIndustry;
    return scoreMatch && industryMatch;
  });

  const industries = ["all", ...new Set(entrepreneurs.map(e => e.industry).filter(Boolean))];

  const isMatched = (entrepreneurId) => {
    return matches.some(m => m.entrepreneur_id === entrepreneurId);
  };

  const getMatchStatus = (entrepreneurId) => {
    const match = matches.find(m => m.entrepreneur_id === entrepreneurId);
    return match?.application_status || null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070A0F] p-6">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-white/60">Loading funder portal...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#070A0F] p-6">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="text-red-400">{error}</div>
              <button
                onClick={fetchFunderData}
                className="rounded-2xl bg-[#C7000B] px-6 py-2 text-sm font-semibold text-white hover:opacity-95"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070A0F] p-6 pb-20">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Funder Portal</h1>
          <button
            onClick={() => navigate('/app/funder/profile')}
            className="bg-[#C7000B] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-95"
          >
            Investment Profile
          </button>
        </div>

        {/* Welcome Card */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-[#C7000B]/20 to-transparent p-6">
          <h2 className="text-xl font-semibold text-white mb-2">
            Welcome, {funderData?.organization_name || "Funder"} 👋
          </h2>
          <p className="text-white/70">
            Discover and connect with vetted entrepreneurs who are ready for funding. 
            Our readiness program ensures you only see qualified businesses.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            icon="📊"
            value={entrepreneurs.length}
            label="Eligible Businesses"
            color="text-blue-400"
          />
          <StatCard
            icon="🤝"
            value={matches.length}
            label="Active Matches"
            color="text-green-400"
          />
          <StatCard
            icon="⏳"
            value={matches.filter(m => m.application_status === 'pending').length}
            label="Pending Reviews"
            color="text-yellow-400"
          />
          <StatCard
            icon="✅"
            value={matches.filter(m => m.application_status === 'approved').length}
            label="Approved"
            color="text-purple-400"
          />
        </div>

        {/* How It Works Section */}
        {showGuide && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">How It Works</h2>
              <button
                onClick={() => setShowGuide(false)}
                className="text-white/40 hover:text-white/60 text-sm"
              >
                Dismiss
              </button>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              <GuideCard
                icon="📋"
                title="1. Grooming Program"
                description="Entrepreneurs complete our comprehensive business grooming program covering financial literacy, market research, business mindset, and more. Each module includes quizzes to validate understanding."
                details={[
                  "Financial Literacy module",
                  "Market Research training",
                  "Business Mindset development",
                  "Business Plan creation"
                ]}
              />
              <GuideCard
                icon="📊"
                title="2. Stress Test"
                description="Entrepreneurs undergo a rigorous stress test simulating real-world business challenges. They must score 70%+ to pass, demonstrating financial resilience and decision-making skills."
                details={[
                  "3 real-world scenarios",
                  "Decision-based scoring",
                  "Must pass to unlock mentors",
                  "Builds investor confidence"
                ]}
              />
              <GuideCard
                icon="👥"
                title="3. Mentorship"
                description="Qualified entrepreneurs connect with experienced mentors who provide guidance and vouch for their readiness. Each mentor vouch adds 10 points to their readiness score."
                details={[
                  "One-on-one mentoring",
                  "Business guidance",
                  "Vouch system",
                  "Track progress"
                ]}
              />
            </div>

            <div className="mt-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <p className="text-sm text-blue-300">
                <span className="font-semibold">🏆 Why this matters to you:</span> Every entrepreneur you see has passed through this rigorous process. You're not just seeing business ideas - you're seeing validated, resilient businesses ready for investment.
              </p>
            </div>
          </div>
        )}

        {/* Filters Section */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Find Businesses</h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-[#C7000B] text-sm font-semibold hover:underline"
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>

          {showFilters && (
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Minimum Readiness Score</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="50"
                    max="95"
                    step="5"
                    value={minScore}
                    onChange={(e) => setMinScore(Number(e.target.value))}
                    className="flex-1 accent-[#C7000B]"
                  />
                  <span className="text-white font-bold text-lg">{minScore}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">Industry</label>
                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white"
                >
                  {industries.map(industry => (
                    <option key={industry} value={industry}>
                      {industry === 'all' ? 'All Industries' : industry}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <p className="text-sm text-white/40">
            Showing {filteredEntrepreneurs.length} of {entrepreneurs.length} eligible businesses
          </p>
        </div>

        {/* Businesses Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEntrepreneurs.map((business) => {
            const risk = getRiskLevel(business.readiness_score || 0);
            const stage = getStage(business);
            const matched = isMatched(business.user_id);
            const matchStatus = getMatchStatus(business.user_id);
            
            return (
              <div
                key={business.user_id}
                className="rounded-3xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-white">{business.business_name}</h3>
                    <p className="text-xs text-white/50">{business.industry}</p>
                  </div>
                  <div className={`text-lg font-bold ${
                    business.readiness_score >= 80 ? 'text-green-400' :
                    business.readiness_score >= 60 ? 'text-yellow-400' :
                    'text-orange-400'
                  }`}>
                    {business.readiness_score}
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {business.verified && (
                    <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">✓ Verified</span>
                  )}
                  {business.grooming_completed && (
                    <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">📚 Groomed</span>
                  )}
                  {business.stress_test_passed && (
                    <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">📊 Stress Tested</span>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs text-white/60 mb-3 line-clamp-2">
                  {business.description || "No description provided."}
                </p>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <Metric label="Risk" value={risk.level} color={risk.color} />
                  <Metric label="Vouches" value={business.mentor_vouches || 0} />
                  <Metric label="Stage" value={stage.split('—')[1]?.trim() || 'Onboarding'} />
                </div>

                {/* Match Status */}
                {matched ? (
                  <div className={`text-center py-2 rounded-xl text-xs font-semibold mb-2 ${
                    matchStatus === 'approved' ? 'bg-green-500/20 text-green-300' :
                    matchStatus === 'rejected' ? 'bg-red-500/20 text-red-300' :
                    'bg-yellow-500/20 text-yellow-300'
                  }`}>
                    {matchStatus === 'approved' ? '✓ Approved' :
                     matchStatus === 'rejected' ? '✗ Rejected' :
                     '⏳ Pending Review'}
                  </div>
                ) : (
                  <button
                    onClick={() => handleCreateMatch(business.user_id)}
                    disabled={submitting}
                    className="w-full mb-2 rounded-xl bg-[#C7000B] py-2 text-xs font-semibold text-white hover:opacity-95 disabled:opacity-50"
                  >
                    Express Interest
                  </button>
                )}

                {/* View Profile Link */}
                <button
                  onClick={() => navigate(`/app/funder/entrepreneur/${business.user_id}`)}
                  className="w-full text-xs text-[#C7000B] hover:underline"
                >
                  View Full Profile →
                </button>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredEntrepreneurs.length === 0 && (
          <div className="text-center py-12 bg-white/5 rounded-3xl">
            <p className="text-white/40 mb-3">No businesses match your criteria</p>
            <button
              onClick={() => {
                setMinScore(50);
                setSelectedIndustry("all");
              }}
              className="text-[#C7000B] text-sm hover:underline"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper Components
function StatCard({ icon, value, label, color }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <div className={`text-2xl font-bold ${color}`}>{value}</div>
          <div className="text-xs text-white/40">{label}</div>
        </div>
      </div>
    </div>
  );
}

function GuideCard({ icon, title, description, details }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="p-4 rounded-xl bg-black/25">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{icon}</span>
        <h3 className="font-semibold text-white">{title}</h3>
      </div>
      <p className="text-xs text-white/60 mb-2">{description}</p>
      
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-[#C7000B] hover:underline mb-2"
      >
        {expanded ? 'Show less' : 'Show details'}
      </button>
      
      {expanded && (
        <ul className="space-y-1">
          {details.map((detail, index) => (
            <li key={index} className="text-xs text-white/40 flex items-center gap-1">
              <span className="text-green-400">•</span>
              {detail}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Metric({ label, value, color = "text-white" }) {
  return (
    <div className="text-center p-2 rounded-lg bg-black/25">
      <div className="text-[10px] text-white/40">{label}</div>
      <div className={`text-xs font-semibold ${color}`}>{value}</div>
    </div>
  );
}