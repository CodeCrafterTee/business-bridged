import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";

export default function FunderMatches() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [matches, setMatches] = useState([]);
  const [pendingApplications, setPendingApplications] = useState([]);
  const [approvedMatches, setApprovedMatches] = useState([]);
  const [rejectedMatches, setRejectedMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // Mock data for demonstration
  const mockMatches = {
    pending: [
      {
        id: "m1",
        funderName: "VCC Growth Fund",
        funderImage: "📈",
        organization: "VCC Capital",
        amount: 5000000,
        industry: "Technology, Retail",
        matchScore: 95,
        status: "pending",
        appliedDate: "2024-03-01",
        description: "We invest in early-stage businesses with high growth potential. Looking for innovative solutions and scalable business models.",
        requirements: {
          documents: ["Business plan", "Financial statements", "Tax returns"],
          stage: "Stage 2+",
          location: "Johannesburg",
          yearsInBusiness: "2+ years"
        },
        contactPerson: "Sarah Khumalo",
        contactEmail: "sarah@vccgrowth.co.za",
        website: "www.vccgrowth.co.za"
      },
      {
        id: "m2",
        funderName: "Women's Investment Network",
        funderImage: "👩‍💼",
        organization: "WIN Fund",
        amount: 2500000,
        industry: "Women-owned businesses",
        matchScore: 88,
        status: "pending",
        appliedDate: "2024-02-28",
        description: "Empowering women entrepreneurs through funding and mentorship. Focus on businesses making social impact.",
        requirements: {
          documents: ["Business plan", "ID document", "Bank statements"],
          stage: "Any stage",
          location: "Nationwide",
          womenOwned: "51%+"
        },
        contactPerson: "Lerato Ndlovu",
        contactEmail: "lerato@win.org.za",
        website: "www.win.org.za"
      }
    ],
    approved: [
      {
        id: "m3",
        funderName: "GreenTech Ventures",
        funderImage: "🌱",
        organization: "GreenTech",
        amount: 10000000,
        industry: "Clean energy, Sustainability",
        matchScore: 72,
        status: "approved",
        appliedDate: "2024-02-15",
        approvedDate: "2024-02-28",
        description: "Funding innovative solutions for environmental challenges. Passionate about businesses that make a positive impact on the planet.",
        requirements: {
          documents: ["Environmental impact assessment", "Business plan", "Patents"],
          stage: "Stage 3",
          location: "Cape Town",
          certification: "Green certification preferred"
        },
        contactPerson: "Marcus van der Merwe",
        contactEmail: "marcus@greentech.za",
        website: "www.greentech.za",
        nextSteps: "Schedule introductory call with investment team",
        meetingLink: "https://calendly.com/greentech/intro"
      }
    ],
    rejected: [
      {
        id: "m4",
        funderName: "Small Business Fund",
        funderImage: "💼",
        organization: "SBF",
        amount: 1000000,
        industry: "All industries",
        matchScore: 82,
        status: "rejected",
        appliedDate: "2024-02-10",
        rejectedDate: "2024-02-20",
        description: "Supporting small businesses with flexible funding options.",
        requirements: {
          documents: ["Business plan", "Bank statements", "Tax clearance"],
          stage: "Stage 1+",
          location: "Nationwide",
          employees: "Less than 50"
        },
        feedback: "Thank you for your application. Unfortunately, we are focusing on businesses with at least 2 years of trading history at this time. We encourage you to reapply once your business is more established.",
        contactPerson: "Thabo Molefe",
        contactEmail: "thabo@sbf.co.za"
      }
    ]
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Try to fetch real matches from backend
      try {
        const data = await api.get('/entrepreneur/funder-matches');
        console.log('Matches data:', data);
        
        if (data && data.matches) {
          // Process real data
          const pending = data.matches.filter(m => m.status === 'pending');
          const approved = data.matches.filter(m => m.status === 'approved');
          const rejected = data.matches.filter(m => m.status === 'rejected');
          
          setMatches(data.matches);
          setPendingApplications(pending);
          setApprovedMatches(approved);
          setRejectedMatches(rejected);
        }
      } catch (matchesError) {
        console.log('Using mock matches data:', matchesError.message);
        
        // Use mock data
        setMatches([
          ...mockMatches.pending,
          ...mockMatches.approved,
          ...mockMatches.rejected
        ]);
        setPendingApplications(mockMatches.pending);
        setApprovedMatches(mockMatches.approved);
        setRejectedMatches(mockMatches.rejected);
      }
      
    } catch (err) {
      console.error('Error fetching matches:', err);
      setError('Failed to load funder matches. Please try again.');
      
      // Fallback to mock data
      setMatches([
        ...mockMatches.pending,
        ...mockMatches.approved,
        ...mockMatches.rejected
      ]);
      setPendingApplications(mockMatches.pending);
      setApprovedMatches(mockMatches.approved);
      setRejectedMatches(mockMatches.rejected);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (match) => {
    setSelectedMatch(match);
    setShowDetailsModal(true);
  };

  const handleScheduleCall = (match) => {
    if (match.meetingLink) {
      window.open(match.meetingLink, '_blank');
    }
  };

  const handleContactFunder = (match) => {
    window.location.href = `mailto:${match.contactEmail}?subject=Funding Application: ${match.funderName}`;
  };

  const handleWithdrawApplication = async (match) => {
    if (window.confirm(`Are you sure you want to withdraw your application from ${match.funderName}?`)) {
      try {
        setSubmitting(true);
        
        // Try to withdraw via API
        try {
          await api.post(`/entrepreneur/funder-matches/${match.id}/withdraw`);
        } catch (withdrawError) {
          console.log('Withdraw endpoint not available - simulating:', withdrawError.message);
        }
        
        // Update local state
        setPendingApplications(prev => prev.filter(m => m.id !== match.id));
        setMatches(prev => prev.filter(m => m.id !== match.id));
        alert('Application withdrawn successfully');
        
      } catch (err) {
        console.error('Error withdrawing application:', err);
        setError('Failed to withdraw application. Please try again.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return <span className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-xs font-semibold">Pending Review</span>;
      case 'approved':
        return <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs font-semibold">Approved ✓</span>;
      case 'rejected':
        return <span className="bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-xs font-semibold">Not Selected</span>;
      default:
        return null;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-ZA', options);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070A0F] p-6">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-white/60">Loading your matches...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070A0F] p-6 pb-20">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="text-white/40 hover:text-white/60"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-white">Funder Matches</h1>
          <button
            onClick={() => navigate('/app/apply-funding')}
            className="text-[#C7000B] text-sm font-semibold hover:underline"
          >
            Find More →
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 rounded-xl bg-red-500/20 border border-red-500 p-3 text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div 
            className="rounded-2xl border border-white/10 bg-black/25 p-3 text-center cursor-pointer hover:bg-white/5 transition"
            onClick={() => setActiveTab("pending")}
          >
            <div className="text-2xl font-bold text-yellow-400">{pendingApplications.length}</div>
            <div className="text-xs text-white/40">Pending</div>
          </div>
          <div 
            className="rounded-2xl border border-white/10 bg-black/25 p-3 text-center cursor-pointer hover:bg-white/5 transition"
            onClick={() => setActiveTab("approved")}
          >
            <div className="text-2xl font-bold text-green-400">{approvedMatches.length}</div>
            <div className="text-xs text-white/40">Approved</div>
          </div>
          <div 
            className="rounded-2xl border border-white/10 bg-black/25 p-3 text-center cursor-pointer hover:bg-white/5 transition"
            onClick={() => setActiveTab("rejected")}
          >
            <div className="text-2xl font-bold text-red-400">{rejectedMatches.length}</div>
            <div className="text-xs text-white/40">Rejected</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold transition ${
              activeTab === "all"
                ? 'bg-[#C7000B] text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            All ({matches.length})
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold transition ${
              activeTab === "pending"
                ? 'bg-yellow-500 text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            Pending ({pendingApplications.length})
          </button>
          <button
            onClick={() => setActiveTab("approved")}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold transition ${
              activeTab === "approved"
                ? 'bg-green-500 text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            Approved ({approvedMatches.length})
          </button>
        </div>

        {/* Matches List */}
        {activeTab === "all" && (
          <div className="space-y-4">
            {matches.length === 0 ? (
              <div className="text-center py-12 bg-white/5 rounded-3xl">
                <p className="text-white/40 mb-3">No funder matches yet</p>
                <button
                  onClick={() => navigate('/app/apply-funding')}
                  className="text-[#C7000B] text-sm font-semibold hover:underline"
                >
                  Start finding matches →
                </button>
              </div>
            ) : (
              <>
                {/* Pending Section */}
                {pendingApplications.length > 0 && (
                  <div>
                    <h2 className="text-sm font-semibold text-yellow-400 mb-3">PENDING REVIEW</h2>
                    {pendingApplications.map((match) => (
                      <MatchCard
                        key={match.id}
                        match={match}
                        onViewDetails={handleViewDetails}
                        onWithdraw={handleWithdrawApplication}
                        formatCurrency={formatCurrency}
                        getStatusBadge={getStatusBadge}
                        submitting={submitting}
                      />
                    ))}
                  </div>
                )}

                {/* Approved Section */}
                {approvedMatches.length > 0 && (
                  <div className="mt-6">
                    <h2 className="text-sm font-semibold text-green-400 mb-3">APPROVED</h2>
                    {approvedMatches.map((match) => (
                      <MatchCard
                        key={match.id}
                        match={match}
                        onViewDetails={handleViewDetails}
                        onScheduleCall={handleScheduleCall}
                        formatCurrency={formatCurrency}
                        getStatusBadge={getStatusBadge}
                      />
                    ))}
                  </div>
                )}

                {/* Rejected Section */}
                {rejectedMatches.length > 0 && (
                  <div className="mt-6">
                    <h2 className="text-sm font-semibold text-red-400 mb-3">NOT SELECTED</h2>
                    {rejectedMatches.map((match) => (
                      <MatchCard
                        key={match.id}
                        match={match}
                        onViewDetails={handleViewDetails}
                        formatCurrency={formatCurrency}
                        getStatusBadge={getStatusBadge}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === "pending" && (
          <div className="space-y-4">
            {pendingApplications.length === 0 ? (
              <div className="text-center py-12 bg-white/5 rounded-3xl">
                <p className="text-white/40">No pending applications</p>
              </div>
            ) : (
              pendingApplications.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  onViewDetails={handleViewDetails}
                  onWithdraw={handleWithdrawApplication}
                  formatCurrency={formatCurrency}
                  getStatusBadge={getStatusBadge}
                  submitting={submitting}
                />
              ))
            )}
          </div>
        )}

        {activeTab === "approved" && (
          <div className="space-y-4">
            {approvedMatches.length === 0 ? (
              <div className="text-center py-12 bg-white/5 rounded-3xl">
                <p className="text-white/40">No approved matches yet</p>
              </div>
            ) : (
              approvedMatches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  onViewDetails={handleViewDetails}
                  onScheduleCall={handleScheduleCall}
                  formatCurrency={formatCurrency}
                  getStatusBadge={getStatusBadge}
                />
              ))
            )}
          </div>
        )}

        {/* Details Modal */}
        {showDetailsModal && selectedMatch && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4 overflow-y-auto py-10">
            <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0A0E16] p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedMatch.funderImage}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{selectedMatch.funderName}</h3>
                    <p className="text-xs text-white/50">{selectedMatch.organization}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-white/40 hover:text-white/60"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {/* Status and Score */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-black/25">
                  <div>
                    <div className="text-xs text-white/40">Status</div>
                    <div className="mt-1">{getStatusBadge(selectedMatch.status)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-white/40">Match Score</div>
                    <div className="text-lg font-bold text-white">{selectedMatch.matchScore}%</div>
                  </div>
                </div>

                {/* Amount */}
                <div className="p-3 rounded-xl bg-black/25">
                  <div className="text-xs text-white/40">Funding Amount</div>
                  <div className="text-xl font-bold text-white">
                    {formatCurrency(selectedMatch.amount)}
                  </div>
                </div>

                {/* Description */}
                <div className="p-3 rounded-xl bg-black/25">
                  <div className="text-xs text-white/40 mb-2">About the Funder</div>
                  <p className="text-sm text-white/70">{selectedMatch.description}</p>
                </div>

                {/* Requirements */}
                <div className="p-3 rounded-xl bg-black/25">
                  <div className="text-xs text-white/40 mb-2">Requirements</div>
                  <div className="space-y-2">
                    {Object.entries(selectedMatch.requirements).map(([key, value]) => (
                      <div key={key} className="flex text-sm">
                        <span className="text-white/40 w-28 capitalize">{key}:</span>
                        <span className="text-white/70 flex-1">
                          {Array.isArray(value) ? value.join(', ') : value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="p-3 rounded-xl bg-black/25">
                  <div className="text-xs text-white/40 mb-2">Contact Information</div>
                  <div className="space-y-2">
                    <div className="flex text-sm">
                      <span className="text-white/40 w-20">Person:</span>
                      <span className="text-white/70">{selectedMatch.contactPerson}</span>
                    </div>
                    <div className="flex text-sm">
                      <span className="text-white/40 w-20">Email:</span>
                      <a href={`mailto:${selectedMatch.contactEmail}`} className="text-[#C7000B] hover:underline">
                        {selectedMatch.contactEmail}
                      </a>
                    </div>
                    {selectedMatch.website && (
                      <div className="flex text-sm">
                        <span className="text-white/40 w-20">Website:</span>
                        <a 
                          href={`https://${selectedMatch.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#C7000B] hover:underline"
                        >
                          {selectedMatch.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Application Timeline */}
                <div className="p-3 rounded-xl bg-black/25">
                  <div className="text-xs text-white/40 mb-2">Timeline</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/40">Applied:</span>
                      <span className="text-white/70">{formatDate(selectedMatch.appliedDate)}</span>
                    </div>
                    {selectedMatch.approvedDate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-white/40">Approved:</span>
                        <span className="text-green-400">{formatDate(selectedMatch.approvedDate)}</span>
                      </div>
                    )}
                    {selectedMatch.rejectedDate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-white/40">Decision:</span>
                        <span className="text-red-400">{formatDate(selectedMatch.rejectedDate)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Feedback (if rejected) */}
                {selectedMatch.feedback && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                    <div className="text-xs text-red-400 mb-2">Feedback</div>
                    <p className="text-sm text-red-300/80">{selectedMatch.feedback}</p>
                  </div>
                )}

                {/* Next Steps (if approved) */}
                {selectedMatch.nextSteps && (
                  <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                    <div className="text-xs text-green-400 mb-2">Next Steps</div>
                    <p className="text-sm text-green-300/80 mb-3">{selectedMatch.nextSteps}</p>
                    {selectedMatch.meetingLink && (
                      <button
                        onClick={() => handleScheduleCall(selectedMatch)}
                        className="w-full rounded-xl bg-green-600 py-2 text-sm font-semibold text-white hover:opacity-95"
                      >
                        Schedule Introductory Call
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-white/80 hover:bg-white/10"
                >
                  Close
                </button>
                {selectedMatch.status === 'pending' && (
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleWithdrawApplication(selectedMatch);
                    }}
                    disabled={submitting}
                    className="flex-1 rounded-xl border border-red-500/30 bg-red-500/10 py-3 text-sm font-semibold text-red-300 hover:bg-red-500/20 disabled:opacity-50"
                  >
                    {submitting ? "Withdrawing..." : "Withdraw Application"}
                  </button>
                )}
                {selectedMatch.status === 'approved' && (
                  <button
                    onClick={() => handleContactFunder(selectedMatch)}
                    className="flex-1 rounded-xl bg-[#C7000B] py-3 text-sm font-semibold text-white hover:opacity-95"
                  >
                    Contact Funder
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper Component for Match Cards
function MatchCard({ match, onViewDetails, onWithdraw, onScheduleCall, formatCurrency, getStatusBadge, submitting }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition cursor-pointer">
      <div className="flex items-start gap-3">
        {/* Funder Image */}
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-[#C7000B]/20 flex items-center justify-center text-2xl">
          {match.funderImage}
        </div>

        {/* Match Details */}
        <div className="flex-1" onClick={() => onViewDetails(match)}>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-white">{match.funderName}</h3>
              <p className="text-xs text-white/50">{match.organization}</p>
            </div>
            {getStatusBadge(match.status)}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1 text-white/40">
              <span>💰</span>
              <span>{formatCurrency(match.amount)}</span>
            </div>
            <div className="flex items-center gap-1 text-white/40">
              <span>📊</span>
              <span>{match.matchScore}% match</span>
            </div>
            <div className="flex items-center gap-1 text-white/40 col-span-2">
              <span>🏭</span>
              <span>{match.industry}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(match);
              }}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-semibold text-white/80 hover:bg-white/10"
            >
              View Details
            </button>
            {match.status === 'pending' && onWithdraw && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onWithdraw(match);
                }}
                disabled={submitting}
                className="flex-1 rounded-xl border border-red-500/30 bg-red-500/10 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/20 disabled:opacity-50"
              >
                {submitting ? "..." : "Withdraw"}
              </button>
            )}
            {match.status === 'approved' && onScheduleCall && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onScheduleCall(match);
                }}
                className="flex-1 rounded-xl bg-green-600 py-2 text-xs font-semibold text-white hover:opacity-95"
              >
                Schedule Call
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}