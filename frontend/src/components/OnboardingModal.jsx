import { useState } from 'react';
import '../styles/OnboardingModal.css';

function OnboardingModal({ onClose, translations }) {
  const [currentStep, setCurrentStep] = useState(0);

  const icons = [
    <svg width="64" height="64" viewBox="0 0 24 24" fill="#1DB954">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>,
    <svg width="64" height="64" viewBox="0 0 24 24" fill="#1DB954">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>,
    <svg width="64" height="64" viewBox="0 0 24 24" fill="#1DB954">
      <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
    </svg>,
    <svg width="64" height="64" viewBox="0 0 24 24" fill="#1DB954">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
    </svg>,
    <svg width="64" height="64" viewBox="0 0 24 24" fill="#1DB954">
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
    </svg>
  ];

  const steps = translations.steps.map((step, index) => ({
    ...step,
    icon: icons[index]
  }));

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    onClose();
  };

  const handleFinish = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    onClose();
  };

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-modal">
        <button onClick={handleSkip} className="onboarding-skip">
          {translations.skip}
        </button>

        <div className="onboarding-content">
          <div className="onboarding-icon">
            {steps[currentStep].icon}
          </div>

          <div className="onboarding-step-indicator">
            {translations.stepOf} {currentStep + 1} {translations.of} {steps.length}
          </div>

          <h2 className="onboarding-title">
            {steps[currentStep].title}
          </h2>

          <p
            className="onboarding-description"
            dangerouslySetInnerHTML={{ __html: steps[currentStep].description }}
          />
        </div>

        <div className="onboarding-dots">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`onboarding-dot ${index === currentStep ? 'active' : ''}`}
              onClick={() => setCurrentStep(index)}
            />
          ))}
        </div>

        <div className="onboarding-actions">
          {currentStep > 0 && (
            <button onClick={prevStep} className="onboarding-button secondary">
              {translations.previous}
            </button>
          )}
          {currentStep < steps.length - 1 ? (
            <button onClick={nextStep} className="onboarding-button primary">
              {translations.next}
            </button>
          ) : (
            <button onClick={handleFinish} className="onboarding-button primary">
              {translations.start}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default OnboardingModal;
