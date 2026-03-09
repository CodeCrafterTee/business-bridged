import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Help() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFaq, setActiveFaq] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [contactForm, setContactForm] = useState({
    subject: "",
    message: "",
    category: "general"
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // FAQ Categories
  const categories = [
    { id: "all", name: "All Questions", icon: "📚" },
    { id: "getting-started", name: "Getting Started", icon: "🚀" },
    { id: "profile", name: "Profile & Account", icon: "👤" },
    { id: "grooming", name: "Grooming Program", icon: "📊" },
    { id: "mentors", name: "Mentors", icon: "👥" },
    { id: "funding", name: "Funding", icon: "💰" },
    { id: "technical", name: "Technical Support", icon: "🔧" }
  ];

  // FAQ Data
  const faqs = [
    {
      id: 1,
      category: "getting-started",
      question: "How do I get started with Business Bridged?",
      answer: "Getting started is easy! Simply create an account, complete your business profile in the Intake form, and you'll receive your initial B² score. From there, you can access the Grooming program, connect with mentors, and start exploring funding opportunities."
    },
    {
      id: 2,
      category: "getting-started",
      question: "What is the B² score?",
      answer: "Your B² (Business Bridged) score is a readiness indicator that ranges from 0-100. It's calculated based on your business information, completed readiness steps, stress test results, mentor vouches, and verification status. A higher score means you're more ready for funding opportunities."
    },
    {
      id: 3,
      category: "profile",
      question: "How do I update my business information?",
      answer: "You can update your business information through the Intake form. Navigate to your Dashboard and click on 'Intake Form' in the Quick Actions section, or go to Settings > Business and click 'Update Business Information'."
    },
    {
      id: 4,
      category: "profile",
      question: "How do I change my password?",
      answer: "To change your password, go to Settings > Security. You'll need to enter your current password and your new password twice to confirm. Make sure your new password is at least 6 characters long."
    },
    {
      id: 5,
      category: "grooming",
      question: "What is the Grooming program?",
      answer: "The Grooming program is a series of modules designed to help you build business skills and improve your readiness score. It covers topics like Financial Literacy, Market Research, Business Mindset, and more. Each module includes quizzes to test your knowledge."
    },
    {
      id: 6,
      category: "grooming",
      question: "How long does the Grooming program take?",
      answer: "The Grooming program is self-paced. Most entrepreneurs complete it in 2-4 weeks, but you can go faster or slower depending on your schedule. Each module takes about 30-60 minutes to complete."
    },
    {
      id: 7,
      category: "mentors",
      question: "How do I find a mentor?",
      answer: "To find a mentor, you must first pass the Stress Test. Once you've passed, visit the Mentor Search page where you can browse available mentors by industry, expertise, and availability. You can send mentorship requests to mentors that match your needs."
    },
    {
      id: 8,
      category: "mentors",
      question: "What happens after I request a mentor?",
      answer: "The mentor will receive your request and respond within 48 hours. If they accept, you'll be able to schedule sessions through the platform. You can track your mentorship journey in the Mentor Sessions page."
    },
    {
      id: 9,
      category: "funding",
      question: "How do I apply for funding?",
      answer: "You can start by using the Apply Funding page, which works like a matching service. Browse funders, like the ones you're interested in, and if there's a mutual match, you can connect. You can also track your applications in the Funder Matches page."
    },
    {
      id: 10,
      category: "funding",
      question: "What's the difference between Apply Funding and Funder Matches?",
      answer: "Apply Funding is where you discover and like potential funders (like a dating app). Funder Matches is where you track your applications, see approved matches, and manage the funding process once you've connected with a funder."
    },
    {
      id: 11,
      category: "technical",
      question: "The website isn't loading properly. What should I do?",
      answer: "First, try refreshing the page. If that doesn't work, clear your browser cache and cookies. Make sure you're using an updated browser (Chrome, Firefox, Safari, or Edge). If problems persist, contact our support team."
    },
    {
      id: 12,
      category: "technical",
      question: "Is my data secure?",
      answer: "Absolutely! We use industry-standard encryption to protect your data. Your personal information and business details are stored securely and never shared without your consent. You can review our privacy policy for more details."
    }
  ];

  // Guide Data
  const guides = [
    {
      id: 1,
      title: "Complete Your Profile",
      description: "Step-by-step guide to setting up your business profile",
      icon: "📋",
      time: "5 min",
      link: "/app/intake"
    },
    {
      id: 2,
      title: "Master the Grooming Program",
      description: "Tips and tricks to get the most out of each module",
      icon: "📚",
      time: "10 min",
      link: "/app/grooming"
    },
    {
      id: 3,
      title: "Pass the Stress Test",
      description: "Strategies to ace your financial resilience assessment",
      icon: "📊",
      time: "8 min",
      link: "/app/stress-test"
    },
    {
      id: 4,
      title: "Find Your Perfect Mentor",
      description: "How to search, request, and work with mentors",
      icon: "👥",
      time: "6 min",
      link: "/app/mentor-search"
    },
    {
      id: 5,
      title: "Secure Funding",
      description: "From matching to application to approval",
      icon: "💰",
      time: "12 min",
      link: "/app/apply-funding"
    }
  ];

  // Filter FAQs based on search and category
  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleFaqClick = (id) => {
    setActiveFaq(activeFaq === id ? null : id);
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setFormSubmitted(true);
      setSubmitting(false);
      setContactForm({ subject: "", message: "", category: "general" });
      
      // Reset success message after 5 seconds
      setTimeout(() => setFormSubmitted(false), 5000);
    }, 1000);
  };

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
          <h1 className="text-2xl font-bold text-white">Help Center</h1>
          <div className="w-8"></div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for help articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 pl-10 text-white placeholder-white/30 focus:ring-2 focus:ring-white/20 outline-none"
            />
            <span className="absolute left-3 top-3 text-white/40">🔍</span>
          </div>
        </div>

        {/* Quick Guides */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-white/60 mb-3">QUICK GUIDES</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {guides.map((guide) => (
              <button
                key={guide.id}
                onClick={() => navigate(guide.link)}
                className="p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition text-center"
              >
                <div className="text-2xl mb-2">{guide.icon}</div>
                <div className="text-xs font-semibold text-white">{guide.title}</div>
                <div className="text-[10px] text-white/40 mt-1">{guide.time}</div>
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-white/60 mb-3">FAQ CATEGORIES</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
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

        {/* FAQ List */}
        <div className="mb-8 space-y-2">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-8 bg-white/5 rounded-3xl">
              <p className="text-white/40">No FAQs match your search</p>
            </div>
          ) : (
            filteredFaqs.map((faq) => (
              <div
                key={faq.id}
                className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden"
              >
                <button
                  onClick={() => handleFaqClick(faq.id)}
                  className="w-full text-left p-4 flex items-center justify-between hover:bg-white/10 transition"
                >
                  <span className="text-sm font-semibold text-white pr-4">{faq.question}</span>
                  <span className="text-white/40 text-lg">
                    {activeFaq === faq.id ? '−' : '+'}
                  </span>
                </button>
                
                {activeFaq === faq.id && (
                  <div className="p-4 pt-0 border-t border-white/10 mt-2">
                    <p className="text-sm text-white/70 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Contact Support */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white mb-2">Still Need Help?</h2>
          <p className="text-sm text-white/60 mb-4">
            Can't find what you're looking for? Send us a message and we'll get back to you within 24 hours.
          </p>

          {formSubmitted ? (
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <p className="text-green-300 text-sm">
                ✓ Thank you for reaching out! We'll respond to your message within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <select
                  value={contactForm.category}
                  onChange={(e) => setContactForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white"
                >
                  <option value="general">General Inquiry</option>
                  <option value="technical">Technical Support</option>
                  <option value="account">Account Issues</option>
                  <option value="mentorship">Mentorship Questions</option>
                  <option value="funding">Funding Questions</option>
                </select>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Subject"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white placeholder-white/30"
                />
              </div>

              <div>
                <textarea
                  placeholder="Describe your issue or question..."
                  value={contactForm.message}
                  onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                  required
                  rows="4"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white placeholder-white/30"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#C7000B] text-white py-3 rounded-xl text-sm font-semibold hover:opacity-95 disabled:opacity-50"
              >
                {submitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          )}
        </div>

        {/* Support Info */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl border border-white/10 bg-white/5 text-center">
            <div className="text-2xl mb-2">📧</div>
            <div className="text-xs text-white/40">Email</div>
            <a href="mailto:support@businessbridged.co.za" className="text-sm text-white hover:text-[#C7000B]">
              support@businessbridged.co.za
            </a>
          </div>
          
          <div className="p-4 rounded-2xl border border-white/10 bg-white/5 text-center">
            <div className="text-2xl mb-2">📞</div>
            <div className="text-xs text-white/40">Phone</div>
            <a href="tel:+27111234567" className="text-sm text-white hover:text-[#C7000B]">
              +27 11 123 4567
            </a>
            <div className="text-[10px] text-white/30 mt-1">Mon-Fri, 9am-5pm</div>
          </div>
        </div>

        {/* Resources */}
        <div className="mt-6 p-4 rounded-2xl border border-white/10 bg-white/5">
          <h3 className="text-sm font-semibold text-white mb-2">Additional Resources</h3>
          <div className="grid grid-cols-2 gap-2">
            <button className="text-left p-2 hover:bg-white/5 rounded-xl transition">
              <div className="text-xs text-white/80">📘 User Guide</div>
              <div className="text-[10px] text-white/40">PDF Download</div>
            </button>
            <button className="text-left p-2 hover:bg-white/5 rounded-xl transition">
              <div className="text-xs text-white/80">🎥 Video Tutorials</div>
              <div className="text-[10px] text-white/40">Watch Now</div>
            </button>
            <button className="text-left p-2 hover:bg-white/5 rounded-xl transition">
              <div className="text-xs text-white/80">📊 Webinars</div>
              <div className="text-[10px] text-white/40">Upcoming Events</div>
            </button>
            <button className="text-left p-2 hover:bg-white/5 rounded-xl transition">
              <div className="text-xs text-white/80">📝 Blog</div>
              <div className="text-[10px] text-white/40">Tips & Updates</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}