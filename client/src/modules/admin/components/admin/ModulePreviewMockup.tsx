import React from 'react';
import {
    LayoutDashboard, Target, Calendar, Users, DollarSign,
    Package, BarChart3, CheckSquare, Settings, Trophy,
    Clock, TrendingUp, Bell, MapPin
} from 'lucide-react';

interface ModulePreviewMockupProps {
    moduleCode: string;
    moduleName: string;
    category: string;
}

// Miniature mockup of Dashboard
const DashboardMockup = () => (
    <div className="bg-slate-900 rounded-lg p-3 space-y-2">
        <div className="flex items-center gap-2 mb-3">
            <LayoutDashboard className="w-4 h-4 text-primary-400" />
            <span className="text-xs font-medium text-white">Dashboard</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
            <div className="bg-emerald-500/20 rounded p-2 text-center">
                <div className="text-lg font-bold text-emerald-400">12</div>
                <div className="text-[10px] text-slate-400">Sessions</div>
            </div>
            <div className="bg-blue-500/20 rounded p-2 text-center">
                <div className="text-lg font-bold text-blue-400">9.2</div>
                <div className="text-[10px] text-slate-400">Avg Score</div>
            </div>
            <div className="bg-amber-500/20 rounded p-2 text-center">
                <div className="text-lg font-bold text-amber-400">85%</div>
                <div className="text-[10px] text-slate-400">Progress</div>
            </div>
        </div>
        <div className="h-16 bg-slate-800 rounded flex items-end p-2 gap-1">
            {[40, 60, 45, 80, 55, 70, 90].map((h, i) => (
                <div key={i} className="flex-1 bg-primary-500/60 rounded-t" style={{ height: `${h}%` }} />
            ))}
        </div>
    </div>
);

// Miniature mockup of Scoring
const ScoringMockup = () => (
    <div className="bg-slate-900 rounded-lg p-3 space-y-2">
        <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-red-400" />
            <span className="text-xs font-medium text-white">Scoring</span>
        </div>
        {/* Target face */}
        <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full bg-white border-4 border-slate-600" />
            <div className="absolute inset-2 rounded-full bg-slate-800" />
            <div className="absolute inset-4 rounded-full bg-blue-500" />
            <div className="absolute inset-6 rounded-full bg-red-500" />
            <div className="absolute inset-8 rounded-full bg-amber-400" />
            <div className="absolute inset-[38px] rounded-full bg-amber-300" />
        </div>
        {/* Score row */}
        <div className="flex justify-center gap-1">
            {[10, 9, 'X', 10, 8, 9].map((s, i) => (
                <div key={i} className={`w-6 h-6 rounded text-[10px] font-bold flex items-center justify-center
                    ${s === 'X' ? 'bg-amber-500 text-black' : s === 10 ? 'bg-amber-400 text-black' : 'bg-slate-700 text-white'}`}>
                    {s}
                </div>
            ))}
        </div>
        <div className="text-center text-lg font-bold text-emerald-400">56/60</div>
    </div>
);

