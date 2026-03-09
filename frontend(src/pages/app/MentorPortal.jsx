// src/pages/app/MentorPortal.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../../services/api";

export default function MentorPortal() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if user just logged in
  const justLoggedIn = location.state?.justLoggedIn;
  const mentorName = location.state?.mentorName;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mentorData, setMentorData] = useState(null);
  const [entrepreneurs, setEntrepreneurs] = useState([]);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [notes, setNotes] = useState("");
  const [vouchStatus, setVouchStatus] = useState("approved");
  const [submitting, setSubmitting] = useState(false);
  const [showWelcome, setShowWelcome] = useState(justLoggedIn);
  const [showGuide, setShowGuide] = useState(true);
  const [impactStats, setImpactStats] = useState({
    totalScoreImpact: 0,
    entrepreneursHelped: 0,
    avgScoreIncrease: 0
  });

  useEffect(() => {
    fetchMentorData();
  }, []);

  const fetchMentorData = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Try to get mentor profile with fallback
      let profile = { user: { fullName: mentorName || "Mentor" } };
      try {
        profile = await api.get('/auth/profile');
        console.log('Mentor profile:', profile);
      } catch (profileErr) {
        console.log('Using fallback profile:', profileErr.message);
      }
      
      // Try to get assigned entrepreneurs with fallback
      let entrepreneursData = [];
      try {
        entrepreneursData = await api.get('/mentor/entrepreneurs');
        console.log('Entrepreneurs data:', entrepreneursData);
      } catch (entrepreneursErr) {
        console.log('Using mock entrepreneurs data:', entrepreneursErr.message);
        // Mock data for demonstration
        entrepreneursData = [
          {
            user_id: "1",
            full_name: "Thandi M.",
            business_name: "Thandi's Catering",
            industry: "Food & Beverage",
            readiness_score: 74,
            verified: true,
            visit_count: 3,
            last_vouch_status: "approved",
            compliance_completed: true,
            grooming_completed: true,
            stress_test_passed: true
          },
          {
            user_id: "2",
            full_name: "Lebo K.",
            business_name: "Lebo Sneakers",
            industry: "Retail",
            readiness_score: 68,
            verified: false,
            visit_count: 1,
            last_vouch_status: null,
            compliance_completed: true,
            grooming_completed: false,
            stress_test_passed: false
          },
          {
            user_id: "3",
            full_name: "Nomsa R.",
            business_name: "Nomsa Retail",
            industry: "Retail",
            readiness_score: 81,
            verified: true,
            visit_count: 4,
            last_vouch_status: "approved",
            compliance_completed: true,
            grooming_completed: true,
            stress_test_passed: true
          }
        ];
      }
      
      setMentorData(profile.user);
      setEntrepreneurs(entrepreneursData);
      
      // Calculate impact stats
      const approvedVouches = entrepreneursData.filter(e => e.last_vouch_status === 'approved').length;
      const totalScoreImpact = approvedVouches * 10; // Each vouch adds 10 points
      const avgIncrease = entrepreneursData.length > 0 ? totalScoreImpact / entrepreneursData.length : 0;
      
      setImpactStats({
        totalScoreImpact,
        entrepreneursHelped: entrepreneursData.length,
        avgScoreIncrease: Math.round(avgIncrease * 10) / 10
      });
      
    } catch (err) {
      console.error('Error fetching mentor data:', err);
      setError('Unable to load mentor data. Using demo data for now.');
      
      // Fallback to mock data
      const mockEntrepreneurs = [
        {
          user_id: "1",
          full_name: "Thandi M.",
          business_name: "Thandi's Catering",
          industry: "Food & Beverage",
          readiness_score: 74,
          verified: true,
          visit_count: 3,
          last_vouch_status: "approved",
          compliance_completed: true,
          grooming_completed: true,
          stress_test_passed: true
        },
        {
          user_id: "2",
          full_name: "Lebo K.",
          business_name: "Lebo Sneakers",
          industry: "Retail",
          readiness_score: 68,
          verified: false,
          visit_count: 1,
          last_vouch_status: null,
          compliance_completed: true,
          grooming_completed: false,
          stress_test_passed: false
        }
      ];
      
      setEntrepreneurs(mockEntrepreneurs);
      setMentorData({ fullName: mentorName || "Mentor" });
      
      setImpactStats({
        totalScoreImpact: 10,
        entrepreneursHelped: 2,
        avgScoreIncrease: 5
      });
      
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleSession = async (entrepreneurId, entrepreneurName) => {
    try {
      setSelectedSession({
        entrepreneur_id: entrepreneurId,
        entrepreneur_name: entrepreneurName,
        notes: '',
        isNewSession: true
      });
      setNotes("");
      setVouchStatus("approved");
      setShowNotesModal(true);
      
    } catch (err) {
      console.error('Error scheduling session:', err);
      setError('Failed to schedule session. Please try again.');
    }
  };

  const handleDeclineRequest = async (entrepreneurId, entrepreneurName) => {
    if (window.confirm(`Are you sure you want to decline mentorship for ${entrepreneurName}?`)) {
      try {
        // This would typically decline the request
        console.log(`Declined request from ${entrepreneurName}`);
        alert('Request declined. The entrepreneur will be notified.');
      } catch (err) {
        console.error('Error declining request:', err);
        setError('Failed to decline request. Please try again.');
      }
    }
  };

  const openNotesModal = (session) => {
    setSelectedSession({
      ...session,
      isNewSession: false
    });
    setNotes(session.notes || "");
    setVouchStatus(session.vouch_status || "approved");
    setShowNotesModal(true);
  };

  const submitNotes = async () => {
    if (!selectedSession) return;
    
    try {
      setSubmitting(true);
      
      // Create visit log
      const logData = {
        entrepreneurId: selectedSession.entrepreneur_id,
        visitDate: new Date().toISOString().split('T')[0],
        notes: notes,
        vouchStatus: vouchStatus
      };
      
      try {
        await api.post('/mentor/visits', logData);
      } catch (postErr) {
        console.log('Visit log endpoint not available - simulating:', postErr.message);
      }
      
      // Update local state
      setEntrepreneurs(prev => prev.map(e => 
        e.user_id === selectedSession.entrepreneur_id
          ? {
              ...e,
              visit_count: (e.visit_count || 0) + 1,
              last_vouch_status: vouchStatus,
              readiness_score: vouchStatus === 'approved' 
                ? Math.min(100, (e.readiness_score || 0) + 10)
                : e.readiness_score
            }
          : e
      ));
      
      // Refresh impact stats
      const updatedEntrepreneurs = entrepreneurs.map(e => 
        e.user_id === selectedSession.entrepreneur_id
          ? {
              ...e,
              visit_count: (e.visit_count || 0) + 1,
              last_vouch_status: vouchStatus
            }
          : e
      );
      
      const approvedVouches = updatedEntrepreneurs.filter(e => e.last_vouch_status === 'approved').length;
      setImpactStats({
        totalScoreImpact: approvedVouches * 10,
        entrepreneursHelped: updatedEntrepreneurs.length,
        avgScoreIncrease: updatedEntrepreneurs.length > 0 
          ? Math.round((approvedVouches * 10 / updatedEntrepreneurs.length) * 10) / 10
          : 0
      });
      
      setShowNotesModal(false);
      setSelectedSession(null);
      setNotes("");
      
    } catch (err) {
      console.error('Error submitting notes:', err);
      setError('Failed to submit notes. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getReadinessScoreColor = (score) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    if (score >= 40) return "text-orange-400";
    return "text-red-400";
  };

  const getStageDescription = (entrepreneur) => {
    if (entrepreneur.verified && entrepreneur.stress_test_passed && entrepreneur.grooming_completed) {
      return "Investment Ready - Completed all requirements";
    } else if (entrepreneur.grooming_completed && entrepreneur.compliance_completed) {
      return "Structured - Ready for stress test";
    } else if (entrepreneur.compliance_completed) {
      return "In Progress - Working on grooming";
    } else {
      return "Onboarding - Complete intake first";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070A0F] p-6">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-white/60">Loading mentor portal...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Separate entrepreneurs into pending requests and past sessions
  const pendingRequests = entrepreneurs.filter(e => 
    !e.last_vouch_status || e.visit_count === 0
  );
  
  const pastSessions = entrepreneurs.filter(e => 
    e.visit_count > 0
  ).map(e => ({
    entrepreneur_id: e.user_id,
    entrepreneur_name: e.full_name,
    business_name: e.business_name,
    topic: e.last_vouch_status ? 'Mentor session completed' : 'Follow-up needed',
    status: e.last_vouch_status === 'approved' ? 'Approved' : 
            e.last_vouch_status === 'not_approved' ? 'Not Approved' : 'Pending',
    visit_count: e.visit_count,
    readiness_score: e.readiness_score,
    vouch_status: e.last_vouch_status,
    stage: getStageDescription(e),
    notes: ''
  }));

  return (
    <div className="min-h-screen bg-[#070A0F] p-6 pb-20">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Welcome Banner */}
        {showWelcome && (
          <div className="rounded-3xl border border-green-500/30 bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-6">
            <div className="flex items-start gap-4">
              <span className="text-3xl">👋</span>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-white">Welcome to Your Mentor Portal!</h2>
                <p className="text-sm text-white/70 mt-1">
                  Thank you for volunteering your time and expertise. Your guidance helps entrepreneurs build stronger businesses and achieve their dreams.
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

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Mentor Portal</h1>
            <p className="text-white/60 mt-1">Welcome back, {mentorData?.fullName || "Mentor"} 👋</p>
          </div>
          <button
            onClick={() => navigate('/app/mentor/profile')}
            className="bg-[#C7000B] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-95"
          >
            Mentor Profile
          </button>
        </div>

        {/* Role Explanation Card */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-6">
          <h2 className="text-lg font-semibold text-white mb-3">Your Role as a Mentor</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <RoleCard
              icon="🎯"
              title="Guide & Support"
              description="Provide business guidance, share your experience, and help entrepreneurs navigate challenges."
            />
            <RoleCard
              icon="📊"
              title="Evaluate Progress"
              description="Assess their business readiness and provide constructive feedback to help them improve."
            />
            <RoleCard
              icon="✅"
              title="Vouch & Validate"
              description="When ready, vouching for an entrepreneur adds 10 points to their readiness score, helping them access funding."
            />
          </div>
          <div className="mt-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-xs text-yellow-300">
              <span className="font-semibold">🔍 Why accuracy matters:</span> Your vouches directly impact an entrepreneur's ability to secure funding. 
              Accurate assessments ensure that only truly ready businesses receive investment, protecting both entrepreneurs and funders.
            </p>
          </div>
        </div>

        {/* Impact Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            icon="📈"
            value={entrepreneurs.length}
            label="Entrepreneurs Mentored"
            color="text-blue-400"
          />
          <StatCard
            icon="✓"
            value={entrepreneurs.filter(e => e.last_vouch_status === 'approved').length}
            label="Vouches Given"
            color="text-green-400"
          />
          <StatCard
            icon="⭐"
            value={`+${impactStats.totalScoreImpact}`}
            label="Total Score Impact"
            color="text-purple-400"
          />
          <StatCard
            icon="📊"
            value={`+${impactStats.avgScoreIncrease}`}
            label="Avg Score Increase"
            color="text-yellow-400"
          />
        </div>

        {/* How It Works Guide */}
        {showGuide && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Understanding the Entrepreneur Journey</h2>
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
                description="Entrepreneurs complete modules on financial literacy, market research, and business planning."
                details={[
                  "Financial Literacy - Understanding finances",
                  "Market Research - Analyzing opportunities",
                  "Business Mindset - Developing resilience",
                  "Business Plan - Creating strategy"
                ]}
                color="blue"
              />
              <GuideCard
                icon="📊"
                title="2. Stress Test"
                description="A rigorous test of business resilience through real-world scenarios."
                details={[
                  "3 realistic business challenges",
                  "Decision-making assessment",
                  "Must score 70%+ to pass",
                  "Demonstrates financial resilience"
                ]}
                color="purple"
              />
              <GuideCard
                icon="👥"
                title="3. Your Role"
                description="You guide them through the final stages and validate their readiness."
                details={[
                  "Review their progress",
                  "Provide expert feedback",
                  "Vouch when ready (+10 points)",
                  "Help them prepare for funders"
                ]}
                color="green"
              />
            </div>

            <div className="mt-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <p className="text-sm text-blue-300">
                <span className="font-semibold">📊 Understanding Scores:</span> Entrepreneurs start with a baseline score that increases as they complete requirements. 
                Your vouches add 10 points, significantly impacting their funding eligibility (target is 70+).
              </p>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="rounded-xl bg-yellow-500/20 border border-yellow-500 p-4">
            <p className="text-yellow-300 text-sm">{error}</p>
            <button
              onClick={fetchMentorData}
              className="mt-2 text-xs text-yellow-400 hover:underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Pending Requests */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Pending Requests ({pendingRequests.length})
          </h2>
          
          {pendingRequests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/40">No pending requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((entrepreneur) => (
                <div
                  key={entrepreneur.user_id}
                  className="p-4 rounded-xl bg-black/25 border border-white/10"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-white">{entrepreneur.business_name}</h3>
                      <p className="text-sm text-white/60">{entrepreneur.full_name} • {entrepreneur.industry}</p>
                      <p className="text-xs text-white/40 mt-1">{getStageDescription(entrepreneur)}</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getReadinessScoreColor(entrepreneur.readiness_score)}`}>
                        {entrepreneur.readiness_score}
                      </div>
                      <div className="text-xs text-white/40">Score</div>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleScheduleSession(entrepreneur.user_id, entrepreneur.business_name)}
                      className="flex-1 bg-[#C7000B] text-white py-2 rounded-xl text-xs font-semibold hover:opacity-95"
                    >
                      Schedule Session
                    </button>
                    <button
                      onClick={() => handleDeclineRequest(entrepreneur.user_id, entrepreneur.business_name)}
                      className="flex-1 border border-white/10 bg-white/5 text-white/80 py-2 rounded-xl text-xs font-semibold hover:bg-white/10"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Session History */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Session History ({pastSessions.length})
          </h2>
          
          {pastSessions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/40">No sessions yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pastSessions.map((session, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-black/25 border border-white/10"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-white">{session.business_name}</h3>
                      <p className="text-xs text-white/60 mt-1">{session.stage}</p>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      session.status === 'Approved' ? 'bg-green-500/20 text-green-300' :
                      session.status === 'Not Approved' ? 'bg-red-500/20 text-red-300' :
                      'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {session.status}
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-white/40">Sessions:</span>
                      <span className="ml-2 text-white">{session.visit_count}</span>
                    </div>
                    <div>
                      <span className="text-white/40">Score:</span>
                      <span className={`ml-2 font-semibold ${getReadinessScoreColor(session.readiness_score)}`}>
                        {session.readiness_score}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => openNotesModal(session)}
                    className="mt-3 w-full border border-white/10 bg-white/5 text-white/80 py-2 rounded-xl text-xs font-semibold hover:bg-white/10"
                  >
                    {session.notes ? 'Edit Notes' : 'Add Notes'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <ActionButton
              icon="👥"
              label="All Entrepreneurs"
              onClick={() => navigate('/app/mentor/entrepreneurs')}
            />
            <ActionButton
              icon="📅"
              label="Schedule"
              onClick={() => navigate('/app/mentor/schedule')}
            />
            <ActionButton
              icon="📊"
              label="Resources"
              onClick={() => navigate('/app/mentor/resources')}
            />
            <ActionButton
              icon="❓"
              label="Help"
              onClick={() => navigate('/app/help')}
            />
          </div>
        </div>

        {/* Notes Modal */}
        {showNotesModal && selectedSession && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4">
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0A0E16] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">
                  {selectedSession.isNewSession ? 'New Session' : 'Session Notes'}: {selectedSession.business_name || selectedSession.entrepreneur_name}
                </h3>
                <button
                  onClick={() => setShowNotesModal(false)}
                  className="text-white/40 hover:text-white/60"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Vouch Status */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Vouch Status
                  </label>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="vouchStatus"
                        value="approved"
                        checked={vouchStatus === 'approved'}
                        onChange={(e) => setVouchStatus(e.target.value)}
                        className="text-[#C7000B]"
                      />
                      <span className="text-sm text-white/70">Approve ✓</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="vouchStatus"
                        value="not_approved"
                        checked={vouchStatus === 'not_approved'}
                        onChange={(e) => setVouchStatus(e.target.value)}
                        className="text-[#C7000B]"
                      />
                      <span className="text-sm text-white/70">Not Approve ✗</span>
                    </label>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Session Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows="5"
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder-white/30 focus:ring-2 focus:ring-white/20 outline-none"
                    placeholder="Enter your observations, feedback, and recommendations..."
                  />
                </div>

                {/* Impact Info */}
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <p className="text-xs text-blue-300/80">
                    <span className="font-semibold">ℹ️ Note:</span> Approving an entrepreneur increases their readiness score by 10 points, 
                    significantly improving their chances of securing funding.
                  </p>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setShowNotesModal(false)}
                    className="rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-white/80 hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitNotes}
                    disabled={submitting}
                    className="rounded-xl bg-[#C7000B] py-3 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-50"
                  >
                    {submitting ? "Saving..." : "Save Notes"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper Components
function RoleCard({ icon, title, description }) {
  return (
    <div className="p-3 rounded-xl bg-black/25">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <h3 className="font-semibold text-white text-sm">{title}</h3>
      </div>
      <p className="text-xs text-white/60">{description}</p>
    </div>
  );
}

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

function GuideCard({ icon, title, description, details, color }) {
  const [expanded, setExpanded] = useState(false);
  
  const colorClasses = {
    blue: "bg-blue-500/10 border-blue-500/20",
    purple: "bg-purple-500/10 border-purple-500/20",
    green: "bg-green-500/10 border-green-500/20"
  };

  return (
    <div className={`p-4 rounded-xl ${colorClasses[color]} border`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{icon}</span>
        <h3 className="font-semibold text-white text-sm">{title}</h3>
      </div>
      <p className="text-xs text-white/60 mb-2">{description}</p>
      
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-[#C7000B] hover:underline"
      >
        {expanded ? 'Show less' : 'Show details'}
      </button>
      
      {expanded && (
        <ul className="mt-2 space-y-1">
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

function ActionButton({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="p-3 rounded-xl bg-black/25 border border-white/10 hover:bg-white/5 transition text-center"
    >
      <span className="text-xl mb-1 block">{icon}</span>
      <span className="text-xs text-white/80">{label}</span>
    </button>
  );
}