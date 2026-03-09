import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";

export default function Intake() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Form state
  const [formData, setFormData] = useState({
    // Business Information
    businessName: "",
    industry: "",
    cicpNumber: "",
    yearEstablished: "",
    businessStructure: "",
    registrationNumber: "",
    taxId: "",
    
    // Contact Information
    businessPhone: "",
    businessEmail: "",
    website: "",
    physicalAddress: "",
    postalAddress: "",
    
    // Financial Information
    annualRevenue: "",
    fixedCosts: "",
    variableCosts: "",
    bankName: "",
    accountNumber: "",
    branchCode: "",
    
    // Owner Information
    ownerFullName: "",
    ownerIdNumber: "",
    ownerPhone: "",
    ownerEmail: "",
    ownershipPercentage: "100",
    
    // Documents (will be handled by file upload)
    documents: {
      idDocument: null,
      proofOfRegistration: null,
      taxClearance: null,
      bankStatements: null,
      financialStatements: null
    }
  });

  const [formErrors, setFormErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadProgress, setUploadProgress] = useState({});

  useEffect(() => {
    fetchExistingData();
  }, []);

  const fetchExistingData = async () => {
    try {
      setLoading(true);
      
      // Get existing entrepreneur data if any
      const data = await api.get('/entrepreneur/dashboard');
      console.log('Existing data:', data);
      
      // Pre-fill form with existing data
      if (data) {
        setFormData(prev => ({
          ...prev,
          businessName: data.business_name || "",
          industry: data.industry || "",
          cicpNumber: data.cicp_number || "",
          fixedCosts: data.fixed_cost || "",
          variableCosts: data.variable_monthly_cost || "",
          // Add more fields as they become available from backend
        }));
      }
      
    } catch (err) {
      // Using the error parameter in the catch block
      console.log('No existing data found, starting fresh:', err.message);
      // 404 is expected for new users, so we don't set an error state
    } finally {
      setLoading(false);
    }
  };

  const validateStep = () => {
    const errors = {};
    
    if (currentStep === 1) {
      // Business Information validation
      if (!formData.businessName.trim()) errors.businessName = "Business name is required";
      if (!formData.industry.trim()) errors.industry = "Industry is required";
      if (!formData.cicpNumber.trim()) errors.cicpNumber = "CICP number is required";
      if (!formData.yearEstablished) errors.yearEstablished = "Year established is required";
      if (!formData.businessStructure) errors.businessStructure = "Business structure is required";
      if (!formData.registrationNumber.trim()) errors.registrationNumber = "Registration number is required";
    }
    
    if (currentStep === 2) {
      // Contact Information validation
      if (!formData.businessPhone.trim()) errors.businessPhone = "Business phone is required";
      if (!formData.businessEmail.trim()) {
        errors.businessEmail = "Business email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.businessEmail)) {
        errors.businessEmail = "Email is invalid";
      }
      if (!formData.physicalAddress.trim()) errors.physicalAddress = "Physical address is required";
    }
    
    if (currentStep === 3) {
      // Financial Information validation
      if (!formData.annualRevenue) errors.annualRevenue = "Annual revenue is required";
      if (!formData.fixedCosts) errors.fixedCosts = "Fixed costs are required";
      if (!formData.variableCosts) errors.variableCosts = "Variable costs are required";
      if (!formData.bankName.trim()) errors.bankName = "Bank name is required";
      if (!formData.accountNumber.trim()) errors.accountNumber = "Account number is required";
    }
    
    if (currentStep === 4) {
      // Owner Information validation
      if (!formData.ownerFullName.trim()) errors.ownerFullName = "Owner name is required";
      if (!formData.ownerIdNumber.trim()) errors.ownerIdNumber = "ID number is required";
      if (!formData.ownerPhone.trim()) errors.ownerPhone = "Owner phone is required";
      if (!formData.ownerEmail.trim()) {
        errors.ownerEmail = "Owner email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.ownerEmail)) {
        errors.ownerEmail = "Email is invalid";
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileUpload = async (documentType, file) => {
    if (!file) return;
    
    try {
      setUploadProgress(prev => ({ ...prev, [documentType]: 0 }));
      
      // Create form data
      const formData = new FormData();
      formData.append('document', file);
      formData.append('type', documentType);
      
      // Upload with progress tracking
      const response = await fetch('http://localhost:5000/api/entrepreneur/documents/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      if (!response.ok) throw new Error('Upload failed');
      
      const result = await response.json();
      
      setFormData(prev => ({
        ...prev,
        documents: { ...prev.documents, [documentType]: result.url }
      }));
      
      setUploadProgress(prev => ({ ...prev, [documentType]: 100 }));
      
    } catch (uploadErr) {
      // Using the error parameter
      console.error('Upload error:', uploadErr);
      setError(`Failed to upload ${documentType}: ${uploadErr.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep()) {
      return;
    }

    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
      return;
    }

    // Final submission
    try {
      setSubmitting(true);
      setError("");
      
      // Prepare data for backend
      const submissionData = {
        // Business info
        businessName: formData.businessName,
        industry: formData.industry,
        cicpNumber: formData.cicpNumber,
        yearEstablished: parseInt(formData.yearEstablished),
        businessStructure: formData.businessStructure,
        registrationNumber: formData.registrationNumber,
        taxId: formData.taxId,
        
        // Contact info
        businessPhone: formData.businessPhone,
        businessEmail: formData.businessEmail,
        website: formData.website,
        physicalAddress: formData.physicalAddress,
        postalAddress: formData.postalAddress,
        
        // Financial info
        annualRevenue: parseFloat(formData.annualRevenue),
        fixedCost: parseFloat(formData.fixedCosts),
        variableMonthlyCost: parseFloat(formData.variableCosts),
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        branchCode: formData.branchCode,
        
        // Owner info
        ownerFullName: formData.ownerFullName,
        ownerIdNumber: formData.ownerIdNumber,
        ownerPhone: formData.ownerPhone,
        ownerEmail: formData.ownerEmail,
        ownershipPercentage: parseFloat(formData.ownershipPercentage)
      };
      
      // Submit entrepreneur profile
      await api.put('/entrepreneur/profile', {
        fixedCost: submissionData.fixedCost,
        variableMonthlyCost: submissionData.variableMonthlyCost
      });
      
      // Submit compliance
      await api.post('/entrepreneur/compliance', submissionData);
      
      setSuccess("Profile submitted successfully! Redirecting to grooming...");
      
      // Redirect after success
      setTimeout(() => {
        navigate("/app/grooming");
      }, 2000);
      
    } catch (submitErr) {
      // Using the error parameter
      console.error('Submission error:', submitErr);
      setError(submitErr.message || 'Failed to submit profile');
    } finally {
      setSubmitting(false);
    }
  };

  const getStepTitle = () => {
    switch(currentStep) {
      case 1: return "Business Information";
      case 2: return "Contact Details";
      case 3: return "Financial Information";
      case 4: return "Owner Information";
      default: return "Business Intake Form";
    }
  };

  const getStepProgress = () => {
    return `${currentStep}/4`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070A0F] p-6">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-white/60">Loading your profile...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070A0F] p-6">
      <div className="max-w-2xl mx-auto">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">
                Business Intake Form
              </h1>
              <span className="text-sm text-white/40">
                Step {getStepProgress()}
              </span>
            </div>
            <p className="mt-1 text-sm text-white/60">
              {getStepTitle()}
            </p>
            
            {/* Progress bar */}
            <div className="mt-4 h-1 w-full rounded-full bg-white/10">
              <div 
                className="h-1 rounded-full bg-[#C7000B] transition-all duration-300"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              />
            </div>
          </div>

          {/* Error/Success messages */}
          {error && (
            <div className="mb-4 rounded-xl bg-red-500/20 border border-red-500 p-3 text-sm text-red-300">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 rounded-xl bg-green-500/20 border border-green-500 p-3 text-sm text-green-300">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Step 1: Business Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    className={`w-full rounded-xl border ${
                      formErrors.businessName ? 'border-red-500' : 'border-white/10'
                    } bg-black/30 px-4 py-3 text-white placeholder-white/30 focus:ring-2 focus:ring-white/20 outline-none`}
                    placeholder="e.g., Thandi's Catering"
                  />
                  {formErrors.businessName && (
                    <p className="mt-1 text-xs text-red-400">{formErrors.businessName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">
                    Industry *
                  </label>
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleInputChange}
                    className={`w-full rounded-xl border ${
                      formErrors.industry ? 'border-red-500' : 'border-white/10'
                    } bg-black/30 px-4 py-3 text-white focus:ring-2 focus:ring-white/20 outline-none`}
                  >
                    <option value="">Select industry</option>
                    <option value="Technology">Technology</option>
                    <option value="Retail">Retail</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Services">Services</option>
                    <option value="Agriculture">Agriculture</option>
                    <option value="Construction">Construction</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                  </select>
                  {formErrors.industry && (
                    <p className="mt-1 text-xs text-red-400">{formErrors.industry}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">
                    CICP Number *
                  </label>
                  <input
                    type="text"
                    name="cicpNumber"
                    value={formData.cicpNumber}
                    onChange={handleInputChange}
                    className={`w-full rounded-xl border ${
                      formErrors.cicpNumber ? 'border-red-500' : 'border-white/10'
                    } bg-black/30 px-4 py-3 text-white placeholder-white/30 focus:ring-2 focus:ring-white/20 outline-none`}
                    placeholder="e.g., CICP-2024-00123"
                  />
                  {formErrors.cicpNumber && (
                    <p className="mt-1 text-xs text-red-400">{formErrors.cicpNumber}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1">
                      Year Established *
                    </label>
                    <input
                      type="number"
                      name="yearEstablished"
                      value={formData.yearEstablished}
                      onChange={handleInputChange}
                      min="1900"
                      max={new Date().getFullYear()}
                      className={`w-full rounded-xl border ${
                        formErrors.yearEstablished ? 'border-red-500' : 'border-white/10'
                      } bg-black/30 px-4 py-3 text-white placeholder-white/30 focus:ring-2 focus:ring-white/20 outline-none`}
                      placeholder="2020"
                    />
                    {formErrors.yearEstablished && (
                      <p className="mt-1 text-xs text-red-400">{formErrors.yearEstablished}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1">
                      Business Structure *
                    </label>
                    <select
                      name="businessStructure"
                      value={formData.businessStructure}
                      onChange={handleInputChange}
                      className={`w-full rounded-xl border ${
                        formErrors.businessStructure ? 'border-red-500' : 'border-white/10'
                      } bg-black/30 px-4 py-3 text-white focus:ring-2 focus:ring-white/20 outline-none`}
                    >
                      <option value="">Select structure</option>
                      <option value="Sole Proprietorship">Sole Proprietorship</option>
                      <option value="Partnership">Partnership</option>
                      <option value="Pty Ltd">Pty Ltd</option>
                      <option value="Non-Profit">Non-Profit</option>
                      <option value="Cooperative">Cooperative</option>
                    </select>
                    {formErrors.businessStructure && (
                      <p className="mt-1 text-xs text-red-400">{formErrors.businessStructure}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">
                    Registration Number *
                  </label>
                  <input
                    type="text"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleInputChange}
                    className={`w-full rounded-xl border ${
                      formErrors.registrationNumber ? 'border-red-500' : 'border-white/10'
                    } bg-black/30 px-4 py-3 text-white placeholder-white/30 focus:ring-2 focus:ring-white/20 outline-none`}
                    placeholder="e.g., 2024/123456/07"
                  />
                  {formErrors.registrationNumber && (
                    <p className="mt-1 text-xs text-red-400">{formErrors.registrationNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">
                    Tax ID / VAT Number (Optional)
                  </label>
                  <input
                    type="text"
                    name="taxId"
                    value={formData.taxId}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder-white/30 focus:ring-2 focus:ring-white/20 outline-none"
                    placeholder="e.g., 4123456789"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Contact Details */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1">
                      Business Phone *
                    </label>
                    <input
                      type="tel"
                      name="businessPhone"
                      value={formData.businessPhone}
                      onChange={handleInputChange}
                      className={`w-full rounded-xl border ${
                        formErrors.businessPhone ? 'border-red-500' : 'border-white/10'
                      } bg-black/30 px-4 py-3 text-white placeholder-white/30 focus:ring-2 focus:ring-white/20 outline-none`}
                      placeholder="+27 11 123 4567"
                    />
                    {formErrors.businessPhone && (
                      <p className="mt-1 text-xs text-red-400">{formErrors.businessPhone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1">
                      Business Email *
                    </label>
                    <input
                      type="email"
                      name="businessEmail"
                      value={formData.businessEmail}
                      onChange={handleInputChange}
                      className={`w-full rounded-xl border ${
                        formErrors.businessEmail ? 'border-red-500' : 'border-white/10'
                      } bg-black/30 px-4 py-3 text-white placeholder-white/30 focus:ring-2 focus:ring-white/20 outline-none`}
                      placeholder="info@business.com"
                    />
                    {formErrors.businessEmail && (
                      <p className="mt-1 text-xs text-red-400">{formErrors.businessEmail}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">
                    Website (Optional)
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder-white/30 focus:ring-2 focus:ring-white/20 outline-none"
                    placeholder="https://www.example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">
                    Physical Address *
                  </label>
                  <textarea
                    name="physicalAddress"
                    value={formData.physicalAddress}
                    onChange={handleInputChange}
                    rows="3"
                    className={`w-full rounded-xl border ${
                      formErrors.physicalAddress ? 'border-red-500' : 'border-white/10'
                    } bg-black/30 px-4 py-3 text-white placeholder-white/30 focus:ring-2 focus:ring-white/20 outline-none`}
                    placeholder="Street address, city, province, postal code"
                  />
                  {formErrors.physicalAddress && (
                    <p className="mt-1 text-xs text-red-400">{formErrors.physicalAddress}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">
                    Postal Address (Optional)
                  </label>
                  <textarea
                    name="postalAddress"
                    value={formData.postalAddress}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder-white/30 focus:ring-2 focus:ring-white/20 outline-none"
                    placeholder="If different from physical address"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Financial Information */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">
                    Annual Revenue (ZAR) *
                  </label>
                  <input
                    type="number"
                    name="annualRevenue"
                    value={formData.annualRevenue}
                    onChange={handleInputChange}
                    min="0"
                    step="1000"
                    className={`w-full rounded-xl border ${
                      formErrors.annualRevenue ? 'border-red-500' : 'border-white/10'
                    } bg-black/30 px-4 py-3 text-white placeholder-white/30 focus:ring-2 focus:ring-white/20 outline-none`}
                    placeholder="500000"
                  />
                  {formErrors.annualRevenue && (
                    <p className="mt-1 text-xs text-red-400">{formErrors.annualRevenue}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1">
                      Fixed Monthly Costs (ZAR) *
                    </label>
                    <input
                      type="number"
                      name="fixedCosts"
                      value={formData.fixedCosts}
                      onChange={handleInputChange}
                      min="0"
                      step="1000"
                      className={`w-full rounded-xl border ${
                        formErrors.fixedCosts ? 'border-red-500' : 'border-white/10'
                      } bg-black/30 px-4 py-3 text-white placeholder-white/30 focus:ring-2 focus:ring-white/20 outline-none`}
                      placeholder="25000"
                    />
                    {formErrors.fixedCosts && (
                      <p className="mt-1 text-xs text-red-400">{formErrors.fixedCosts}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1">
                      Variable Monthly Costs (ZAR) *
                    </label>
                    <input
                      type="number"
                      name="variableCosts"
                      value={formData.variableCosts}
                      onChange={handleInputChange}
                      min="0"
                      step="1000"
                      className={`w-full rounded-xl border ${
                        formErrors.variableCosts ? 'border-red-500' : 'border-white/10'
                      } bg-black/30 px-4 py-3 text-white placeholder-white/30 focus:ring-2 focus:ring-white/20 outline-none`}
                      placeholder="15000"
                    />
                    {formErrors.variableCosts && (
                      <p className="mt-1 text-xs text-red-400">{formErrors.variableCosts}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">
                    Bank Name *
                  </label>
                  <select
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleInputChange}
                    className={`w-full rounded-xl border ${
                      formErrors.bankName ? 'border-red-500' : 'border-white/10'
                    } bg-black/30 px-4 py-3 text-white focus:ring-2 focus:ring-white/20 outline-none`}
                  >
                    <option value="">Select bank</option>
                    <option value="FNB">FNB</option>
                    <option value="Standard Bank">Standard Bank</option>
                    <option value="Absa">Absa</option>
                    <option value="Nedbank">Nedbank</option>
                    <option value="Capitec">Capitec</option>
                    <option value="Other">Other</option>
                  </select>
                  {formErrors.bankName && (
                    <p className="mt-1 text-xs text-red-400">{formErrors.bankName}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1">
                      Account Number *
                    </label>
                    <input
                      type="text"
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleInputChange}
                      className={`w-full rounded-xl border ${
                        formErrors.accountNumber ? 'border-red-500' : 'border-white/10'
                      } bg-black/30 px-4 py-3 text-white placeholder-white/30 focus:ring-2 focus:ring-white/20 outline-none`}
                      placeholder="123456789"
                    />
                    {formErrors.accountNumber && (
                      <p className="mt-1 text-xs text-red-400">{formErrors.accountNumber}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1">
                      Branch Code (Optional)
                    </label>
                    <input
                      type="text"
                      name="branchCode"
                      value={formData.branchCode}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder-white/30 focus:ring-2 focus:ring-white/20 outline-none"
                      placeholder="250655"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Owner Information */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-white/80 mb-1">
                      Owner Full Name *
                    </label>
                    <input
                      type="text"
                      name="ownerFullName"
                      value={formData.ownerFullName}
                      onChange={handleInputChange}
                      className={`w-full rounded-xl border ${
                        formErrors.ownerFullName ? 'border-red-500' : 'border-white/10'
                      } bg-black/30 px-4 py-3 text-white placeholder-white/30 focus:ring-2 focus:ring-white/20 outline-none`}
                      placeholder="As per ID document"
                    />
                    {formErrors.ownerFullName && (
                      <p className="mt-1 text-xs text-red-400">{formErrors.ownerFullName}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1">
                      ID / Passport Number *
                    </label>
                    <input
                      type="text"
                      name="ownerIdNumber"
                      value={formData.ownerIdNumber}
                      onChange={handleInputChange}
                      className={`w-full rounded-xl border ${
                        formErrors.ownerIdNumber ? 'border-red-500' : 'border-white/10'
                      } bg-black/30 px-4 py-3 text-white placeholder-white/30 focus:ring-2 focus:ring-white/20 outline-none`}
                      placeholder="9001011234088"
                    />
                    {formErrors.ownerIdNumber && (
                      <p className="mt-1 text-xs text-red-400">{formErrors.ownerIdNumber}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1">
                      Ownership Percentage *
                    </label>
                    <input
                      type="number"
                      name="ownershipPercentage"
                      value={formData.ownershipPercentage}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      step="1"
                      className={`w-full rounded-xl border ${
                        formErrors.ownershipPercentage ? 'border-red-500' : 'border-white/10'
                      } bg-black/30 px-4 py-3 text-white placeholder-white/30 focus:ring-2 focus:ring-white/20 outline-none`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1">
                      Owner Phone *
                    </label>
                    <input
                      type="tel"
                      name="ownerPhone"
                      value={formData.ownerPhone}
                      onChange={handleInputChange}
                      className={`w-full rounded-xl border ${
                        formErrors.ownerPhone ? 'border-red-500' : 'border-white/10'
                      } bg-black/30 px-4 py-3 text-white placeholder-white/30 focus:ring-2 focus:ring-white/20 outline-none`}
                      placeholder="+27 82 123 4567"
                    />
                    {formErrors.ownerPhone && (
                      <p className="mt-1 text-xs text-red-400">{formErrors.ownerPhone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1">
                      Owner Email *
                    </label>
                    <input
                      type="email"
                      name="ownerEmail"
                      value={formData.ownerEmail}
                      onChange={handleInputChange}
                      className={`w-full rounded-xl border ${
                        formErrors.ownerEmail ? 'border-red-500' : 'border-white/10'
                      } bg-black/30 px-4 py-3 text-white placeholder-white/30 focus:ring-2 focus:ring-white/20 outline-none`}
                      placeholder="owner@email.com"
                    />
                    {formErrors.ownerEmail && (
                      <p className="mt-1 text-xs text-red-400">{formErrors.ownerEmail}</p>
                    )}
                  </div>
                </div>

                {/* Document Upload Section */}
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-white/80 mb-3">Required Documents</h3>
                  <div className="space-y-3">
                    {[
                      { key: 'idDocument', label: 'ID Document / Passport' },
                      { key: 'proofOfRegistration', label: 'Proof of Business Registration' },
                      { key: 'taxClearance', label: 'Tax Clearance Certificate' },
                      { key: 'bankStatements', label: 'Last 3 Months Bank Statements' },
                      { key: 'financialStatements', label: 'Financial Statements (if available)' }
                    ].map((doc) => (
                      <div key={doc.key} className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-black/25">
                        <span className="text-sm text-white/70">{doc.label}</span>
                        <div className="flex items-center gap-2">
                          {formData.documents[doc.key] && (
                            <span className="text-xs text-green-400">✓ Uploaded</span>
                          )}
                          {uploadProgress[doc.key] === 100 ? (
                            <span className="text-xs text-green-400">Complete</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.onchange = (e) => {
                                  const file = e.target.files[0];
                                  if (file) handleFileUpload(doc.key, file);
                                };
                                input.click();
                              }}
                              className="text-xs bg-[#C7000B] px-3 py-1 rounded-full text-white hover:opacity-90"
                            >
                              Upload
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-4">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-white/80 hover:bg-white/10"
                >
                  Back
                </button>
              )}
              
              <button
                type="submit"
                disabled={submitting}
                className={`flex-1 rounded-xl bg-[#C7000B] py-3 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-50 ${
                  currentStep === 1 ? 'w-full' : ''
                }`}
              >
                {submitting ? "Submitting..." : 
                 currentStep === 4 ? "Submit Application" : "Next Step"}
              </button>
            </div>
          </form>

          {/* Help Text */}
          <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <p className="text-xs text-blue-300/80">
              <span className="font-semibold">🔒 Secure Information:</span> All information provided is encrypted and stored securely. 
              This information helps us verify your business and assess your readiness for funding.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}