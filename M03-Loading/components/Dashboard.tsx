import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-slate-100 max-w-lg">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">Welcome to HexaFlow</h1>
        <p className="text-slate-600 leading-relaxed">
          The application has loaded successfully. The loading screen transition demonstrated 
          how to keep users engaged while assets initialize in the background.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-8 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          Reload to see Animation
        </button>
      </div>
    </div>
  );
};

export default Dashboard;