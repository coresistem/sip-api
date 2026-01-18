import React from 'react';
import { TestReport } from '../types';

interface ReportViewProps {
    reports: TestReport[];
    onReset: () => void;
}

const ReportView: React.FC<ReportViewProps> = ({ reports, onReset }) => {

    // Sort by score (Distance descending)
    const sortedReports = [...reports].sort((a, b) => b.totalDistance - a.totalDistance);

    const handleDownloadCSV = () => {
        const headers = ['Rank', 'Date', 'Participant', 'Assessor', 'Gender', 'Age', 'Level', 'Shuttle', 'Max Speed', 'VO2 Max', 'Distance', 'Fitness Category'];

        const rows = sortedReports.map((r, index) => [
            index + 1,
            r.participant.testDate,
            r.participant.fullName,
            r.participant.assessorName || 'N/A',
            r.participant.gender,
            r.participant.age,
            r.level,
            r.shuttle,
            r.maxSpeed,
            r.vo2Max,
            r.totalDistance,
            r.fitnessCategory
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `bleep_session_report_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 print:max-w-none">
            <div className="bg-slate-800 rounded-xl p-8 shadow-2xl border border-slate-700 print:bg-white print:text-black print:border-none print:shadow-none">
                <div className="flex flex-col md:flex-row justify-between items-start mb-8 border-b border-slate-700 pb-6 print:border-black gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2 print:text-black">Session Report</h1>
                        <p className="text-slate-400 print:text-gray-600">Date: {new Date().toLocaleDateString()}</p>
                        <p className="text-slate-400 print:text-gray-600">Participants: {reports.length}</p>
                    </div>
                    <div className="flex gap-3 print:hidden">
                        <button onClick={handlePrint} className="px-4 py-2 bg-slate-700 rounded hover:bg-slate-600 text-sm">Print</button>
                        <button onClick={handleDownloadCSV} className="px-4 py-2 bg-cyan-600 rounded hover:bg-cyan-500 text-white text-sm">Download CSV</button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-xs text-slate-400 uppercase tracking-wider border-b border-slate-700 print:border-black print:text-black">
                                <th className="py-3 pl-4">Rank</th>
                                <th className="py-3">Participant</th>
                                <th className="py-3">Assessor</th>
                                <th className="py-3 text-center">Level - Shuttle</th>
                                <th className="py-3 text-center">Distance</th>
                                <th className="py-3 text-center">VO2 Max</th>
                                <th className="py-3 text-right pr-4">Category</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700 print:divide-gray-300">
                            {sortedReports.map((r, idx) => (
                                <tr key={r.id} className="hover:bg-slate-700/20 print:text-black">
                                    <td className="py-4 pl-4 font-mono text-slate-500 print:text-black">#{idx + 1}</td>
                                    <td className="py-4 font-bold text-white print:text-black">
                                        {r.participant.fullName}
                                        <div className="text-xs text-slate-500 print:text-gray-500 font-normal">{r.participant.gender}, {r.participant.age}yo</div>
                                    </td>
                                    <td className="py-4 text-slate-300 print:text-black">{r.participant.assessorName || '-'}</td>
                                    <td className="py-4 text-center">
                                        <span className="text-xl font-bold text-white print:text-black">{r.level}</span>
                                        <span className="text-sm text-slate-500"> - {r.shuttle}</span>
                                    </td>
                                    <td className="py-4 text-center text-slate-300 print:text-black">{r.totalDistance}m</td>
                                    <td className="py-4 text-center text-cyan-400 font-bold print:text-black">{r.vo2Max}</td>
                                    <td className="py-4 text-right pr-4">
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase
                                    ${r.fitnessCategory === 'Excellent' || r.fitnessCategory === 'Superior' ? 'bg-emerald-500/20 text-emerald-400 print:border print:border-black' :
                                                r.fitnessCategory === 'Good' ? 'bg-cyan-500/20 text-cyan-400 print:border print:border-black' :
                                                    'bg-orange-500/20 text-orange-400 print:border print:border-black'}`}>
                                            {r.fitnessCategory}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-700 print:hidden">
                    <button
                        onClick={onReset}
                        className="w-full py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors"
                    >
                        Start New Session
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportView;
