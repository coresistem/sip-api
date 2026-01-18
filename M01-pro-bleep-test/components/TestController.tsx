import React, { useEffect, useRef, useState } from 'react';
import { Participant, TestReport } from '../types';
import { BLEEP_LEVELS } from '../constants';
import { audioEngine } from '../utils/audio';
import { calculateVO2Max, getFitnessCategory } from '../utils/formulas';
import LiveProgress from './LiveProgress';
import { v4 as uuidv4 } from 'uuid';

interface TestControllerProps {
  participants: Participant[];
  onComplete: (reports: TestReport[]) => void;
}

// Track individual status for every participant
interface ParticipantState {
  status: 'RUNNING' | 'FINISHED';
  finalLevel: number;
  finalShuttle: number;
  finalDistance: number;
  warnings: number;
  stopTime: number; // for sorting/reporting
}

const createWorker = () => {
  const code = `
    let intervalId;
    self.onmessage = function(e) {
      if (e.data === 'start') {
        if(intervalId) clearInterval(intervalId);
        intervalId = setInterval(() => {
          self.postMessage('tick');
        }, 16); // ~60fps for smooth progress bar
      } else if (e.data === 'stop') {
        clearInterval(intervalId);
      }
    };
  `;
  const blob = new Blob([code], { type: "application/javascript" });
  return new Worker(URL.createObjectURL(blob));
};

