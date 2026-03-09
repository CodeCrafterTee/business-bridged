import { useState, useEffect } from "react";
import { api } from "../../services/api";

export default function FinalStage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboardData, setDashboardData] = useState(null);
  const [matches, setMatches] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedFunder, setSelectedFunder] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationForm, setApplicationForm] = useState({
    pitchDeck: null,
    additionalDocs: null,
    coverLetter: "",
    expectedAmount: "",
    useOfFunds: ""
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchFinalStageData();
  }, []);

  const fetchFinalStageData = async () => {
    try {
      setLoading(true);
      
      // Get entrepreneur dashboard data
      let dashboard;
      try {
        dashboard = await api.get('/entrepreneur/dashboard');
        console.log('Dashboard data:', dashboard);
      } catch (err) {
        console.log('Dashboard endpoint not found:', err.message);
        dashboard = {};
      }
      setDashboardData(dashboard);
      
      // Get funder matches
      let matchesData;
      try {
        matchesData = await api.get('/entrepreneur/funder-matches');
        console.log('Matches data:', matchesData);
      } catch (err) {
        console.log('Matches endpoint not found:', err.message);
        matchesData = [];
      }
      setMatches(Array.isArray(matchesData) ? matchesData : []);
      
      // Get applications (if any)
      let applicationsData;
      try {
        applicationsData = await api.get('/entrepreneur/applications');
        console.log('Applications data:', applicationsData);
      } catch (err) {
        console.log('Applications endpoint not found:', err.message);
        applicationsData = [];
      }
      setApplications(Array.isArray(applicationsData) ? applicationsData : []);
      
    } catch (err) {
      console.error('Error fetching final stage data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyNow = (funder) => {
    setSelectedFunder(funder);
    setShowApplicationModal(true);
  };

  const handleApplicationSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      // Submit application
      const applicationData = {
        funderId: selectedFunder.funder_id,
        expectedAmount: parseFloat(applicationForm.expectedAmount),
        useOfFunds: applicationForm.useOfFunds,
        coverLetter: applicationForm.coverLetter,
        // In a real app, you'd upload files separately
      };
      
      await api.post('/entrepreneur/applications', applicationData);
      
      // Refresh data
      await fetchFinalStageData();
      
      setShowApplicationModal(false);
      setSelectedFunder(null);
      setApplicationForm({
        pitchDeck: null,
        additionalDocs: null,
        coverLetter: "",
        expectedAmount: "",
        useOfFunds: ""
      });
      
    } catch (err) {
      console.error('Error submitting application:', err);
      setError(err.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return 'bg-green-500/20 text-green-300';
      case 'rejected': return 'bg-red-500/20 text-red-300';
      case 'pending':
      default: return 'bg-yellow-500/20 text-yellow-300';
    }
  };

  const getReadinessMessage = () => {
    if (!dashboardData) return "Complete your profile to get started";
    
    if (!dashboardData.verified) {
      return "Your business is being verified. This usually takes 2-3 business days.";
    }
    
    if (!dashboardData.stress_test_passed) {
      return "Complete the stress test to become investment ready.";
    }
    
    if (!dashboardData.grooming_completed) {
      return "Finish the grooming program to improve your readiness score.";
    }
    
    if (dashboardData.readiness_score < 70) {
      return "Your readiness score is below our threshold. Focus on improving your score.";
    }
    
    return "You're ready to apply for funding!";
  };

  const isEligible = dashboardData?.verified && 
                     dashboardData?.stress_test_passed && 
                     dashboardData?.grooming_completed && 
                     (dashboardData?.readiness_score || 0) >= 70;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070A0F] p-6">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-white/60">Loading your funding journey...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#070A0F] p-6">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="text-red-400">{error}</div>
              <button
                onClick={fetchFinalStageData}
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
    <div className="min-h-screen bg-[#070A0F] p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h1 className="text-2xl font-bold text-white">Final Stage: Funding</h1>
          <p className="mt-1 text-white/60">
            Complete your journey to secure investment for your business
          </p>
        </div>

        {/* Readiness Status */}
        <div className={`rounded-3xl border p-6 ${
          isEligible 
            ? 'border-green-500/30 bg-green-500/10' 
            : 'border-yellow-500/30 bg-yellow-500/10'
        }`}>
          <div className="flex items-start gap-4">
            <div className="text-3xl">
              {isEligible ? '🎯' : '📋'}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-white">
                {isEligible ? 'Ready to Apply!' : 'Complete Requirements'}
              </h2>
              <p className="mt-1 text-sm text-white/70">
                {getReadinessMessage()}
              </p>
              
              {/* Progress checklist */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <CheckItem 
                  label="Verified Business" 
                  completed={dashboardData?.verified}
                />
                <CheckItem 
                  label="Grooming Complete" 
                  completed={dashboardData?.grooming_completed}
                />
                <CheckItem 
                  label="Stress Test Passed" 
                  completed={dashboardData?.stress_test_passed}
                />
                <CheckItem 
                  label="Score ≥ 70" 
                  completed={(dashboardData?.readiness_score || 0) >= 70}
                  value={dashboardData?.readiness_score}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Active Applications */}
        {applications.length > 0 && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Your Applications ({applications.length})
            </h2>
            <div className="space-y-3">
              {applications.map((app) => (
                <div
                  key={app.application_id}
                  className="rounded-2xl border border-white/10 bg-black/25 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-semibold">{app.funder_name}</div>
                      <div className="mt-1 text-xs text-white/60">
                        Applied: {new Date(app.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className={`text-xs px-3 py-1 rounded-full ${getStatusColor(app.status)}`}>
                      {app.status}
                    </div>
                  </div>
                  {app.feedback && (
                    <div className="mt-3 p-3 rounded-xl bg-white/5 text-sm text-white/70">
                      <span className="font-semibold">Feedback:</span> {app.feedback}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Funders */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Available Funding Partners
          </h2>
          
          {matches.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/40">No funder matches yet</p>
              <p className="text-sm text-white/30 mt-1">
                Complete your profile to get matched with funders
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {matches.map((funder) => (
                <div
                  key={funder.funder_id}
                  className="rounded-2xl border border-white/10 bg-black/25 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-semibold">{funder.organization_name}</div>
                      <div className="mt-1 text-xs text-white/60">
                        {funder.preferred_industry || 'All industries'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-white/40">Budget</div>
                      <div className="text-sm font-bold text-white">
                        R{Number(funder.investment_budget || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-xs">
                    <span className="text-white/40">Min score:</span>
                    <span className="text-white font-semibold">{funder.minimum_readiness_score || 0}</span>
                  </div>

                  {funder.requirements_json && (
                    <div className="mt-2">
                      <details className="text-xs">
                        <summary className="text-[#C7000B] cursor-pointer">View requirements</summary>
                        <pre className="mt-2 p-2 rounded bg-black/50 text-white/60 text-[10px] overflow-auto">
                          {JSON.stringify(funder.requirements_json, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}

                  <button
                    onClick={() => handleApplyNow(funder)}
                    disabled={!isEligible}
                    className={`mt-4 w-full rounded-2xl py-2 text-xs font-semibold transition-all ${
                      isEligible
                        ? 'bg-[#C7000B] text-white hover:opacity-95'
                        : 'bg-white/10 text-white/40 cursor-not-allowed'
                    }`}
                  >
                    {isEligible ? 'Apply Now' : 'Complete Requirements'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Next Steps */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white mb-3">Next Steps</h2>
          <div className="space-y-3">
            <StepItem 
              number="1"
              title="Prepare your pitch deck"
              description="Create a compelling presentation about your business"
              completed={false}
            />
            <StepItem 
              number="2"
              title="Gather financial documents"
              description="3 years of financial statements, tax returns, and bank statements"
              completed={false}
            />
            <StepItem 
              number="3"
              title="Research funders"
              description="Review funder requirements and choose the best fit"
              completed={matches.length > 0}
            />
            <StepItem 
              number="4"
              title="Submit applications"
              description="Apply to multiple funders to increase your chances"
              completed={applications.length > 0}
            />
            <StepItem 
              number="5"
              title="Follow up"
              description="Track your applications and respond to feedback"
              completed={applications.some(a => a.status !== 'pending')}
            />
          </div>
        </div>

        {/* Success Stories */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white mb-3">Success Stories</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                  ✓
                </div>
                <div>
                  <div className="text-sm font-semibold">Thandi's Catering</div>
                  <div className="text-xs text-white/40">Secured R250,000 from VCC Fund</div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                  ✓
                </div>
                <div>
                  <div className="text-sm font-semibold">Lebo Sneakers</div>
                  <div className="text-xs text-white/40">Secured R500,000 from Growth Fund</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Application Modal */}
        {showApplicationModal && selectedFunder && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4">
            <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0A0E16] p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Apply to {selectedFunder.organization_name}
                </h3>
                <button
                  onClick={() => setShowApplicationModal(false)}
                  className="text-white/40 hover:text-white/60"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleApplicationSubmit} className="space-y-4">
                {/* Expected Amount */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Funding Amount Requested (ZAR) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1000"
                    step="1000"
                    value={applicationForm.expectedAmount}
                    onChange={(e) => setApplicationForm(prev => ({ 
                      ...prev, 
                      expectedAmount: e.target.value 
                    }))}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white"
                    placeholder="e.g., 250000"
                  />
                </div>

                {/* Use of Funds */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    How will you use the funds? *
                  </label>
                  <textarea
                    required
                    rows="3"
                    value={applicationForm.useOfFunds}
                    onChange={(e) => setApplicationForm(prev => ({ 
                      ...prev, 
                      useOfFunds: e.target.value 
                    }))}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white"
                    placeholder="Describe how you plan to use the investment..."
                  />
                </div>

                {/* Cover Letter */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Cover Letter / Pitch *
                  </label>
                  <textarea
                    required
                    rows="4"
                    value={applicationForm.coverLetter}
                    onChange={(e) => setApplicationForm(prev => ({ 
                      ...prev, 
                      coverLetter: e.target.value 
                    }))}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white"
                    placeholder="Introduce your business and explain why you're a good fit..."
                  />
                </div>

                {/* File Uploads */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Pitch Deck (PDF)
                    </label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setApplicationForm(prev => ({ 
                        ...prev, 
                        pitchDeck: e.target.files[0] 
                      }))}
                      className="w-full text-white/60 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Additional Documents
                    </label>
                    <input
                      type="file"
                      multiple
                      onChange={(e) => setApplicationForm(prev => ({ 
                        ...prev, 
                        additionalDocs: e.target.files 
                      }))}
                      className="w-full text-white/60 text-sm"
                    />
                  </div>
                </div>

                {/* Requirements Check */}
                {selectedFunder.requirements_json && (
                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <p className="text-xs text-blue-300/80">
                      <span className="font-semibold">📋 Requirements:</span> Make sure you've reviewed the funder's requirements before applying.
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowApplicationModal(false)}
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-white/80 hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 rounded-xl bg-[#C7000B] py-3 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-50"
                  >
                    {submitting ? "Submitting..." : "Submit Application"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Debug Info */}
        {import.meta.env.DEV && (
          <div className="mt-4 p-3 border border-yellow-500/30 bg-yellow-500/10 rounded-2xl">
            <details>
              <summary className="text-xs text-yellow-400 cursor-pointer">
                Debug Data
              </summary>
              <pre className="mt-2 text-[10px] text-yellow-200/70 overflow-auto max-h-40">
                {JSON.stringify({ dashboardData, matches, applications }, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper Components
function CheckItem({ label, completed, value }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`text-sm ${completed ? 'text-green-400' : 'text-white/40'}`}>
        {completed ? '✓' : '○'}
      </span>
      <span className="text-xs text-white/70">{label}</span>
      {value !== undefined && (
        <span className="text-xs text-white/40 ml-auto">{value}</span>
      )}
    </div>
  );
}

function StepItem({ number, title, description, completed }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
        completed 
          ? 'bg-green-500/20 text-green-400' 
          : 'bg-white/10 text-white/40'
      }`}>
        {completed ? '✓' : number}
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold text-white">{title}</div>
        <div className="text-xs text-white/40">{description}</div>
      </div>
    </div>
  );
}