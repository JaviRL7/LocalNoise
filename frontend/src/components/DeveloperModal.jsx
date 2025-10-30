import '../styles/DeveloperModal.css';

function DeveloperModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content developer-modal" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="close-button-dev">&times;</button>
        
        <div className="developer-content">
          <div className="developer-header">
            <img src="/foto2.PNG" alt="Javier Rodriguez" className="developer-photo" />
            <div className="developer-title">
              <h2>Hi, I'm Javier!</h2>
              <p className="developer-subtitle">Full Stack Developer</p>
              <p className="developer-subtitle-extra">Los Planetas enjoyer</p>
            </div>
          </div>

          <div className="developer-bio">
            <p>
              I'm just a <strong>broke developer</strong> trying to make cool stuff for the community 
              (and for my portfolio, because, you know, I kinda need to eat). 
            </p>
            <p>
              All donations go toward keeping my <strong>personal projects alive</strong> and helping me <strong>find a job</strong>.
            </p>
          </div>

          <div className="developer-links">
            <a 
              href="https://www.linkedin.com/in/javier-rodriguez-lopez-4795a8180/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="developer-link linkedin"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
              LinkedIn
            </a>

            <a 
              href="mailto:javierrldev@gmail.com"
              className="developer-link email"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              javierrldev@gmail.com
            </a>
          </div>

          <div className="developer-cta">
            <a 
              href="https://ko-fi.com/javi_r0dev" 
              target="_blank" 
              rel="noopener noreferrer"
              className="kofi-cta-button"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.7-.091-3.71.951-1.01 3.005-1.086 4.363.407 0 0 1.565-1.782 3.468-.963 1.904.82 1.832 3.011.723 4.311zm6.173.478c-.928.116-1.682.028-1.682.028V7.284h1.77s1.971.551 1.971 2.638c0 1.913-.985 2.667-2.059 3.015z"/>
              </svg>
              Buy me a coffee (please)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeveloperModal;
