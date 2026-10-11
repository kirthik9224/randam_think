import React, { useState, useEffect } from 'react';
import authService from '../services/authService';
import leaderboardService from '../services/leaderboardService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import sounds from '../utils/soundEffects';
import '../styles/Profile.css';

const Profile = () => {
  const currentUser = authService.getCurrentUser();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Update profile form state
  const [editMode, setEditMode] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (currentUser?.id) {
      loadProfile();
    }
  }, [currentUser?.id]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await leaderboardService.getPlayerProfile(currentUser.id);
      setProfile(data);
      setUsername(data.username);
      setEmail(data.email);
    } catch (err) {
      setError('Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    try {
      setUpdating(true);
      sounds.playClick();
      const payload = {
        username,
        email,
      };
      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await leaderboardService.updateProfile(currentUser.id, payload);
      setProfile(res.data);
      authService.setCurrentUser({
        ...currentUser,
        username: res.data.username,
        email: res.data.email,
      });

      setSuccessMsg('Profile updated successfully!');
      setEditMode(false);
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading user profile..." fullScreen />;
  }

  return (
    <div className="profile-page container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          {/* Header Card */}
          <div className="card border-0 shadow-sm rounded-4 mb-4 bg-body overflow-hidden">
            <div className="card-header bg-primary text-white py-4 px-4 d-flex flex-wrap justify-content-between align-items-center gap-3">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="avatar-circle bg-white text-primary rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                  style={{ width: '64px', height: '64px', fontSize: '28px', fontWeight: 'bold' }}
                >
                  {profile?.username?.charAt(0).toUpperCase() || 'P'}
                </div>
                <div>
                  <h3 className="fw-bold mb-0">{profile?.username}</h3>
                  <div className="d-flex align-items-center gap-2 small text-white-50">
                    <span>{profile?.email}</span>
                    <span>•</span>
                    <span className="badge bg-warning text-dark">{profile?.role || 'USER'}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  sounds.playClick();
                  setEditMode(!editMode);
                }}
                className="btn btn-light rounded-pill px-4"
              >
                <i className={`bi ${editMode ? 'bi-x-circle' : 'bi-pencil-square'} me-1`}></i>
                {editMode ? 'Cancel Edit' : 'Edit Profile'}
              </button>
            </div>

            <div className="card-body p-4">
              {successMsg && (
                <div className="alert alert-success alert-dismissible fade show rounded-3" role="alert">
                  <i className="bi bi-check-circle-fill me-2"></i>
                  {successMsg}
                  <button type="button" className="btn-close" onClick={() => setSuccessMsg('')}></button>
                </div>
              )}
              <ErrorMessage message={error} onDismiss={() => setError('')} />

              {editMode ? (
                /* Edit Profile Form */
                <form onSubmit={handleUpdateProfile} className="p-3 bg-body-tertiary rounded-4 border">
                  <h5 className="fw-bold mb-3">Update Account Details</h5>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Username</label>
                      <input
                        type="text"
                        className="form-control"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        minLength={3}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Email Address</label>
                      <input
                        type="email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <hr className="my-3" />
                  <h6 className="fw-bold mb-2">Change Password (Optional)</h6>

                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Current Password</label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Required only if changing password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">New Password</label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="At least 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        minLength={6}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill px-4"
                    disabled={updating}
                  >
                    {updating ? (
                      <span>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Saving Changes...
                      </span>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </form>
              ) : (
                /* Lifetime Stats Grid */
                <div>
                  <h5 className="fw-bold mb-3">
                    <i className="bi bi-bar-chart-fill text-primary me-2"></i> Career Game Statistics
                  </h5>
                  <div className="row g-3">
                    <div className="col-6 col-md-3">
                      <div className="p-3 rounded-4 bg-body-tertiary border text-center">
                        <div className="text-muted small">Total Games</div>
                        <div className="h3 fw-bold text-primary mb-0">{profile?.totalGames || 0}</div>
                      </div>
                    </div>
                    <div className="col-6 col-md-3">
                      <div className="p-3 rounded-4 bg-body-tertiary border text-center">
                        <div className="text-muted small">Victories</div>
                        <div className="h3 fw-bold text-success mb-0">{profile?.gamesWon || 0}</div>
                      </div>
                    </div>
                    <div className="col-6 col-md-3">
                      <div className="p-3 rounded-4 bg-body-tertiary border text-center">
                        <div className="text-muted small">Losses</div>
                        <div className="h3 fw-bold text-danger mb-0">{profile?.gamesLost || 0}</div>
                      </div>
                    </div>
                    <div className="col-6 col-md-3">
                      <div className="p-3 rounded-4 bg-body-tertiary border text-center">
                        <div className="text-muted small">Win Percentage</div>
                        <div className="h3 fw-bold text-info mb-0">{profile?.winRate || 0}%</div>
                      </div>
                    </div>

                    <div className="col-6 col-md-4">
                      <div className="p-3 rounded-4 bg-body-tertiary border text-center">
                        <div className="text-muted small">Highest Single Score</div>
                        <div className="h3 fw-bold text-warning-emphasis mb-0">{profile?.highestScore || 0}</div>
                      </div>
                    </div>
                    <div className="col-6 col-md-4">
                      <div className="p-3 rounded-4 bg-body-tertiary border text-center">
                        <div className="text-muted small">Total Career Score</div>
                        <div className="h3 fw-bold text-dark-emphasis mb-0">{profile?.totalScore || 0}</div>
                      </div>
                    </div>
                    <div className="col-12 col-md-4">
                      <div className="p-3 rounded-4 bg-body-tertiary border text-center">
                        <div className="text-muted small">Winning Streak</div>
                        <div className="h3 fw-bold text-danger mb-0">{profile?.currentStreak || 0} 🔥</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
