// src/pages/app/MentorResources.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MentorResources() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedGuide, setExpandedGuide] = useState(null);

  // Resource categories
  const categories = [
    { id: "all", name: "All Resources", icon: "📚" },
    { id: "guides", name: "Mentor Guides", icon: "📖" },
    { id: "templates", name: "Templates", icon: "📋" },
    { id: "assessments", name: "Assessments", icon: "📊" },
    { id: "videos", name: "Video Library", icon: "🎥" },
    { id: "articles", name: "Articles", icon: "📄" }
  ];

  // Resources data
  const resources = [
    // Mentor Guides
    {
      id: 1,
      category: "guides",
      title: "The Effective Mentor: A Complete Guide",
      description: "Learn the principles of effective mentorship, from building rapport to providing constructive feedback.",
      icon: "👥",
      type: "Guide",
      duration: "20 min read",
      author: "Mentorship Team",
      tags: ["beginner", "fundamentals", "communication"],
      content: {
        sections: [
          {
            title: "Building Trust",
            content: "Trust is the foundation of any mentoring relationship. Start by being reliable, keeping confidences, and showing genuine interest in your mentee's success."
          },
          {
            title: "Active Listening",
            content: "Listen more than you talk. Ask open-ended questions and paraphrase to ensure understanding. Your mentee needs to feel heard."
          },
          {
            title: "Providing Feedback",
            content: "Use the SBI model: Situation, Behavior, Impact. Be specific about what you observed and its effect, then discuss alternatives."
          }
        ],
        tips: [
          "Set clear expectations from the start",
          "Establish regular meeting schedules",
          "Celebrate small wins together",
          "Be patient - growth takes time"
        ]
      }
    },
    {
      id: 2,
      category: "guides",
      title: "Understanding the B² Score",
      description: "A deep dive into how readiness scores are calculated and what they mean for entrepreneurs.",
      icon: "📊",
      type: "Guide",
      duration: "15 min read",
      author: "Analytics Team",
      tags: ["scores", "assessment", "intermediate"],
      content: {
        sections: [
          {
            title: "Score Components",
            content: "The B² score is weighted across five categories: Compliance (20%), Grooming (30%), Stress Test (20%), Mentor Vouches (20%), and Business Plan (10%)."
          },
          {
            title: "Interpreting Scores",
            content: "Scores above 70 indicate investment readiness. Scores between 50-69 show good progress but need work. Below 50 requires foundational improvements."
          }
        ],
        tips: [
          "Focus on the lowest-scoring areas first",
          "Each vouch adds 10 points to their score",
          "Celebrate when mentees cross the 70 threshold"
        ]
      }
    },
    {
      id: 3,
      category: "guides",
      title: "Grooming Program Overview",
      description: "Complete guide to the 6-module grooming program and how to support entrepreneurs through each stage.",
      icon: "📚",
      type: "Guide",
      duration: "25 min read",
      author: "Curriculum Team",
      tags: ["grooming", "program", "comprehensive"],
      content: {
        sections: [
          {
            title: "Module 1: Financial Literacy",
            content: "Covers financial statements, cash flow management, and basic accounting. Key concepts: profit & loss, balance sheets, cash flow forecasting."
          },
          {
            title: "Module 2: Market Research",
            content: "Teaches market analysis, competitor research, and customer discovery. Includes TAM/SAM/SOM calculations."
          },
          {
            title: "Module 3: Business Mindset",
            content: "Focuses on entrepreneurial thinking, resilience, and growth mindset. Includes practical exercises."
          }
        ],
        tips: [
          "Review quiz results before sessions",
          "Focus on real-world application",
          "Share personal experiences"
        ]
      }
    },

    // Templates
    {
      id: 4,
      category: "templates",
      title: "Session Planning Template",
      description: "Structured template for planning productive mentoring sessions.",
      icon: "📅",
      type: "Template",
      format: "Google Docs",
      downloadUrl: "#",
      preview: [
        "Session objectives",
        "Topics to cover",
        "Questions to ask",
        "Action items",
        "Follow-up tasks"
      ]
    },
    {
      id: 5,
      category: "templates",
      title: "Feedback Form",
      description: "Comprehensive feedback template for providing structured feedback after sessions.",
      icon: "📝",
      type: "Template",
      format: "PDF",
      downloadUrl: "#",
      preview: [
        "Strengths observed",
        "Areas for improvement",
        "Specific recommendations",
        "Resources to review",
        "Next session goals"
      ]
    },
    {
      id: 6,
      category: "templates",
      title: "Progress Tracker",
      description: "Track entrepreneur progress across all program milestones.",
      icon: "📊",
      type: "Template",
      format: "Excel",
      downloadUrl: "#",
      preview: [
        "Milestone checklist",
        "Score tracking",
        "Session log",
        "Notes section",
        "Goal setting"
      ]
    },

    // Assessments
    {
      id: 7,
      category: "assessments",
      title: "Entrepreneur Readiness Assessment",
      description: "Evaluate entrepreneur readiness across key business areas.",
      icon: "📋",
      type: "Assessment",
      questions: 25,
      timeEstimate: "30 min",
      areas: [
        "Business planning",
        "Financial management",
        "Market understanding",
        "Operational capacity",
        "Team leadership"
      ]
    },
    {
      id: 8,
      category: "assessments",
      title: "Mentorship Impact Survey",
      description: "Measure the effectiveness of your mentoring sessions.",
      icon: "📊",
      type: "Assessment",
      questions: 15,
      timeEstimate: "15 min",
      areas: [
        "Goal progress",
        "Skill development",
        "Confidence growth",
        "Network expansion",
        "Overall satisfaction"
      ]
    },

    // Videos
    {
      id: 9,
      category: "videos",
      title: "Effective Mentoring Techniques",
      description: "Video workshop on proven mentoring techniques.",
      icon: "🎥",
      type: "Video",
      duration: "45 min",
      presenter: "Dr. Sarah Khumalo",
      thumbnail: "🎬",
      topics: [
        "Building trust quickly",
        "Asking powerful questions",
        "Providing actionable feedback",
        "Setting SMART goals"
      ]
    },
    {
      id: 10,
      category: "videos",
      title: "Understanding Financial Statements",
      description: "Quick guide to helping entrepreneurs understand their numbers.",
      icon: "📊",
      type: "Video",
      duration: "20 min",
      presenter: "Marcus van der Merwe",
      thumbnail: "🎬",
      topics: [
        "Income statements",
        "Balance sheets",
        "Cash flow statements",
        "Key ratios to watch"
      ]
    },

    // Articles
    {
      id: 11,
      category: "articles",
      title: "The Psychology of Entrepreneurship",
      description: "Understanding the mindset challenges entrepreneurs face.",
      icon: "🧠",
      type: "Article",
      readTime: "8 min",
      author: "Dr. Lerato Ndlovu",
      keyPoints: [
        "Imposter syndrome is common",
        "Fear of failure vs. growth mindset",
        "Building resilience",
        "Managing stress and burnout"
      ]
    },
    {
      id: 12,
      category: "articles",
      title: "Funding Readiness: What Investors Look For",
      description: "Insights from funders on what makes an entrepreneur investment-ready.",
      icon: "💰",
      type: "Article",
      readTime: "10 min",
      author: "Investment Team",
      keyPoints: [
        "Clear business model",
        "Traction and metrics",
        "Strong team",
        "Market opportunity",
        "Scalability"
      ]
    }
  ];

  // Filter resources based on search and category
  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (resource.tags && resource.tags.some(tag => tag.includes(searchTerm.toLowerCase())));
    
    const matchesCategory = activeCategory === "all" || resource.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#070A0F] p-6 pb-20">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/app/mentor')}
            className="text-white/40 hover:text-white/60"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-white">Mentor Resources</h1>
          <div className="w-24"></div>
        </div>

        {/* Welcome Card */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-2">Welcome to the Mentor Resource Center</h2>
          <p className="text-white/70">
            Access guides, templates, and tools to support your mentoring journey. All resources are free and designed to help you make the biggest impact.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search resources by title, description, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 pl-10 text-white placeholder-white/30"
            />
            <span className="absolute left-3 top-3 text-white/40">🔍</span>
          </div>
        </div>

        {/* Category Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition ${
                  activeCategory === category.id
                    ? 'bg-[#C7000B] text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                <span className="mr-1">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <p className="text-sm text-white/40 mb-4">
          Showing {filteredResources.length} of {resources.length} resources
        </p>

        {/* Resources Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map(resource => (
            <div
              key={resource.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition cursor-pointer"
              onClick={() => setExpandedGuide(expandedGuide === resource.id ? null : resource.id)}
            >
              {/* Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-[#C7000B]/20 flex items-center justify-center text-xl">
                  {resource.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white text-sm">{resource.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-white/60">
                      {resource.type}
                    </span>
                    {resource.duration && (
                      <span className="text-[10px] text-white/40">{resource.duration}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-white/60 mb-3 line-clamp-2">{resource.description}</p>

              {/* Tags */}
              {resource.tags && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {resource.tags.map(tag => (
                    <span key={tag} className="text-[9px] bg-white/5 px-2 py-0.5 rounded-full text-white/40">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Preview/Expanded Content */}
              {expandedGuide === resource.id && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  {/* Guides Content */}
                  {resource.content && (
                    <div className="space-y-3">
                      {resource.content.sections?.map((section, idx) => (
                        <div key={idx}>
                          <h4 className="text-xs font-semibold text-white/80 mb-1">{section.title}</h4>
                          <p className="text-[11px] text-white/60">{section.content}</p>
                        </div>
                      ))}
                      {resource.content.tips && (
                        <div>
                          <h4 className="text-xs font-semibold text-white/80 mb-1">💡 Pro Tips</h4>
                          <ul className="space-y-1">
                            {resource.content.tips.map((tip, idx) => (
                              <li key={idx} className="text-[11px] text-white/60 flex items-start gap-1">
                                <span className="text-green-400">•</span>
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Templates Preview */}
                  {resource.preview && (
                    <div>
                      <h4 className="text-xs font-semibold text-white/80 mb-2">Includes:</h4>
                      <ul className="space-y-1">
                        {resource.preview.map((item, idx) => (
                          <li key={idx} className="text-[11px] text-white/60 flex items-start gap-1">
                            <span className="text-green-400">✓</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                      <button className="mt-3 w-full bg-[#C7000B] text-white py-2 rounded-lg text-xs font-semibold hover:opacity-95">
                        Download {resource.format}
                      </button>
                    </div>
                  )}

                  {/* Assessments Preview */}
                  {resource.questions && (
                    <div>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="text-center p-2 rounded-lg bg-black/25">
                          <div className="text-xs text-white/40">Questions</div>
                          <div className="text-sm font-bold text-white">{resource.questions}</div>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-black/25">
                          <div className="text-xs text-white/40">Time</div>
                          <div className="text-sm font-bold text-white">{resource.timeEstimate}</div>
                        </div>
                      </div>
                      <h4 className="text-xs font-semibold text-white/80 mb-2">Areas Assessed:</h4>
                      <ul className="space-y-1">
                        {resource.areas.map((area, idx) => (
                          <li key={idx} className="text-[11px] text-white/60 flex items-start gap-1">
                            <span className="text-blue-400">•</span>
                            {area}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Videos Preview */}
                  {resource.topics && resource.type === "Video" && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-white/40">Presenter:</span>
                        <span className="text-xs text-white/80">{resource.presenter}</span>
                      </div>
                      <h4 className="text-xs font-semibold text-white/80 mb-2">Topics Covered:</h4>
                      <ul className="space-y-1">
                        {resource.topics.map((topic, idx) => (
                          <li key={idx} className="text-[11px] text-white/60 flex items-start gap-1">
                            <span className="text-red-400">▶</span>
                            {topic}
                          </li>
                        ))}
                      </ul>
                      <button className="mt-3 w-full bg-[#C7000B] text-white py-2 rounded-lg text-xs font-semibold hover:opacity-95">
                        Watch Video
                      </button>
                    </div>
                  )}

                  {/* Articles Preview */}
                  {resource.keyPoints && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-white/40">By:</span>
                        <span className="text-xs text-white/80">{resource.author}</span>
                      </div>
                      <h4 className="text-xs font-semibold text-white/80 mb-2">Key Points:</h4>
                      <ul className="space-y-1">
                        {resource.keyPoints.map((point, idx) => (
                          <li key={idx} className="text-[11px] text-white/60 flex items-start gap-1">
                            <span className="text-green-400">•</span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Expand/Collapse Indicator */}
              <div className="mt-2 text-[10px] text-[#C7000B] text-center">
                {expandedGuide === resource.id ? 'Show less' : 'Click to expand'}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredResources.length === 0 && (
          <div className="text-center py-12 bg-white/5 rounded-3xl">
            <p className="text-white/40 mb-3">No resources match your search</p>
            <button
              onClick={() => {
                setSearchTerm("");
                setActiveCategory("all");
              }}
              className="text-[#C7000B] text-sm hover:underline"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Request Resource */}
        <div className="mt-8 p-6 rounded-3xl border border-white/10 bg-white/5">
          <h3 className="text-lg font-semibold text-white mb-2">Don't see what you're looking for?</h3>
          <p className="text-white/60 text-sm mb-4">
            We're constantly adding new resources. Let us know what would help you be a better mentor.
          </p>
          <button
            onClick={() => navigate('/app/contact')}
            className="bg-[#C7000B] text-white px-6 py-2 rounded-xl text-sm font-semibold hover:opacity-95"
          >
            Request a Resource
          </button>
        </div>
      </div>
    </div>
  );
}