import { useState, useEffect } from 'react';
import '../styles/SocialMediaModal.css';

function SocialMediaModal({ isOpen, onClose, onSave, initialData, translations }) {
  const [socialData, setSocialData] = useState({
    instagramUrl: '',
    twitterUrl: '',
    tiktokUrl: ''
  });

  const getDescription = () => {
    const isSpanish = translations?.instagram === 'Instagram' || !translations?.instagram;
    if (isSpanish) {
      return (
        <>
          Ayuda a otros a encontrar a esta banda en sus <span className="highlight-text">redes sociales</span>. Este paso es completamente <span className="highlight-text">opcional</span>.
        </>
      );
    } else {
      return (
        <>
          Help others find this band on <span className="highlight-text">social media</span>. This step is completely <span className="highlight-text">optional</span>.
        </>
      );
    }
  };

  useEffect(() => {
    if (initialData) {
      setSocialData({
        instagramUrl: initialData.instagramUrl || '',
        twitterUrl: initialData.twitterUrl || '',
        tiktokUrl: initialData.tiktokUrl || ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSocialData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    onSave(socialData);
    onClose();
  };

  const handleSkip = () => {
    onSave({ instagramUrl: '', twitterUrl: '', tiktokUrl: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content social-media-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{translations?.title || 'Agregar redes sociales'}</h2>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>

        <div className="social-media-modal-body">
          <p className="social-media-description">
            {getDescription()}
          </p>

          <div className="form-group">
            <label>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="social-icon instagram-icon">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span>{translations?.instagram || 'Instagram'}</span>
            </label>
            <input
              type="url"
              name="instagramUrl"
              value={socialData.instagramUrl}
              onChange={handleChange}
              placeholder="https://instagram.com/tubanda"
            />
          </div>

          <div className="form-group">
            <label>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="social-icon twitter-icon">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span>{translations?.twitter || 'X / Twitter'}</span>
            </label>
            <input
              type="url"
              name="twitterUrl"
              value={socialData.twitterUrl}
              onChange={handleChange}
              placeholder="https://x.com/tubanda"
            />
          </div>

          <div className="form-group">
            <label>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="social-icon tiktok-icon">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
              <span>{translations?.tiktok || 'TikTok'}</span>
            </label>
            <input
              type="url"
              name="tiktokUrl"
              value={socialData.tiktokUrl}
              onChange={handleChange}
              placeholder="https://tiktok.com/@tubanda"
            />
          </div>
        </div>

        <div className="social-media-modal-actions">
          <button onClick={handleSkip} className="skip-button">
            {translations?.skip || 'Omitir'}
          </button>
          <button onClick={handleSave} className="save-button">
            {translations?.save || 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SocialMediaModal;
