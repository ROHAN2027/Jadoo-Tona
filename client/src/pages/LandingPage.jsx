import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const modules = [
    {
      id: 'dsa',
      title: 'DSA Coding Interview',
      description: 'Solve algorithmic problems with real-time code execution',
      icon: '💻',
      route: '/dsa',
      duration: '30-45 mins',
      features: ['5 coding problems', 'Multiple languages', 'Real-time feedback'],
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      id: 'conceptual',
      title: 'Conceptual Interview',
      description: 'Voice-based CS fundamentals Q&A with AI evaluation',
      icon: '🎤',
      route: '/conceptual',
      duration: '15-20 mins',
      features: ['Voice interaction', 'CS fundamentals', 'AI-powered feedback'],
      color: 'bg-purple-600 hover:bg-purple-700',
      badge: 'New'
    },
    {
      id: 'project',
      title: 'Project Deep Dive',
      description: 'GitHub repository analysis with contextual questions',
      icon: '🚀',
      route: '/project',
      duration: '20-30 mins',
      features: ['GitHub integration', 'Architecture discussion', 'AI analysis'],
      color: 'bg-green-600 hover:bg-green-700',
      badge: 'New',
      disabled: false
    }
  ];

  const handleModuleClick = (module) => {
    if (!module.disabled) {
      navigate(module.route);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <div className="container mx-auto px-6 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            Sarthi Interview Platform
          </h1>
          <p className="text-xl text-gray-400">
            AI-Powered Technical Interview Simulation
          </p>
        </div>

        {/* Module Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-12">
          {modules.map((module) => (
            <div
              key={module.id}
              onClick={() => handleModuleClick(module)}
              className={`relative bg-gray-800 rounded-xl p-6 shadow-xl transition-all duration-300 ${
                module.disabled 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'cursor-pointer transform hover:scale-105 hover:shadow-2xl'
              }`}
            >
              {/* Badge */}
              {module.badge && (
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold ${
                  module.disabled ? 'bg-gray-600' : 'bg-gradient-to-r from-yellow-500 to-orange-500'
                }`}>
                  {module.badge}
                </div>
              )}

              {/* Icon */}
              <div className="text-6xl mb-4">{module.icon}</div>

              {/* Title */}
              <h2 className="text-2xl font-bold mb-2">{module.title}</h2>

              {/* Description */}
              <p className="text-gray-400 mb-4">{module.description}</p>

              {/* Duration */}
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {module.duration}
              </div>

              {/* Features */}
              <ul className="space-y-2 mb-6">
                {module.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-sm text-gray-300">
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Button */}
              <button
                disabled={module.disabled}
                className={`w-full py-3 rounded-lg font-semibold text-white transition-colors ${
                  module.disabled ? 'bg-gray-600 cursor-not-allowed' : module.color
                }`}
              >
                {module.disabled ? 'Coming Soon' : 'Start Interview'}
              </button>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="max-w-4xl mx-auto bg-gray-800 rounded-xl p-8">
          <h3 className="text-2xl font-bold mb-4">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">1️⃣</div>
              <h4 className="font-semibold mb-2">Choose Module</h4>
              <p className="text-sm text-gray-400">Select the interview type that suits your needs</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">2️⃣</div>
              <h4 className="font-semibold mb-2">Complete Interview</h4>
              <p className="text-sm text-gray-400">Answer questions with AI-powered assistance</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">3️⃣</div>
              <h4 className="font-semibold mb-2">Get Feedback</h4>
              <p className="text-sm text-gray-400">Receive detailed performance analysis</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>Powered by AI • Real-time Evaluation • Comprehensive Feedback</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
