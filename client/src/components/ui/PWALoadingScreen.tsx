import React, { useEffect, useState } from 'react';
import ComplexBackgroundCanvas from './ComplexBackgroundCanvas';
import AnimatedHexLogo from './AnimatedHexLogo';

const TIPS = [
    "Compiling Archery Data...",
    "Calibrating Quantum Bows...",
    "Optimizing Arrow Aerodynamics...",
    "Loading Club Databases...",
    "Syncing with Perpani Servers...",
    "Generating 3D Targets...",
    "Encrypting Scorecards...",
    "Establishing Secure Neural Link...",
    "Buffering Wind Physics...",
    "Rendering Digital Field..."
];

const STATUS_MESSAGES = [
    { pct: 0, text: "INITIALIZING_KERNEL", log: "Kernel_Init_Sequence_Start" },
    { pct: 15, text: "MOUNTING_VIRTUAL_DOM", log: "V_DOM_Mount_Success" },
    { pct: 30, text: "CONNECTING_NEURAL_NET", log: "Neural_Link_Established_Secure" },
    { pct: 45, text: "LOADING_ASSETS_PACK", log: "Asset_Bundle_Decompressed" },
    { pct: 60, text: "SYNCING_DATABASES", log: "DB_Sync_Shard_01_OK" },
    { pct: 75, text: "OPTIMIZING_GRAPHICS", log: "GPU_Acceleration_Enabled" },
    { pct: 90, text: "FINALIZING_BOOT", log: "Boot_Sequence_Finalizing" },
    { pct: 100, text: "SYSTEM_READY", log: "System_Ready" }
];

interface LoadingScreenProps {
    onComplete?: () => void;
    isLoading?: boolean;
}

const PWALoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete, isLoading }) => {
    const [logs, setLogs] = useState<string[]>([]);
    const [currentTip, setCurrentTip] = useState(0);
    const [percentage, setPercentage] = useState(0);
    const [statusText, setStatusText] = useState(STATUS_MESSAGES[0].text);

    // Valid Props: isLoading (true = hold at 90%, false = finish), onComplete
    // Default mode (no isLoading prop): behave like before (simulated 4.5s)

    useEffect(() => {
        const DURATION = 4500;
        const INTERVAL_TIME = 50;

        // If controlled mode (isLoading is explicitly provided)
        const isControlled = isLoading !== undefined;

        let interval: NodeJS.Timeout;

        if (!isControlled) {
            // ORIGINAL SIMULATION MODE
            const TOTAL_STEPS = DURATION / INTERVAL_TIME;
            let step = 0;
            interval = setInterval(() => {
                step++;
                const progress = Math.max(0, Math.min(step / TOTAL_STEPS, 1)); // Clamp 0-1
                const currentPct = Math.round(progress * 100);

                setPercentage(currentPct);

                // Update text
                const messageObj = [...STATUS_MESSAGES].reverse().find(m => currentPct >= m.pct);
                if (messageObj) setStatusText(messageObj.text);

                if (step >= TOTAL_STEPS) {
                    clearInterval(interval);
                    if (onComplete) setTimeout(onComplete, 500);
                }
            }, INTERVAL_TIME);

        } else {
            // REALISTIC SYNC MODE
            // 1. Initial Phase: Quickly go to 80% (System Init)
            // 2. Wait Phase: Stall at 80-90% while isLoading is true
            // 3. Finish Phase: When isLoading is false, zoom to 100%

            const TARGET_WAIT_PCT = 85;

            interval = setInterval(() => {
                setPercentage(prev => {
                    // If loading is finished, zoom to 100
                    if (isLoading === false) {
                        const next = prev + 5; // Fast finish
                        if (next >= 100) {
                            clearInterval(interval);
                            // Ensure we hit exactly 100 and update text
                            setStatusText("SYSTEM_READY");
                            // Small delay before unmounting
                            if (onComplete) setTimeout(onComplete, 800);
                            return 100;
                        }
                        return next;
                    }

                    // If still loading, approach TARGET_WAIT_PCT (asymptotic)
                    if (prev < TARGET_WAIT_PCT) {
                        // Slow down as we get closer
                        const diff = TARGET_WAIT_PCT - prev;
                        const increment = Math.max(0.2, diff * 0.05);
                        return Math.min(prev + increment, TARGET_WAIT_PCT);
                    } else {
                        // Wobble slightly around 85-88% to show activity
                        return prev;
                    }
                });
            }, INTERVAL_TIME);
        }

        return () => clearInterval(interval);
    }, [isLoading, onComplete]);

    // Text sync for Controlled Mode
    useEffect(() => {
        if (isLoading !== undefined) {
            const messageObj = [...STATUS_MESSAGES].reverse().find(m => percentage >= m.pct);
            if (messageObj) setStatusText(messageObj.text);
        }
    }, [percentage, isLoading]);


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
        const timeString = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const newLog = `[SYSTEM] ${statusText} ... OK`;

        setLogs(prev => [...prev.slice(-5), `${timeString} ${newLog}`]);
    }, [statusText]);

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

        /* Glitch Animation */
        @keyframes glitch {
          0% { transform: translate(0); text-shadow: -2px 0 #0ff, 2px 0 #f00; clip-path: inset(40% 0 61% 0); }
          20% { transform: translate(-2px, 2px); text-shadow: -2px 0 #f00, 2px 0 #0ff; clip-path: inset(92% 0 1% 0); }
          40% { transform: translate(-2px, -2px); text-shadow: 2px 0 #0ff, -2px 0 #f00; clip-path: inset(43% 0 1% 0); }
          60% { transform: translate(2px, 2px); text-shadow: 2px 0 #f00, -2px 0 #0ff; clip-path: inset(25% 0 58% 0); }
          80% { transform: translate(2px, -2px); text-shadow: -2px 0 #0ff, 2px 0 #f00; clip-path: inset(54% 0 7% 0); }
          100% { transform: translate(0); text-shadow: -2px 0 #f00, 2px 0 #0ff; clip-path: inset(58% 0 43% 0); }
        }
        .animate-glitch { animation: glitch 0.5s cubic-bezier(.25, .46, .45, .94) both infinite; }
        
        @keyframes typing {
            from { width: 0 }
            to { width: 100% }
        }
        
        .animate-typing {
            overflow: hidden;
            white-space: nowrap;
            border-right: 2px solid transparent;
            animation: typing 2s steps(40, end), blink 0.75s step-end infinite;
        }
      `}</style>

            {/* Interactive Background Canvas - Wrapped to be absolute */}
            <div className="absolute inset-0 z-0">
                <ComplexBackgroundCanvas progress={percentage} />
            </div>

            {/* DARKER Overlay to ensure text readability against bright particles */}
            <div className="absolute inset-0 bg-black/60 pointer-events-none" />

            {/* MAIN CONTAINER */}
            <div className="relative flex flex-col items-center justify-center w-full max-w-xl p-8 z-10 pointer-events-none transition-all duration-300">

                {/* Central Glow - Reduced opacity to not wash out text */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] w-64 h-64 bg-cyan-500 rounded-full blur-[80px] animate-bg-glow opacity-20" />

                {/* Floating Logo with Hexagon Golden Edge */}
                <div className="mb-8 pointer-events-auto cursor-pointer animate-float hover:scale-105 transition-transform duration-300">
                    <AnimatedHexLogo size="w-40 h-40" />
                </div>

                {/* TEXT AREA */}
                <div className="flex flex-col items-center gap-2 w-full">
                    <div className="relative">
                        <h1 className="text-4xl font-bold tracking-[0.2em] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] animate-pulse">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
                                Csystem
                            </span>
                        </h1>
                        <span className="absolute top-0 left-0 -ml-2 text-cyan-400 opacity-70 animate-ping" style={{ animationDuration: '3s' }}>_</span>
                    </div>

                    {/* PROGRESS BAR */}
                    <div className="w-full max-w-md h-2 bg-slate-800/80 rounded-full mt-6 overflow-hidden backdrop-blur-sm ring-1 ring-slate-700/50 relative shadow-lg">
                        <div
                            className="h-full bg-gradient-to-r from-blue-600 via-cyan-500 to-amber-400 relative"
                            style={{ width: `${percentage}%`, transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
                        >
                            <div className="absolute inset-0 bg-white/40 w-full -translate-x-full animate-[shimmer_1s_infinite]" />
                        </div>
                    </div>

                    <div className="flex justify-between w-full max-w-md mt-1 px-1">
                        <span className="text-[10px] text-cyan-400 font-mono animate-pulse drop-shadow-[0_1px_2px_rgba(0,0,0,1)] font-semibold">
                            {Math.floor(percentage) < 100 ? 'PROCESSING_DATA_STREAMS' : 'SYSTEM_READY'}
                        </span>
                        <span className="text-[10px] text-amber-400 font-mono drop-shadow-[0_1px_2px_rgba(0,0,0,1)] font-semibold">
                            {Math.floor(percentage)}%
                        </span>
                    </div>

                    {/* SCROLLING LOGS (Hacker Terminal feel) */}
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

export default PWALoadingScreen;
