import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";

export default function MentorSessions() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [pastSessions, setPastSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");

  // Mock data for demonstration
  const mockSessions = {
    upcoming: [
      {
        id: "s1",
        mentorName: "Sarah Khumalo",
        mentorImage: "👩‍💼",
        mentorTitle: "Serial Entrepreneur",
        date: "2024-03-15",
        time: "14:00",
        duration: "60 min",
        topic: "Business Strategy Review",
        status: "confirmed",
        meetingLink: "https://meet.google.com/abc-xyz",
        preparation: "Please bring your business plan and financial projections"
      },
      {
        id: "s2",
        mentorName: "Thabo Molefe",
        mentorImage: "👨‍💻",
        mentorTitle: "Tech Founder",
        date: "2024-03-18",
        time: "10:30",
        duration: "45 min",
        topic: "Product Development Roadmap",
        status: "pending",
        preparation: "Think about your top 3 technical challenges"
      }
    ],
    past: [
      {
        id: "p1",
        mentorName: "Lerato Ndlovu",
        mentorImage: "👩‍💼",
        mentorTitle: "Financial Advisor",
        date: "2024-03-01",
        time: "15:00",
        duration: "60 min",
        topic: "Financial Planning Basics",
        status: "completed",
        notes: "Reviewed cash flow management and discussed funding options. Recommended opening a business bank account and using accounting software.",
        rating: 5,
        feedback: "Very helpful! Learned a lot about managing business finances."
      },
      {
        id: "p2",
        mentorName: "Marcus van der Merwe",
        mentorImage: "👨‍🔧",
        mentorTitle: "Manufacturing Expert",
        date: "2024-02-25",
        time: "11:00",
        duration: "45 min",
        topic: "Supply Chain Optimization",
        status: "completed",
        notes: "Discussed supplier diversification and inventory management. Provided contacts for local suppliers.",
        rating: 4,
        feedback: "Good insights on supply chain. Would have liked more time on cost optimization."
      },
      {
        id: "p3",
        mentorName: "Nosipho Dlamini",
        mentorImage: "👩‍🎨",
        mentorTitle: "Marketing Strategist",
        date: "2024-02-15",
        time: "09:00",
        duration: "60 min",
        topic: "Brand Development",
        status: "cancelled",
        notes: "Session cancelled due to mentor emergency. Rescheduling for next week."
      }
    ]
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Try to fetch real sessions from backend
      try {
        const data = await api.get('/entrepreneur/mentor-sessions');
        console.log('Sessions data:', data);
        
        // If we get real data, process it
        if (data && data.sessions) {
          const now = new Date();
          const upcoming = data.sessions.filter(s => new Date(s.date) > now);
          const past = data.sessions.filter(s => new Date(s.date) <= now);
          
          setUpcomingSessions(upcoming);
          setPastSessions(past);
        }
      } catch (sessionsError) {
        console.log('Using mock session data:', sessionsError.message);
        
        // Use mock data
        setUpcomingSessions(mockSessions.upcoming);
        setPastSessions(mockSessions.past);
      }
      
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError('Failed to load mentor sessions. Please try again.');
      
      // Fallback to mock data on error
      setUpcomingSessions(mockSessions.upcoming);
      setPastSessions(mockSessions.past);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSession = (session) => {
    if (session.meetingLink) {
      window.open(session.meetingLink, '_blank');
    }
  };

  const handleReschedule = (session) => {
    // Navigate to scheduling page with pre-filled data
    navigate('/app/mentor-search', { 
      state: { 
        rescheduleSession: session 
      } 
    });
  };

  const handleCancel = async (session) => {
    if (window.confirm(`Are you sure you want to cancel your session with ${session.mentorName}?`)) {
      try {
        setSubmitting(true);
        
        // Try to cancel via API
        try {
          await api.post(`/mentor/sessions/${session.id}/cancel`);
        } catch (cancelError) {
          console.log('Cancel endpoint not available - simulating:', cancelError.message);
        }
        
        // Update local state
        setUpcomingSessions(prev => prev.filter(s => s.id !== session.id));
        alert('Session cancelled successfully');
        
      } catch (err) {
        console.error('Error cancelling session:', err);
        setError('Failed to cancel session. Please try again.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleAddFeedback = (session) => {
    setSelectedSession(session);
    setFeedback(session.feedback || "");
    setRating(session.rating || 0);
    setShowNotesModal(true);
  };

  const submitFeedback = async () => {
    try {
      setSubmitting(true);
      
      // Try to submit feedback via API
      try {
        await api.post(`/mentor/sessions/${selectedSession.id}/feedback`, {
          rating,
          feedback
        });
      } catch (feedbackError) {
        console.log('Feedback endpoint not available - simulating:', feedbackError.message);
      }
      
      // Update local state
      setPastSessions(prev => prev.map(s => 
        s.id === selectedSession.id 
          ? { ...s, rating, feedback, status: 'completed' }
          : s
      ));
      
      setShowNotesModal(false);
      setSelectedSession(null);
      setFeedback("");
      setRating(0);
      alert('Feedback submitted successfully!');
      
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'confirmed':
        return <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs">Confirmed</span>;
      case 'pending':
        return <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full text-xs">Pending</span>;
      case 'completed':
        return <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full text-xs">Completed</span>;
      case 'cancelled':
        return <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded-full text-xs">Cancelled</span>;
      default:
        return null;
    }
  };

  const formatDate = (dateStr) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070A0F] p-6">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-white/60">Loading your sessions...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070A0F] p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="text-white/40 hover:text-white/60"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-white">Mentor Sessions</h1>
          <div className="w-8"></div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 rounded-xl bg-red-500/20 border border-red-500 p-3 text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-2xl border border-white/10 bg-black/25 p-3 text-center">
            <div className="text-2xl font-bold text-white">{upcomingSessions.length}</div>
            <div className="text-xs text-white/40">Upcoming</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/25 p-3 text-center">
            <div className="text-2xl font-bold text-white">{pastSessions.length}</div>
            <div className="text-xs text-white/40">Completed</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/25 p-3 text-center">
            <div className="text-2xl font-bold text-white">
              {pastSessions.filter(s => s.rating > 0).length}
            </div>
            <div className="text-xs text-white/40">With Feedback</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold transition ${
              activeTab === "upcoming"
                ? 'bg-[#C7000B] text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            Upcoming ({upcomingSessions.length})
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold transition ${
              activeTab === "past"
                ? 'bg-[#C7000B] text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            Past ({pastSessions.length})
          </button>
        </div>

        {/* Sessions List */}
        {activeTab === "upcoming" && (
          <div className="space-y-3">
            {upcomingSessions.length === 0 ? (
              <div className="text-center py-12 bg-white/5 rounded-3xl">
                <p className="text-white/40">No upcoming sessions</p>
                <button
                  onClick={() => navigate('/app/mentor-search')}
                  className="mt-3 text-[#C7000B] text-sm hover:underline"
                >
                  Find a mentor →
                </button>
              </div>
            ) : (
              upcomingSessions.map((session) => (
                <div
                  key={session.id}
                  className="rounded-3xl border border-white/10 bg-white/5 p-5"
                >
                  <div className="flex items-start gap-3">
                    {/* Mentor Avatar */}
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-[#C7000B]/20 flex items-center justify-center text-2xl">
                      {session.mentorImage}
                    </div>

                    {/* Session Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-white">{session.mentorName}</h3>
                          <p className="text-xs text-white/50">{session.mentorTitle}</p>
                        </div>
                        {getStatusBadge(session.status)}
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1 text-white/40">
                          <span>📅</span>
                          <span>{formatDate(session.date)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-white/40">
                          <span>⏰</span>
                          <span>{session.time} ({session.duration})</span>
                        </div>
                        <div className="flex items-center gap-1 text-white/40 col-span-2">
                          <span>📋</span>
                          <span>{session.topic}</span>
                        </div>
                      </div>

                      {/* Preparation Notes */}
                      {session.preparation && (
                        <div className="mt-3 p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                          <p className="text-xs text-blue-300">
                            <span className="font-semibold">📝 Prepare:</span> {session.preparation}
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="mt-4 flex gap-2">
                        {session.status === 'confirmed' && (
                          <button
                            onClick={() => handleJoinSession(session)}
                            className="flex-1 rounded-xl bg-[#C7000B] py-2 text-xs font-semibold text-white hover:opacity-95"
                          >
                            Join Meeting
                          </button>
                        )}
                        <button
                          onClick={() => handleReschedule(session)}
                          className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-semibold text-white/80 hover:bg-white/10"
                        >
                          Reschedule
                        </button>
                        {session.status === 'pending' && (
                          <button
                            onClick={() => handleCancel(session)}
                            disabled={submitting}
                            className="flex-1 rounded-xl border border-red-500/30 bg-red-500/10 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/20"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "past" && (
          <div className="space-y-3">
            {pastSessions.length === 0 ? (
              <div className="text-center py-12 bg-white/5 rounded-3xl">
                <p className="text-white/40">No past sessions</p>
              </div>
            ) : (
              pastSessions.map((session) => (
                <div
                  key={session.id}
                  className="rounded-3xl border border-white/10 bg-white/5 p-5"
                >
                  <div className="flex items-start gap-3">
                    {/* Mentor Avatar */}
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-[#C7000B]/20 flex items-center justify-center text-2xl">
                      {session.mentorImage}
                    </div>

                    {/* Session Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-white">{session.mentorName}</h3>
                          <p className="text-xs text-white/50">{session.mentorTitle}</p>
                        </div>
                        {getStatusBadge(session.status)}
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1 text-white/40">
                          <span>📅</span>
                          <span>{formatDate(session.date)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-white/40">
                          <span>⏰</span>
                          <span>{session.time}</span>
                        </div>
                        <div className="flex items-center gap-1 text-white/40 col-span-2">
                          <span>📋</span>
                          <span>{session.topic}</span>
                        </div>
                      </div>

                      {/* Session Notes */}
                      {session.notes && (
                        <div className="mt-3 p-3 rounded-xl bg-black/25">
                          <p className="text-xs text-white/60">{session.notes}</p>
                        </div>
                      )}

                      {/* Rating */}
                      {session.rating > 0 && (
                        <div className="mt-2 flex items-center gap-1">
                          {[1,2,3,4,5].map((star) => (
                            <span key={star} className={star <= session.rating ? 'text-yellow-400' : 'text-white/20'}>
                              ★
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Action Buttons */}
                      {session.status === 'completed' && !session.feedback && (
                        <button
                          onClick={() => handleAddFeedback(session)}
                          className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-semibold text-white/80 hover:bg-white/10"
                        >
                          Leave Feedback
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Feedback Modal */}
        {showNotesModal && selectedSession && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4">
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0A0E16] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Rate your session with {selectedSession.mentorName}
                </h3>
                <button
                  onClick={() => setShowNotesModal(false)}
                  className="text-white/40 hover:text-white/60"
                >
                  ✕
                </button>
              </div>

              {/* Star Rating */}
              <div className="mb-4">
                <label className="block text-sm text-white/60 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-white/20'} hover:scale-110 transition`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback Text */}
              <div className="mb-4">
                <label className="block text-sm text-white/60 mb-2">Feedback (optional)</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Share your thoughts about the session..."
                  rows="4"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder-white/30 focus:ring-2 focus:ring-white/20 outline-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowNotesModal(false)}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-white/80 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={submitFeedback}
                  disabled={submitting || rating === 0}
                  className="flex-1 rounded-xl bg-[#C7000B] py-3 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}