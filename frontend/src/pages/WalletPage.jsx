import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import coinWalletService from '../services/coinWalletService';
import authService from '../services/authService';
import sounds from '../utils/soundEffects';
import { setSelectedTheme, getSelectedTheme } from '../utils/themeHelper';
import '../styles/Wallet.css';

const WalletPage = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('history'); // 'history' | 'shop' | 'rules'
  const [txFilter, setTxFilter] = useState('ALL'); // 'ALL' | 'EARNED' | 'SPENT'
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [equippedTheme, setEquippedTheme] = useState(() => getSelectedTheme());

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    loadWalletData();

    const handleWalletUpdated = () => {
      loadWalletData(false);
    };
    window.addEventListener('rtg-wallet-updated', handleWalletUpdated);
    return () => {
      window.removeEventListener('rtg-wallet-updated', handleWalletUpdated);
    };
  }, []);

  const loadWalletData = async (showSpinner = true) => {
    try {
      if (showSpinner) setLoading(true);
      setErrorMsg('');
      const data = await coinWalletService.getWallet();
      setWallet(data);
    } catch (err) {
      console.error('Failed to load wallet:', err);
      setErrorMsg(err.message || 'Could not fetch coin wallet data.');
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  const handleClaimDailyLogin = async () => {
    try {
      sounds.playPowerUp();
      setActionLoading(true);
      setErrorMsg('');
      const res = await coinWalletService.claimDailyLogin();
      setSuccessMsg(res.message || 'Claimed 50 Daily Login coins!');
      await loadWalletData(false);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      sounds.playError();
      setErrorMsg(err.message || 'Failed to claim daily login bonus.');
      setTimeout(() => setErrorMsg(''), 4000);
    } finally {
      setActionLoading(false);
    }
  };

  const handleClaimDailyChallenge = async () => {
    try {
      sounds.playPowerUp();
      setActionLoading(true);
      setErrorMsg('');
      const res = await coinWalletService.claimDailyChallenge();
      setSuccessMsg(res.message || 'Claimed 100 Daily Challenge coins!');
      await loadWalletData(false);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      sounds.playError();
      setErrorMsg(err.message || 'Daily challenge reward not ready or already claimed.');
      setTimeout(() => setErrorMsg(''), 4000);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePurchase = async (item) => {
    if (wallet && wallet.virtualCoins < item.price) {
      sounds.playError();
      setErrorMsg(`Insufficient coins! You need ${item.price} coins, but have ${wallet.virtualCoins}.`);
      setTimeout(() => setErrorMsg(''), 4000);
      return;
    }

    try {
      sounds.playClick();
      setActionLoading(true);
      setErrorMsg('');
      const res = await coinWalletService.purchaseItem(item.id);
      sounds.playPowerUp();
      setSuccessMsg(res.message || `Unlocked ${item.name}!`);
      await loadWalletData(false);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      sounds.playError();
      setErrorMsg(err.message || 'Purchase could not be completed.');
      setTimeout(() => setErrorMsg(''), 4000);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEquipTheme = (themeId) => {
    sounds.playClick();
    // Map shop theme IDs to theme system IDs
    let mapped = 'CYBERPUNK';
    if (themeId.includes('casino')) mapped = 'CASINO_GOLD';
    else if (themeId.includes('midnight')) mapped = 'MIDNIGHT_SPACE';
    else if (themeId.includes('retro')) mapped = 'RETRO_8BIT';
    else if (themeId.includes('emerald')) mapped = 'RETRO_8BIT';
    else if (themeId.includes('cyberpunk')) mapped = 'CYBERPUNK';

    setSelectedTheme(mapped);
    setEquippedTheme(mapped);
    setSuccessMsg(`Equipped ${mapped} Theme!`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const filteredTransactions = (wallet?.transactions || []).filter((tx) => {
    if (txFilter === 'EARNED') return tx.amount > 0;
    if (txFilter === 'SPENT') return tx.amount < 0;
    return true;
  });

  const streak = wallet?.consecutiveWins || 0;
  const winsToBonus = 3 - (streak % 3);

  return (
    <div className="wallet-page-container">
      <div className="container" style={{ maxWidth: '1060px' }}>
        {/* Navigation / Header */}
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <button
                className="btn btn-outline-secondary btn-sm rounded-pill px-3 py-1 text-light border-0"
                style={{ background: 'rgba(255,255,255,0.06)' }}
                onClick={() => navigate('/multiplayer')}
              >
                <i className="bi bi-arrow-left me-1"></i> Back to Multiplayer
              </button>
              <span className="badge bg-warning text-dark fw-bold px-2.5 py-1 rounded-pill">
                VIRTUAL ECONOMY
              </span>
            </div>
            <h1 className="fw-black text-white mb-0 display-6">
              Coin Wallet & Shop
            </h1>
          </div>

          <button
            className="btn btn-outline-info rounded-pill px-3 py-1.5 fw-bold d-flex align-items-center gap-2"
            onClick={() => loadWalletData(true)}
            disabled={loading}
          >
            <i className={`bi bi-arrow-clockwise ${loading ? 'spin' : ''}`}></i>
            Refresh Balance
          </button>
        </div>

        {/* Global Notifications */}
        {errorMsg && (
          <div className="alert alert-danger rounded-4 shadow-sm border-0 d-flex align-items-center gap-2 mb-4">
            <i className="bi bi-exclamation-triangle-fill fs-5"></i>
            <div>{errorMsg}</div>
          </div>
        )}
        {successMsg && (
          <div className="alert alert-success rounded-4 shadow-sm border-0 d-flex align-items-center gap-2 mb-4">
            <i className="bi bi-check-circle-fill fs-5"></i>
            <div>{successMsg}</div>
          </div>
        )}

        {/* Top Cards: Balance & Win Streak */}
        <div className="row g-3 mb-4">
          {/* Virtual Coin Balance Card */}
          <div className="col-lg-6">
            <div className="wallet-balance-card p-4 h-100 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className="text-warning fw-bold text-uppercase tracking-wider small">
                    Verified Server Balance
                  </span>
                  <span className="badge bg-dark text-warning border border-warning rounded-pill px-2.5 py-1">
                    Virtual Points Only
                  </span>
                </div>
                <div className="d-flex align-items-center gap-3 my-2">
                  <div className="wallet-coin-icon-pulse">🪙</div>
                  <div>
                    <h2 className="display-5 fw-black text-white font-monospace mb-0">
                      {wallet ? wallet.virtualCoins.toLocaleString() : '---'}
                    </h2>
                    <span className="text-secondary small">Available Virtual Coins</span>
                  </div>
                </div>
              </div>

              {/* Quick Daily Claim Buttons */}
              <div className="d-flex flex-wrap gap-2 pt-3 border-top border-secondary border-opacity-25 mt-3">
                <button
                  className={`btn rounded-pill px-3 py-2 fw-bold text-nowrap d-flex align-items-center gap-2 ${
                    wallet?.dailyLoginClaimedToday
                      ? 'btn-outline-secondary disabled text-muted'
                      : 'btn-warning text-dark shadow-sm'
                  }`}
                  onClick={handleClaimDailyLogin}
                  disabled={wallet?.dailyLoginClaimedToday || actionLoading}
                >
                  {wallet?.dailyLoginClaimedToday ? (
                    <>
                      <i className="bi bi-check-circle-fill text-success"></i>
                      <span>Daily Claimed Today (+50)</span>
                    </>
                  ) : (
                    <>
                      <span>🎁 Claim Daily Login (+50)</span>
                    </>
                  )}
                </button>

                <button
                  className={`btn rounded-pill px-3 py-2 fw-bold text-nowrap d-flex align-items-center gap-2 ${
                    wallet?.dailyChallengeClaimedToday
                      ? 'btn-outline-secondary disabled text-muted'
                      : 'btn-info text-dark shadow-sm'
                  }`}
                  onClick={handleClaimDailyChallenge}
                  disabled={wallet?.dailyChallengeClaimedToday || actionLoading}
                >
                  {wallet?.dailyChallengeClaimedToday ? (
                    <>
                      <i className="bi bi-check-circle-fill text-success"></i>
                      <span>Daily Challenge Claimed (+100)</span>
                    </>
                  ) : (
                    <>
                      <span>⚡ Claim Daily Challenge (+100)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Win Streak Card */}
          <div className="col-lg-6">
            <div className="wallet-glass-panel p-4 h-100 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-info fw-bold text-uppercase tracking-wider small">
                    Win Streak Tracker
                  </span>
                  <span className="badge bg-danger text-white rounded-pill px-2.5 py-1">
                    🔥 75 Bonus Coins / 3 Wins
                  </span>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <div className="fs-1 text-danger">🔥</div>
                  <div>
                    <h3 className="fw-black text-white font-monospace mb-0">
                      {streak} {streak === 1 ? 'Win' : 'Wins'} In a Row
                    </h3>
                    <p className="text-secondary small mb-0">
                      {winsToBonus === 3
                        ? 'Win your next match to begin your streak!'
                        : `${winsToBonus} more consecutive ${winsToBonus === 1 ? 'win' : 'wins'} needed for the +75 Bonus Reward!`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress Tracker */}
              <div className="streak-pill-card p-3 mt-3">
                <div className="d-flex justify-content-between align-items-center small text-secondary mb-1.5">
                  <span>Current Milestone Progress:</span>
                  <span className="text-warning fw-bold">{(streak % 3)} / 3 Wins</span>
                </div>
                <div className="progress" style={{ height: '8px', background: 'rgba(255,255,255,0.1)' }}>
                  <div
                    className="progress-bar bg-gradient bg-warning"
                    role="progressbar"
                    style={{ width: `${((streak % 3) / 3) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="d-flex border-bottom border-secondary border-opacity-25 mb-4 gap-2 wallet-nav-tabs">
          <button
            className={`nav-link ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => { sounds.playClick(); setActiveTab('history'); }}
          >
            <i className="bi bi-clock-history me-1.5"></i> Transaction History
          </button>
          <button
            className={`nav-link ${activeTab === 'shop' ? 'active' : ''}`}
            onClick={() => { sounds.playClick(); setActiveTab('shop'); }}
          >
            <i className="bi bi-shop me-1.5"></i> Virtual Shop & Items
          </button>
          <button
            className={`nav-link ${activeTab === 'rules' ? 'active' : ''}`}
            onClick={() => { sounds.playClick(); setActiveTab('rules'); }}
          >
            <i className="bi bi-info-circle me-1.5"></i> Reward Rates & Policy
          </button>
        </div>

        {/* TAB 1: TRANSACTION HISTORY */}
        {activeTab === 'history' && (
          <div className="wallet-glass-panel p-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
              <div>
                <h4 className="fw-bold text-white mb-0">Transaction Audit Trail</h4>
                <p className="text-secondary small mb-0">
                  All virtual coin earnings and deductions verified by database transactions.
                </p>
              </div>

              {/* Filter Buttons */}
              <div className="btn-group btn-group-sm rounded-pill p-1" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <button
                  className={`btn rounded-pill px-3 py-1 ${txFilter === 'ALL' ? 'btn-primary' : 'btn-link text-secondary'}`}
                  onClick={() => setTxFilter('ALL')}
                >
                  All ({wallet?.transactions?.length || 0})
                </button>
                <button
                  className={`btn rounded-pill px-3 py-1 ${txFilter === 'EARNED' ? 'btn-success' : 'btn-link text-secondary'}`}
                  onClick={() => setTxFilter('EARNED')}
                >
                  Earned (+)
                </button>
                <button
                  className={`btn rounded-pill px-3 py-1 ${txFilter === 'SPENT' ? 'btn-danger' : 'btn-link text-secondary'}`}
                  onClick={() => setTxFilter('SPENT')}
                >
                  Spent (-)
                </button>
              </div>
            </div>

            {/* Table */}
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-5 text-secondary">
                <i className="bi bi-inbox fs-1 d-block mb-2 text-muted"></i>
                <p>No transactions match the selected filter.</p>
              </div>
            ) : (
              <div className="tx-table-container">
                <table className="tx-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Type</th>
                      <th>Description</th>
                      <th className="text-end">Coins</th>
                      <th className="text-end">Balance After</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((tx) => {
                      const isPositive = tx.amount > 0;
                      let badgeClass = 'tx-badge-earned';
                      if (tx.transactionType === 'SHOP_PURCHASE') badgeClass = 'tx-badge-spent';
                      else if (tx.transactionType === 'MATCH_STAKE') badgeClass = 'tx-badge-stake';

                      const date = tx.createdAt ? new Date(tx.createdAt).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }) : 'Just now';

                      return (
                        <tr key={tx.id || Math.random()}>
                          <td className="small text-secondary font-monospace text-nowrap">
                            {date}
                          </td>
                          <td>
                            <span className={`tx-badge ${badgeClass}`}>
                              {tx.transactionType.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="small text-light">
                            {tx.description}
                          </td>
                          <td className={`text-end ${isPositive ? 'tx-amount-earned' : 'tx-amount-spent'}`}>
                            {isPositive ? `+${tx.amount.toLocaleString()}` : tx.amount.toLocaleString()} 🪙
                          </td>
                          <td className="text-end font-monospace text-white small">
                            {tx.balanceAfter ? tx.balanceAfter.toLocaleString() : '---'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: VIRTUAL SHOP */}
        {activeTab === 'shop' && (
          <div>
            {/* 1. Board Themes */}
            <div className="mb-5">
              <div className="d-flex align-items-center gap-2 mb-3">
                <span className="fs-4">🎨</span>
                <h4 className="fw-black text-white mb-0">Optional Board Themes</h4>
                <span className="text-secondary small ms-2">Personalize your game backdrop</span>
              </div>

              <div className="row g-3">
                {(wallet?.shopCatalog || []).filter(i => i.type === 'THEME').map((item) => (
                  <div key={item.id} className="col-md-6 col-lg-4">
                    <div className={`shop-card ${item.owned ? 'owned' : ''}`}>
                      <div>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div className="d-flex align-items-center gap-2">
                            <span
                              className="theme-swatch"
                              style={{ background: item.previewColor, color: item.previewColor }}
                            ></span>
                            <h5 className="fw-bold text-white mb-0">{item.name}</h5>
                          </div>
                          {item.owned ? (
                            <span className="badge bg-success text-dark fw-bold rounded-pill">OWNED</span>
                          ) : (
                            <span className="badge bg-warning text-dark font-monospace fw-bold rounded-pill">
                              🪙 {item.price}
                            </span>
                          )}
                        </div>
                        <p className="text-secondary small mb-3">{item.description}</p>
                      </div>

                      <div className="pt-2 border-top border-secondary border-opacity-25 mt-2">
                        {item.owned ? (
                          <button
                            className="btn btn-outline-success btn-sm w-100 rounded-pill fw-bold"
                            onClick={() => handleEquipTheme(item.id)}
                          >
                            <i className="bi bi-check2-circle me-1"></i> Equip Theme
                          </button>
                        ) : (
                          <button
                            className="btn btn-warning btn-sm w-100 rounded-pill fw-bold text-dark"
                            onClick={() => handlePurchase(item)}
                            disabled={actionLoading || (wallet && wallet.virtualCoins < item.price)}
                          >
                            Unlock for 🪙 {item.price}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Avatars */}
            <div className="mb-5">
              <div className="d-flex align-items-center gap-2 mb-3">
                <span className="fs-4">👤</span>
                <h4 className="fw-black text-white mb-0">Lobby Avatars & Badges</h4>
                <span className="text-secondary small ms-2">Stand out in multiplayer arenas</span>
              </div>

              <div className="row g-3">
                {(wallet?.shopCatalog || []).filter(i => i.type === 'AVATAR').map((item) => (
                  <div key={item.id} className="col-sm-6 col-md-4 col-lg-4">
                    <div className={`shop-card ${item.owned ? 'owned' : ''}`}>
                      <div>
                        <div className="d-flex align-items-center gap-3 mb-2">
                          <div className="shop-card-icon-wrap">{item.icon}</div>
                          <div>
                            <h5 className="fw-bold text-white mb-0">{item.name}</h5>
                            <span className="badge bg-secondary text-light small">Avatar Badge</span>
                          </div>
                        </div>
                        <p className="text-secondary small mb-3">{item.description}</p>
                      </div>

                      <div className="pt-2 border-top border-secondary border-opacity-25 mt-2">
                        {item.owned ? (
                          <button className="btn btn-outline-success btn-sm w-100 rounded-pill fw-bold disabled">
                            <i className="bi bi-check2 me-1"></i> Unlocked
                          </button>
                        ) : (
                          <button
                            className="btn btn-warning btn-sm w-100 rounded-pill fw-bold text-dark"
                            onClick={() => handlePurchase(item)}
                            disabled={actionLoading || (wallet && wallet.virtualCoins < item.price)}
                          >
                            Unlock for 🪙 {item.price}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Approved Power-Ups */}
            <div className="mb-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <span className="fs-4">⚡</span>
                <h4 className="fw-black text-white mb-0">Approved In-Game Power-Up Packs</h4>
                <span className="text-secondary small ms-2">Tactical assists for solo & multiplayer rounds</span>
              </div>

              <div className="row g-3">
                {(wallet?.shopCatalog || []).filter(i => i.type === 'POWERUP').map((item) => (
                  <div key={item.id} className="col-md-6 col-lg-3">
                    <div className="shop-card">
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <div className="shop-card-icon-wrap" style={{ width: '42px', height: '42px', fontSize: '1.4rem' }}>
                            {item.icon}
                          </div>
                          <div>
                            <h6 className="fw-bold text-white mb-0">{item.name}</h6>
                            <span className="badge bg-warning text-dark font-monospace" style={{ fontSize: '0.7rem' }}>
                              🪙 {item.price}
                            </span>
                          </div>
                        </div>
                        <p className="text-secondary small mb-3">{item.description}</p>
                      </div>

                      <div className="pt-2 border-top border-secondary border-opacity-25 mt-2">
                        <button
                          className="btn btn-primary btn-sm w-100 rounded-pill fw-bold"
                          onClick={() => handlePurchase(item)}
                          disabled={actionLoading || (wallet && wallet.virtualCoins < item.price)}
                        >
                          Acquire Pack (🪙 {item.price})
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: RULES & REWARD RATES */}
        {activeTab === 'rules' && (
          <div className="wallet-glass-panel p-4">
            <h4 className="fw-black text-white mb-2">Server Reward Rates & Economy Rules</h4>
            <p className="text-secondary small mb-4">
              Every coin is awarded strictly upon server validation of game outcomes and achievements.
            </p>

            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <div className="reward-info-card">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-bold text-white">📅 Daily Login</div>
                      <small className="text-secondary">Claimable once per calendar day</small>
                    </div>
                    <span className="badge bg-success font-monospace fs-6 px-3 py-1.5 rounded-pill">+50 Coins</span>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="reward-info-card">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-bold text-white">🎯 Solo Game Win</div>
                      <small className="text-secondary">Awarded on correctly guessing secret</small>
                    </div>
                    <span className="badge bg-success font-monospace fs-6 px-3 py-1.5 rounded-pill">+20 Coins</span>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="reward-info-card">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-bold text-white">🗺️ Level Completion</div>
                      <small className="text-secondary">Beating any progression campaign level</small>
                    </div>
                    <span className="badge bg-success font-monospace fs-6 px-3 py-1.5 rounded-pill">+50 Coins</span>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="reward-info-card">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-bold text-white">⚡ Quick Match Win</div>
                      <small className="text-secondary">Defeating an opponent in matchmaking</small>
                    </div>
                    <span className="badge bg-success font-monospace fs-6 px-3 py-1.5 rounded-pill">+100 Coins</span>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="reward-info-card">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-bold text-white">⚔️ Team Battle Win</div>
                      <small className="text-secondary">Victory for your team in team clashes</small>
                    </div>
                    <span className="badge bg-success font-monospace fs-6 px-3 py-1.5 rounded-pill">+150 Coins</span>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="reward-info-card">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-bold text-white">🔥 Three Consecutive Wins</div>
                      <small className="text-secondary">Streak bonus every 3 wins in a row</small>
                    </div>
                    <span className="badge bg-danger font-monospace fs-6 px-3 py-1.5 rounded-pill">+75 Bonus</span>
                  </div>
                </div>
              </div>

              <div className="col-md-12">
                <div className="reward-info-card">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-bold text-white">🧩 Daily Mystery Challenge Completion</div>
                      <small className="text-secondary">Cracking the deterministic universal daily mystery number</small>
                    </div>
                    <span className="badge bg-info text-dark font-monospace fs-6 px-3 py-1.5 rounded-pill">+100 Coins</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Strict Virtual Point Notice */}
            <div className="p-3 rounded-4" style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
              <div className="d-flex align-items-start gap-2.5">
                <i className="bi bi-shield-check text-warning fs-4 mt-0.5"></i>
                <div>
                  <div className="fw-bold text-warning mb-1">Strict Virtual Points Policy & Security</div>
                  <p className="text-secondary small mb-0">
                    Virtual coins are strictly digital game progression points for cosmetic unlocks (themes, avatars) and approved in-game power-ups.
                    They possess <strong>no real-world monetary value</strong>, cannot be deposited, withdrawn, transferred, or exchanged for real currency.
                    All coin updates are executed securely within transactional database boundaries.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletPage;
