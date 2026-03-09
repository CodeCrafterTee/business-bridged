import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";

export default function FunderProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Organization Details
  const [profile, setProfile] = useState({
    organizationName: "",
    registrationNumber: "",
    yearFounded: "",
    website: "",
    logo: "",
    description: "",
    mission: "",
    teamSize: "",
    officeLocation: ""
  });

  // Investment Criteria
  const [criteria, setCriteria] = useState({
    minInvestment: "",
    maxInvestment: "",
    preferredIndustries: [],
    excludedIndustries: [],
    minReadinessScore: 70,
    requiredStages: [],
    investmentTypes: [],
    geographicFocus: [],
    minRevenue: "",
    maxRevenue: "",
    minEmployees: "",
    maxEmployees: "",
    yearsInBusiness: "",
    requiresProfitability: false,
    requiresCollateral: false,
    requiresPersonalGuarantee: false
  });

  // Funding Preferences
  const [preferences, setPreferences] = useState({
    fundingTypes: [],
    equityRange: { min: 0, max: 100 },
    debtRange: { min: 0, max: 100 },
    grantRange: { min: 0, max: 100 },
    preferredDurations: [],
    expectedROI: "",
    exitPreferences: []
  });

  // Portfolio Stats
  const [portfolio, setPortfolio] = useState({
    totalInvested: 0,
    numberOfInvestments: 0,
    industriesInvested: [],
    averageTicketSize: 0,
    successfulExits: 0,
    activeInvestments: 0
  });

  // Available options for selects
  const industryOptions = [
    "Technology", "Retail", "Manufacturing", "Services", 
    "Agriculture", "Construction", "Healthcare", "Education",
    "Financial Services", "Media", "Transportation", "Energy",
    "Hospitality", "Real Estate", "Non-Profit", "Social Enterprise"
  ];

  const stageOptions = [
    "Stage 1 — Onboarding",
    "Stage 2 — In Progress",
    "Stage 2 — Structured",
    "Stage 3 — Investment Ready"
  ];

  const investmentTypeOptions = [
    "Equity", "Debt", "Convertible Note", "Grant", "Revenue-Based Financing"
  ];

  const geographicOptions = [
    "Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape",
    "Free State", "Limpopo", "Mpumalanga", "North West",
    "Northern Cape", "Nationwide", "Africa", "Global"
  ];

  const durationOptions = [
    "Short-term (1-2 years)", "Medium-term (3-5 years)", "Long-term (5+ years)"
  ];

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Try to fetch real profile data
      try {
        const data = await api.get('/funder/profile');
        console.log('Funder profile:', data);
        
        if (data) {
          setProfile({
            organizationName: data.organization_name || "",
            registrationNumber: data.registration_number || "",
            yearFounded: data.year_founded || "",
            website: data.website || "",
            logo: data.logo || "",
            description: data.description || "",
            mission: data.mission || "",
            teamSize: data.team_size || "",
            officeLocation: data.office_location || ""
          });

          setCriteria({
            minInvestment: data.min_investment || "",
            maxInvestment: data.max_investment || "",
            preferredIndustries: data.preferred_industries || [],
            excludedIndustries: data.excluded_industries || [],
            minReadinessScore: data.min_readiness_score || 70,
            requiredStages: data.required_stages || [],
            investmentTypes: data.investment_types || [],
            geographicFocus: data.geographic_focus || [],
            minRevenue: data.min_revenue || "",
            maxRevenue: data.max_revenue || "",
            minEmployees: data.min_employees || "",
            maxEmployees: data.max_employees || "",
            yearsInBusiness: data.years_in_business || "",
            requiresProfitability: data.requires_profitability || false,
            requiresCollateral: data.requires_collateral || false,
            requiresPersonalGuarantee: data.requires_personal_guarantee || false
          });

          setPreferences({
            fundingTypes: data.funding_types || [],
            equityRange: data.equity_range || { min: 0, max: 100 },
            debtRange: data.debt_range || { min: 0, max: 100 },
            grantRange: data.grant_range || { min: 0, max: 100 },
            preferredDurations: data.preferred_durations || [],
            expectedROI: data.expected_roi || "",
            exitPreferences: data.exit_preferences || []
          });

          setPortfolio({
            totalInvested: data.total_invested || 0,
            numberOfInvestments: data.number_of_investments || 0,
            industriesInvested: data.industries_invested || [],
            averageTicketSize: data.average_ticket_size || 0,
            successfulExits: data.successful_exits || 0,
            activeInvestments: data.active_investments || 0
          });
        }
      } catch (profileErr) {
        console.log('Using mock profile data:', profileErr.message);
        // Mock data for demonstration
        setProfile({
          organizationName: "VCC Growth Fund",
          registrationNumber: "2020/123456/07",
          yearFounded: "2020",
          website: "www.vccgrowth.co.za",
          logo: "📈",
          description: "VCC Growth Fund is a venture capital firm focused on early-stage businesses with high growth potential in South Africa.",
          mission: "To empower the next generation of South African entrepreneurs by providing capital, mentorship, and strategic guidance.",
          teamSize: "12",
          officeLocation: "Johannesburg, Gauteng"
        });

        setCriteria({
          minInvestment: 500000,
          maxInvestment: 5000000,
          preferredIndustries: ["Technology", "Retail"],
          excludedIndustries: ["Gambling", "Tobacco"],
          minReadinessScore: 70,
          requiredStages: ["Stage 2 — Structured", "Stage 3 — Investment Ready"],
          investmentTypes: ["Equity", "Convertible Note"],
          geographicFocus: ["Gauteng", "Western Cape"],
          minRevenue: 1000000,
          maxRevenue: 20000000,
          minEmployees: 5,
          maxEmployees: 50,
          yearsInBusiness: "2+ years",
          requiresProfitability: false,
          requiresCollateral: false,
          requiresPersonalGuarantee: false
        });

        setPreferences({
          fundingTypes: ["Equity", "Convertible Note"],
          equityRange: { min: 10, max: 30 },
          debtRange: { min: 0, max: 0 },
          grantRange: { min: 0, max: 0 },
          preferredDurations: ["Medium-term (3-5 years)"],
          expectedROI: "25-30%",
          exitPreferences: ["Acquisition", "IPO"]
        });

        setPortfolio({
          totalInvested: 25000000,
          numberOfInvestments: 12,
          industriesInvested: ["Technology", "Retail", "Fintech"],
          averageTicketSize: 2080000,
          successfulExits: 3,
          activeInvestments: 9
        });
      }
      
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleCriteriaChange = (field, value) => {
    setCriteria(prev => ({ ...prev, [field]: value }));
  };

  const handlePreferencesChange = (field, value) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };

  const handleMultiSelect = (field, value, category) => {
    if (category === 'criteria') {
      setCriteria(prev => ({
        ...prev,
        [field]: prev[field].includes(value)
          ? prev[field].filter(item => item !== value)
          : [...prev[field], value]
      }));
    } else if (category === 'preferences') {
      setPreferences(prev => ({
        ...prev,
        [field]: prev[field].includes(value)
          ? prev[field].filter(item => item !== value)
          : [...prev[field], value]
      }));
    }
  };

  const handleSave = async () => {
    try {
      setSubmitting(true);
      setError("");
      setSuccess("");
      
      // Prepare data for API
      const profileData = {
        organization_name: profile.organizationName,
        registration_number: profile.registrationNumber,
        year_founded: profile.yearFounded,
        website: profile.website,
        logo: profile.logo,
        description: profile.description,
        mission: profile.mission,
        team_size: profile.teamSize,
        office_location: profile.officeLocation,
        
        min_investment: criteria.minInvestment,
        max_investment: criteria.maxInvestment,
        preferred_industries: criteria.preferredIndustries,
        excluded_industries: criteria.excludedIndustries,
        min_readiness_score: criteria.minReadinessScore,
        required_stages: criteria.requiredStages,
        investment_types: criteria.investmentTypes,
        geographic_focus: criteria.geographicFocus,
        min_revenue: criteria.minRevenue,
        max_revenue: criteria.maxRevenue,
        min_employees: criteria.minEmployees,
        max_employees: criteria.maxEmployees,
        years_in_business: criteria.yearsInBusiness,
        requires_profitability: criteria.requiresProfitability,
        requires_collateral: criteria.requiresCollateral,
        requires_personal_guarantee: criteria.requiresPersonalGuarantee,
        
        funding_types: preferences.fundingTypes,
        equity_range: preferences.equityRange,
        debt_range: preferences.debtRange,
        grant_range: preferences.grantRange,
        preferred_durations: preferences.preferredDurations,
        expected_roi: preferences.expectedROI,
        exit_preferences: preferences.exitPreferences
      };

      // Try to save via API
      try {
        await api.put('/funder/profile', profileData);
        setSuccess("Profile updated successfully!");
      } catch (saveErr) {
        console.log('Save endpoint not available - simulating:', saveErr.message);
        setTimeout(() => {
          setSuccess("Profile updated successfully! (Demo mode)");
        }, 1000);
      }
      
      setIsEditing(false);
      
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070A0F] p-6">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-white/60">Loading investment profile...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070A0F] p-6 pb-20">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/app/funder')}
            className="text-white/40 hover:text-white/60"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-white">Investment Profile</h1>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-[#C7000B] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-95"
            >
              Edit Profile
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="border border-white/10 text-white/80 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-white/10"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Success/Error Messages */}
        {error && (
          <div className="mb-4 rounded-xl bg-red-500/20 border border-red-500 p-3 text-red-300 text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 rounded-xl bg-green-500/20 border border-green-500 p-3 text-green-300 text-sm">
            {success}
          </div>
        )}

        {/* Organization Overview */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-[#C7000B]/20 flex items-center justify-center text-3xl">
              {profile.logo || "🏢"}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{profile.organizationName}</h2>
              <p className="text-sm text-white/60">{profile.officeLocation}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <DetailField
              label="Registration Number"
              value={profile.registrationNumber}
              editing={isEditing}
              onChange={(val) => handleProfileChange('registrationNumber', val)}
            />
            <DetailField
              label="Year Founded"
              value={profile.yearFounded}
              editing={isEditing}
              onChange={(val) => handleProfileChange('yearFounded', val)}
            />
            <DetailField
              label="Website"
              value={profile.website}
              editing={isEditing}
              onChange={(val) => handleProfileChange('website', val)}
              type="url"
            />
            <DetailField
              label="Team Size"
              value={profile.teamSize}
              editing={isEditing}
              onChange={(val) => handleProfileChange('teamSize', val)}
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm text-white/40 mb-1">Description</label>
            {isEditing ? (
              <textarea
                value={profile.description}
                onChange={(e) => handleProfileChange('description', e.target.value)}
                rows="3"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white"
              />
            ) : (
              <p className="text-white/80">{profile.description}</p>
            )}
          </div>

          <div className="mt-4">
            <label className="block text-sm text-white/40 mb-1">Mission</label>
            {isEditing ? (
              <textarea
                value={profile.mission}
                onChange={(e) => handleProfileChange('mission', e.target.value)}
                rows="2"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white"
              />
            ) : (
              <p className="text-white/80 italic">{profile.mission}</p>
            )}
          </div>
        </div>

        {/* Portfolio Stats */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Portfolio Overview</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatBox
              label="Total Invested"
              value={formatCurrency(portfolio.totalInvested)}
            />
            <StatBox
              label="Number of Investments"
              value={portfolio.numberOfInvestments}
            />
            <StatBox
              label="Average Ticket"
              value={formatCurrency(portfolio.averageTicketSize)}
            />
            <StatBox
              label="Active Investments"
              value={portfolio.activeInvestments}
            />
            <StatBox
              label="Successful Exits"
              value={portfolio.successfulExits}
            />
            <StatBox
              label="Industries"
              value={portfolio.industriesInvested.join(', ')}
            />
          </div>
        </div>

        {/* Investment Criteria */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Investment Criteria</h2>

          <div className="space-y-4">
            {/* Investment Range */}
            <div className="grid md:grid-cols-2 gap-4">
              <DetailField
                label="Minimum Investment (ZAR)"
                value={criteria.minInvestment}
                editing={isEditing}
                onChange={(val) => handleCriteriaChange('minInvestment', val)}
                type="number"
                prefix="R"
              />
              <DetailField
                label="Maximum Investment (ZAR)"
                value={criteria.maxInvestment}
                editing={isEditing}
                onChange={(val) => handleCriteriaChange('maxInvestment', val)}
                type="number"
                prefix="R"
              />
            </div>

            {/* Revenue Range */}
            <div className="grid md:grid-cols-2 gap-4">
              <DetailField
                label="Minimum Annual Revenue"
                value={criteria.minRevenue}
                editing={isEditing}
                onChange={(val) => handleCriteriaChange('minRevenue', val)}
                type="number"
                prefix="R"
              />
              <DetailField
                label="Maximum Annual Revenue"
                value={criteria.maxRevenue}
                editing={isEditing}
                onChange={(val) => handleCriteriaChange('maxRevenue', val)}
                type="number"
                prefix="R"
              />
            </div>

            {/* Employee Range */}
            <div className="grid md:grid-cols-2 gap-4">
              <DetailField
                label="Minimum Employees"
                value={criteria.minEmployees}
                editing={isEditing}
                onChange={(val) => handleCriteriaChange('minEmployees', val)}
                type="number"
              />
              <DetailField
                label="Maximum Employees"
                value={criteria.maxEmployees}
                editing={isEditing}
                onChange={(val) => handleCriteriaChange('maxEmployees', val)}
                type="number"
              />
            </div>

            {/* Readiness Score */}
            <div>
              <label className="block text-sm text-white/40 mb-2">Minimum Readiness Score</label>
              {isEditing ? (
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="50"
                    max="95"
                    step="5"
                    value={criteria.minReadinessScore}
                    onChange={(e) => handleCriteriaChange('minReadinessScore', Number(e.target.value))}
                    className="flex-1 accent-[#C7000B]"
                  />
                  <span className="text-white font-bold text-lg">{criteria.minReadinessScore}</span>
                </div>
              ) : (
                <p className="text-white font-semibold">{criteria.minReadinessScore}</p>
              )}
            </div>

            {/* Years in Business */}
            <DetailField
              label="Years in Business Required"
              value={criteria.yearsInBusiness}
              editing={isEditing}
              onChange={(val) => handleCriteriaChange('yearsInBusiness', val)}
            />

            {/* Preferred Industries */}
            <MultiSelect
              label="Preferred Industries"
              options={industryOptions}
              selected={criteria.preferredIndustries}
              editing={isEditing}
              onToggle={(value) => handleMultiSelect('preferredIndustries', value, 'criteria')}
            />

            {/* Required Stages */}
            <MultiSelect
              label="Required Business Stages"
              options={stageOptions}
              selected={criteria.requiredStages}
              editing={isEditing}
              onToggle={(value) => handleMultiSelect('requiredStages', value, 'criteria')}
            />

            {/* Geographic Focus */}
            <MultiSelect
              label="Geographic Focus"
              options={geographicOptions}
              selected={criteria.geographicFocus}
              editing={isEditing}
              onToggle={(value) => handleMultiSelect('geographicFocus', value, 'criteria')}
            />

            {/* Checkboxes */}
            <div className="space-y-2">
              <Checkbox
                label="Requires Profitability"
                checked={criteria.requiresProfitability}
                editing={isEditing}
                onChange={(val) => handleCriteriaChange('requiresProfitability', val)}
              />
              <Checkbox
                label="Requires Collateral"
                checked={criteria.requiresCollateral}
                editing={isEditing}
                onChange={(val) => handleCriteriaChange('requiresCollateral', val)}
              />
              <Checkbox
                label="Requires Personal Guarantee"
                checked={criteria.requiresPersonalGuarantee}
                editing={isEditing}
                onChange={(val) => handleCriteriaChange('requiresPersonalGuarantee', val)}
              />
            </div>
          </div>
        </div>

        {/* Funding Preferences */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Funding Preferences</h2>

          <div className="space-y-4">
            {/* Investment Types */}
            <MultiSelect
              label="Investment Types"
              options={investmentTypeOptions}
              selected={preferences.fundingTypes}
              editing={isEditing}
              onToggle={(value) => handleMultiSelect('fundingTypes', value, 'preferences')}
            />

            {/* Preferred Durations */}
            <MultiSelect
              label="Preferred Investment Durations"
              options={durationOptions}
              selected={preferences.preferredDurations}
              editing={isEditing}
              onToggle={(value) => handleMultiSelect('preferredDurations', value, 'preferences')}
            />

            {/* Expected ROI */}
            <DetailField
              label="Expected ROI"
              value={preferences.expectedROI}
              editing={isEditing}
              onChange={(val) => handlePreferencesChange('expectedROI', val)}
              placeholder="e.g., 25-30%"
            />

            {/* Exit Preferences */}
            <DetailField
              label="Exit Preferences"
              value={preferences.exitPreferences.join(', ')}
              editing={false}
            />
          </div>
        </div>

        {/* Save Button */}
        {isEditing && (
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={submitting}
              className="bg-[#C7000B] text-white px-8 py-3 rounded-xl text-sm font-semibold hover:opacity-95 disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save All Changes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper Components
function DetailField({ label, value, editing, onChange, type = "text", placeholder, prefix }) {
  return (
    <div>
      <label className="block text-sm text-white/40 mb-1">{label}</label>
      {editing ? (
        <div className="relative">
          {prefix && <span className="absolute left-3 top-2 text-white/40">{prefix}</span>}
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white ${prefix ? 'pl-8' : ''}`}
          />
        </div>
      ) : (
        <p className="text-white font-semibold">{prefix ? `${prefix} ${value}` : value || 'Not set'}</p>
      )}
    </div>
  );
}

function MultiSelect({ label, options, selected, editing, onToggle }) {
  return (
    <div>
      <label className="block text-sm text-white/40 mb-2">{label}</label>
      {editing ? (
        <div className="flex flex-wrap gap-2">
          {options.map(option => (
            <button
              key={option}
              onClick={() => onToggle(option)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                selected.includes(option)
                  ? 'bg-[#C7000B] text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {selected.length > 0 ? (
            selected.map(item => (
              <span key={item} className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs">
                {item}
              </span>
            ))
          ) : (
            <p className="text-white/40 text-sm">None selected</p>
          )}
        </div>
      )}
    </div>
  );
}

function Checkbox({ label, checked, editing, onChange }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      {editing ? (
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="w-4 h-4 accent-[#C7000B]"
        />
      ) : (
        <span className={`w-4 h-4 rounded flex items-center justify-center text-xs ${
          checked ? 'bg-[#C7000B] text-white' : 'bg-white/10 text-transparent'
        }`}>
          {checked && '✓'}
        </span>
      )}
      <span className="text-sm text-white/80">{label}</span>
    </label>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="p-3 rounded-xl bg-black/25">
      <div className="text-xs text-white/40">{label}</div>
      <div className="text-sm font-semibold text-white mt-1">{value}</div>
    </div>
  );
}