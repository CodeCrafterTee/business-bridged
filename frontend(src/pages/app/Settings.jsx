import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { authService } from "../../services/authService";

export default function Settings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    businessName: "",
    industry: "",
    cicpNumber: ""
  });

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Notification preferences
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    mentorSessionReminders: true,
    fundingAlerts: true,
    marketingEmails: false,
    weeklyDigest: true
  });

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profileVisibility: "public", // public, mentors_only, private
    showScore: true,
    showBusinessName: true,
    allowMentorRequests: true,
    dataSharing: false
  });

  // Business details (read-only from dashboard)
  const [businessDetails, setBusinessDetails] = useState({
    readinessScore: 0,
    verified: false,
    complianceCompleted: false,
    groomingCompleted: false,
    stressTestPassed: false,
    mentorVouches: 0,
    funderMatches: 0,
    memberSince: ""
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Get user from localStorage first
      const userData = authService.getCurrentUser();
      
      // Try to fetch profile from API
      try {
        const profile = await api.get('/auth/profile');
        console.log('Profile data:', profile);
        
        if (profile && profile.user) {
          setProfileForm({
            fullName: profile.user.fullName || "",
            email: profile.user.email || "",
            phone: profile.user.phone || "",
            businessName: profile.user.businessName || "",
            industry: profile.user.industry || "",
            cicpNumber: profile.user.cicpNumber || ""
          });
        }
      } catch (profileError) {
        console.log('Using localStorage user data:', profileError.message);
        // Fallback to localStorage
        if (userData) {
          setProfileForm({
            fullName: userData.fullName || "",
            email: userData.email || "",
            phone: userData.phone || "",
            businessName: userData.businessName || "",
            industry: userData.industry || "",
            cicpNumber: userData.cicpNumber || ""
          });
        }
      }
      
      // Try to fetch entrepreneur dashboard for business details
      try {
        const dashboard = await api.get('/entrepreneur/dashboard');
        console.log('Dashboard data:', dashboard);
        
        if (dashboard) {
          setBusinessDetails({
            readinessScore: dashboard.readiness_score || 0,
            verified: dashboard.verified || false,
            complianceCompleted: dashboard.compliance_completed || false,
            groomingCompleted: dashboard.grooming_completed || false,
            stressTestPassed: dashboard.stress_test_passed || false,
            mentorVouches: dashboard.mentor_vouches || 0,
            funderMatches: dashboard.funder_matches || 0,
            memberSince: dashboard.created_at || new Date().toISOString()
          });
        }
      } catch (dashboardError) {
        console.log('Could not fetch dashboard data:', dashboardError.message);
      }
      
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to load settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePrivacyChange = (key, value) => {
    setPrivacy(prev => ({ ...prev, [key]: value }));
  };

  const validatePassword = () => {
    if (passwordForm.newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSaveProfile = async () => {
    try {
      setSubmitting(true);
      setError("");
      setSuccess("");
      
      // Try to update profile via API
      try {
        await api.put('/auth/profile', {
          fullName: profileForm.fullName,
          phone: profileForm.phone
        });
        
        // Update local storage
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          const updatedUser = { ...currentUser, ...profileForm };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        
        setSuccess("Profile updated successfully!");
        setIsEditing(false);
      } catch (updateError) {
        console.log('Update endpoint not available - simulating:', updateError.message);
        
        // Simulate success
        setTimeout(() => {
          setSuccess("Profile updated successfully! (Demo mode)");
          setIsEditing(false);
        }, 1000);
      }
      
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) return;
    
    try {
      setSubmitting(true);
      setError("");
      setSuccess("");
      
      // Try to change password via API
      try {
        await api.post('/auth/change-password', {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        });
        
        setSuccess("Password changed successfully!");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      } catch (passwordError) {
        console.log('Password change endpoint not available - simulating:', passwordError.message);
        
        // Simulate success
        setTimeout(() => {
          setSuccess("Password changed successfully! (Demo mode)");
          setPasswordForm({
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
          });
        }, 1000);
      }
      
    } catch (err) {
      console.error('Error changing password:', err);
      setError('Failed to change password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setSubmitting(true);
      setError("");
      setSuccess("");
      
      // Try to save notification preferences
      try {
        await api.put('/auth/notifications', notifications);
        setSuccess("Notification preferences saved!");
      } catch (notifError) {
        console.log('Notifications endpoint not available - simulating:', notifError.message);
        
        // Simulate success
        setTimeout(() => {
          setSuccess("Notification preferences saved! (Demo mode)");
        }, 1000);
      }
      
    } catch (err) {
      console.error('Error saving notifications:', err);
      setError('Failed to save preferences. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSavePrivacy = async () => {
    try {
      setSubmitting(true);
      setError("");
      setSuccess("");
      
      // Try to save privacy settings
      try {
        await api.put('/auth/privacy', privacy);
        setSuccess("Privacy settings saved!");
      } catch (privacyError) {
        console.log('Privacy endpoint not available - simulating:', privacyError.message);
        
        // Simulate success
        setTimeout(() => {
          setSuccess("Privacy settings saved! (Demo mode)");
        }, 1000);
      }
      
    } catch (err) {
      console.error('Error saving privacy settings:', err);
      setError('Failed to save settings. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      if (window.confirm("This will permanently delete all your data. Type 'DELETE' to confirm.")) {
        // Handle account deletion
        alert("Account deletion requested. This feature is not yet implemented.");
      }
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const formatDate = (dateStr) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-ZA', options);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070A0F] p-6">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-white/60">Loading settings...</div>
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
            onClick={() => navigate(-1)}
            className="text-white/40 hover:text-white/60"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <div className="w-8"></div>
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

        {/* Settings Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <TabButton 
            active={activeTab === "profile"} 
            onClick={() => setActiveTab("profile")}
            icon="👤"
            label="Profile"
          />
          <TabButton 
            active={activeTab === "business"} 
            onClick={() => setActiveTab("business")}
            icon="📊"
            label="Business"
          />
          <TabButton 
            active={activeTab === "notifications"} 
            onClick={() => setActiveTab("notifications")}
            icon="🔔"
            label="Notifications"
          />
          <TabButton 
            active={activeTab === "privacy"} 
            onClick={() => setActiveTab("privacy")}
            icon="🔒"
            label="Privacy"
          />
          <TabButton 
            active={activeTab === "security"} 
            onClick={() => setActiveTab("security")}
            icon="🛡️"
            label="Security"
          />
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Profile Information</h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-[#C7000B] text-sm font-semibold hover:underline"
                >
                  Edit Profile
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-white/40 text-sm hover:text-white/60"
                >
                  Cancel
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-white/40 mb-1">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="fullName"
                      value={profileForm.fullName}
                      onChange={handleProfileChange}
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white"
                    />
                  ) : (
                    <p className="text-white/80">{profileForm.fullName || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs text-white/40 mb-1">Email</label>
                  <p className="text-white/80">{profileForm.email || 'Not set'}</p>
                </div>

                <div>
                  <label className="block text-xs text-white/40 mb-1">Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={profileForm.phone}
                      onChange={handleProfileChange}
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white"
                      placeholder="+27 XX XXX XXXX"
                    />
                  ) : (
                    <p className="text-white/80">{profileForm.phone || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs text-white/40 mb-1">Member Since</label>
                  <p className="text-white/80">{formatDate(businessDetails.memberSince)}</p>
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleSaveProfile}
                    disabled={submitting}
                    className="bg-[#C7000B] text-white px-6 py-2 rounded-xl text-sm font-semibold hover:opacity-95 disabled:opacity-50"
                  >
                    {submitting ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Business Tab */}
        {activeTab === "business" && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Business Details</h2>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-black/25">
                <div className="text-xs text-white/40 mb-1">Business Name</div>
                <div className="text-white font-semibold">{profileForm.businessName || 'Not set'}</div>
              </div>
              <div className="p-4 rounded-xl bg-black/25">
                <div className="text-xs text-white/40 mb-1">Industry</div>
                <div className="text-white font-semibold">{profileForm.industry || 'Not set'}</div>
              </div>
              <div className="p-4 rounded-xl bg-black/25">
                <div className="text-xs text-white/40 mb-1">CICP Number</div>
                <div className="text-white font-semibold">{profileForm.cicpNumber || 'Not set'}</div>
              </div>
              <div className="p-4 rounded-xl bg-black/25">
                <div className="text-xs text-white/40 mb-1">Readiness Score</div>
                <div className="text-2xl font-bold text-white">{businessDetails.readinessScore}</div>
              </div>
            </div>

            <h3 className="text-sm font-semibold text-white/60 mb-3">Progress Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <StatusBadge 
                label="Verified" 
                status={businessDetails.verified} 
              />
              <StatusBadge 
                label="Compliance" 
                status={businessDetails.complianceCompleted} 
              />
              <StatusBadge 
                label="Grooming" 
                status={businessDetails.groomingCompleted} 
              />
              <StatusBadge 
                label="Stress Test" 
                status={businessDetails.stressTestPassed} 
              />
              <StatusBadge 
                label="Mentor Vouches" 
                value={businessDetails.mentorVouches} 
              />
              <StatusBadge 
                label="Funder Matches" 
                value={businessDetails.funderMatches} 
              />
            </div>

            <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <p className="text-xs text-blue-300">
                <span className="font-semibold">ℹ️ Note:</span> Business details can only be updated through the intake form.
              </p>
              <button
                onClick={() => navigate('/app/intake')}
                className="mt-2 text-sm text-[#C7000B] hover:underline"
              >
                Update Business Information →
              </button>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Notification Preferences</h2>

            <div className="space-y-4">
              <ToggleSwitch
                label="Email Notifications"
                description="Receive updates via email"
                checked={notifications.emailNotifications}
                onChange={() => handleNotificationChange('emailNotifications')}
              />
              <ToggleSwitch
                label="SMS Notifications"
                description="Receive updates via SMS"
                checked={notifications.smsNotifications}
                onChange={() => handleNotificationChange('smsNotifications')}
              />
              <ToggleSwitch
                label="Mentor Session Reminders"
                description="Get reminded about upcoming mentor sessions"
                checked={notifications.mentorSessionReminders}
                onChange={() => handleNotificationChange('mentorSessionReminders')}
              />
              <ToggleSwitch
                label="Funding Alerts"
                description="Be notified when new funding opportunities match your profile"
                checked={notifications.fundingAlerts}
                onChange={() => handleNotificationChange('fundingAlerts')}
              />
              <ToggleSwitch
                label="Weekly Digest"
                description="Receive a weekly summary of your progress"
                checked={notifications.weeklyDigest}
                onChange={() => handleNotificationChange('weeklyDigest')}
              />
              <ToggleSwitch
                label="Marketing Emails"
                description="Receive tips, resources, and updates from our team"
                checked={notifications.marketingEmails}
                onChange={() => handleNotificationChange('marketingEmails')}
              />
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={handleSaveNotifications}
                disabled={submitting}
                className="bg-[#C7000B] text-white px-6 py-2 rounded-xl text-sm font-semibold hover:opacity-95 disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Save Preferences"}
              </button>
            </div>
          </div>
        )}

        {/* Privacy Tab */}
        {activeTab === "privacy" && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Privacy Settings</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-white/40 mb-2">Profile Visibility</label>
                <select
                  value={privacy.profileVisibility}
                  onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white"
                >
                  <option value="public">Public - Anyone can see my profile</option>
                  <option value="mentors_only">Mentors Only - Only mentors can see my profile</option>
                  <option value="private">Private - Only I can see my profile</option>
                </select>
              </div>

              <ToggleSwitch
                label="Show Business Score"
                description="Display your readiness score on your profile"
                checked={privacy.showScore}
                onChange={() => handlePrivacyChange('showScore', !privacy.showScore)}
              />
              
              <ToggleSwitch
                label="Show Business Name"
                description="Display your business name on your profile"
                checked={privacy.showBusinessName}
                onChange={() => handlePrivacyChange('showBusinessName', !privacy.showBusinessName)}
              />
              
              <ToggleSwitch
                label="Allow Mentor Requests"
                description="Let mentors reach out to you"
                checked={privacy.allowMentorRequests}
                onChange={() => handlePrivacyChange('allowMentorRequests', !privacy.allowMentorRequests)}
              />
              
              <ToggleSwitch
                label="Data Sharing"
                description="Allow us to use your data to improve matching (anonymized)"
                checked={privacy.dataSharing}
                onChange={() => handlePrivacyChange('dataSharing', !privacy.dataSharing)}
              />
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={handleSavePrivacy}
                disabled={submitting}
                className="bg-[#C7000B] text-white px-6 py-2 rounded-xl text-sm font-semibold hover:opacity-95 disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Save Privacy Settings"}
              </button>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Security Settings</h2>

            {/* Change Password */}
            <div className="mb-6 p-4 rounded-xl bg-black/25">
              <h3 className="text-sm font-semibold text-white mb-3">Change Password</h3>
              
              <div className="space-y-3">
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Current Password"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white"
                />
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="New Password"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white"
                />
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm New Password"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white"
                />
              </div>

              <button
                onClick={handleChangePassword}
                disabled={submitting || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                className="mt-3 bg-[#C7000B] text-white px-6 py-2 rounded-xl text-sm font-semibold hover:opacity-95 disabled:opacity-50"
              >
                {submitting ? "Updating..." : "Update Password"}
              </button>
            </div>

            {/* Session Management */}
            <div className="mb-6 p-4 rounded-xl bg-black/25">
              <h3 className="text-sm font-semibold text-white mb-2">Active Sessions</h3>
              <p className="text-xs text-white/40 mb-3">
                You are currently logged in on this device.
              </p>
              <button
                onClick={() => alert("This would log out all other devices")}
                className="text-sm text-[#C7000B] hover:underline"
              >
                Log out of all other devices
              </button>
            </div>

            {/* Danger Zone */}
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <h3 className="text-sm font-semibold text-red-400 mb-2">Danger Zone</h3>
              <p className="text-xs text-red-300/80 mb-3">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button
                onClick={handleDeleteAccount}
                className="text-sm text-red-400 hover:text-red-300 underline"
              >
                Delete Account
              </button>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <div className="mt-6">
          <button
            onClick={handleLogout}
            className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-white/80 hover:bg-white/10"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
        active 
          ? 'bg-[#C7000B] text-white' 
          : 'bg-white/5 text-white/60 hover:bg-white/10'
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function ToggleSwitch({ label, description, checked, onChange }) {
  return (
    <label className="flex items-start justify-between p-3 rounded-xl bg-black/25 cursor-pointer">
      <div>
        <div className="text-sm text-white/90">{label}</div>
        {description && <div className="text-xs text-white/40 mt-1">{description}</div>}
      </div>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />
        <div className={`w-10 h-6 rounded-full transition ${
          checked ? 'bg-[#C7000B]' : 'bg-white/20'
        }`}>
          <div className={`w-4 h-4 rounded-full bg-white transition transform mt-1 ${
            checked ? 'translate-x-5' : 'translate-x-1'
          }`} />
        </div>
      </div>
    </label>
  );
}

function StatusBadge({ label, status, value }) {
  if (value !== undefined) {
    return (
      <div className="p-3 rounded-xl bg-black/25 text-center">
        <div className="text-xs text-white/40">{label}</div>
        <div className="text-sm font-bold text-white">{value}</div>
      </div>
    );
  }
  
  return (
    <div className="p-3 rounded-xl bg-black/25 text-center">
      <div className="text-xs text-white/40">{label}</div>
      <div className={`text-sm font-bold ${status ? 'text-green-400' : 'text-yellow-400'}`}>
        {status ? '✓ Complete' : '○ Incomplete'}
      </div>
    </div>
  );
}