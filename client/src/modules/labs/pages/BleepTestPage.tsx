import React, { useState } from 'react';

import SessionSetup from '../features/bleep-test/components/SessionSetup';
import TestController from '../features/bleep-test/components/TestController';
import ReportView from '../features/bleep-test/components/ReportView';
import { Participant, TestReport } from '../features/bleep-test/types';
import { saveSession } from '../features/bleep-test/services/storageService';

type AppState = 'FORM' | 'TEST' | 'REPORT';

const BleepTestPage: React.FC = () => {
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
        <div className="bg-dark-900 min-h-screen">
            <div className="p-4 md:p-8">
                <header className="mb-10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/30">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-white">
                                Pro <span className="text-cyan-400">Bleep</span> Test
                            </h1>
                            <p className="text-slate-400 text-sm">Standard 20m Shuttle Run (PACER)</p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-center">
                        {view !== 'FORM' && (
                            <button onClick={handleReset} className="text-sm text-slate-400 hover:text-white">Back to Roster</button>
                        )}
                    </div>
                </header>

                <main>
                    {view === 'FORM' && <SessionSetup onStart={handleStartSession} />}
                    {view === 'TEST' && participants.length > 0 && (
                        <TestController participants={participants} onComplete={handleSessionComplete} />
                    )}
                    {view === 'REPORT' && reports.length > 0 && (
                        <ReportView reports={reports} onReset={handleReset} />
                    )}
                </main>
            </div>
        </div>
    );
};

export default BleepTestPage;
