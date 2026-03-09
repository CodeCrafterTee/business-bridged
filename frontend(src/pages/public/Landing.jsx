import { Link, useNavigate } from "react-router-dom"; // Added useNavigate

export default function Landing() {
  const navigate = useNavigate(); // Add this for navigation

  return (
    <div className="min-h-screen bg-[#070A0F]">
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-sm font-extrabold">
              B²
            </div>
            <div>
              <div className="text-sm font-semibold tracking-wide">
                Business Bridged
              </div>
              <div className="text-xs text-white/60">
                Funding readiness for underserved entrepreneurs
              </div>
            </div>
          </div>

          <h1 className="mt-6 text-3xl font-extrabold leading-tight">
            Your bridge to funding readiness
          </h1>

          <p className="mt-3 text-sm text-white/70">
            Build a trusted profile, complete readiness steps, and improve your business
            score over time.
          </p>

          <div className="mt-7 space-y-3">
            {/* Updated button with proper navigation */}
            <button
              onClick={() => navigate('/score-assessment')}
              className="w-full bg-gradient-to-r from-pink-600 to-[#C7000B] text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:opacity-95 transition-all shadow-lg"
            >
              ✨ Get your free B² score ✨
            </button>

            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/register"
                className="block rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white/85 hover:bg-white/10"
              >
                Create account
              </Link>
              <Link
                to="/login"
                className="block rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white/85 hover:bg-white/10"
              >
                Login
              </Link>
            </div>
          </div>

          {/* New feature highlights */}
          <div className="mt-6 grid grid-cols-2 gap-2 text-center">
            <div className="p-2 rounded-xl bg-white/5">
              <div className="text-[#C7000B] font-bold text-lg">10</div>
              <div className="text-xs text-white/60">Quick Questions</div>
            </div>
            <div className="p-2 rounded-xl bg-white/5">
              <div className="text-[#C7000B] font-bold text-lg">60s</div>
              <div className="text-xs text-white/60">Average Time</div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2 text-[11px] text-white/70">
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
              📊 Instant Score
            </span>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
              🎯 Personalized Tips
            </span>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
              🤝 Mentor Access
            </span>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
              💰 Investor Matching
            </span>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
              📈 Growth Tools
            </span>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
              🔒 Free & Anonymous
            </span>
          </div>

          {/* Testimonial / Trust builder */}
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-purple-900/20 to-[#C7000B]/20 border border-white/10">
            <p className="text-sm text-white/80 italic">
              "I got my score in 2 minutes and discovered exactly what my business needs to improve. The personalized plan was a game-changer!"
            </p>
            <p className="mt-2 text-xs text-white/40">
              — Thandi M., Soweto
            </p>
          </div>

          <div className="mt-6 text-xs text-white/55 border-t border-white/10 pt-4">
            <p className="text-center">
              🚀 Join 5,000+ entrepreneurs who've already assessed their readiness
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}