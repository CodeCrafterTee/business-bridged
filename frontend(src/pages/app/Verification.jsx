import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";

export default function Verification() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [verificationData, setVerificationData] = useState({
    status: "pending",
    documents: [],
    submittedDate: "",
    estimatedCompletion: "",
    comments: ""
  });

  // Mock data for demonstration
  const mockVerificationData = {
    status: "in_progress", // pending, in_progress, approved, rejected
    documents: [
      { name: "ID Document", status: "approved", submittedDate: "2024-03-01" },
      { name: "Business Registration", status: "approved", submittedDate: "2024-03-01" },
      { name: "Tax Clearance", status: "pending", submittedDate: "2024-03-01" },
      { name: "Bank Statements", status: "reviewing", submittedDate: "2024-03-01" }
    ],
    submittedDate: "2024-03-01",
    estimatedCompletion: "2024-03-15",
    comments: "Your tax clearance certificate is being verified with SARS. This may take 3-5 business days."
  };

  useEffect(() => {
    fetchVerificationStatus();
  }, []);

  const fetchVerificationStatus = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Try to fetch real verification data
      try {
        const data = await api.get('/entrepreneur/verification');
        console.log('Verification data:', data);
        
        if (data) {
          setVerificationData(data);
        }
      } catch (verificationError) {
        console.log('Using mock verification data:', verificationError.message);
        setVerificationData(mockVerificationData);
      }
      
    } catch (err) {
      console.error('Error fetching verification status:', err);
      setError('Failed to load verification status. Please try again.');
      setVerificationData(mockVerificationData);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved':
        return 'bg-green-500/20 text-green-300';
      case 'rejected':
        return 'bg-red-500/20 text-red-300';
      case 'reviewing':
        return 'bg-blue-500/20 text-blue-300';
      case 'pending':
      default:
        return 'bg-yellow-500/20 text-yellow-300';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'approved':
        return '✓';
      case 'rejected':
        return '✗';
      case 'reviewing':
        return '⋯';
      case 'pending':
      default:
        return '○';
    }
  };

  const getOverallStatus = () => {
    if (verificationData.status === 'approved') {
      return {
        label: 'Verified',
        color: 'bg-green-500/20 text-green-300',
        icon: '✅',
        message: 'Your business has been verified! You can now access all features.'
      };
    } else if (verificationData.status === 'rejected') {
      return {
        label: 'Verification Failed',
        color: 'bg-red-500/20 text-red-300',
        icon: '❌',
        message: 'Your verification was not successful. Please review the comments below and resubmit.'
      };
    } else if (verificationData.status === 'in_progress') {
      return {
        label: 'In Progress',
        color: 'bg-blue-500/20 text-blue-300',
        icon: '⋯',
        message: 'Your documents are being reviewed. This typically takes 3-5 business days.'
      };
    } else {
      return {
        label: 'Pending',
        color: 'bg-yellow-500/20 text-yellow-300',
        icon: '⏳',
        message: 'Your verification has been submitted and is waiting to be processed.'
      };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070A0F] p-6">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-white/60">Loading verification status...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const overallStatus = getOverallStatus();

  return (
    <div className="min-h-screen bg-[#070A0F] p-6 pb-20">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="text-white/40 hover:text-white/60"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-white">Business Verification</h1>
          <div className="w-8"></div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 rounded-xl bg-red-500/20 border border-red-500 p-3 text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Main Status Card */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl ${overallStatus.color} flex items-center justify-center text-3xl`}>
              {overallStatus.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-white">Verification Status</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${overallStatus.color}`}>
                  {overallStatus.label}
                </span>
              </div>
              <p className="mt-1 text-sm text-white/60">{overallStatus.message}</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-xs text-white/40">Submitted</div>
              <div className="text-sm text-white font-semibold">
                {new Date(verificationData.submittedDate).toLocaleDateString()}
              </div>
            </div>
            <div>
              <div className="text-xs text-white/40">Est. Completion</div>
              <div className="text-sm text-white font-semibold">
                {new Date(verificationData.estimatedCompletion).toLocaleDateString()}
              </div>
            </div>
            <div>
              <div className="text-xs text-white/40">Documents</div>
              <div className="text-sm text-white font-semibold">
                {verificationData.documents.filter(d => d.status === 'approved').length}/{verificationData.documents.length}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="h-2 w-full rounded-full bg-white/10">
              <div 
                className="h-2 rounded-full bg-[#C7000B] transition-all duration-300"
                style={{ 
                  width: `${(verificationData.documents.filter(d => d.status === 'approved').length / verificationData.documents.length) * 100}%` 
                }}
              />
            </div>
          </div>
        </div>

        {/* Documents Status */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 mb-6">
          <h2 className="text-sm font-semibold text-white/60 mb-4">DOCUMENTS STATUS</h2>
          
          <div className="space-y-3">
            {verificationData.documents.map((doc, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-xl bg-black/25"
              >
                <div className="flex items-center gap-3">
                  <span className={`text-lg ${getStatusColor(doc.status)}`}>
                    {getStatusIcon(doc.status)}
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-white">{doc.name}</div>
                    <div className="text-xs text-white/40">Submitted {new Date(doc.submittedDate).toLocaleDateString()}</div>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${getStatusColor(doc.status)}`}>
                  {doc.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Comments/Feedback */}
        {verificationData.comments && (
          <div className="rounded-3xl border border-white/10 bg-blue-500/10 p-6 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-blue-400 text-xl">ℹ️</span>
              <div>
                <h3 className="text-sm font-semibold text-blue-300 mb-1">Verification Notes</h3>
                <p className="text-sm text-blue-200/80">{verificationData.comments}</p>
              </div>
            </div>
          </div>
        )}

        {/* What Happens Next */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-sm font-semibold text-white/60 mb-3">WHAT HAPPENS NEXT?</h2>
          
          <div className="space-y-3">
            <Step
              number="1"
              title="Document Review"
              description="Our team reviews each document for completeness and authenticity."
              completed={verificationData.documents.some(d => d.status !== 'pending')}
            />
            <Step
              number="2"
              title="Background Check"
              description="We verify your business registration and tax compliance."
              completed={verificationData.status === 'in_progress' || verificationData.status === 'approved'}
            />
            <Step
              number="3"
              title="Final Approval"
              description="Once verified, you'll get full access to all platform features."
              completed={verificationData.status === 'approved'}
            />
          </div>

          {/* Action Buttons */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/app/vault')}
              className="rounded-xl border border-white/10 bg-white/5 py-2 text-sm font-semibold text-white/80 hover:bg-white/10"
            >
              View Documents
            </button>
            <button
              onClick={() => navigate('/app/help')}
              className="rounded-xl border border-white/10 bg-white/5 py-2 text-sm font-semibold text-white/80 hover:bg-white/10"
            >
              Get Help
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Component
function Step({ number, title, description, completed }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
        completed 
          ? 'bg-green-500/20 text-green-400' 
          : 'bg-white/10 text-white/40'
      }`}>
        {completed ? '✓' : number}
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold text-white">{title}</div>
        <div className="text-xs text-white/40">{description}</div>
      </div>
    </div>
  );
}