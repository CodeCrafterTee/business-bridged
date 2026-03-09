import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";

export default function Score() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboardData, setDashboardData] = useState(null);
  const [showBreakdown, setShowBreakdown] = useState(false);

  useEffect(() => {
    fetchScoreData();
  }, []);

  const fetchScoreData = async () => {
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
          throw new Error('Could not load your score data');
        }
      }
      
      console.log('Score data:', data);
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching score:', err);
      setError(err.message || 'Failed to load score data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate category scores based on actual data
  const calculateCategoryScores = () => {
    if (!dashboardData) return [];

    // Helper function to get nested properties safely
    const getValue = (path, defaultValue = null) => {
      return path.split('.').reduce((obj, key) => obj?.[key], dashboardData) ?? defaultValue;
    };

    const categories = [
      {
        name: "Compliance",
        score: getValue('compliance_completed', false) ? 100 : 0,
        maxScore: 100,
        weight: 20,
        description: "Business verification and legal compliance",
        status: getValue('compliance_completed', false) ? "Complete" : "Incomplete"
      },
      {
        name: "Grooming",
        score: getValue('grooming_completed', false) ? 100 : (getValue('quiz_score', 0)),
        maxScore: 100,
        weight: 30,
        description: "Business readiness program completion",
        status: getValue('grooming_completed', false) ? "Complete" : 
                getValue('quiz_score', 0) > 0 ? "In Progress" : "Not Started"
      },
      {
        name: "Stress Test",
        score: getValue('stress_test_passed', false) ? 100 : (getValue('simulation_score', 0)),
        maxScore: 100,
        weight: 20,
        description: "Financial resilience assessment",
        status: getValue('stress_test_passed', false) ? "Passed" :
                getValue('simulation_score', 0) > 0 ? "Attempted" : "Not Taken"
      },
      {
        name: "Mentor Vouches",
        score: Math.min((getValue('mentor_vouches', 0)) * 20, 100),
        maxScore: 100,
        weight: 20,
        description: "Endorsements from mentors",
        count: getValue('mentor_vouches', 0)
      },
      {
        name: "Business Plan",
        score: getValue('business_plan_url', null) ? 100 : 0,
        maxScore: 100,
        weight: 10,
        description: "Quality of business plan",
        status: getValue('business_plan_url', null) ? "Uploaded" : "Missing"
      }
    ];

    return categories;
  };

  // Calculate weighted overall score
  const calculateWeightedScore = (categories) => {
    const totalWeight = categories.reduce((sum, cat) => sum + cat.weight, 0);
    const weightedSum = categories.reduce((sum, cat) => 
      sum + ((cat.score / cat.maxScore) * cat.weight), 0);
    return Math.round((weightedSum / totalWeight) * 100);
  };

  // Get next steps based on lowest scoring categories
  const getImprovementTips = (categories) => {
    const tips = [];
    const lowestCategories = [...categories]
      .sort((a, b) => (a.score / a.maxScore) - (b.score / b.maxScore))
      .slice(0, 3);

    lowestCategories.forEach(cat => {
      if (cat.score < 70) {
        switch(cat.name) {
          case "Compliance":
            tips.push("Complete your compliance verification by uploading required documents");
            break;
          case "Grooming":
            tips.push("Finish the grooming program and take the business quiz");
            break;
          case "Stress Test":
            tips.push("Take the stress test to assess your financial resilience");
            break;
          case "Mentor Vouches": {
            const needed = Math.ceil((70 - cat.score) / 20);
            tips.push(`Connect with ${needed} more mentor${needed > 1 ? 's' : ''} to get vouches`);
            break;
          }
          case "Business Plan":
            tips.push("Upload a detailed business plan to improve your score");
            break;
          default:
            break;
        }
      }
    });

    if (tips.length === 0) {
      tips.push("Your score is great! Consider applying for funding opportunities.");
    }

    return tips;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070A0F] p-6">
        <div className="max-w-md mx-auto">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-white/60">Loading your score...</div>
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
                onClick={fetchScoreData}
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

  const categories = calculateCategoryScores();
  const overallScore = calculateWeightedScore(categories);
  const improvementTips = getImprovementTips(categories);
  const isEligibleForFunding = dashboardData?.verified && overallScore >= 70;

  return (
    <div className="min-h-screen bg-[#070A0F] p-6">
      <div className="max-w-md mx-auto space-y-4">
        {/* Main Score Card */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2 text-white/90">
              Your B² Readiness Score
            </h2>
            
            <div className="relative inline-block">
              <div className="text-7xl font-bold text-white">
                {overallScore}
              </div>
              <div className="absolute -top-2 -right-8">
                <span className="text-sm text-white/40">/100</span>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-center gap-2">
              <span className={`text-sm px-3 py-1 rounded-full ${
                isEligibleForFunding 
                  ? "bg-green-500/20 text-green-300" 
                  : "bg-yellow-500/20 text-yellow-300"
              }`}>
                {isEligibleForFunding ? "🏆 Funding Ready" : "📈 In Progress"}
              </span>
              {dashboardData?.verified && (
                <span className="bg-blue-500/20 text-blue-300 text-sm px-3 py-1 rounded-full">
                  ✓ Verified
                </span>
              )}
            </div>
          </div>

          {/* Toggle Breakdown Button */}
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="mt-6 w-full flex items-center justify-between rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-left hover:bg-white/5"
          >
            <span className="text-sm font-semibold text-white/80">
              {showBreakdown ? "Hide" : "Show"} Score Breakdown
            </span>
            <span className="text-white/40">{showBreakdown ? "▲" : "▼"}</span>
          </button>
        </div>

        {/* Score Breakdown */}
        {showBreakdown && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-sm font-semibold text-white/60 mb-4">
              CATEGORY BREAKDOWN
            </h3>
            <div className="space-y-4">
              {categories.map((category, index) => {
                const percentage = Math.round((category.score / category.maxScore) * 100);
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-white/90">
                          {category.name}
                        </div>
                        <div className="text-xs text-white/50">
                          {category.description}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-white">
                          {percentage}%
                        </div>
                        <div className="text-xs text-white/40">
                          Weight: {category.weight}%
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="h-2 w-full rounded-full bg-white/10">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          percentage >= 80 ? "bg-green-500" :
                          percentage >= 60 ? "bg-yellow-500" :
                          "bg-orange-500"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    {/* Category-specific details */}
                    {category.name === "Grooming" && dashboardData?.quiz_score > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-white/40">Quiz score:</span>
                        <span className="text-white/60">{dashboardData.quiz_score}%</span>
                      </div>
                    )}
                    {category.name === "Stress Test" && dashboardData?.simulation_score > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-white/40">Test score:</span>
                        <span className="text-white/60">{dashboardData.simulation_score}%</span>
                      </div>
                    )}
                    {category.name === "Mentor Vouches" && (
                      <div className="flex justify-between text-xs">
                        <span className="text-white/40">Vouches:</span>
                        <span className="text-white/60">{dashboardData?.mentor_vouches || 0}</span>
                      </div>
                    )}
                    {category.status && (
                      <div className="flex justify-between text-xs">
                        <span className="text-white/40">Status:</span>
                        <span className={`${
                          category.status === "Complete" || category.status === "Passed" || category.status === "Uploaded"
                            ? "text-green-400"
                            : category.status === "In Progress" || category.status === "Attempted"
                            ? "text-yellow-400"
                            : "text-red-400"
                        }`}>
                          {category.status}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Improvement Tips */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-sm font-semibold text-white/60 mb-3">
            IMPROVEMENT TIPS
          </h3>
          <div className="space-y-2">
            {improvementTips.map((tip, index) => (
              <div
                key={index}
                className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white/80"
              >
                {tip}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          {isEligibleForFunding ? (
            <button
              className="col-span-2 rounded-2xl bg-[#C7000B] py-4 text-sm font-semibold text-white hover:opacity-95"
              onClick={() => navigate("/app/funder-matches")}
            >
              View Funding Opportunities
            </button>
          ) : (
            <>
              <button
                className="rounded-2xl bg-[#C7000B] py-3 text-sm font-semibold text-white hover:opacity-95"
                onClick={() => {
                  if (!dashboardData?.compliance_completed) {
                    navigate("/app/intake");
                  } else if (!dashboardData?.grooming_completed) {
                    navigate("/app/grooming");
                  } else if (!dashboardData?.stress_test_passed) {
                    navigate("/app/stress-test");
                  } else {
                    navigate("/app/vault");
                  }
                }}
              >
                Improve Score
              </button>
              <button
                className="rounded-2xl border border-white/15 bg-white/5 py-3 text-sm font-semibold text-white/85 hover:bg-white/10"
                onClick={() => navigate(-1)}
              >
                Go Back
              </button>
            </>
          )}
        </div>

        {/* Debug Info */}
        {import.meta.env.DEV && (
          <div className="mt-4 p-3 border border-yellow-500/30 bg-yellow-500/10 rounded-2xl">
            <details>
              <summary className="text-xs text-yellow-400 cursor-pointer">
                Debug Data
              </summary>
              <pre className="mt-2 text-[10px] text-yellow-200/70 overflow-auto max-h-40">
                {JSON.stringify(dashboardData, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}