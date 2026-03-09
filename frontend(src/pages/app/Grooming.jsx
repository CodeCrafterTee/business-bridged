import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";

export default function Grooming() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [groomingData, setGroomingData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchGroomingData();
  }, []);

  const fetchGroomingData = async () => {
    try {
      setLoading(true);
      
      // Try multiple endpoints
      let data;
      try {
        // First try the grooming endpoint
        data = await api.get('/entrepreneur/grooming');
        console.log('Grooming data:', data);
        setGroomingData(data);
      } catch (error) {
        console.log('Grooming endpoint not found, trying dashboard...', error.message);
        
        // Fallback to dashboard data
        const dashboard = await api.get('/entrepreneur/dashboard');
        console.log('Dashboard data:', dashboard);
        setDashboardData(dashboard);
        
        // Create mock grooming data from dashboard
        data = {
          status: dashboard.grooming_completed ? 'completed' : 'in_progress',
          quiz_score: dashboard.quiz_score || 0,
          business_report_url: dashboard.business_report_url,
          last_updated: dashboard.grooming_last_updated
        };
        setGroomingData(data);
      }
      
    } catch (err) {
      console.error('Error fetching grooming data:', err);
      setError(err.message || 'Failed to load grooming data');
    } finally {
      setLoading(false);
    }
  };

  // Define grooming modules
  const modules = [
    {
      id: 1,
      title: "Financial Literacy",
      description: "Understand financial statements, cash flow, and basic accounting",
      completed: dashboardData?.grooming_completed || groomingData?.quiz_score > 20 || false,
      quiz: [
        {
          question: "What is the primary purpose of a cash flow statement?",
          options: [
            "To show company profits",
            "To track money in and out of the business",
            "To calculate taxes",
            "To list company assets"
          ],
          correct: 1
        },
        {
          question: "Which of the following is considered a fixed cost?",
          options: [
            "Raw materials",
            "Monthly rent",
            "Shipping costs",
            "Commission payments"
          ],
          correct: 1
        }
      ]
    },
    {
      id: 2,
      title: "Market Research",
      description: "Learn to analyze your market, competitors, and target audience",
      completed: dashboardData?.grooming_completed || groomingData?.quiz_score > 40 || false,
      quiz: [
        {
          question: "What is a TAM (Total Addressable Market)?",
          options: [
            "The market you currently serve",
            "The entire revenue opportunity for your product",
            "Your top 10 competitors",
            "Your marketing budget"
          ],
          correct: 1
        }
      ]
    },
    {
      id: 3,
      title: "Business Mindset",
      description: "Develop entrepreneurial thinking and leadership skills",
      completed: dashboardData?.grooming_completed || groomingData?.quiz_score > 60 || false,
      quiz: [
        {
          question: "What is a key characteristic of a growth mindset?",
          options: [
            "Avoiding challenges",
            "Believing abilities can be developed",
            "Sticking to what you know",
            "Giving up easily"
          ],
          correct: 1
        }
      ]
    },
    {
      id: 4,
      title: "Business Plan Development",
      description: "Create a comprehensive business plan",
      completed: !!(dashboardData?.business_plan_url || groomingData?.business_report_url) || false,
      quiz: []
    },
    {
      id: 5,
      title: "Pitch Preparation",
      description: "Learn to present your business effectively",
      completed: dashboardData?.grooming_completed || false,
      quiz: []
    },
    {
      id: 6,
      title: "Final Assessment",
      description: "Comprehensive test of all modules",
      completed: dashboardData?.grooming_completed || false,
      quiz: []
    }
  ];

  // Calculate progress
  const completedModules = modules.filter(m => m.completed).length;
  const totalModules = modules.length;
  const progress = Math.round((completedModules / totalModules) * 100);
  const quizScore = groomingData?.quiz_score || 0;

  const handleModuleClick = (module) => {
    if (module.quiz.length > 0 && !module.completed) {
      setSelectedModule(module);
      setQuizAnswers({});
    }
  };

  const handleQuizAnswer = (questionIndex, answerIndex) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const submitQuiz = async () => {
    try {
      setSubmitting(true);
      
      // Calculate score for this module
      const module = selectedModule;
      let correct = 0;
      module.quiz.forEach((q, idx) => {
        if (quizAnswers[idx] === q.correct) correct++;
      });
      const moduleScore = Math.round((correct / module.quiz.length) * 100);
      
      // Update overall quiz score (simplified - you might want a more sophisticated approach)
      const newOverallScore = Math.min(100, (quizScore + moduleScore) / 2);
      
      // Send update to backend
      const updateData = {
        status: newOverallScore >= 70 ? 'completed' : 'in_progress',
        quizScore: newOverallScore,
        businessReportUrl: groomingData?.business_report_url
      };
      
      await api.put('/entrepreneur/grooming', updateData);
      
      // Refresh data
      await fetchGroomingData();
      setSelectedModule(null);
      
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError(err.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070A0F] p-6">
        <div className="max-w-md mx-auto">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-white/60">Loading grooming program...</div>
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
                onClick={fetchGroomingData}
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
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-bold text-white">Business Grooming</h2>
          <p className="mt-1 text-sm text-white/60">
            Complete all modules to improve your readiness score
          </p>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-white/60">Overall Progress</span>
              <span className="text-white font-semibold">{progress}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/10">
              <div
                className="h-2 rounded-full bg-[#C7000B] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Quiz Score */}
          {quizScore > 0 && (
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-white/60">Quiz Score</span>
              <span className="text-white font-semibold">{quizScore}%</span>
            </div>
          )}

          {/* Status Badge */}
          <div className="mt-3">
            <span className={`text-xs px-3 py-1 rounded-full ${
              dashboardData?.grooming_completed 
                ? "bg-green-500/20 text-green-300"
                : "bg-yellow-500/20 text-yellow-300"
            }`}>
              {dashboardData?.grooming_completed ? "✓ Program Completed" : "📝 In Progress"}
            </span>
          </div>
        </div>

        {/* Modules List */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-sm font-semibold text-white/60 mb-4">
            GROOMING MODULES ({completedModules}/{totalModules})
          </h3>
          
          <div className="space-y-3">
            {modules.map((module) => (
              <button
                key={module.id}
                onClick={() => handleModuleClick(module)}
                disabled={module.completed}
                className={`w-full text-left rounded-2xl border ${
                  module.completed 
                    ? "border-green-500/30 bg-green-500/5" 
                    : "border-white/10 bg-black/25 hover:bg-white/5"
                } p-4 transition-all`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">
                        {module.title}
                      </span>
                      {module.completed && (
                        <span className="text-green-400 text-xs">✓</span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-white/50">
                      {module.description}
                    </p>
                  </div>
                  {module.quiz.length > 0 && !module.completed && (
                    <span className="text-xs text-[#C7000B] font-semibold">
                      Quiz →
                    </span>
                  )}
                </div>

                {/* Mini progress for this module */}
                {module.completed && (
                  <div className="mt-2 h-1 w-full rounded-full bg-white/10">
                    <div className="h-1 rounded-full bg-green-500 w-full" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Next Steps */}
        {dashboardData?.grooming_completed ? (
          <div className="rounded-3xl border border-white/10 bg-green-500/5 p-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎉</span>
              <div>
                <h4 className="font-semibold text-white">Congratulations!</h4>
                <p className="text-sm text-white/60 mt-1">
                  You've completed the grooming program. Ready for the stress test?
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/app/stress-test")}
              className="mt-4 w-full rounded-2xl bg-[#C7000B] py-3 text-sm font-semibold text-white hover:opacity-95"
            >
              Take Stress Test
            </button>
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h4 className="font-semibold text-white">Next Steps</h4>
            <ul className="mt-3 space-y-2 text-sm text-white/60">
              {!modules[0].completed && <li>• Complete Financial Literacy module</li>}
              {modules[0].completed && !modules[1].completed && <li>• Complete Market Research module</li>}
              {modules[1].completed && !modules[2].completed && <li>• Complete Business Mindset module</li>}
              {modules[2].completed && !modules[3].completed && <li>• Create your Business Plan</li>}
              {modules[3].completed && !modules[4].completed && <li>• Prepare your Pitch</li>}
              {modules[4].completed && !modules[5].completed && <li>• Take Final Assessment</li>}
              {completedModules === totalModules && <li>• Program complete! Take the stress test</li>}
            </ul>
          </div>
        )}

        {/* Quiz Modal */}
        {selectedModule && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4">
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0A0E16] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">{selectedModule.title} Quiz</h3>
                <button
                  onClick={() => setSelectedModule(null)}
                  className="text-white/40 hover:text-white/60"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6 max-h-[60vh] overflow-y-auto">
                {selectedModule.quiz.map((q, qIdx) => (
                  <div key={qIdx} className="space-y-3">
                    <p className="text-sm text-white/90">{q.question}</p>
                    <div className="space-y-2">
                      {q.options.map((opt, oIdx) => (
                        <label
                          key={oIdx}
                          className={`flex items-center p-3 rounded-xl border ${
                            quizAnswers[qIdx] === oIdx
                              ? "border-[#C7000B] bg-[#C7000B]/10"
                              : "border-white/10 bg-black/25"
                          } cursor-pointer`}
                        >
                          <input
                            type="radio"
                            name={`q${qIdx}`}
                            value={oIdx}
                            checked={quizAnswers[qIdx] === oIdx}
                            onChange={() => handleQuizAnswer(qIdx, oIdx)}
                            className="sr-only"
                          />
                          <span className="text-sm text-white/80">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedModule(null)}
                  className="rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-white/80 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={submitQuiz}
                  disabled={Object.keys(quizAnswers).length !== selectedModule.quiz.length || submitting}
                  className="rounded-xl bg-[#C7000B] py-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit"}
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
                {JSON.stringify({ groomingData, dashboardData }, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}