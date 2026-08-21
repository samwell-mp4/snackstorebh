import React from 'react';

export default function ScrollyProgress({ activeStep = 0, totalSteps = 5, onDotClick }) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i);

  return (
    <div className="scrolly-progress-container" aria-label="Progresso da narrativa">
      <div className="scrolly-progress-line"></div>
      {steps.map((step) => {
        const stepNum = String(step + 1).padStart(2, '0');
        const isActive = activeStep === step;

        return (
          <div
            key={step}
            className={`scrolly-progress-dot-wrapper ${isActive ? 'active' : ''}`}
            onClick={() => onDotClick && onDotClick(step)}
            role="button"
            aria-label={`Ir para a cena ${stepNum}`}
            tabIndex={0}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && onDotClick) {
                e.preventDefault();
                onDotClick(step);
              }
            }}
          >
            <div className="scrolly-progress-dot"></div>
            <span className="scrolly-progress-tooltip">{stepNum}</span>
          </div>
        );
      })}
    </div>
  );
}
