import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../services/api";

export default function MentorEntrepreneurDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [entrepreneur, setEntrepreneur] = useState(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notes, setNotes] = useState("");
  const [vouchStatus, setVouchStatus] = useState("approved");
  const [submitting, setSubmitting] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);

  // Mock data as absolute last resort
  const mockEntrepreneur = {
    business_name: "Sample Business",
    full_name: "Entrepreneur Name",
    email: "entrepreneur@example.com",
    industry: "Technology",
    cicp_number: "CICP123456",
    phone: "+27 12 345 6789",
    readiness_score: 68,
    verified: false,
    compliance_completed: true,
    grooming_completed: false,
    stress_test_passed: false,
    fixed_cost: 25000,
    variable_monthly_cost: 15000,
    quiz_score: 65,
    simulation_score: 58,
    session_history: [
      {
        log_id: "mock1",
        visit_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: "Discussed financial planning and cash flow management. Entrepreneur shows good understanding but needs help with projections.",
        vouch_status: "approved"
      },
      {
        log_id: "mock2",
        visit_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: "Reviewed business plan and market analysis. Recommended focusing on customer acquisition strategy.",
        vouch_status: "pending"
      }
    ]
  };

  // Wrap fetch function in useCallback
  const fetchEntrepreneurDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setUsingMockData(false);
      
      // Try to fetch real data
      const data = await api.get(`/mentor/entrepreneurs/${id}/profile`);
      console.log('Entrepreneur details:', data);
      setEntrepreneur(data);
      
    } catch (err) {
      console.error('Error fetching entrepreneur:', err);
      
      // Check if it's a network error vs 404
      if (err.message.includes('Network Error') || err.message.includes('Failed to fetch')) {
        setError('Network error. Please check your connection and try again.');
      } else if (err.message.includes('404')) {
        setError('Entrepreneur profile not found. They may have been removed.');
      } else {
        // Only use mock data as absolute last resort
        console.log('Using mock data as fallback');
        setEntrepreneur(mockEntrepreneur);
        setUsingMockData(true);
        setError(null); // Clear error when using mock data
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEntrepreneurDetails();
  }, [fetchEntrepreneurDetails]);

  const handleAddSession = async () => {
    try {
      setSubmitting(true);
      setError("");
      
      // Try to submit to real API
      await api.post('/mentor/visits', {
        entrepreneurId: id,
        visitDate: new Date().toISOString().split('T')[0],
        notes,
        vouchStatus
      });
      
      setShowNotesModal(false);
      setNotes("");
      fetchEntrepreneurDetails(); // Refresh with real data
      
    } catch (err) {
      console.error('Error adding session:', err);
      
      // If API fails, show error but don't mock
      setError('Failed to save session. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStageDescription = () => {
    if (!entrepreneur) return "";
    
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
        <div className="max-w-4xl mx-auto">
          <div className="border border-white/10 bg-white/5 rounded-3xl p-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-white/60">Loading entrepreneur details...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !entrepreneur) {
    return (
      <div className="min-h-screen bg-[#070A0F] p-6">
        <div className="max-w-4xl mx-auto">
          <div className="border border-white/10 bg-white/5 rounded-3xl p-8">
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="text-red-400">{error}</div>
              <button 
                onClick={fetchEntrepreneurDetails} 
                className="bg-[#C7000B] text-white px-6 py-2 rounded-xl hover:opacity-95"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/app/mentor/entrepreneurs')}
                className="text-white/40 hover:text-white/60 text-sm"
              >
                Back to Entrepreneurs
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!entrepreneur) {
    return (
      <div className="min-h-screen bg-[#070A0F] p-6">
        <div className="max-w-4xl mx-auto">
          <div className="border border-white/10 bg-white/5 rounded-3xl p-8 text-center">
            <p className="text-white/60">Entrepreneur not found</p>
            <button
              onClick={() => navigate('/app/mentor/entrepreneurs')}
              className="mt-4 bg-[#C7000B] text-white px-6 py-2 rounded-xl"
            >
              Back to Entrepreneurs
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070A0F] p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Mock Data Warning */}
        {usingMockData && (
          <div className="mb-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-xs text-yellow-300">
              <span className="font-semibold">⚠️ Demo Mode:</span> Showing sample data. Connect to backend to see real entrepreneur information.
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="text-xs text-red-300">{error}</p>
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/app/mentor/entrepreneurs')}
            className="text-white/60 hover:text-white mb-2 flex items-center gap-1"
          >
            ← Back to Entrepreneurs
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">{entrepreneur.business_name}</h1>
              <p className="text-white/60">{entrepreneur.full_name} • {entrepreneur.email}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-white/40">Stage</div>
              <p className="text-sm text-white/80">{getStageDescription()}</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard 
            label="Readiness Score" 
            value={entrepreneur.readiness_score || 0}
            className={entrepreneur.readiness_score >= 70 ? 'text-green-400' : 'text-yellow-400'}
          />
          <StatCard 
            label="Sessions" 
            value={entrepreneur.session_history?.length || 0} 
          />
          <StatCard 
            label="Status" 
            value={entrepreneur.verified ? 'Verified' : 'Pending'}
            className={entrepreneur.verified ? 'text-green-400' : 'text-yellow-400'}
          />
          <StatCard 
            label="Vouches" 
            value={entrepreneur.session_history?.filter(s => s.vouch_status === 'approved').length || 0}
            className="text-green-400"
          />
        </div>

        {/* Business Details */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="border border-white/10 bg-black/25 rounded-2xl p-4">
            <h3 className="text-white/60 text-sm mb-2">Business Information</h3>
            <div className="space-y-2">
              <DetailRow label="Industry" value={entrepreneur.industry || 'Not specified'} />
              <DetailRow label="CICP Number" value={entrepreneur.cicp_number || 'Not provided'} />
              <DetailRow label="Phone" value={entrepreneur.phone || 'Not provided'} />
              <DetailRow label="Fixed Costs" value={entrepreneur.fixed_cost ? `R${Number(entrepreneur.fixed_cost).toLocaleString()}` : 'Not provided'} />
              <DetailRow label="Variable Costs" value={entrepreneur.variable_monthly_cost ? `R${Number(entrepreneur.variable_monthly_cost).toLocaleString()}` : 'Not provided'} />
            </div>
          </div>

          <div className="border border-white/10 bg-black/25 rounded-2xl p-4">
            <h3 className="text-white/60 text-sm mb-2">Program Progress</h3>
            <div className="space-y-2">
              <ProgressItem label="Compliance" completed={entrepreneur.compliance_completed} />
              <ProgressItem label="Grooming" completed={entrepreneur.grooming_completed} />
              <ProgressItem label="Stress Test" completed={entrepreneur.stress_test_passed} />
              {entrepreneur.quiz_score > 0 && (
                <ProgressItem label="Quiz Score" value={entrepreneur.quiz_score} />
              )}
              {entrepreneur.simulation_score > 0 && (
                <ProgressItem label="Stress Test Score" value={entrepreneur.simulation_score} />
              )}
            </div>
          </div>
        </div>

        {/* Session History */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-white">Session History</h2>
            <button
              onClick={() => setShowNotesModal(true)}
              className="bg-[#C7000B] text-white px-4 py-2 rounded-xl text-sm hover:opacity-95"
            >
              + Add Session
            </button>
          </div>
          
          {!entrepreneur.session_history || entrepreneur.session_history.length === 0 ? (
            <div className="border border-white/10 bg-black/25 rounded-2xl p-8 text-center">
              <p className="text-white/40">No sessions yet</p>
              <p className="text-white/30 text-sm mt-1">Click "Add Session" to create your first session log</p>
            </div>
          ) : (
            <div className="space-y-2">
              {entrepreneur.session_history.map((session) => (
                <div key={session.log_id} className="border border-white/10 bg-black/25 rounded-xl p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-white font-semibold">
                        {new Date(session.visit_date).toLocaleDateString('en-ZA', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                      <p className="text-white/60 text-sm mt-1">{session.notes || 'No notes recorded'}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      session.vouch_status === 'approved' ? 'bg-green-500/20 text-green-300' :
                      session.vouch_status === 'not_approved' ? 'bg-red-500/20 text-red-300' :
                      'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {session.vouch_status === 'approved' ? '✓ Approved' :
                       session.vouch_status === 'not_approved' ? '✗ Not Approved' :
                       '⏳ Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes Modal */}
        {showNotesModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-[#0A0E16] rounded-3xl p-6 max-w-md w-full border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">Add Session Notes</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white/80 mb-2">Vouch Status</label>
                  <select
                    value={vouchStatus}
                    onChange={(e) => setVouchStatus(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white"
                  >
                    <option value="approved">Approve ✓ (+10 points to score)</option>
                    <option value="not_approved">Not Approve ✗</option>
                  </select>
                  <p className="text-xs text-white/40 mt-1">
                    Approving increases their readiness score by 10 points
                  </p>
                </div>

                <div>
                  <label className="block text-white/80 mb-2">Session Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows="4"
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white placeholder-white/30"
                    placeholder="Enter your observations, feedback, and recommendations..."
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowNotesModal(false)}
                    className="flex-1 border border-white/10 bg-white/5 py-2 rounded-xl text-white hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddSession}
                    disabled={submitting || !notes.trim()}
                    className="flex-1 bg-[#C7000B] py-2 rounded-xl text-white hover:opacity-95 disabled:opacity-50"
                  >
                    {submitting ? "Saving..." : "Save Session"}
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

function StatCard({ label, value, className = "" }) {
  return (
    <div className="border border-white/10 bg-black/25 rounded-xl p-3">
      <div className="text-white/40 text-xs">{label}</div>
      <div className={`text-white font-bold text-lg ${className}`}>{value}</div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-white/40">{label}:</span>
      <span className="text-white/80">{value}</span>
    </div>
  );
}

function ProgressItem({ label, completed, value }) {
  if (value !== undefined) {
    return (
      <div className="flex justify-between text-sm">
        <span className="text-white/40">{label}:</span>
        <span className="text-white/80">{value}%</span>
      </div>
    );
  }
  return (
    <div className="flex justify-between text-sm">
      <span className="text-white/40">{label}:</span>
      <span className={completed ? 'text-green-400' : 'text-yellow-400'}>
        {completed ? '✓ Complete' : '○ Incomplete'}
      </span>
    </div>
  );
}