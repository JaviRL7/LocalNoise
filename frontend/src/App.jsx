import { useState, useEffect } from 'react';
import { Server, Database, Sparkles, Heart, ChevronDown } from 'lucide-react';
import Map from './components/Map';
import AddBandForm from './components/AddBandForm';
import OnboardingModal from './components/OnboardingModal';
import ConfirmModal from './components/ConfirmModal';
import DeveloperModal from './components/DeveloperModal';
import { bandService, authService } from './services/api';
import { translations } from './translations';
import './styles/App.css';

function App() {
  const [bands, setBands] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedBand, setSelectedBand] = useState(null);
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' o 'register'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userBands, setUserBands] = useState([]);
  const [language, setLanguage] = useState('es');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [initialCoordinates, setInitialCoordinates] = useState(null);
  const [clickToAddMode, setClickToAddMode] = useState(false);
  const [pendingLocation, setPendingLocation] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bandToDelete, setBandToDelete] = useState(null);
  const [infoPanelCollapsed, setInfoPanelCollapsed] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showDeveloperModal, setShowDeveloperModal] = useState(false);
  const [showMobileInfoPanel, setShowMobileInfoPanel] = useState(false);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showMobileMenu && !e.target.closest('.header-actions') && !e.target.closest('.hamburger-menu')) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showMobileMenu]);

  // Cargar bandas al iniciar
  useEffect(() => {
    loadBands();
    checkAuth();

    // Check Google OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userData = urlParams.get('user');

    if (token && userData) {
      try {
        const user = JSON.parse(decodeURIComponent(userData));
        localStorage.setItem('token', token);
        setUser(user);
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error('Error parsing Google auth data:', error);
      }
    }

    // Check if first visit
    const onboardingCompleted = localStorage.getItem('onboardingCompleted');
    if (!onboardingCompleted) {
      setShowOnboarding(true);
    }
  }, []);

  const loadBands = async () => {
    try {
      const response = await bandService.getAll();
      setBands(response.data.bands);
    } catch (err) {
      console.error('Error al cargar bandas:', err);
      setError('Error al cargar las bandas');
    } finally {
      setLoading(false);
    }
  };

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await authService.getProfile();
        setUser(response.data.user);
      } catch (err) {
        localStorage.removeItem('token');
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const formData = new FormData(e.target);

    try {
      const response = await authService.login({
        email: formData.get('email'),
        password: formData.get('password')
      });

      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      setShowAuth(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    const formData = new FormData(e.target);

    try {
      const response = await authService.register({
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password'),
        city: formData.get('city'),
        country: formData.get('country')
      });

      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      setShowAuth(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarse');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  const toggleUserMenu = async () => {
    if (!showUserMenu && user) {
      // Load user's bands when opening menu
      const userBandsData = bands.filter(b => b.addedBy === user.id);
      setUserBands(userBandsData);
    }
    setShowUserMenu(!showUserMenu);
  };

  const handleBandAdded = (newBand) => {
    setBands([...bands, newBand]);
  };

  const handleBandUpdated = (updatedBand) => {
    setBands(bands.map(b => b.id === updatedBand.id ? updatedBand : b));
    setShowAddForm(false);
    setSelectedBand(null);
  };

  const handleAddBandClick = () => {
    if (!user) {
      setError('');
      setShowAuth(true);
      setAuthMode('login');
    } else {
      setSelectedBand(null);
      setInitialCoordinates(null);
      setShowAddForm(true);
    }
  };

  const handleMapClick = async (latlng) => {
    if (!clickToAddMode) return;

    // Hacer geocodificación inversa para obtener ciudad y país
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`
      );
      const data = await response.json();

      const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || '';
      const country = data.address?.country || '';

      setPendingLocation({
        latitude: latlng.lat.toFixed(6),
        longitude: latlng.lng.toFixed(6),
        city: city,
        country: country
      });
    } catch (error) {
      console.error('Error en geocodificación inversa:', error);
      // Si falla, simplemente usar las coordenadas
      setPendingLocation({
        latitude: latlng.lat.toFixed(6),
        longitude: latlng.lng.toFixed(6),
        city: '',
        country: ''
      });
    }
  };

  const handleConfirmLocation = () => {
    setInitialCoordinates(pendingLocation);
    setPendingLocation(null);
    setClickToAddMode(false);
    setSelectedBand(null);
    setShowAddForm(true);
  };

  const handleCancelLocation = () => {
    setPendingLocation(null);
    setClickToAddMode(false);
  };

  const toggleClickToAddMode = () => {
    if (!user) {
      setError('');
      setShowAuth(true);
      setAuthMode('login');
    } else {
      setClickToAddMode(!clickToAddMode);
      if (clickToAddMode) {
        setPendingLocation(null);
      }
    }
  };

  const handleEditBand = (band) => {
    setSelectedBand(band);
    setInitialCoordinates(null);
    setShowAddForm(true);
  };

  const handleDeleteBand = (bandId) => {
    setBandToDelete(bandId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteBand = async () => {
    if (!bandToDelete) return;

    try {
      await bandService.delete(bandToDelete);
      setBands(bands.filter(b => b.id !== bandToDelete));
      setSelectedBand(null);
      setShowDeleteConfirm(false);
      setBandToDelete(null);
    } catch (err) {
      console.error('Error al eliminar banda:', err);
      alert(err.response?.data?.error || 'Error al eliminar la banda');
      setShowDeleteConfirm(false);
      setBandToDelete(null);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'es' ? 'en' : 'es');
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setShowLanguageMenu(false);
  };

  const languageOptions = [
    { code: 'es', name: 'Español', flagCode: 'es' },
    { code: 'en', name: 'English', flagCode: 'gb' },
    { code: 'fr', name: 'Français', flagCode: 'fr' },
    { code: 'it', name: 'Italiano', flagCode: 'it' },
    { code: 'ja', name: '日本語', flagCode: 'jp' },
    { code: 'ko', name: '한국어', flagCode: 'kr' }
  ];

  const currentLanguage = languageOptions.find(l => l.code === language);

  const t = translations[language];

  if (loading) {
    return <div className="loading">{t.loading}</div>;
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-container">
              <img src="/logo.png" alt="LocalNoise" className="logo-image" />
              <span className="logo-subtitle">{t.subtitle}</span>
            </div>
          </div>

          {/* Hamburger Menu Button */}
          <button
            className="hamburger-menu"
            onClick={(e) => {
              e.stopPropagation();
              setShowMobileMenu(!showMobileMenu);
            }}
            aria-label="Menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {showMobileMenu ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </>
              )}
            </svg>
          </button>

          {/* Overlay oscuro cuando el menú está abierto */}
          {showMobileMenu && (
            <div
              className="mobile-menu-overlay"
              onClick={() => setShowMobileMenu(false)}
            />
          )}

          <div className={`header-actions ${showMobileMenu ? 'mobile-open' : ''}`}>
            <button
              onClick={() => { setShowOnboarding(true); setShowMobileMenu(false); }}
              className="info-button"
              title={t.header.tutorialButton}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
            </button>
            <div className="language-menu-container">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLanguageMenu(!showLanguageMenu);
                }}
                className="language-toggle"
                title={currentLanguage?.name}
              >
                <img
                  src={`https://flagcdn.com/w40/${currentLanguage?.flagCode}.png`}
                  alt={currentLanguage?.name}
                  className="flag-icon"
                />
              </button>

              {showLanguageMenu && (
                <div className="language-dropdown-menu">
                  {languageOptions.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        handleLanguageChange(lang.code);
                        setShowMobileMenu(false);
                      }}
                      className={`language-option ${language === lang.code ? 'active' : ''}`}
                    >
                      <img
                        src={`https://flagcdn.com/w40/${lang.flagCode}.png`}
                        alt={lang.name}
                        className="flag-icon-dropdown"
                      />
                      <span className="language-name">{lang.name}</span>
                      {language === lang.code && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Grupo de botones de acción */}
            <div className="mobile-action-buttons">
              <a
                href="https://ko-fi.com/javi_r0dev"
                target="_blank"
                rel="noopener noreferrer"
                className="kofi-button-header"
                title="Support LocalNoise"
                onClick={() => setShowMobileMenu(false)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.7-.091-3.71.951-1.01 3.005-1.086 4.363.407 0 0 1.565-1.782 3.468-.963 1.904.82 1.832 3.011.723 4.311zm6.173.478c-.928.116-1.682.028-1.682.028V7.284h1.77s1.971.551 1.971 2.638c0 1.913-.985 2.667-2.059 3.015z"/>
                </svg>
                Ko-fi
              </a>
              <button
                onClick={() => { setDarkMode(!darkMode); setShowMobileMenu(false); }}
                className="theme-toggle"
                title={darkMode ? t.header.lightMode : t.header.darkMode}
              >
                {darkMode ? 'Light' : 'Dark'}
              </button>
              {user ? (
                <>
                  <button onClick={toggleUserMenu} className="user-info-button">
                    {user.profilePhoto ? (
                      <img
                        src={user.profilePhoto}
                        alt={user.username}
                        className="user-avatar"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className="user-avatar-placeholder"
                      style={{ display: user.profilePhoto ? 'none' : 'flex' }}
                    >
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span>{user.username}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                      <path d="M7 10l5 5 5-5z"/>
                    </svg>
                  </button>
                  {showUserMenu && (
                    <div className="user-dropdown-menu">
                <div className="user-menu-header">
                  <h3>{t.header.myBands} ({userBands.length})</h3>
                </div>
                <div className="user-bands-list">
                  {userBands.length === 0 ? (
                    <p className="no-bands-message">{t.header.noBands}</p>
                  ) : (
                    userBands.map(band => (
                      <div key={band.id} className="user-band-item">
                        <div className="user-band-info">
                          {band.spotifyImageUrl && (
                            <img src={band.spotifyImageUrl} alt={band.name} className="band-thumb" />
                          )}
                          <div className="band-details">
                            <h4>{band.name}</h4>
                            <p>{band.city}, {band.country}</p>
                          </div>
                        </div>
                        <div className="band-actions-menu">
                          <button onClick={() => { handleEditBand(band); setShowUserMenu(false); setShowMobileMenu(false); }} className="band-action-btn edit">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                            </svg>
                          </button>
                          <button onClick={() => { handleDeleteBand(band.id); setShowUserMenu(false); setShowMobileMenu(false); }} className="band-action-btn delete">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="user-menu-footer">
                  <button onClick={() => { handleLogout(); setShowUserMenu(false); setShowMobileMenu(false); }} className="logout-menu-button">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                    </svg>
                    {t.header.logout}
                  </button>
                </div>
              </div>
                    )}
                  </>
              ) : (
                <button onClick={() => { setError(''); setShowAuth(true); setAuthMode('login'); setShowMobileMenu(false); }} className="login-button">
                  {t.header.login}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="app-main">
        <Map
          bands={bands}
          onBandClick={setSelectedBand}
          onMapClick={handleMapClick}
          selectedBand={selectedBand}
          darkMode={darkMode}
          user={user}
          onAddBandClick={handleAddBandClick}
          onShowAuth={() => { setError(''); setShowAuth(true); setAuthMode('login'); }}
          onEditBand={handleEditBand}
          onDeleteBand={handleDeleteBand}
          translations={t.map}
          bandPopupTranslations={t.bandPopup}
          clickToAddMode={clickToAddMode}
          onToggleClickToAdd={toggleClickToAddMode}
        />

        {/* Botón flotante para abrir panel de info en móvil */}
        <button
          className="mobile-info-toggle"
          onClick={() => setShowMobileInfoPanel(true)}
          aria-label="Info"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
        </button>

        {/* Overlay oscuro cuando el panel está abierto en móvil */}
        {showMobileInfoPanel && (
          <div
            className="mobile-info-overlay"
            onClick={() => setShowMobileInfoPanel(false)}
          />
        )}

        <div className={`info-panel-overlay ${showMobileInfoPanel ? 'mobile-open' : ''}`}>
          {/* Botón para cerrar en móvil */}
          <button
            className="mobile-info-close"
            onClick={() => setShowMobileInfoPanel(false)}
            aria-label="Cerrar"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <h2>{t.info.title}</h2>
          <p>{t.info.totalBands} <strong>{bands.length}</strong></p>
          <p>{t.info.countriesRepresented} <strong>{new Set(bands.map(b => b.country)).size}</strong></p>

          {!user && (
            <div className="info-message">
              <p>{t.info.loginPrompt}</p>
            </div>
          )}

          {/* Ko-fi Goals Section - Collapsible */}
          <div
            className="kofi-goals-header"
            onClick={() => setInfoPanelCollapsed(!infoPanelCollapsed)}
            title={t.kofiGoals?.collapseHint || 'Click to collapse'}
          >
            <h3 className="kofi-goals-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '6px' }}>
                <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.7-.091-3.71.951-1.01 3.005-1.086 4.363.407 0 0 1.565-1.782 3.468-.963 1.904.82 1.832 3.011.723 4.311zm6.173.478c-.928.116-1.682.028-1.682.028V7.284h1.77s1.971.551 1.971 2.638c0 1.913-.985 2.667-2.059 3.015z"/>
              </svg>
              {t.kofiGoals?.title || 'Project Goals'}
            </h3>
            <ChevronDown
              size={20}
              style={{
                transform: infoPanelCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease'
              }}
            />
          </div>

          {!infoPanelCollapsed && (
          <>
            <div className="kofi-goal">
              <div className="goal-header">
                <span className="goal-name">
                  <Server size={16} className="goal-icon" />
                  {t.kofiGoals?.goal1.name || 'Hosting & Domain'}
                </span>
                <span className="goal-amount">{t.kofiGoals?.goal1.amount || '10'} €</span>
              </div>
              <div className="goal-progress-bar">
                <div className="goal-progress-fill" style={{ width: '0%' }}></div>
              </div>
              <p className="goal-description">{t.kofiGoals?.goal1.description || 'Server and custom domain for LocalNoise'}</p>
            </div>
            <div className="kofi-goal">
              <div className="goal-header">
                <span className="goal-name">
                  <Database size={16} className="goal-icon" />
                  {t.kofiGoals?.goal2.name || 'Database'}
                </span>
                <span className="goal-amount">{t.kofiGoals?.goal2.amount || '25'} €</span>
              </div>
              <div className="goal-progress-bar">
                <div className="goal-progress-fill" style={{ width: '0%' }}></div>
              </div>
              <p className="goal-description">{t.kofiGoals?.goal2.description || 'Premium plan to scale the database'}</p>
            </div>
            <div className="kofi-goal">
              <div className="goal-header">
                <span className="goal-name">
                  <Sparkles size={16} className="goal-icon" />
                  {t.kofiGoals?.goal3.name || 'New Features'}
                </span>
                <span className="goal-amount">{t.kofiGoals?.goal3.amount || '50'} €</span>
              </div>
              <div className="goal-progress-bar">
                <div className="goal-progress-fill" style={{ width: '0%' }}></div>
              </div>
              <p className="goal-description">{t.kofiGoals?.goal3.description || 'Development of new functionalities'}</p>
            </div>
            <a
              href="https://ko-fi.com/javi_r0dev"
              target="_blank"
              rel="noopener noreferrer"
              className="kofi-support-link"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.7-.091-3.71.951-1.01 3.005-1.086 4.363.407 0 0 1.565-1.782 3.468-.963 1.904.82 1.832 3.011.723 4.311zm6.173.478c-.928.116-1.682.028-1.682.028V7.284h1.77s1.971.551 1.971 2.638c0 1.913-.985 2.667-2.059 3.015z"/>
              </svg>
              {t.kofiGoals?.supportButton || 'Support LocalNoise'}
            </a>
          </>
          )}
        </div>
      </main>

      {showAddForm && (
        <AddBandForm
          band={selectedBand}
          initialCoordinates={initialCoordinates}
          onBandAdded={handleBandAdded}
          onBandUpdated={handleBandUpdated}
          onClose={() => {
            setShowAddForm(false);
            setSelectedBand(null);
            setInitialCoordinates(null);
          }}
          translations={t.bandForm}
        />
      )}

      {showAuth && (
        <div className="modal-overlay" onClick={() => setShowAuth(false)}>
          <div className="modal-content auth-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{authMode === 'login' ? t.auth.login : t.auth.register}</h2>
              <button onClick={() => setShowAuth(false)} className="close-button">&times;</button>
            </div>

            <div className="auth-form-container">
              {error && <div className="error-message">{error}</div>}

              {authMode === 'login' ? (
                <form onSubmit={handleLogin}>
                  <button type="button" onClick={handleGoogleLogin} className="google-auth-button">
                    <svg width="18" height="18" viewBox="0 0 18 18">
                      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                      <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.59.102-1.167.282-1.707V4.961H.957C.348 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
                      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
                    </svg>
                    {t.auth.continueWithGoogle}
                  </button>

                  <div className="auth-divider">
                    <span>{t.auth.or}</span>
                  </div>

                  <div className="form-group">
                    <label>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px', opacity: 0.7 }}>
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                      </svg>
                      {t.auth.email}
                    </label>
                    <input type="email" name="email" placeholder="tu@email.com" required />
                  </div>
                  <div className="form-group">
                    <label>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px', opacity: 0.7 }}>
                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                      </svg>
                      {t.auth.password}
                    </label>
                    <input type="password" name="password" placeholder="••••••••" required />
                  </div>
                  <button type="submit" className="submit-button auth-submit">{t.auth.loginButton}</button>
                  <p className="auth-switch">
                    {t.auth.noAccount} <button type="button" onClick={() => { setAuthMode('register'); setError(''); }}>{t.auth.registerButton}</button>
                  </p>
                </form>
              ) : (
                <form onSubmit={handleRegister}>
                  <button type="button" onClick={handleGoogleLogin} className="google-auth-button">
                    <svg width="18" height="18" viewBox="0 0 18 18">
                      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                      <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.59.102-1.167.282-1.707V4.961H.957C.348 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
                      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
                    </svg>
                    {t.auth.continueWithGoogle}
                  </button>

                  <div className="auth-divider">
                    <span>{t.auth.or}</span>
                  </div>

                  <div className="form-group">
                    <label>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px', opacity: 0.7 }}>
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                      {t.auth.username}
                    </label>
                    <input type="text" name="username" placeholder="tunombre" required />
                  </div>
                  <div className="form-group">
                    <label>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px', opacity: 0.7 }}>
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                      </svg>
                      {t.auth.email}
                    </label>
                    <input type="email" name="email" placeholder="tu@email.com" required />
                  </div>
                  <div className="form-group">
                    <label>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px', opacity: 0.7 }}>
                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                      </svg>
                      {t.auth.password}
                    </label>
                    <input type="password" name="password" placeholder="••••••••" required />
                  </div>
                  <div className="form-group">
                    <label>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px', opacity: 0.7 }}>
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                      {t.auth.city}
                    </label>
                    <input type="text" name="city" placeholder="Madrid" />
                  </div>
                  <div className="form-group">
                    <label>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px', opacity: 0.7 }}>
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                      </svg>
                      {t.auth.country}
                    </label>
                    <input type="text" name="country" placeholder="España" />
                  </div>
                  <button type="submit" className="submit-button auth-submit">{t.auth.registerButton}</button>
                  <p className="auth-switch">
                    {t.auth.hasAccount} <button type="button" onClick={() => { setAuthMode('login'); setError(''); }}>{t.auth.loginButton}</button>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {showOnboarding && (
        <OnboardingModal
          onClose={() => setShowOnboarding(false)}
          translations={t.onboarding}
        />
      )}

      {showDeleteConfirm && (
        <ConfirmModal
          isOpen={showDeleteConfirm}
          onClose={() => {
            setShowDeleteConfirm(false);
            setBandToDelete(null);
          }}
          onConfirm={confirmDeleteBand}
          title={t.deleteConfirm?.title || '¿Eliminar banda?'}
          message={t.deleteConfirm?.message || '¿Estás seguro de que quieres eliminar esta banda? Esta acción no se puede deshacer.'}
          confirmText={t.deleteConfirm?.confirm || 'Eliminar'}
          cancelText={t.deleteConfirm?.cancel || 'Cancelar'}
        />
      )}

      {pendingLocation && (
        <div className="modal-overlay">
          <div className="modal-content confirm-location-modal">
            <div className="modal-header">
              <h2>{t.map.confirmLocation.title}</h2>
              <button onClick={handleCancelLocation} className="close-button">&times;</button>
            </div>
            <div className="confirm-location-content">
              <p className="location-info">
                <strong>{t.map.confirmLocation.detectedLocation}</strong>
                {pendingLocation.city || t.map.confirmLocation.noName}, {pendingLocation.country || t.map.confirmLocation.unknown}
              </p>
              <p className="coordinates-info">
                <strong>{t.map.confirmLocation.coordinates}</strong>
                {pendingLocation.latitude}, {pendingLocation.longitude}
              </p>
              <p className="instruction-text">
                {t.map.confirmLocation.instruction}
              </p>
            </div>
            <div className="form-actions">
              <button onClick={handleCancelLocation} className="cancel-button">
                {t.map.confirmLocation.cancel}
              </button>
              <button onClick={handleConfirmLocation} className="submit-button">
                {t.map.confirmLocation.confirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-left">
            <p>
              <strong>LocalNoise</strong>
            </p>
            <span className="separator" style={{ color: '#535353' }}>•</span>
            <div className="powered-by-section">
              <span className="powered-by-text">Powered by</span>
              <span className="service-text spotify-text">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
                Spotify
              </span>
              <span className="separator" style={{ color: '#535353' }}>+</span>
              <span className="service-text deezer-text">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/0/0e/Deezer_New_Icon.svg"
                  alt="Deezer"
                  width="16"
                  height="16"
                  className="deezer-icon"
                />
                Deezer
              </span>
            </div>
          </div>
          <p className="footer-copy">
            © 2025 - Made with <Heart size={12} fill="#FF5E5B" style={{ display: 'inline', verticalAlign: 'middle', margin: '0 2px' }} /> for local music
          </p>
          <div className="footer-links">
            <button onClick={() => setShowDeveloperModal(true)} className="footer-link-button">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              Created by
            </button>
            <span className="separator">•</span>
            <a href="https://github.com/JaviRL7" target="_blank" rel="noopener noreferrer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </a>
            <span className="separator">•</span>
            <a href="https://www.linkedin.com/in/javier-rodriguez-lopez-4795a8180/" target="_blank" rel="noopener noreferrer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
              LinkedIn
            </a>
          </div>
        </div>
      </footer>

      {/* Developer Modal */}
      <DeveloperModal 
        isOpen={showDeveloperModal} 
        onClose={() => setShowDeveloperModal(false)} 
      />
    </div>
  );
}

export default App;
