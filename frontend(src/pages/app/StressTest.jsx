import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";

export default function StressTest() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [testData, setTestData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [currentScenario, setCurrentScenario] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [testScore, setTestScore] = useState(0);
  const [testPassed, setTestPassed] = useState(false);

  useEffect(() => {
    fetchTestData();
  }, []);

  const fetchTestData = async () => {
    try {
      setLoading(true);
      
      // Get entrepreneur data to check previous attempts
      const data = await api.get('/entrepreneur/dashboard');
      console.log('Dashboard data for stress test:', data);
      setDashboardData(data);
      
      // Try to get previous test attempts
      try {
        const attempts = await api.get('/entrepreneur/stress-test/attempts');
        setTestData(attempts);
      } catch (attemptsError) {
        // Now we're using the error parameter
        console.log('No previous attempts found:', attemptsError.message);
        setTestData({ attempts: [] });
      }
      
    } catch (err) {
      console.error('Error fetching test data:', err);
      setSubmitError(err.message || 'Failed to load test data');
    } finally {
      setLoading(false);
    }
  };

  // Stress test scenarios
  const scenarios = [
    {
      id: 1,
      title: "Fuel Price Shock",
      description: "Global oil prices spike by 40% due to geopolitical tensions",
      context: "Your business relies on transportation for deliveries and raw materials. Fuel costs make up 15% of your monthly operational expenses.",
      initialImpact: "Your fuel costs will increase by 40% immediately",
      questions: [
        {
          id: "q1",
          question: "What is your immediate response to the fuel price increase?",
          options: [
            { text: "Pass the full cost to customers immediately", impact: -10, reasoning: "May lose price-sensitive customers" },
            { text: "Absorb the cost and maintain current prices", impact: -20, reasoning: "Reduces your profit margin significantly" },
            { text: "Optimize delivery routes and reduce non-essential trips", impact: 15, reasoning: "Shows adaptive thinking and cost management" },
            { text: "Negotiate with suppliers for better rates", impact: 20, reasoning: "Proactive approach to supply chain management" }
          ]
        },
        {
          id: "q2",
          question: "How do you adjust your inventory strategy?",
          options: [
            { text: "Reduce inventory to minimum levels", impact: -5, reasoning: "Risk of stockouts during supply chain disruption" },
            { text: "Increase inventory of essential items", impact: 15, reasoning: "Good buffer against supply delays" },
            { text: "Maintain current inventory levels", impact: -10, reasoning: "No adaptation to changing conditions" },
            { text: "Diversify suppliers across regions", impact: 25, reasoning: "Excellent risk management strategy" }
          ]
        },
        {
          id: "q3",
          question: "How do you communicate with customers?",
          options: [
            { text: "No communication, wait for them to notice", impact: -15, reasoning: "Damages customer trust" },
            { text: "Explain situation and offer alternatives", impact: 20, reasoning: "Builds transparency and loyalty" },
            { text: "Blame external factors without solutions", impact: -5, reasoning: "Seems unprofessional" },
            { text: "Offer discounts for flexible delivery windows", impact: 25, reasoning: "Creative solution that benefits both parties" }
          ]
        }
      ]
    },
    {
      id: 2,
      title: "Supplier Bankruptcy",
      description: "Your main supplier files for bankruptcy with 30 days notice",
      context: "This supplier provides 70% of your key raw materials. You have 4 weeks of inventory.",
      initialImpact: "You need to find new suppliers quickly or face production shutdown",
      questions: [
        {
          id: "q4",
          question: "What's your priority action?",
          options: [
            { text: "Panic and hope for the best", impact: -30, reasoning: "Not a strategy" },
            { text: "Immediately contact alternative suppliers", impact: 20, reasoning: "Proactive but may not be enough" },
            { text: "Activate your business continuity plan", impact: 30, reasoning: "Excellent preparation" },
            { text: "Wait for more information", impact: -20, reasoning: "Wastes precious time" }
          ]
        },
        {
          id: "q5",
          question: "How do you manage cash flow during this transition?",
          options: [
            { text: "Use emergency line of credit", impact: 10, reasoning: "Good short-term solution" },
            { text: "Delay payments to other vendors", impact: -25, reasoning: "Damages supplier relationships" },
            { text: "Negotiate payment terms with new suppliers", impact: 25, reasoning: "Smart financial management" },
            { text: "Reduce operating expenses temporarily", impact: 15, reasoning: "Prudent cost control" }
          ]
        }
      ]
    },
    {
      id: 3,
      title: "Economic Downturn",
      description: "A recession hits, reducing customer spending by 25%",
      context: "Your business has been growing steadily. Fixed costs are $50,000/month.",
      initialImpact: "Revenue drops sharply while fixed costs remain",
      questions: [
        {
          id: "q6",
          question: "How do you adjust your marketing?",
          options: [
            { text: "Cut marketing budget completely", impact: -20, reasoning: "Loses visibility when needed most" },
            { text: "Shift to lower-cost digital channels", impact: 20, reasoning: "Adapts to new reality" },
            { text: "Increase marketing to capture market share", impact: 15, reasoning: "Bold but risky" },
            { text: "Focus on retention of existing customers", impact: 25, reasoning: "Excellent strategy" }
          ]
        },
        {
          id: "q7",
          question: "What's your approach to pricing?",
          options: [
            { text: "Discount heavily to maintain volume", impact: -15, reasoning: "Erodes margins permanently" },
            { text: "Maintain prices and add value", impact: 20, reasoning: "Good differentiation" },
            { text: "Introduce tiered pricing options", impact: 25, reasoning: "Captures different segments" },
            { text: "Raise prices to maintain margins", impact: -25, reasoning: "Could accelerate customer loss" }
          ]
        },
        {
          id: "q8",
          question: "How do you manage your team?",
          options: [
            { text: "Immediate layoffs", impact: -30, reasoning: "Damages morale and future capacity" },
            { text: "Reduce hours across the board", impact: 10, reasoning: "Shares the burden fairly" },
            { text: "Cross-train employees for flexibility", impact: 25, reasoning: "Builds resilience" },
            { text: "Maintain full staff, cut other costs", impact: 5, reasoning: "Preserves team but risky" }
          ]
        }
      ]
    }
  ];

  const handleAnswer = (questionId, optionIndex, impact) => {
    setAnswers(prev => {
      const newAnswers = [...prev];
      const existingIndex = newAnswers.findIndex(a => a.questionId === questionId);
      
      const answer = {
        questionId,
        optionIndex,
        impact,
        timestamp: new Date()
      };
      
      if (existingIndex >= 0) {
        newAnswers[existingIndex] = answer;
      } else {
        newAnswers.push(answer);
      }
      
      return newAnswers;
    });
  };

  const calculateTestScore = () => {
    // Calculate total impact score
    const totalImpact = answers.reduce((sum, a) => sum + a.impact, 0);
    
    // Base score of 50 + impact (capped at 0-100)
    const rawScore = 50 + totalImpact;
    const finalScore = Math.min(100, Math.max(0, rawScore));
    
    // Pass if score >= 70
    const passed = finalScore >= 70;
    
    return { score: finalScore, passed };
  };

  const submitTest = async () => {
    // Check if all questions in current scenario are answered
    const currentQuestions = scenarios[currentScenario].questions;
    const answeredCount = answers.filter(a => 
      currentQuestions.some(q => q.id === a.questionId)
    ).length;
    
    if (answeredCount < currentQuestions.length) {
      setSubmitError("Please answer all questions before submitting");
      return;
    }

    if (currentScenario < scenarios.length - 1) {
      // Move to next scenario
      setCurrentScenario(prev => prev + 1);
      setSubmitError("");
    } else {
      // All scenarios completed - submit final test
      try {
        setSubmitting(true);
        
        const { score, passed } = calculateTestScore();
        setTestScore(score);
        setTestPassed(passed);
        
        // Submit to backend
        const result = await api.post('/entrepreneur/stress-test', {
          simulationScore: score,
          passed: passed
        });
        
        console.log('Test submitted:', result);
        setShowResults(true);
        
      } catch (err) {
        console.error('Error submitting test:', err);
        setSubmitError(err.message || 'Failed to submit test');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const restartTest = () => {
    setCurrentScenario(0);
    setAnswers([]);
    setShowResults(false);
    setTestScore(0);
    setTestPassed(false);
    setSubmitError("");
  };

  const currentScenarioData = scenarios[currentScenario];
  const scenarioProgress = ((currentScenario + 1) / scenarios.length) * 100;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070A0F] p-6">
        <div className="max-w-md mx-auto">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-white/60">Loading stress test...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-[#070A0F] p-6">
        <div className="max-w-md mx-auto space-y-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Test Complete</h2>
            
            <div className="mt-6">
              <div className="text-6xl font-bold text-white">
                {testScore}
              </div>
              <div className="text-sm text-white/40 mt-1">/100</div>
            </div>

            <div className="mt-4">
              <span className={`text-lg px-4 py-2 rounded-full ${
                testPassed 
                  ? "bg-green-500/20 text-green-300" 
                  : "bg-red-500/20 text-red-300"
              }`}>
                {testPassed ? "✓ PASSED" : "✗ NOT PASSED"}
              </span>
            </div>

            <div className="mt-6 p-4 rounded-2xl bg-black/25 text-left">
              <h3 className="font-semibold text-white mb-2">Results Summary</h3>
              <p className="text-sm text-white/70">
                {testPassed 
                  ? "Congratulations! You've demonstrated strong business resilience. Your stress test is now complete."
                  : "Your score didn't meet the passing threshold. Review the scenarios and try again to improve your resilience score."}
              </p>
              
              {testData?.attempts?.length > 0 && (
                <div className="mt-3 text-xs text-white/40">
                  Previous attempts: {testData.attempts.length}
                </div>
              )}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={restartTest}
                className="rounded-2xl border border-white/15 bg-white/5 py-3 text-sm font-semibold text-white/85 hover:bg-white/10"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate("/app/score")}
                className="rounded-2xl bg-[#C7000B] py-3 text-sm font-semibold text-white hover:opacity-95"
              >
                View Score
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
          <h2 className="text-xl font-bold text-white">Market Shock Simulation</h2>
          <p className="mt-1 text-sm text-white/60">
            Test your business resilience against real-world scenarios
          </p>

          {/* Progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-white/60">Scenario {currentScenario + 1}/{scenarios.length}</span>
              <span className="text-white font-semibold">{Math.round(scenarioProgress)}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/10">
              <div
                className="h-2 rounded-full bg-[#C7000B] transition-all duration-300"
                style={{ width: `${scenarioProgress}%` }}
              />
            </div>
          </div>

          {/* Previous attempts info */}
          {testData?.attempts?.length > 0 && (
            <div className="mt-3 text-xs text-white/40">
              Previous attempts: {testData.attempts.length} • 
              Best score: {Math.max(...testData.attempts.map(a => a.simulation_score || 0))}%
            </div>
          )}
        </div>

        {/* Current Scenario */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white">{currentScenarioData.title}</h3>
            <p className="mt-1 text-sm text-white/70">{currentScenarioData.description}</p>
          </div>

          <div className="p-4 rounded-2xl bg-black/25 mb-4">
            <p className="text-sm text-white/80">
              <span className="font-semibold">Context:</span> {currentScenarioData.context}
            </p>
            <p className="mt-2 text-sm text-yellow-400/80">
              <span className="font-semibold">Impact:</span> {currentScenarioData.initialImpact}
            </p>
          </div>

          {/* Questions */}
          <div className="space-y-6">
            {currentScenarioData.questions.map((q) => {
              const selectedAnswer = answers.find(a => a.questionId === q.id);
              
              return (
                <div key={q.id} className="space-y-3">
                  <p className="text-sm font-medium text-white/90">
                    {q.question}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((opt, oIdx) => (
                      <button
                        key={oIdx}
                        onClick={() => handleAnswer(q.id, oIdx, opt.impact)}
                        className={`w-full text-left p-4 rounded-xl border transition-all ${
                          selectedAnswer?.optionIndex === oIdx
                            ? "border-[#C7000B] bg-[#C7000B]/10"
                            : "border-white/10 bg-black/25 hover:bg-white/5"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-sm text-white/80 flex-1">
                            {opt.text}
                          </span>
                          {selectedAnswer?.optionIndex === oIdx && (
                            <span className="text-[#C7000B] text-xs font-semibold">
                              Selected
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-white/40">
                          {opt.reasoning}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="mt-6">
            {submitError && (
              <div className="mb-3 text-sm text-red-400">
                {submitError}
              </div>
            )}
            
            <button
              onClick={submitTest}
              disabled={submitting}
              className="w-full rounded-2xl bg-[#C7000B] py-3 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-50"
            >
              {submitting 
                ? "Submitting..." 
                : currentScenario < scenarios.length - 1 
                  ? "Next Scenario" 
                  : "Complete Test"
              }
            </button>
          </div>
        </div>

        {/* Info Panel */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h4 className="text-sm font-semibold text-white">How it works</h4>
              <p className="text-xs text-white/40 mt-1">
                Each decision impacts your resilience score. Choose wisely based on 
                business best practices. You need 70% to pass.
              </p>
            </div>
          </div>
        </div>

        {/* Debug Info */}
        {import.meta.env.DEV && (
          <div className="mt-4 p-3 border border-yellow-500/30 bg-yellow-500/10 rounded-2xl">
            <details>
              <summary className="text-xs text-yellow-400 cursor-pointer">
                Debug Data
              </summary>
              <pre className="mt-2 text-[10px] text-yellow-200/70 overflow-auto max-h-40">
                {JSON.stringify({ dashboardData, testData, answers }, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}