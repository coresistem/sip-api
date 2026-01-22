import React, { useState, useEffect, useRef } from 'react';
import LoadingScreen from './components/LoadingScreen';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [visualProgress, setVisualProgress] = useState(0);
  const [status, setStatus] = useState('Initializing System...');
  
  const targetProgress = useRef(0);

  // 1. ANIMATION LOOP
  useEffect(() => {
    let animationFrameId: number;

    const animateProgress = () => {
      setVisualProgress((prev) => {
        const target = targetProgress.current;
        if (prev >= target && target === 100) return 100;
        
        const diff = target - prev;
        if (diff <= 0.1) return prev;
        
        // Slower easing for a more "heavy" data feel
        return prev + diff * 0.05;
      });
      animationFrameId = requestAnimationFrame(animateProgress);
    };

    animationFrameId = requestAnimationFrame(animateProgress);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // 2. LONG LOAD SIMULATION (Simulating a heavy PWA start)
  useEffect(() => {
    const runSystemCheck = async () => {
      
      targetProgress.current = 5;
      setStatus('Mounting Core React Modules');
      await new Promise(r => setTimeout(r, 1000));

      targetProgress.current = 15;
      setStatus('Verifying Device Capabilities');
      await new Promise(r => setTimeout(r, 2000));

      targetProgress.current = 25;
      setStatus('Loading High-Res Texture Assets');
      await document.fonts.ready; 
      await new Promise(r => setTimeout(r, 3000)); // Heavy asset sim

      targetProgress.current = 40;
      setStatus('Initializing Service Worker Registry');
      await new Promise(r => setTimeout(r, 2500));

      targetProgress.current = 55;
      setStatus('Hydrating Local Offline Database');
      await new Promise(r => setTimeout(r, 3500)); // Database sim

      targetProgress.current = 70;
      setStatus('Handshaking with Secure API Gateway');
      await new Promise(r => setTimeout(r, 3000));

      targetProgress.current = 85;
      setStatus('Compiling WebAssembly Modules');
      await new Promise(r => setTimeout(r, 4000)); // Heavy computation sim

      targetProgress.current = 95;
      setStatus('Finalizing User Interface');
      await new Promise(r => setTimeout(r, 2000));

      targetProgress.current = 100;
      setStatus('Launching Application');
      await new Promise(r => setTimeout(r, 1000));
      
      setTimeout(() => {
        setIsLoading(false);
      }, 800);
    };

    runSystemCheck();
  }, []);

  return (
    <main className="w-full h-full relative">
      {isLoading ? (
        <LoadingScreen progress={visualProgress} status={status} />
      ) : (
        <Dashboard />
      )}
    </main>
  );
};

export default App;