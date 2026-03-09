import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Contact() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "general",
    subject: "",
    message: "",
    priority: "normal"
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setSubmitted(true);
      setSubmitting(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        category: "general",
        subject: "",
        message: "",
        priority: "normal"
      });
      
      // Reset success message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#070A0F] p-6 pb-20">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="text-white/40 hover:text-white/60"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-white">Contact Us</h1>
          <div className="w-8"></div>
        </div>

        {/* Success Message */}
        {submitted && (
          <div className="mb-4 rounded-xl bg-green-500/20 border border-green-500 p-4">
            <p className="text-green-300 text-sm">
              ✓ Thank you for reaching out! We'll get back to you within 24 hours.
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-xl bg-red-500/20 border border-red-500 p-4">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Main Contact Card */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Send us a Message</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name and Email */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-white/40 mb-1">Your Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white placeholder-white/30"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white placeholder-white/30"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            {/* Phone (Optional) */}
            <div>
              <label className="block text-xs text-white/40 mb-1">Phone Number (Optional)</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white placeholder-white/30"
                placeholder="+27 XX XXX XXXX"
              />
            </div>

            {/* Category and Priority */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-white/40 mb-1">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white"
                >
                  <option value="general">General Inquiry</option>
                  <option value="technical">Technical Support</option>
                  <option value="account">Account Issues</option>
                  <option value="mentorship">Mentorship</option>
                  <option value="funding">Funding</option>
                  <option value="partnership">Partnership Opportunities</option>
                  <option value="feedback">Feedback</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white"
                >
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs text-white/40 mb-1">Subject *</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white placeholder-white/30"
                placeholder="Brief summary of your inquiry"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs text-white/40 mb-1">Message *</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="5"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white placeholder-white/30"
                placeholder="Please provide as much detail as possible..."
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#C7000B] text-white py-3 rounded-xl text-sm font-semibold hover:opacity-95 disabled:opacity-50"
            >
              {submitting ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>

        {/* Contact Information */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C7000B]/20 flex items-center justify-center text-xl">
                📧
              </div>
              <div>
                <div className="text-xs text-white/40">Email Us</div>
                <a href="mailto:support@businessbridged.co.za" className="text-sm text-white hover:text-[#C7000B]">
                  support@businessbridged.co.za
                </a>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C7000B]/20 flex items-center justify-center text-xl">
                📞
              </div>
              <div>
                <div className="text-xs text-white/40">Call Us</div>
                <a href="tel:+27111234567" className="text-sm text-white hover:text-[#C7000B]">
                  +27 11 123 4567
                </a>
                <div className="text-[10px] text-white/30">Mon-Fri, 9am-5pm</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C7000B]/20 flex items-center justify-center text-xl">
                💬
              </div>
              <div>
                <div className="text-xs text-white/40">Live Chat</div>
                <div className="text-sm text-white">Available soon</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C7000B]/20 flex items-center justify-center text-xl">
                📍
              </div>
              <div>
                <div className="text-xs text-white/40">Office</div>
                <div className="text-sm text-white">Johannesburg, SA</div>
              </div>
            </div>
          </div>
        </div>

        {/* Office Hours */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h3 className="text-sm font-semibold text-white mb-2">Office Hours</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <div className="text-xs text-white/40">Monday - Friday</div>
              <div className="text-white">9:00 AM - 5:00 PM</div>
            </div>
            <div>
              <div className="text-xs text-white/40">Saturday - Sunday</div>
              <div className="text-white">Closed</div>
            </div>
          </div>
          <p className="mt-3 text-xs text-white/30">
            We aim to respond to all inquiries within 24 hours during business days.
          </p>
        </div>

        {/* Social Media Links */}
        <div className="mt-6 flex justify-center gap-4">
          <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-[#C7000B] transition">
            𝕏
          </a>
          <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-[#C7000B] transition">
            in
          </a>
          <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-[#C7000B] transition">
            fb
          </a>
          <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-[#C7000B] transition">
            ig
          </a>
        </div>
      </div>
    </div>
  );
}