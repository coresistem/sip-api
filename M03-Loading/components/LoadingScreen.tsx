import React, { useState, useEffect } from 'react';
import Logo from './Logo';
import BackgroundCanvas from './BackgroundCanvas';

interface LoadingScreenProps {
  progress: number;
  status: string;
}

const TIPS = [
  "Did you know? HexaFlow caches data offline for 2x faster subsequent loads.",
  "Tip: You can install this app to your home screen for a native experience.",
  "System: Optimizing graphical assets for your specific device GPU.",
  "Security: Establishing end-to-end encrypted handshake with the server.",
  "Network: Compressing data streams to save your bandwidth.",
];

const LoadingScreen: React.FC<LoadingScreenProps> = ({ progress, status }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [currentTip, setCurrentTip] = useState(0);

  // Cycle Tips
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % TIPS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Generate "Fake" High-Tech Logs based on progress
  useEffect(() => {
    const now = new Date();
    // Use fixed width time string to align logs perfectly
    const timeString = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' });
    const newLog = `[SYSTEM] ${status} ... OK`;
    
    // Keep last 5 logs to ensure they fit in the container without hard cutoffs
    setLogs(prev => [...prev.slice(-5), `${timeString} ${newLog}`]); 
  }, [status]); 

  return (
    // Universe Background: Radial Gradient
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_center,_#1B2735_0%,_#000000_100%)] overflow-hidden cursor-crosshair">
      <style>{`
        /* Hex Spin Animation */
        @keyframes hexSpin {
          0% { stroke-dasharray: 20 320; stroke-dashoffset: 0; }
          50% { stroke-dasharray: 120 320; stroke-dashoffset: -140; }
          100% { stroke-dasharray: 20 320; stroke-dashoffset: -310; }
        }
        .animate-hex-spin { animation: hexSpin 2s ease-in-out infinite; }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .animate-float { animation: float 4s ease-in-out infinite; }
        
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        .animate-bg-glow { animation: pulse-glow 3s ease-in-out infinite; }
        
        /* Blinking Cursor for Logs */
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        .cursor-blink { animation: blink 1s step-end infinite; }
      `}</style>

      {/* Interactive Background Canvas - NOW A PLAYGROUND */}
      <BackgroundCanvas progress={progress} />

      {/* DARKER Overlay to ensure text readability against bright particles */}
      <div className="absolute inset-0 bg-black/60 pointer-events-none" />

      {/* MAIN CONTAINER */}
      <div className="relative flex flex-col items-center justify-center w-full max-w-xl p-8 z-10 pointer-events-none transition-all duration-300">
        
        {/* Central Glow - Reduced opacity to not wash out text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] w-64 h-64 bg-cyan-500 rounded-full blur-[80px] animate-bg-glow opacity-20" />

        {/* Floating Logo */}
        <div className="relative w-32 h-32 mb-8 pointer-events-auto cursor-pointer animate-float hover:scale-105 transition-transform duration-300">
           <Logo 
             animateBorder={true} 
             className="w-full h-full drop-shadow-[0_0_25px_rgba(34,211,238,0.6)]" 
           />
           {/* Rings */}
           <div className="absolute inset-[-20%] border border-cyan-500/20 rounded-full animate-[spin_8s_linear_infinite]" />
           <div className="absolute inset-[-10%] border border-amber-500/20 rounded-full animate-[spin_5s_linear_infinite_reverse]" style={{ borderStyle: 'dashed' }} />
        </div>

        {/* TEXT AREA */}
        <div className="flex flex-col items-center gap-2 w-full">
          <h1 className="text-3xl font-bold tracking-[0.2em] text-white uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            HexaFlow
          </h1>
          
          {/* PROGRESS BAR */}
          <div className="w-full max-w-md h-2 bg-slate-800/80 rounded-full mt-6 overflow-hidden backdrop-blur-sm ring-1 ring-slate-700/50 relative shadow-lg">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 via-cyan-500 to-amber-400 relative"
              style={{ width: `${progress}%`, transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
            >
              <div className="absolute inset-0 bg-white/40 w-full -translate-x-full animate-[shimmer_1s_infinite]" />
            </div>
          </div>
          
          <div className="flex justify-between w-full max-w-md mt-1 px-1">
             <span className="text-[10px] text-cyan-400 font-mono animate-pulse drop-shadow-[0_1px_2px_rgba(0,0,0,1)] font-semibold">
                {Math.floor(progress) < 100 ? 'PROCESSING_DATA_STREAMS' : 'SYSTEM_READY'}
             </span>
             <span className="text-[10px] text-amber-400 font-mono drop-shadow-[0_1px_2px_rgba(0,0,0,1)] font-semibold">
                {Math.floor(progress)}%
             </span>
          </div>

          {/* SCROLLING LOGS (Hacker Terminal feel) */}
          {/* 
              FIX: 
              1. Increased height to h-36 (144px) to comfortably fit lines.
              2. Added 'mask-image' to fade out the top logs smoothly instead of cutting them off.
              3. Added inner padding and leading-relaxed for better readability.
          */}
          <div 
            className="w-full max-w-md h-36 mt-5 bg-[#020617]/90 backdrop-blur-xl rounded-lg border border-slate-700/50 p-4 font-mono text-[11px] flex flex-col justify-end overflow-hidden shadow-2xl relative"
            style={{ maskImage: 'linear-gradient(to bottom, transparent, black 15%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%)' }}
          >
             {/* Decorational Watermark Icon */}
             <div className="absolute top-2 right-2 opacity-10 pointer-events-none">
                <svg width="24" height="24" fill="none" stroke="currentColor" className="text-cyan-500"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" /></svg>
             </div>
             
             {logs.map((log, i) => (
               <div key={i} className="text-slate-300 whitespace-nowrap overflow-hidden text-ellipsis opacity-90 leading-5 drop-shadow-sm">
                  {/* Split timestamp and message for coloring */}
                  <span className="text-slate-500 mr-3 select-none inline-block w-[60px]">{log.substring(0, 8)}</span>
                  <span className={i === logs.length - 1 ? "text-cyan-300 font-semibold" : "text-slate-300"}>
                    {log.substring(9)}
                  </span>
               </div>
             ))}
             <div className="text-cyan-500 mt-1 drop-shadow-md leading-5">
                <span className="mr-3 select-none inline-block w-[60px] opacity-50 text-right">&gt;</span><span className="cursor-blink">_</span>
             </div>
          </div>

          {/* ROTATING TIPS (To Keep User Reading) */}
          <div className="mt-4 h-8 flex items-center justify-center w-full max-w-lg bg-black/40 rounded-full backdrop-blur-sm px-4 border border-white/5 transition-colors hover:border-white/10">
             <p className="text-xs text-slate-300 text-center italic transition-all duration-500 opacity-90 drop-shadow-md">
                {TIPS[currentTip]}
             </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;