import { useState, useEffect } from 'react';
import Map from './components/Map';
import AddBandForm from './components/AddBandForm';
import OnboardingModal from './components/OnboardingModal';
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
      setShowAuth(true);
      setAuthMode('login');
    } else {
      setSelectedBand(null);
      setShowAddForm(true);
    }
  };

  const handleEditBand = (band) => {
    setSelectedBand(band);
    setShowAddForm(true);
  };

  const handleDeleteBand = async (bandId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta banda?')) {
      return;
    }

    try {
      await bandService.delete(bandId);
      setBands(bands.filter(b => b.id !== bandId));
      setSelectedBand(null);
    } catch (err) {
      console.error('Error al eliminar banda:', err);
      alert(err.response?.data?.error || 'Error al eliminar la banda');
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'es' ? 'en' : 'es');
  };

  const t = translations[language];

  if (loading) {
    return <div className="loading">Cargando mapa...</div>;
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
          <div className="header-actions">
            <button
              onClick={() => setShowOnboarding(true)}
              className="info-button"
              title="Ver tutorial"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
            </button>
            <button
              onClick={toggleLanguage}
              className="language-toggle"
              title="Change language"
            >
              🌐 {language === 'es' ? 'EN' : 'ES'}
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="theme-toggle"
              title={darkMode ? "Modo día" : "Modo nocturno"}
            >
              {darkMode ? 'Light' : 'Dark'}
            </button>
            {user ? (
              <div className="user-menu-container">
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
                      <h3>Mis Bandas ({userBands.length})</h3>
                    </div>
                    <div className="user-bands-list">
                      {userBands.length === 0 ? (
                        <p className="no-bands-message">No has agregado ninguna banda aún</p>
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
                              <button onClick={() => { handleEditBand(band); setShowUserMenu(false); }} className="band-action-btn edit">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                                </svg>
                              </button>
                              <button onClick={() => { handleDeleteBand(band.id); setShowUserMenu(false); }} className="band-action-btn delete">
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
                      <button onClick={() => { handleLogout(); setShowUserMenu(false); }} className="logout-menu-button">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                        </svg>
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => { setShowAuth(true); setAuthMode('login'); }} className="login-button">
                Iniciar sesión
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="app-main">
        <Map
          bands={bands}
          onBandClick={setSelectedBand}
          selectedBand={selectedBand}
          darkMode={darkMode}
          user={user}
          onAddBandClick={handleAddBandClick}
          onShowAuth={() => { setShowAuth(true); setAuthMode('login'); }}
          onEditBand={handleEditBand}
          onDeleteBand={handleDeleteBand}
        />

        <div className="info-panel-overlay">
          <h2>Información</h2>
          <p>Total de bandas: <strong>{bands.length}</strong></p>
          <p>Países representados: <strong>{new Set(bands.map(b => b.country)).size}</strong></p>

          {!user && (
            <div className="info-message">
              <p>Inicia sesión para agregar bandas de tu escena local</p>
            </div>
          )}
        </div>
      </main>

      {showAddForm && (
        <AddBandForm
          band={selectedBand}
          onBandAdded={handleBandAdded}
          onBandUpdated={handleBandUpdated}
          onClose={() => {
            setShowAddForm(false);
            setSelectedBand(null);
          }}
        />
      )}

      {showAuth && (
        <div className="modal-overlay">
          <div className="modal-content auth-modal">
            <div className="modal-header">
              <h2>{authMode === 'login' ? 'Iniciar sesión' : 'Registrarse'}</h2>
              <button onClick={() => setShowAuth(false)} className="close-button">&times;</button>
            </div>

            <div className="auth-form-container">
              {error && <div className="error-message">{error}</div>}

              {authMode === 'login' ? (
                <form onSubmit={handleLogin}>
                  <button type="button" onClick={handleGoogleLogin} className="google-button">
                    <svg width="18" height="18" viewBox="0 0 18 18">
                      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                      <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.59.102-1.167.282-1.707V4.961H.957C.348 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
                      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
                    </svg>
                    Continuar con Google
                  </button>

                  <div className="auth-divider">
                    <span>o</span>
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" name="email" required />
                  </div>
                  <div className="form-group">
                    <label>Contraseña</label>
                    <input type="password" name="password" required />
                  </div>
                  <button type="submit" className="submit-button">Iniciar sesión</button>
                  <p className="auth-switch">
                    ¿No tienes cuenta? <button type="button" onClick={() => { setAuthMode('register'); setError(''); }}>Regístrate</button>
                  </p>
                </form>
              ) : (
                <form onSubmit={handleRegister}>
                  <button type="button" onClick={handleGoogleLogin} className="google-button">
                    <svg width="18" height="18" viewBox="0 0 18 18">
                      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                      <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.59.102-1.167.282-1.707V4.961H.957C.348 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
                      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
                    </svg>
                    Continuar con Google
                  </button>

                  <div className="auth-divider">
                    <span>o</span>
                  </div>

                  <div className="form-group">
                    <label>Nombre de usuario</label>
                    <input type="text" name="username" required />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" name="email" required />
                  </div>
                  <div className="form-group">
                    <label>Contraseña</label>
                    <input type="password" name="password" required />
                  </div>
                  <div className="form-group">
                    <label>Ciudad</label>
                    <input type="text" name="city" />
                  </div>
                  <div className="form-group">
                    <label>País</label>
                    <input type="text" name="country" />
                  </div>
                  <button type="submit" className="submit-button">Registrarse</button>
                  <p className="auth-switch">
                    ¿Ya tienes cuenta? <button type="button" onClick={() => { setAuthMode('login'); setError(''); }}>Inicia sesión</button>
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
    </div>
  );
}

export default App;
