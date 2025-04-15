
import React, { useState } from 'react';
import NeuralNetwork from '@/components/NeuralNetwork';

const Index = () => {
  const [showDashboard, setShowDashboard] = useState(false);

  const handleEnterDashboard = () => {
    setShowDashboard(true);
  };

  return (
    <div className="min-h-screen bg-[#0D0D12] text-white">
      {showDashboard ? (
        <Dashboard />
      ) : (
        <div className="h-screen w-full">
          <NeuralNetwork />
          <button
            onClick={handleEnterDashboard}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 px-8 py-2 bg-[#7E3ACE] text-white rounded-md hover:bg-[#6930A8] transition-all"
          >
            Enter Dashboard
          </button>
        </div>
      )}
    </div>
  );
};

// Simple placeholder dashboard component
const Dashboard = () => {
  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[#7E3ACE]">Cogniflow Dashboard</h1>
        <p className="text-gray-400">Your AI automation workspace</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Analytics Card */}
        <div className="bg-gray-800/50 backdrop-blur-lg p-6 rounded-xl border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Analytics Overview</h2>
          <div className="h-40 flex items-center justify-center bg-gray-900/50 rounded-lg">
            <p className="text-gray-400">Analytics visualization</p>
          </div>
          <div className="mt-4 flex justify-between text-sm">
            <span className="text-green-400">+24% growth</span>
            <span className="text-gray-400">Last 30 days</span>
          </div>
        </div>

        {/* Workflow Builder */}
        <div className="bg-gray-800/50 backdrop-blur-lg p-6 rounded-xl border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Workflow Builder</h2>
          <div className="h-40 flex items-center justify-center bg-gray-900/50 rounded-lg">
            <p className="text-gray-400">Drag & drop workflow elements</p>
          </div>
          <button className="mt-4 w-full py-2 bg-[#7E3ACE] rounded-md text-sm">
            Create New Workflow
          </button>
        </div>

        {/* Performance Card */}
        <div className="bg-gray-800/50 backdrop-blur-lg p-6 rounded-xl border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Performance</h2>
          <div className="h-40 flex items-center justify-center bg-gray-900/50 rounded-lg">
            <p className="text-gray-400">Resource utilization charts</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <div className="bg-gray-700/50 p-2 rounded">
              <span className="block text-[#3F8CFF]">CPU</span>
              <span>24%</span>
            </div>
            <div className="bg-gray-700/50 p-2 rounded">
              <span className="block text-[#FF6B6B]">Memory</span>
              <span>1.8GB</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
