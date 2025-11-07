import React from 'react';
import { useInterview } from '../context/InterviewContext';

const ProgressIndicator = () => {
  const { currentStage, completedStages } = useInterview();

  const stages = [
    { id: 'dsa', label: 'DSA Round', icon: '💻' },
    { id: 'conceptual', label: 'Conceptual', icon: '🎤' },
    { id: 'project', label: 'Project', icon: '🚀' }
  ];

  const getStageStatus = (stageId) => {
    if (completedStages.includes(stageId)) return 'completed';
    if (currentStage === stageId) return 'active';
    return 'pending';
  };

  const getCurrentRoundNumber = () => {
    const index = stages.findIndex(s => s.id === currentStage);
    return index >= 0 ? index + 1 : 0;
  };

  return (
    <div className="bg-gray-800 border-b border-gray-700 py-4">
      <div className="container mx-auto px-6">
        {/* Round Counter */}
        <div className="text-center mb-4">
          <p className="text-sm text-gray-400">
            Round <span className="text-white font-bold">{getCurrentRoundNumber()}</span> of{' '}
            <span className="text-white font-bold">{stages.length}</span>
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center justify-center space-x-4">
          {stages.map((stage, index) => {
            const status = getStageStatus(stage.id);
            
            return (
              <React.Fragment key={stage.id}>
                {/* Stage Circle */}
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center text-xl
                      transition-all duration-300
                      ${status === 'completed' ? 'bg-green-600 scale-110' : ''}
                      ${status === 'active' ? 'bg-blue-600 ring-4 ring-blue-400 ring-opacity-50 scale-110 animate-pulse' : ''}
                      ${status === 'pending' ? 'bg-gray-600' : ''}
                    `}
                  >
                    {status === 'completed' ? '✓' : stage.icon}
                  </div>
                  <p className={`
                    mt-2 text-xs font-medium
                    ${status === 'active' ? 'text-blue-400' : ''}
                    ${status === 'completed' ? 'text-green-400' : ''}
                    ${status === 'pending' ? 'text-gray-500' : ''}
                  `}>
                    {stage.label}
                  </p>
                </div>

                {/* Connector Line */}
                {index < stages.length - 1 && (
                  <div
                    className={`
                      w-16 h-1 transition-all duration-300
                      ${completedStages.includes(stage.id) ? 'bg-green-600' : 'bg-gray-600'}
                    `}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProgressIndicator;