// Miniature mockup of Schedule/Calendar
const ScheduleMockup = () => (
    <div className="bg-slate-900 rounded-lg p-3 space-y-2">
        <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-medium text-white">Training Schedule</span>
        </div>
        <div className="space-y-1">
            {[
                { time: '07:00', title: 'Morning Practice', color: 'bg-emerald-500' },
                { time: '14:00', title: 'Technique Drill', color: 'bg-blue-500' },
                { time: '17:00', title: 'Strength Training', color: 'bg-orange-500' },
            ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 bg-slate-800 rounded p-1.5">
                    <div className={`w-1 h-6 rounded ${item.color}`} />
                    <div>
                        <div className="text-[10px] text-slate-400">{item.time}</div>
                        <div className="text-xs text-white">{item.title}</div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

// Miniature mockup of Attendance
const AttendanceMockup = () => (
    <div className="bg-slate-900 rounded-lg p-3 space-y-2">
        <div className="flex items-center gap-2 mb-3">
            <CheckSquare className="w-4 h-4 text-green-400" />
            <span className="text-xs font-medium text-white">Attendance</span>
        </div>
        <div className="space-y-1">
            {[
                { name: 'Andi P.', status: 'PRESENT', color: 'bg-emerald-500' },
                { name: 'Siti R.', status: 'LATE', color: 'bg-amber-500' },
                { name: 'Budi S.', status: 'ABSENT', color: 'bg-red-500' },
            ].map((item, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-800 rounded p-1.5">
                    <span className="text-xs text-white">{item.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${item.color} text-white`}>
                        {item.status}
                    </span>
                </div>
            ))}
        </div>
    </div>
);

// Miniature mockup of Finance
const FinanceMockup = () => (
    <div className="bg-slate-900 rounded-lg p-3 space-y-2">
        <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-medium text-white">Finance</span>
        </div>
        <div className="bg-emerald-500/20 rounded p-2 text-center mb-2">
            <div className="text-xs text-emerald-300">Monthly Revenue</div>
            <div className="text-xl font-bold text-emerald-400">Rp 15.2M</div>
        </div>
        <div className="space-y-1">
            {[
                { label: 'Membership', amount: 'Rp 8.5M', pct: 56 },
                { label: 'Training', amount: 'Rp 4.2M', pct: 28 },
            ].map((item, i) => (
                <div key={i} className="bg-slate-800 rounded p-1.5">
                    <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-slate-400">{item.label}</span>
                        <span className="text-white">{item.amount}</span>
                    </div>
                    <div className="h-1 bg-slate-700 rounded">
                        <div className="h-full bg-emerald-500 rounded" style={{ width: `${item.pct}%` }} />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

// Miniature mockup of Orders/Commerce
const OrdersMockup = () => (
    <div className="bg-slate-900 rounded-lg p-3 space-y-2">
        <div className="flex items-center gap-2 mb-3">
            <Package className="w-4 h-4 text-orange-400" />
            <span className="text-xs font-medium text-white">Orders</span>
        </div>
        <div className="space-y-1">
            {[
                { id: 'JO-001', status: 'Production', color: 'bg-blue-500' },
                { id: 'JO-002', status: 'QC Check', color: 'bg-amber-500' },
                { id: 'JO-003', status: 'Shipped', color: 'bg-emerald-500' },
            ].map((item, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-800 rounded p-1.5">
                    <span className="text-xs font-mono text-slate-300">{item.id}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${item.color} text-white`}>
                        {item.status}
                    </span>
                </div>
            ))}
        </div>
    </div>
);

// Miniature mockup of Analytics
const AnalyticsMockup = () => (
    <div className="bg-slate-900 rounded-lg p-3 space-y-2">
        <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-medium text-white">Analytics</span>
        </div>
        <div className="flex gap-2">
            <div className="flex-1 bg-purple-500/20 rounded p-2 text-center">
                <TrendingUp className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                <div className="text-sm font-bold text-purple-400">+12%</div>
                <div className="text-[10px] text-slate-400">Growth</div>
            </div>
            <div className="flex-1 bg-cyan-500/20 rounded p-2 text-center">
                <Trophy className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                <div className="text-sm font-bold text-cyan-400">3</div>
                <div className="text-[10px] text-slate-400">Awards</div>
            </div>
        </div>
        <div className="h-12 flex items-end gap-1 p-1 bg-slate-800 rounded">
            {[30, 45, 60, 40, 70, 55, 80, 65].map((h, i) => (
                <div key={i} className="flex-1 bg-gradient-to-t from-purple-600 to-purple-400 rounded-t" style={{ height: `${h}%` }} />
            ))}
        </div>
    </div>
);

// Miniature mockup of Admin/Users
const UsersMockup = () => (
    <div className="bg-slate-900 rounded-lg p-3 space-y-2">
        <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-red-400" />
            <span className="text-xs font-medium text-white">User Management</span>
        </div>
        <div className="grid grid-cols-4 gap-1 mb-2">
            {['💪', '🎯', '👨‍🏫', '👨‍👩‍👧'].map((emoji, i) => (
                <div key={i} className="bg-slate-800 rounded p-2 text-center text-lg">
                    {emoji}
                </div>
            ))}
        </div>
        <div className="space-y-1">
            {['Athletes', 'Coaches', 'Parents'].map((role, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-800 rounded p-1.5">
                    <span className="text-xs text-white">{role}</span>
                    <span className="text-xs text-primary-400">{Math.floor(Math.random() * 50 + 10)}</span>
                </div>
            ))}
        </div>
    </div>
);

// Generic Module Mockup for unknown types
const GenericMockup = ({ moduleName }: { moduleName: string }) => (
    <div className="bg-slate-900 rounded-lg p-3 space-y-2">
        <div className="flex items-center gap-2 mb-3">
            <Settings className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-medium text-white">{moduleName}</span>
        </div>
        <div className="h-24 bg-slate-800 rounded flex items-center justify-center">
            <div className="text-center">
                <Package className="w-8 h-8 text-slate-600 mx-auto mb-1" />
                <span className="text-[10px] text-slate-500">Module Preview</span>
            </div>
        </div>
        <div className="flex gap-1">
            <div className="flex-1 h-3 bg-slate-700 rounded" />
            <div className="flex-1 h-3 bg-slate-700 rounded" />
        </div>
    </div>
);

const AthleteDashboardMockup = () => (
    <div className="bg-slate-900 rounded-lg p-3 space-y-2">
        <div className="flex items-center gap-2 mb-3">
            <LayoutDashboard className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-medium text-white">Athlete Dashboard</span>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="bg-cyan-500/20 rounded p-2 text-center">
                <div className="text-lg font-bold text-cyan-400">9.17</div>
                <div className="text-[10px] text-slate-400">Avg Arrow</div>
            </div>
            <div className="bg-blue-500/20 rounded p-2 text-center">
                <div className="text-lg font-bold text-blue-400">5</div>
                <div className="text-[10px] text-slate-400">Sessions</div>
            </div>
        </div>
        <div className="bg-slate-800 rounded p-2 h-20 flex items-end justify-between px-2 gap-1">
            {[9.0, 9.2, 9.1, 9.5, 9.3, 9.4].map((v, i) => (
                <div key={i} className="bg-cyan-500 w-full rounded-t opacity-80" style={{ height: `${(v - 8) * 40}%` }} />
            ))}
        </div>
    </div>
);

const ModulePreviewMockup: React.FC<ModulePreviewMockupProps> = ({ moduleCode, moduleName, category }) => {
    // Map module codes to mockup components
    const codeLower = moduleCode.toLowerCase();

    if (codeLower.includes('athlete_dashboard')) {
        return <AthleteDashboardMockup />;
    }

    if (codeLower.includes('dashboard') || codeLower.includes('dash')) {
        return <DashboardMockup />;
    }
    if (codeLower.includes('score') || codeLower.includes('scoring')) {
        return <ScoringMockup />;
    }
    if (codeLower.includes('schedule') || codeLower.includes('training') || codeLower.includes('calendar')) {
        return <ScheduleMockup />;
    }
    if (codeLower.includes('attendance') || codeLower.includes('checkin')) {
        return <AttendanceMockup />;
    }
    if (codeLower.includes('finance') || codeLower.includes('payment') || codeLower.includes('fee')) {
        return <FinanceMockup />;
    }
    if (codeLower.includes('order') || codeLower.includes('commerce') || codeLower.includes('product')) {
        return <OrdersMockup />;
    }
    if (codeLower.includes('analytic') || codeLower.includes('report') || codeLower.includes('stat')) {
        return <AnalyticsMockup />;
    }
    if (codeLower.includes('user') || codeLower.includes('admin') || codeLower.includes('manage')) {
        return <UsersMockup />;
    }

    // Category-based fallbacks
    switch (category) {
        case 'SPORT':
            return <ScoringMockup />;
        case 'COMMERCE':
            return <OrdersMockup />;
        case 'ADMIN':
            return <UsersMockup />;
        default:
            return <GenericMockup moduleName={moduleName} />;
    }
};

export default ModulePreviewMockup;
