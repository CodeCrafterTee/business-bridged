import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";

export default function MentorEntrepreneurs() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [entrepreneurs, setEntrepreneurs] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [usingMockData, setUsingMockData] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    avgScore: 0
  });

  // Mock data as absolute last resort
  const mockEntrepreneurs = [
    {
      user_id: "mock1",
      business_name: "Thandi's Catering",
      full_name: "Thandi M.",
      industry: "Food & Beverage",
      verified: true,
      readiness_score: 74,
      total_visits: 3,
      total_vouches: 2,
      email: "thandi@example.com",
      phone: "+27 12 345 6789",
      last_active: "2024-03-01"
    },
    {
      user_id: "mock2",
      business_name: "Lebo Sneakers",
      full_name: "Lebo K.",
      industry: "Retail",
      verified: false,
      readiness_score: 68,
      total_visits: 1,
      total_vouches: 0,
      email: "lebo@example.com",
      phone: "+27 12 345 6790",
      last_active: "2024-02-28"
    },
    {
      user_id: "mock3",
      business_name: "Nomsa Retail",
      full_name: "Nomsa R.",
      industry: "Retail",
      verified: true,
      readiness_score: 81,
      total_visits: 4,
      total_vouches: 3,
      email: "nomsa@example.com",
      phone: "+27 12 345 6791",
      last_active: "2024-03-02"
    },
    {
      user_id: "mock4",
      business_name: "Green Gardens",
      full_name: "Peter N.",
      industry: "Agriculture",
      verified: true,
      readiness_score: 92,
      total_visits: 6,
      total_vouches: 5,
      email: "peter@example.com",
      phone: "+27 12 345 6792",
      last_active: "2024-03-03"
    },
    {
      user_id: "mock5",
      business_name: "Tech Solutions",
      full_name: "Sarah K.",
      industry: "Technology",
      verified: false,
      readiness_score: 45,
      total_visits: 0,
      total_vouches: 0,
      email: "sarah@example.com",
      phone: "+27 12 345 6793",
      last_active: "2024-02-25"
    }
  ];

  useEffect(() => {
    fetchEntrepreneurs();
  }, []);

  // Update stats whenever entrepreneurs change
  useEffect(() => {
    if (entrepreneurs.length > 0) {
      const verified = entrepreneurs.filter(e => e.verified).length;
      const totalScore = entrepreneurs.reduce((sum, e) => sum + (e.readiness_score || 0), 0);
      
      setStats({
        total: entrepreneurs.length,
        verified,
        pending: entrepreneurs.length - verified,
        avgScore: Math.round(totalScore / entrepreneurs.length) || 0
      });
    }
  }, [entrepreneurs]);

  const fetchEntrepreneurs = async () => {
    try {
      setLoading(true);
      setError("");
      setUsingMockData(false);
      
      // Try to fetch real data
      const data = await api.get('/mentor/entrepreneurs/all');
      console.log('Entrepreneurs data:', data);
      
      if (data && data.length > 0) {
        setEntrepreneurs(data);
      } else {
        // Empty array from API is fine - no mock data needed
        setEntrepreneurs([]);
      }
      
    } catch (err) {
      console.error('Error fetching entrepreneurs:', err);
      
      // Check error type
      if (err.message?.includes('404')) {
        setError('Entrepreneurs endpoint not found. Please contact support.');
      } else if (err.message?.includes('Network Error')) {
        setError('Network error. Please check your connection.');
      } else {
        // Only use mock data as absolute last resort
        console.log('Using mock data as fallback');
        setEntrepreneurs(mockEntrepreneurs);
        setUsingMockData(true);
        setError(""); // Clear error when using mock data
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredEntrepreneurs = entrepreneurs.filter(e => {
    const matchesSearch = (e.business_name || '').toLowerCase().includes(search.toLowerCase()) ||
                         (e.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
                         (e.industry || '').toLowerCase().includes(search.toLowerCase());
    
    const matchesFilter = filter === "all" || 
                         (filter === "verified" && e.verified) ||
                         (filter === "pending" && !e.verified) ||
                         (filter === "high-score" && (e.readiness_score || 0) >= 80) ||
                         (filter === "needs-attention" && (e.readiness_score || 0) < 60);
    
    return matchesSearch && matchesFilter;
  });

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    if (score >= 40) return "text-orange-400";
    return "text-red-400";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070A0F] p-6">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-white/60">Loading entrepreneurs...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !usingMockData) {
    return (
      <div className="min-h-screen bg-[#070A0F] p-6">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="text-red-400">{error}</div>
              <button 
                onClick={fetchEntrepreneurs} 
                className="bg-[#C7000B] text-white px-6 py-2 rounded-xl hover:opacity-95"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/app/mentor')}
                className="text-white/40 hover:text-white/60 text-sm"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070A0F] p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/app/mentor')}
            className="text-white/60 hover:text-white mb-2 flex items-center gap-1"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-white">All Entrepreneurs</h1>
          <p className="text-white/60">View and manage all entrepreneurs in your network</p>
        </div>

        {/* Mock Data Warning */}
        {usingMockData && (
          <div className="mb-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-xs text-yellow-300">
              <span className="font-semibold">⚠️ Demo Mode:</span> Showing sample data. Connect to backend to see real entrepreneur information.
            </p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard
            label="Total"
            value={stats.total}
            icon="👥"
            color="text-blue-400"
          />
          <StatCard
            label="Verified"
            value={stats.verified}
            icon="✓"
            color="text-green-400"
          />
          <StatCard
            label="Pending"
            value={stats.pending}
            icon="⏳"
            color="text-yellow-400"
          />
          <StatCard
            label="Avg Score"
            value={stats.avgScore}
            icon="📊"
            color="text-purple-400"
          />
        </div>

        {/* Search and Filter */}
        <div className="mb-6 space-y-3">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search by name, business, or industry..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 pl-10 text-white placeholder-white/30"
              />
              <span className="absolute left-3 top-3 text-white/40">🔍</span>
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white"
            >
              <option value="all">All Entrepreneurs</option>
              <option value="verified">Verified Only</option>
              <option value="pending">Pending Only</option>
              <option value="high-score">High Score (80+)</option>
              <option value="needs-attention">Needs Attention (&lt;60)</option>
            </select>
          </div>

          {/* Results count */}
          <p className="text-sm text-white/40">
            Showing {filteredEntrepreneurs.length} of {entrepreneurs.length} entrepreneurs
          </p>
        </div>

        {/* Entrepreneurs Grid */}
        {filteredEntrepreneurs.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-3xl">
            <p className="text-white/40 mb-3">No entrepreneurs found</p>
            <button
              onClick={() => {
                setSearch("");
                setFilter("all");
              }}
              className="text-[#C7000B] text-sm hover:underline"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filteredEntrepreneurs.map((e) => (
              <div
                key={e.user_id}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition cursor-pointer"
                onClick={() => navigate(`/app/mentor/entrepreneurs/${e.user_id}`)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{e.business_name}</h3>
                    <p className="text-sm text-white/60">{e.full_name}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    e.verified ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
                  }`}>
                    {e.verified ? 'Verified' : 'Pending'}
                  </span>
                </div>

                <p className="text-xs text-white/40 mb-3">{e.industry || 'No industry specified'}</p>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  <MetricCard
                    label="Score"
                    value={e.readiness_score || 0}
                    color={getScoreColor(e.readiness_score || 0)}
                  />
                  <MetricCard
                    label="Visits"
                    value={e.total_visits || 0}
                  />
                  <MetricCard
                    label="Vouches"
                    value={e.total_vouches || 0}
                    color={e.total_vouches > 0 ? 'text-green-400' : 'text-white/60'}
                  />
                </div>

                {/* Last Active (if available) */}
                {e.last_active && (
                  <p className="text-[10px] text-white/30">
                    Last active: {new Date(e.last_active).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper Components
function StatCard({ label, value, icon, color }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/25 p-3">
      <div className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <div>
          <div className={`text-xl font-bold ${color}`}>{value}</div>
          <div className="text-xs text-white/40">{label}</div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, color = "text-white" }) {
  return (
    <div className="text-center p-2 rounded-lg bg-black/25">
      <div className="text-[10px] text-white/40">{label}</div>
      <div className={`text-sm font-bold ${color}`}>{value}</div>
    </div>
  );
}