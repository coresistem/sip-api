import React from 'react';
import BackgroundCanvas from './components/BackgroundCanvas';
import OnboardingCard from './components/OnboardingCard';

const App: React.FC = () => {
  return (
    <main className="relative w-full h-screen flex justify-center items-center overflow-hidden bg-brand-bg text-brand-text">
      {/* Background Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <BackgroundCanvas />
      </div>

      {/* Foreground Content Layer */}
      <div className="relative z-10 w-full max-w-4xl px-4 flex justify-center">
        <OnboardingCard />
      </div>
    </main>
  );
};

export default App;