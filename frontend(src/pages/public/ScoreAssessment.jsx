import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ScoreAssessment() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [email, setEmail] = useState("");
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [calculatedScore, setCalculatedScore] = useState(null);

  // Assessment questions
  const questions = [
    {
      id: 1,
      question: "How long has your business been operating?",
      options: [
        { text: "Less than 6 months", score: 20 },
        { text: "6 months - 1 year", score: 40 },
        { text: "1 - 3 years", score: 60 },
        { text: "3 - 5 years", score: 80 },
        { text: "5+ years", score: 100 }
      ]
    },
    {
      id: 2,
      question: "What is your average monthly revenue?",
      options: [
        { text: "Less than R10,000", score: 20 },
        { text: "R10,000 - R50,000", score: 40 },
        { text: "R50,000 - R100,000", score: 60 },
        { text: "R100,000 - R500,000", score: 80 },
        { text: "R500,000+", score: 100 }
      ]
    },
    {
      id: 3,
      question: "Do you have a registered business?",
      options: [
        { text: "No, not registered", score: 0 },
        { text: "Yes, registered", score: 100 }
      ]
    },
    {
      id: 4,
      question: "Do you have a business bank account?",
      options: [
        { text: "No", score: 0 },
        { text: "Yes", score: 100 }
      ]
    },
    {
      id: 5,
      question: "Do you keep financial records?",
      options: [
        { text: "No", score: 0 },
        { text: "Basic records", score: 50 },
        { text: "Detailed records with statements", score: 100 }
      ]
    },
    {
      id: 6,
      question: "Have you ever taken a business loan?",
      options: [
        { text: "No", score: 0 },
        { text: "Yes, and repaid successfully", score: 100 },
        { text: "Yes, but struggling with repayment", score: 30 }
      ]
    },
    {
      id: 7,
      question: "Do you have a business plan?",
      options: [
        { text: "No", score: 0 },
        { text: "In progress", score: 50 },
        { text: "Yes, completed", score: 100 }
      ]
    },
    {
      id: 8,
      question: "How many employees do you have?",
      options: [
        { text: "Just me", score: 20 },
        { text: "2-5 employees", score: 40 },
        { text: "6-20 employees", score: 60 },
        { text: "21-50 employees", score: 80 },
        { text: "50+ employees", score: 100 }
      ]
    },
    {
      id: 9,
      question: "Do you have a mentor or advisor?",
      options: [
        { text: "No", score: 0 },
        { text: "Yes, informally", score: 50 },
        { text: "Yes, formal mentorship", score: 100 }
      ]
    },
    {
      id: 10,
      question: "How confident are you in your business model?",
      options: [
        { text: "Still figuring it out", score: 20 },
        { text: "Somewhat confident", score: 40 },
        { text: "Confident", score: 60 },
        { text: "Very confident", score: 80 },
        { text: "Extremely confident", score: 100 }
      ]
    }
  ];

  // Score explanation based on range
  const getScoreExplanation = (score) => {
    if (score >= 80) {
      return {
        title: "🌟 Excellent Business Readiness!",
        description: "Your business shows strong fundamentals and is well-positioned for growth. With a few refinements, you could be investment-ready.",
        strengths: [
          "Strong operational history",
          "Good financial management",
          "Clear business direction"
        ],
        improvements: [
          "Connect with mentors to refine your pitch",
          "Explore funding options matched to your stage",
          "Document your processes for scalability"
        ]
      };
    } else if (score >= 60) {
      return {
        title: "📈 Good Foundation!",
        description: "You've built a solid business foundation. With targeted improvements, you can significantly increase your readiness score.",
        strengths: [
          "Business is operational",
          "Basic systems in place",
          "Revenue generation"
        ],
        improvements: [
          "Formalize your business registration",
          "Improve financial record-keeping",
          "Develop a comprehensive business plan"
        ]
      };
    } else if (score >= 40) {
      return {
        title: "🌱 Developing Business",
        description: "You're on the right track! Your business has potential, and with structured support, you can build a stronger foundation.",
        strengths: [
          "Entrepreneurial spirit",
          "Business idea with potential",
          "Willingness to learn"
        ],
        improvements: [
          "Register your business formally",
          "Open a business bank account",
          "Start keeping financial records",
          "Seek mentorship and guidance"
        ]
      };
    } else {
      return {
        title: "💡 Starting Your Journey",
        description: "Every successful business starts somewhere! Your score reflects early stage, which means huge opportunity for growth.",
        strengths: [
          "Taking the first step",
          "Interest in business development",
          "Open to assessment and improvement"
        ],
        improvements: [
          "Learn business fundamentals",
          "Connect with mentors for guidance",
          "Develop a clear business concept",
          "Start small and validate your idea"
        ]
      };
    }
  };

  // Benefits of registration
  const registrationBenefits = [
    {
      icon: "📊",
      title: "Detailed Score Breakdown",
      description: "See exactly which areas need improvement with personalized recommendations"
    },
    {
      icon: "🎓",
      title: "Grooming Program Access",
      description: "Step-by-step modules to improve your business operations and score"
    },
    {
      icon: "👥",
      title: "Mentor Matching",
      description: "Connect with experienced mentors who've built successful businesses"
    },
    {
      icon: "💰",
      title: "Investor Network",
      description: "Get matched with funders looking for businesses like yours"
    },
    {
      icon: "📈",
      title: "Progress Tracking",
      description: "Watch your score improve as you complete readiness steps"
    },
    {
      icon: "🔧",
      title: "Business Tools",
      description: "Access templates, calculators, and resources to streamline operations"
    }
  ];

  const handleAnswer = (questionId, score) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: score
    }));

    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Calculate final score
      calculateFinalScore();
    }
  };

  const calculateFinalScore = () => {
    const totalScore = Object.values(answers).reduce((sum, score) => sum + score, 0);
    const averageScore = Math.round(totalScore / questions.length);
    setCalculatedScore(averageScore);
    setShowEmailPrompt(true);
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    // Here you could save the email and score to a database
    console.log('Email:', email, 'Score:', calculatedScore);
    
    // Redirect to register with the score
    navigate('/register', { 
      state: { 
        preFillScore: calculatedScore,
        email: email 
      } 
    });
  };

  const progress = ((currentStep + 1) / questions.length) * 100;

  if (calculatedScore) {
    const explanation = getScoreExplanation(calculatedScore);
    
    return (
      <div className="min-h-screen bg-[#070A0F] p-6">
        <div className="max-w-2xl mx-auto">
          
          {/* Score Card */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center mb-6">
            <div className="text-6xl mb-4">📊</div>
            <h1 className="text-2xl font-bold text-white mb-2">Your B² Readiness Score</h1>
            
            <div className="mt-6 mb-4">
              <div className="text-7xl font-bold text-[#C7000B]">
                {calculatedScore}
              </div>
              <div className="text-white/40 mt-1">out of 100</div>
            </div>

            <div className="p-4 rounded-xl bg-black/25">
              <h2 className="text-xl font-semibold text-white mb-2">{explanation.title}</h2>
              <p className="text-white/70 text-sm">{explanation.description}</p>
            </div>
          </div>

          {/* Score Explanation Section */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">What Your Score Means</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-semibold text-green-400 mb-2">✓ Your Strengths</h4>
                <ul className="space-y-2">
                  {explanation.strengths.map((strength, i) => (
                    <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                      <span className="text-green-400">•</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-yellow-400 mb-2">📝 Areas to Improve</h4>
                <ul className="space-y-2">
                  {explanation.improvements.map((improvement, i) => (
                    <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                      <span className="text-yellow-400">•</span>
                      {improvement}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#C7000B]/20 to-transparent p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">✨ Unlock Your Full Potential</h3>
            <p className="text-white/60 text-sm mb-4">
              Create a free account to access tools that will help you improve your score and grow your business
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {registrationBenefits.map((benefit, i) => (
                <div key={i} className="p-3 rounded-xl bg-black/25 text-center">
                  <div className="text-2xl mb-1">{benefit.icon}</div>
                  <div className="text-xs font-semibold text-white">{benefit.title}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Email Capture */}
          {!showEmailPrompt ? (
            <button
              onClick={() => setShowEmailPrompt(true)}
              className="w-full rounded-2xl bg-[#C7000B] py-4 text-white font-semibold hover:opacity-95 text-lg"
            >
              Get Your Free Improvement Plan →
            </button>
          ) : (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Save Your Progress</h3>
                <p className="text-white/60 text-sm mb-4">
                  Enter your email to receive your detailed score report and improvement plan
                </p>
                
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white mb-3"
                />
                
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-[#C7000B] py-3 text-white font-semibold hover:opacity-95"
                >
                  Continue to Registration
                </button>
                
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="w-full text-sm text-white/40 hover:text-white/60 mt-3"
                >
                  Maybe later, return home
                </button>
              </div>
            </form>
          )}

          {/* Trust Badge */}
          <p className="mt-4 text-xs text-white/30 text-center">
            🔒 Your information is secure. We'll never share your data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070A0F] p-6">
      <div className="max-w-md mx-auto">
        
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-white">Get Your Free B² Score</h1>
          <p className="text-white/60 mt-1">Answer 10 quick questions to assess your business readiness</p>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-white/60 mb-2">
            <span>Question {currentStep + 1} of {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-white/10">
            <div
              className="h-2 rounded-full bg-[#C7000B] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question card */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold text-white mb-6">
            {questions[currentStep].question}
          </h2>

          <div className="space-y-3">
            {questions[currentStep].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(questions[currentStep].id, option.score)}
                className="w-full text-left p-4 rounded-xl border border-white/10 bg-black/25 hover:bg-white/5 transition"
              >
                <span className="text-white/80">{option.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Trust message */}
        <p className="mt-4 text-xs text-white/30 text-center">
          Your answers are anonymous. Create an account to save your results and access improvement tools.
        </p>
      </div>
    </div>
  );
}