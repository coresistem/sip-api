import React, { useState } from 'react';
import SessionSetup from './components/SessionSetup';
import TestController from './components/TestController';
import ReportView from './components/ReportView';
import { Participant, TestReport } from './types';
import { saveSession } from './services/storageService';

type AppState = 'FORM' | 'TEST' | 'REPORT';

const App: React.FC = () => {
  const [view, setView] = useState<AppState>('FORM');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [reports, setReports] = useState<TestReport[]>([]);

  const handleStartSession = (pList: Participant[]) => {
    setParticipants(pList);
    setView('TEST');
  };

  const handleSessionComplete = (rList: TestReport[]) => {
    // Save each report individually
    rList.forEach(r => saveSession(r));
    setReports(rList);
    setView('REPORT');
  };

  const handleReset = () => {
    setParticipants([]);
    setReports([]);
    setView('FORM');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <header className="max-w-7xl mx-auto mb-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
                Pro <span className="text-cyan-400">Bleep</span>
            </h1>
        </div>
        <div className="flex gap-4 items-center">
             {view !== 'FORM' && (
                 <button onClick={handleReset} className="text-sm text-slate-400 hover:text-white">Back to Roster</button>
             )}
             <div className="text-xs text-slate-600 font-mono border border-slate-800 rounded px-2 py-1">
                v1.2.0
            </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl">
        {view === 'FORM' && <SessionSetup onStart={handleStartSession} />}
        {view === 'TEST' && participants.length > 0 && (
          <TestController participants={participants} onComplete={handleSessionComplete} />
        )}
        {view === 'REPORT' && reports.length > 0 && (
          <ReportView reports={reports} onReset={handleReset} />
        )}
      </main>
    </div>
  );
};

export default App;