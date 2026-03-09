import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";

export default function ApplyFunding() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [funders, setFunders] = useState([]);
  const [likedFunders, setLikedFunders] = useState([]);
  const [matches, setMatches] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedFunder, setMatchedFunder] = useState(null);
  const [swipeAnimation, setSwipeAnimation] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minScore: 0,
    maxAmount: 10000000,
    industry: "all"
  });

  const fetchFundingData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get eligible funders
      let fundersData;
      try {
        fundersData = await api.get('/entrepreneur/eligible-funders');
      } catch (fetchErr) {
        console.log('Using mock funders data:', fetchErr.message);
        // Mock data for demonstration
        fundersData = [
          {
            funder_id: "1",
            organization_name: "VCC Growth Fund",
            investment_budget: 5000000,
            preferred_industry: "Technology, Retail",
            minimum_readiness_score: 70,
            description: "We invest in early-stage businesses with high growth potential. Looking for innovative solutions and scalable business models.",
            logo: "📈",
            match_score: 95,
            tags: ["Tech", "Scale-up", "Innovation"],
            requirements_json: {
              documents: ["Business plan", "Financial statements", "Tax returns"],
              stage: "Stage 2+",
              location: "Johannesburg",
              yearsInBusiness: "2+ years"
            }
          },
          {
            funder_id: "2",
            organization_name: "Women's Investment Network",
            investment_budget: 2500000,
            preferred_industry: "Women-owned businesses",
            minimum_readiness_score: 65,
            description: "Empowering women entrepreneurs through funding and mentorship. Focus on businesses making social impact.",
            logo: "👩‍💼",
            match_score: 88,
            tags: ["Women-led", "Social Impact", "Mentorship"],
            requirements_json: {
              documents: ["Business plan", "ID document", "Bank statements"],
              stage: "Any stage",
              location: "Nationwide",
              womenOwned: "51%+"
            }
          },
          {
            funder_id: "3",
            organization_name: "GreenTech Ventures",
            investment_budget: 10000000,
            preferred_industry: "Clean energy, Sustainability",
            minimum_readiness_score: 80,
            description: "Funding innovative solutions for environmental challenges. Passionate about businesses that make a positive impact on the planet.",
            logo: "🌱",
            match_score: 72,
            tags: ["CleanTech", "Sustainability", "Environment"],
            requirements_json: {
              documents: ["Environmental impact assessment", "Business plan", "Patents"],
              stage: "Stage 3",
              location: "Cape Town",
              certification: "Green certification preferred"
            }
          },
          {
            funder_id: "4",
            organization_name: "Small Business Fund",
            investment_budget: 1000000,
            preferred_industry: "All industries",
            minimum_readiness_score: 60,
            description: "Supporting small businesses with flexible funding options. We believe in the power of entrepreneurship to transform communities.",
            logo: "💼",
            match_score: 82,
            tags: ["Small Business", "Flexible", "Community"],
            requirements_json: {
              documents: ["Business plan", "Bank statements", "Tax clearance"],
              stage: "Stage 1+",
              location: "Nationwide",
              employees: "Less than 50"
            }
          },
          {
            funder_id: "5",
            organization_name: "Youth Enterprise Fund",
            investment_budget: 1500000,
            preferred_industry: "All industries",
            minimum_readiness_score: 60,
            description: "Empowering young entrepreneurs (18-35) with funding and business development support.",
            logo: "🚀",
            match_score: 78,
            tags: ["Youth", "Development", "Mentorship"],
            requirements_json: {
              documents: ["Business plan", "ID document", "Bank statements"],
              stage: "Stage 1+",
              location: "Nationwide",
              age: "18-35 years"
            }
          }
        ];
      }
      
      // Get liked funders
      try {
        const likedData = await api.get('/entrepreneur/liked-funders');
        setLikedFunders(likedData.map(f => f.funder_id));
      } catch (likedErr) {
        console.log('No liked funders yet:', likedErr.message);
        setLikedFunders([]);
      }
      
      // Get matches
      try {
        const matchesData = await api.get('/entrepreneur/matches');
        setMatches(matchesData);
      } catch (matchErr) {
        console.log('No matches yet:', matchErr.message);
        setMatches([]);
      }
      
      setFunders(Array.isArray(fundersData) ? fundersData : []);
      
    } catch (err) {
      console.error('Error fetching funding data:', err);
      setError(err.message || 'Failed to load funding opportunities');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFundingData();
  }, [fetchFundingData]);

  const handleLike = async (funder) => {
    setSwipeAnimation('right');
    
    try {
      // Optimistically update UI
      setLikedFunders(prev => [...prev, funder.funder_id]);
      
      // Send like to backend
      try {
        const response = await api.post('/entrepreneur/like-funder', { funderId: funder.funder_id });
        
        // Check if it's a match
        if (response.isMatch) {
          setMatchedFunder(funder);
          setShowMatchModal(true);
          // Refresh matches
          const matchesData = await api.get('/entrepreneur/matches');
          setMatches(matchesData);
        }
      } catch (likeErr) {
        console.log('Like endpoint not ready - simulating match for demo:', likeErr.message);
        // Simulate a match for demo (30% chance)
        if (Math.random() > 0.7) {
          setMatchedFunder(funder);
          setShowMatchModal(true);
          setMatches(prev => [...prev, { ...funder, match_id: Date.now().toString() }]);
        }
      }
      
      // Move to next funder after animation
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setSwipeAnimation(null);
      }, 300);
      
    } catch (err) {
      console.error('Error liking funder:', err);
      setSwipeAnimation(null);
    }
  };

  const handlePass = () => {
    setSwipeAnimation('left');
    
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setSwipeAnimation(null);
    }, 300);
  };

  const handleContactFunder = () => {
    setShowMatchModal(false);
    navigate('/app/messages');
  };

  const handleViewProfile = (funderId) => {
    navigate(`/app/funder/${funderId}`);
  };

  const resetFilters = () => {
    setFilters({
      minScore: 0,
      maxAmount: 10000000,
      industry: "all"
    });
  };

  // Filter funders based on criteria
  const filteredFunders = funders.filter(f => 
    (f.minimum_readiness_score || 0) >= filters.minScore &&
    (f.investment_budget || 0) <= filters.maxAmount &&
    (filters.industry === "all" || f.preferred_industry?.toLowerCase().includes(filters.industry.toLowerCase()))
  );

  const currentFunder = filteredFunders[currentIndex];
  const progress = filteredFunders.length > 0 
    ? ((currentIndex + 1) / filteredFunders.length) * 100 
    : 0;

  // Get unique industries for filter
  const industries = ["all", ...new Set(funders.map(f => f.preferred_industry?.split(',')[0]?.trim()).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070A0F] p-6">
        <div className="max-w-md mx-auto">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <div className="flex flex-col items-center justify-center h-64">
              <div className="text-4xl mb-4 animate-pulse">💝</div>
              <div className="text-white/60">Finding your perfect match...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#070A0F] p-6">
        <div className="max-w-md mx-auto">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="text-red-400">{error}</div>
              <button
                onClick={fetchFundingData}
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

  // Show matches first if there are any
  if (matches.length > 0 && currentIndex === 0) {
    return (
      <div className="min-h-screen bg-[#070A0F] p-6">
        <div className="max-w-md mx-auto space-y-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4 animate-bounce">💖</div>
              <h2 className="text-2xl font-bold text-white mb-2">It's a Match!</h2>
              <p className="text-white/60">
                You have {matches.length} mutual connection{matches.length > 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {matches.map((match) => (
                <div
                  key={match.match_id || match.funder_id}
                  className="rounded-2xl border border-pink-500/30 bg-pink-500/10 p-4 hover:bg-pink-500/20 transition cursor-pointer"
                  onClick={() => handleViewProfile(match.funder_id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{match.logo || '💖'}</div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-white">{match.organization_name}</div>
                      <div className="text-xs text-white/40">Matched {new Date(match.created_at).toLocaleDateString()}</div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleContactFunder();
                      }}
                      className="rounded-xl bg-pink-600 px-4 py-2 text-xs font-semibold text-white hover:opacity-90"
                    >
                      Message
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setCurrentIndex(1)}
              className="mt-4 w-full rounded-2xl border border-white/10 bg-white/5 py-3 text-sm text-white/80 hover:bg-white/10"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No more funders to show
  if (!currentFunder || filteredFunders.length === 0) {
    return (
      <div className="min-h-screen bg-[#070A0F] p-6">
        <div className="max-w-md mx-auto">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-xl font-bold text-white mb-2">You've seen all funders!</h2>
            <p className="text-white/60 mb-6">
              {filteredFunders.length === 0 
                ? "No funders match your current filters. Try adjusting your criteria."
                : "Check back later for new opportunities"}
            </p>
            {filteredFunders.length === 0 && (
              <button
                onClick={resetFilters}
                className="mb-3 w-full rounded-2xl border border-white/10 bg-white/5 py-3 text-sm text-white/80 hover:bg-white/10"
              >
                Reset Filters
              </button>
            )}
            <button
              onClick={() => navigate('/app/dashboard')}
              className="w-full rounded-2xl bg-[#C7000B] py-3 text-sm font-semibold text-white hover:opacity-95"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070A0F] p-6">
      <div className="max-w-md mx-auto">
        
        {/* Header with filter toggle */}
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/app/dashboard')}
            className="text-white/40 hover:text-white/60"
          >
            ← Back
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-white/40 hover:text-white/60 flex items-center gap-1"
          >
            <span>Filters</span>
            <span>{showFilters ? '▲' : '▼'}</span>
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-4 rounded-2xl border border-white/10 bg-black/25 p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Filter Funders</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs text-white/40 block mb-1">Minimum Score</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={filters.minScore}
                  onChange={(e) => setFilters(prev => ({ ...prev, minScore: Number(e.target.value) }))}
                  className="w-full accent-[#C7000B]"
                />
                <div className="flex justify-between text-xs text-white/40 mt-1">
                  <span>0</span>
                  <span>{filters.minScore}+</span>
                  <span>100</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-white/40 block mb-1">Max Investment (R)</label>
                <input
                  type="range"
                  min="100000"
                  max="10000000"
                  step="100000"
                  value={filters.maxAmount}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxAmount: Number(e.target.value) }))}
                  className="w-full accent-[#C7000B]"
                />
                <div className="flex justify-between text-xs text-white/40 mt-1">
                  <span>R100k</span>
                  <span>R{(filters.maxAmount / 1000000).toFixed(1)}M</span>
                  <span>R10M</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-white/40 block mb-1">Industry</label>
                <select
                  value={filters.industry}
                  onChange={(e) => setFilters(prev => ({ ...prev, industry: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white text-sm"
                >
                  {industries.map(industry => (
                    <option key={industry} value={industry}>
                      {industry === 'all' ? 'All Industries' : industry}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-white/60 mb-2">
            <span>Find Your Match</span>
            <span>{currentIndex + 1}/{filteredFunders.length}</span>
          </div>
          <div className="h-1 w-full rounded-full bg-white/10">
            <div
              className="h-1 rounded-full bg-[#C7000B] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Main swipe card */}
        <div 
          className={`relative rounded-3xl border border-white/10 bg-white/5 p-6 transition-all duration-300 ${
            swipeAnimation === 'right' ? 'translate-x-full opacity-0 rotate-12' : 
            swipeAnimation === 'left' ? '-translate-x-full opacity-0 -rotate-12' : ''
          }`}
        >
          {/* Match score badge */}
          <div className="absolute -top-3 -right-3 bg-gradient-to-r from-pink-600 to-[#C7000B] text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            {currentFunder.match_score || Math.floor(Math.random() * 20 + 70)}% Match
          </div>

          {/* Funder header */}
          <div className="text-center mb-6">
            <div className="text-6xl mb-3">{currentFunder.logo || '🏦'}</div>
            <h2 className="text-xl font-bold text-white">{currentFunder.organization_name}</h2>
            <p className="text-sm text-white/60 mt-1">{currentFunder.preferred_industry}</p>
          </div>

          {/* Tags */}
          {currentFunder.tags && (
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              {currentFunder.tags.map((tag, i) => (
                <span key={i} className="text-xs bg-white/10 px-2 py-1 rounded-full text-white/70">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Investment range */}
          <div className="bg-black/25 rounded-2xl p-4 mb-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-xs text-white/40">Investment budget</div>
                <div className="text-lg font-bold text-white">
                  R{Number(currentFunder.investment_budget || 0).toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-white/40">Min score</div>
                <div className="text-sm font-semibold text-white">{currentFunder.minimum_readiness_score}</div>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-white/70 mb-4 leading-relaxed">
            {currentFunder.description}
          </p>

          {/* Requirements */}
          {currentFunder.requirements_json && (
            <details className="mb-4">
              <summary className="text-xs text-[#C7000B] cursor-pointer hover:opacity-80">
                View requirements
              </summary>
              <div className="mt-2 p-3 rounded-xl bg-black/50">
                {Object.entries(currentFunder.requirements_json).map(([key, value]) => (
                  <div key={key} className="text-xs text-white/60 mb-1 flex">
                    <span className="font-semibold text-white/80 w-24 capitalize">{key}:</span>
                    <span className="flex-1">{Array.isArray(value) ? value.join(', ') : value}</span>
                  </div>
                ))}
              </div>
            </details>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handlePass}
              className="flex-1 rounded-2xl border border-white/15 bg-white/5 py-4 text-2xl hover:bg-white/10 transition transform hover:scale-105"
            >
              ✕
            </button>
            <button
              onClick={() => handleLike(currentFunder)}
              disabled={likedFunders.includes(currentFunder.funder_id)}
              className={`flex-1 rounded-2xl py-4 text-2xl transition transform hover:scale-105 ${
                likedFunders.includes(currentFunder.funder_id)
                  ? 'bg-pink-600 text-white cursor-default'
                  : 'bg-[#C7000B] text-white hover:opacity-95'
              }`}
            >
              {likedFunders.includes(currentFunder.funder_id) ? '❤️' : '♡'}
            </button>
          </div>

          {/* Like/pass hint */}
          <div className="flex justify-between text-xs text-white/30 mt-2 px-2">
            <span>Pass</span>
            <span>Like</span>
          </div>
        </div>

        {/* Match explanation */}
        <div className="mt-4 text-center text-xs text-white/30">
          ♡ Like a funder to express interest • ❤️ Mutual like = Match! • Swipe or tap to choose
        </div>
      </div>

      {/* Match Modal */}
      {showMatchModal && matchedFunder && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 px-4">
          <div className="w-full max-w-md rounded-3xl border border-pink-500/30 bg-[#0A0E16] p-8 text-center animate-bounce-once">
            <div className="text-7xl mb-4 animate-pulse">💖</div>
            <h2 className="text-2xl font-bold text-white mb-2">It's a Match!</h2>
            <p className="text-white/60 mb-2">
              You and {matchedFunder.organization_name} like each other
            </p>
            <p className="text-white/40 text-sm mb-6">
              Start a conversation to explore funding opportunities
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowMatchModal(false)}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-white/80 hover:bg-white/10"
              >
                Keep Browsing
              </button>
              <button
                onClick={handleContactFunder}
                className="flex-1 rounded-xl bg-pink-600 py-3 text-sm font-semibold text-white hover:opacity-90"
              >
                Send Message
              </button>
            </div>
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
              {JSON.stringify({ funders: funders.length, likedFunders, matches: matches.length }, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}