const TestController: React.FC<TestControllerProps> = ({ participants, onComplete }) => {
  // Global Session State
  const [status, setStatus] = useState<'IDLE' | 'COUNTDOWN' | 'RUNNING' | 'PAUSED' | 'FINISHED'>('IDLE');
  const [countdown, setCountdown] = useState(5);
  const [levelIndex, setLevelIndex] = useState(0);
  const [shuttleIndex, setShuttleIndex] = useState(0); 
  const [progress, setProgress] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  
  // Individual State Map
  const [participantStates, setParticipantStates] = useState<Record<string, ParticipantState>>(() => {
    const initial: Record<string, ParticipantState> = {};
    participants.forEach(p => {
        initial[p.id] = {
            status: 'RUNNING',
            finalLevel: 0,
            finalShuttle: 0,
            finalDistance: 0,
            warnings: 0,
            stopTime: 0
        };
    });
    return initial;
  });

  // Engine State (Refs for loop access)
  const engineRef = useRef({
    status: 'IDLE',
    levelIndex: 0,
    shuttleIndex: 0,
    startTime: 0,
    pauseStartTime: 0,
    totalPausedTime: 0,
    nextScheduledBeep: 0,
    totalDistance: 0, // Global theoretical distance
  });

  const workerRef = useRef<Worker | null>(null);
  const currentLevelData = BLEEP_LEVELS[levelIndex];
  
  // Initialize Worker
  useEffect(() => {
    workerRef.current = createWorker();
    workerRef.current.onmessage = () => {
       updateLoop();
    };
    return () => {
      workerRef.current?.terminate();
      audioEngine.playBeep(0, 'stop'); 
    };
  }, []);

  const startSequence = async () => {
    audioEngine.init();
    audioEngine.announceGetReady();
    setStatus('COUNTDOWN');
    let count = 5;
    setCountdown(count);
    
    const interval = setInterval(() => {
      count--;
      setCountdown(count);
      
      if (count === 2) {
        audioEngine.announceReady();
      }

      if (count <= 0) {
        clearInterval(interval);
        beginTest();
      }
    }, 1000);
  };

  const beginTest = () => {
    const now = audioEngine.getCurrentTime();
    
    engineRef.current.startTime = now;
    engineRef.current.totalPausedTime = 0;
    engineRef.current.levelIndex = 0;
    engineRef.current.shuttleIndex = 0;
    engineRef.current.totalDistance = 0;
    engineRef.current.status = 'RUNNING';
    
    const firstInterval = BLEEP_LEVELS[0].timePerShuttle;
    engineRef.current.nextScheduledBeep = now + firstInterval;
    
    setStatus('RUNNING');
    setLevelIndex(0);
    setShuttleIndex(0);
    setTotalTime(0);
    
    // Reset individual states just in case
    setParticipantStates(prev => {
        const reset: Record<string, ParticipantState> = {};
        Object.keys(prev).forEach(key => {
            reset[key] = { ...prev[key], status: 'RUNNING', warnings: 0 };
        });
        return reset;
    });

    audioEngine.announceLevel(1);
    audioEngine.playBeep(now, 'shuttle');
    
    workerRef.current?.postMessage('start');
  };

  const toggleGlobalPause = () => {
    const currentStatus = engineRef.current.status;
    
    if (currentStatus === 'RUNNING') {
      engineRef.current.status = 'PAUSED';
      engineRef.current.pauseStartTime = audioEngine.getCurrentTime();
      setStatus('PAUSED');
      workerRef.current?.postMessage('stop');
      
    } else if (currentStatus === 'PAUSED') {
      const now = audioEngine.getCurrentTime();
      const pausedDuration = now - engineRef.current.pauseStartTime;
      engineRef.current.totalPausedTime += pausedDuration;
      engineRef.current.nextScheduledBeep += pausedDuration;
      
      engineRef.current.status = 'RUNNING';
      setStatus('RUNNING');
      workerRef.current?.postMessage('start');
    }
  };

  // Stop a specific participant
  const handleParticipantStop = (id: string) => {
     if (participantStates[id].status === 'FINISHED') return;

     setParticipantStates(prev => {
         const updated = { ...prev };
         // Record their status at the CURRENT global moment
         updated[id] = {
             ...updated[id],
             status: 'FINISHED',
             finalLevel: BLEEP_LEVELS[engineRef.current.levelIndex].level,
             finalShuttle: engineRef.current.shuttleIndex + 1,
             finalDistance: engineRef.current.totalDistance,
             stopTime: audioEngine.getCurrentTime()
         };
         return updated;
     });

     // Check if everyone is finished
     // We need to check the state AFTER this update. 
     // Since setParticipantStates is async, we do a quick check on the prev + current change
     const activeCount = Object.values(participantStates).filter(s => s.status === 'RUNNING').length;
     // activeCount includes the one we just stopped, so if it was 1, now it is 0
     if (activeCount <= 1) {
         finishSession();
     }
  };

  const handleParticipantWarning = (id: string) => {
      if (participantStates[id].status === 'FINISHED') return;
      
      setParticipantStates(prev => {
          const updated = { ...prev };
          const newWarnings = updated[id].warnings + 1;
          updated[id] = { ...updated[id], warnings: newWarnings };
          
          if (newWarnings >= 3) {
              // Auto stop on 3rd warning
              updated[id] = {
                ...updated[id],
                status: 'FINISHED',
                finalLevel: BLEEP_LEVELS[engineRef.current.levelIndex].level,
                finalShuttle: engineRef.current.shuttleIndex + 1,
                finalDistance: engineRef.current.totalDistance,
                stopTime: audioEngine.getCurrentTime()
            };
            audioEngine.playFail();
          } else {
             // Just a warning beep
             // Don't play fail sound globally as it might confuse others, 
             // or play a short distinct tone? Let's play the fail tone but short.
             audioEngine.playFail();
          }
          return updated;
      });

      // Similar check for all finished
      const activeCount = Object.values(participantStates).filter(s => s.status === 'RUNNING').length;
      const thisUserStopped = participantStates[id].warnings + 1 >= 3;
      if (thisUserStopped && activeCount <= 1) {
          finishSession();
      }
  };

  const finishSession = () => {
      engineRef.current.status = 'FINISHED';
      setStatus('FINISHED');
      workerRef.current?.postMessage('stop');
      audioEngine.playBeep(audioEngine.getCurrentTime(), 'stop');

      // Generate reports
      setTimeout(() => {
          const reports: TestReport[] = participants.map(p => {
              const state = participantStates[p.id];
              // If somehow they are still marked running (force stop session), capture current
              const level = state.status === 'FINISHED' ? state.finalLevel : BLEEP_LEVELS[engineRef.current.levelIndex].level;
              const shuttle = state.status === 'FINISHED' ? state.finalShuttle : engineRef.current.shuttleIndex + 1;
              const dist = state.status === 'FINISHED' ? state.finalDistance : engineRef.current.totalDistance;
              
              // Find speed from level data
              // The level stored in state is the 1-based level number (e.g. 1, 2, 3)
              // BLEEP_LEVELS is 0-indexed array, so Level 1 is index 0.
              const lvlData = BLEEP_LEVELS.find(l => l.level === level) || BLEEP_LEVELS[0];
              const vo2 = calculateVO2Max(level, shuttle, lvlData.shuttles);

              return {
                  id: uuidv4(),
                  participantId: p.id,
                  participant: p,
                  level: level,
                  shuttle: shuttle,
                  totalDistance: dist,
                  totalTime: 0, // Simplified for group report
                  maxSpeed: lvlData.speed,
                  vo2Max: vo2,
                  status: 'COMPLETED',
                  fitnessCategory: getFitnessCategory(vo2, p.gender, p.age),
                  history: []
              };
          });
          onComplete(reports);
      }, 1500);
  };

  const updateLoop = () => {
    const state = engineRef.current;
    if (state.status !== 'RUNNING') return;

    const now = audioEngine.getCurrentTime();
    const effectiveTime = now - state.startTime - state.totalPausedTime;
    
    // Look ahead window (0.1s)
    if (state.nextScheduledBeep - now < 0.1) {
       let nextLvl = state.levelIndex;
       let nextSht = state.shuttleIndex + 1;
       let levelChanged = false;

       state.totalDistance += 20;
       
       if (nextSht >= BLEEP_LEVELS[state.levelIndex].shuttles) {
          nextLvl++;
          nextSht = 0;
          levelChanged = true;
          
          if (nextLvl >= BLEEP_LEVELS.length) {
            finishSession();
            return;
          }
       }

       const nextDuration = BLEEP_LEVELS[nextLvl].timePerShuttle;
       const beepTime = state.nextScheduledBeep; 
       
       if (levelChanged) {
         audioEngine.playBeep(beepTime, 'level');
         audioEngine.announceLevel(nextLvl + 1);
       } else {
         audioEngine.playBeep(beepTime, 'shuttle');
       }

       state.nextScheduledBeep = beepTime + nextDuration;
       state.levelIndex = nextLvl;
       state.shuttleIndex = nextSht;
       
       setLevelIndex(nextLvl);
       setShuttleIndex(nextSht);
    } 

    setTotalTime(effectiveTime);
    
    const currentTotalDuration = BLEEP_LEVELS[state.levelIndex].timePerShuttle;
    const timeUntilNext = state.nextScheduledBeep - now;
    const timeSpent = currentTotalDuration - timeUntilNext;
    const p = Math.max(0, Math.min(1, timeSpent / currentTotalDuration));
    setProgress(p);
  };

  // --- Views ---

  if (status === 'IDLE') {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-slate-900 rounded-xl border border-slate-800 p-8 shadow-2xl">
        <h2 className="text-3xl font-bold text-white mb-6">Ready to Start Session?</h2>
        <div className="text-center mb-8">
            <p className="text-slate-400">Total Participants: <span className="text-white font-bold">{participants.length}</span></p>
            <p className="text-slate-400 mt-2">Ensure audio is audible for the whole group.</p>
        </div>
        
        <div className="flex items-center gap-4 mb-8">
             <label className="text-slate-400 text-sm">Volume</label>
             <input 
                type="range" 
                min="0" max="1" step="0.1" 
                value={volume}
                onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setVolume(v);
                    audioEngine.setVolume(v);
                }}
                className="w-32 accent-cyan-500"
             />
        </div>

        <button 
          onClick={startSequence}
          className="px-10 py-5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-2xl font-bold rounded-full shadow-lg transition-all transform hover:scale-105"
        >
          START GROUP TEST
        </button>
      </div>
    );
  }

  if (status === 'COUNTDOWN') {
    return (
        <div className="flex flex-col items-center justify-center h-96">
            <div className="text-9xl font-black text-cyan-400 animate-pulse">
                {countdown}
            </div>
            <p className="text-slate-400 mt-4 uppercase tracking-widest">Get Ready</p>
        </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Top Bar: Global Status */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-2xl relative overflow-hidden sticky top-4 z-30">
        <div className="flex justify-between items-center mb-4">
             <div className="flex items-center gap-4">
                 <button 
                    onClick={toggleGlobalPause}
                    className={`px-4 py-2 rounded font-bold text-sm uppercase tracking-wider ${status === 'PAUSED' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'}`}
                 >
                    {status === 'PAUSED' ? 'Resume' : 'Pause'}
                 </button>
                 <div className="text-xs text-slate-400 font-mono">
                     Global Timer: {Math.floor(totalTime / 60)}:{(totalTime % 60).toFixed(0).padStart(2, '0')}
                 </div>
             </div>
             
             <div className="text-right">
                 <div className="text-sm text-slate-400">Active Runners</div>
                 <div className="text-xl font-bold text-white">
                     {Object.values(participantStates).filter(s => s.status === 'RUNNING').length} / {participants.length}
                 </div>
             </div>
        </div>

        <LiveProgress 
          progress={progress}
          level={currentLevelData.level}
          shuttle={shuttleIndex + 1}
          totalShuttlesInLevel={currentLevelData.shuttles}
          speed={currentLevelData.speed}
        />
        
        {status === 'PAUSED' && (
            <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-20">
                <div className="text-center">
                    <h3 className="text-2xl font-bold text-white mb-2">SESSION PAUSED</h3>
                    <button onClick={toggleGlobalPause} className="px-6 py-2 bg-emerald-600 rounded-full font-bold">RESUME</button>
                </div>
            </div>
        )}
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {participants.map(p => {
              const state = participantStates[p.id] || { 
                  status: 'FINISHED', 
                  warnings: 0,
                  finalLevel: 0,
                  finalShuttle: 0,
                  finalDistance: 0,
                  stopTime: 0
              };
              const isRunning = state.status === 'RUNNING';
              
              return (
                  <div key={p.id} className={`relative p-5 rounded-xl border transition-all ${isRunning ? 'bg-slate-800 border-slate-700 shadow-lg' : 'bg-slate-900 border-slate-800 opacity-70'}`}>
                      <div className="flex justify-between items-start mb-4">
                          <div>
                              <h3 className="font-bold text-lg text-white truncate">{p.fullName}</h3>
                              <p className="text-sm text-slate-400 truncate">Assessor: {p.assessorName || 'None'}</p>
                          </div>
                          <div className="text-right">
                              {isRunning ? (
                                  <span className="inline-block px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded font-bold uppercase">Run</span>
                              ) : (
                                  <span className="inline-block px-2 py-1 bg-slate-700 text-slate-400 text-xs rounded font-bold uppercase">Done</span>
                              )}
                          </div>
                      </div>
                      
                      {/* Warnings Display */}
                      <div className="flex gap-1 mb-6">
                           {[1, 2, 3].map(i => (
                               <div key={i} className={`h-2 flex-1 rounded-full transition-colors ${state.warnings >= i ? 'bg-red-500' : 'bg-slate-700'}`}></div>
                           ))}
                      </div>

                      {/* Controls */}
                      <div className="grid grid-cols-2 gap-3">
                          <button
                            disabled={!isRunning}
                            onClick={() => handleParticipantWarning(p.id)}
                            className="py-3 rounded bg-yellow-600/20 border border-yellow-900 text-yellow-500 hover:bg-yellow-600/30 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm uppercase"
                          >
                              Warning
                          </button>
                          <button
                            disabled={!isRunning}
                            onClick={() => handleParticipantStop(p.id)}
                            className="py-3 rounded bg-red-600/20 border border-red-900 text-red-500 hover:bg-red-600/30 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm uppercase"
                          >
                              Stop
                          </button>
                      </div>
                      
                      {/* Result Overlay if finished */}
                      {!isRunning && (
                          <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center rounded-xl backdrop-blur-[1px]">
                              <div className="text-center">
                                  <div className="text-3xl font-bold text-white">L{state.finalLevel} - S{state.finalShuttle}</div>
                                  <div className="text-xs text-slate-400 uppercase tracking-widest mt-1">Final Score</div>
                              </div>
                          </div>
                      )}
                  </div>
              )
          })}
      </div>
    </div>
  );
};

export default TestController;