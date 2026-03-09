import { useState } from "react";
import { useNavigate } from "react-router-dom";

const STEPS = [
  { title: "Business details" },
  { title: "Costs for risk check" },
  { title: "Proof and history" },
  { title: "Review" },
];

export default function Start() {
  const nav = useNavigate();
  const [step, setStep] = useState(0);

  const [form, setForm] = useState({
    businessName: "",
    category: "Trading",
    industry: "",
    monthlyRevenue: "",
    fixedCosts: "",
    variableCosts: "",
    yearsOperating: "0-1",
    location: "",
  });

  const progress = Math.round(((step + 1) / STEPS.length) * 100);

  const next = () => setStep((s) => Math.min(STEPS.length - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  const saveAndContinue = () => {
    localStorage.setItem("b2_intake", JSON.stringify(form));
    // If user is logged in, go to app. If not, go register.
    const token = localStorage.getItem("b2_token");
    nav(token ? "/app/dashboard" : "/register");
  };

  return (
    <div className="min-h-screen bg-[#070A0F]">
      <div className="max-w-md mx-auto px-4 py-10">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between">
            <div className="text-xs text-white/60">
              Step {step + 1} of {STEPS.length}
            </div>
            <div className="text-xs text-white/60">{progress}%</div>
          </div>

          <div className="mt-3 h-2 w-full rounded-full bg-white/10">
            <div
              className="h-2 rounded-full bg-white/70"
              style={{ width: '${progress}%' }}
            />
          </div>

          <h1 className="mt-4 text-xl font-bold">{STEPS[step].title}</h1>
          <p className="mt-1 text-sm text-white/60">
            Complete the intake to generate your initial business score.
          </p>

          <div className="mt-6 space-y-4">
            {step === 0 && (
              <>
                <Field label="Business name">
                  <input
                    value={form.businessName}
                    onChange={(e) =>
                      setForm({ ...form, businessName: e.target.value })
                    }
                    className={inputClass}
                    placeholder="Business name"
                  />
                </Field>

                <Field label="Category">
                  <div className="mt-2 flex gap-2">
                    {["Trading", "Services", "Other"].map((x) => (
                      <button
                        type="button"
                        key={x}
                        onClick={() => setForm({ ...form, category: x })}
                        className={`flex-1 rounded-2xl border px-3 py-2 text-xs font-semibold ${
                          form.category === x
                            ? "border-white bg-white text-black"
                            : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                        }`}
                      >
                        {x}
                      </button>
                    ))}
                  </div>
                </Field>

                <Field label="Industry">
                  <input
                    value={form.industry}
                    onChange={(e) =>
                      setForm({ ...form, industry: e.target.value })
                    }
                    className={inputClass}
                    placeholder="e.g. Food, Retail, Construction"
                  />
                </Field>

                <Field label="Location">
                  <input
                    value={form.location}
                    onChange={(e) =>
                      setForm({ ...form, location: e.target.value })
                    }
                    className={inputClass}
                    placeholder="City / Township / Village"
                  />
                </Field>
              </>
            )}

            {step === 1 && (
              <>
                <Field label="Average monthly revenue (optional)">
                  <input
                    type="number"
                    value={form.monthlyRevenue}
                    onChange={(e) =>
                      setForm({ ...form, monthlyRevenue: e.target.value })
                    }
                    className={inputClass}
                    placeholder="e.g. 8000"
                  />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Fixed costs">
                    <input
                      type="number"
                      value={form.fixedCosts}
                      onChange={(e) =>
                        setForm({ ...form, fixedCosts: e.target.value })
                      }
                      className={inputClass}
                      placeholder="e.g. 1500"
                    />
                  </Field>

                  <Field label="Variable costs">
                    <input
                      type="number"
                      value={form.variableCosts}
                      onChange={(e) =>
                        setForm({ ...form, variableCosts: e.target.value })
                      }
                      className={inputClass}
                      placeholder="e.g. 3500"
                    />
                  </Field>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-xs text-white/65">
                  This information supports the risk check and readiness calculations.
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <Field label="Years operating">
                  <select
                    value={form.yearsOperating}
                    onChange={(e) =>
                      setForm({ ...form, yearsOperating: e.target.value })
                    }
                    className={inputClass}
                  >
                    <option value="0-1">0–1 years</option>
                    <option value="1-3">1–3 years</option>
                    <option value="3-5">3–5 years</option>
                    <option value="5+">5+ years</option>
                  </select>
                </Field>

                <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-white/70">
                  Proof uploads are available in the Documents section after account setup.
                </div>
              </>
            )}

            {step === 3 && (
              <div className="space-y-2 rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-white/80">
                <SummaryRow label="Business name" value={form.businessName || "Not set"} />
                <SummaryRow label="Category" value={form.category} />
                <SummaryRow label="Industry" value={form.industry || "Not set"} />
                <SummaryRow label="Location" value={form.location || "Not set"} />
                <SummaryRow label="Monthly revenue" value={form.monthlyRevenue || "Not provided"} />
                <SummaryRow label="Fixed costs" value={form.fixedCosts || "Not provided"} />
                <SummaryRow label="Variable costs" value={form.variableCosts || "Not provided"} />
                <SummaryRow label="Years operating" value={form.yearsOperating} />
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-2">
            <button
              type="button"
              onClick={back}
              disabled={step === 0}
              className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-white/85 disabled:opacity-60"
            >
              Back
            </button>

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={next}
                className="flex-1 rounded-2xl bg-[#C7000B] py-3 text-sm font-semibold text-white hover:opacity-95"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={saveAndContinue}
                className="flex-1 rounded-2xl bg-white py-3 text-sm font-semibold text-black hover:opacity-95"
              >
                Continue
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:ring-2 focus:ring-white/20";

function Field({ label, children }) {
  return (
    <label className="block">
      <div className="text-xs font-semibold text-white/70">{label}</div>
      {children}
    </label>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="text-white/60">{label}</div>
      <div className="font-semibold text-white text-right">{value}</div>
    </div>
  );
}