import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const InterviewResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get data from navigation state or fetch from API
    if (location.state) {
      setSessionData(location.state);
      setLoading(false);
    } else {
      // If no state, redirect to home
      navigate('/');
    }
  }, [location.state, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Loading results...</p>
        </div>
      </div>
    );
  }

  const { sessionType, totalScore, maxScore, questionsAnswered, concentrationScore } = sessionData;
  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  
  console.log('Session Data:', sessionData); // Debug log for entire session data
  console.log('Concentration Score:', concentrationScore); // Debug log for concentration data

  const getGradeColor = (percent) => {
    if (percent >= 80) return 'text-green-500';
    if (percent >= 60) return 'text-yellow-500';
    if (percent >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getGradeText = (percent) => {
    if (percent >= 80) return 'Excellent';
    if (percent >= 60) return 'Good';
    if (percent >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Interview Complete! 🎉</h1>
          <p className="text-gray-400">
            {sessionType === 'conceptual' ? 'Conceptual Interview' : 
             sessionType === 'dsa' ? 'DSA Coding Interview' : 'Full Interview'} Results
          </p>
        </div>

        {/* Score Card */}
        <div className="bg-gray-800 rounded-xl p-8 mb-6 text-center">
          <div className="mb-6">
            <div className={`text-7xl font-bold ${getGradeColor(percentage)} mb-2`}>
              {percentage}%
            </div>
            <div className="text-2xl text-gray-300 mb-1">
              {totalScore} / {maxScore} Points
            </div>
            <div className={`text-xl font-semibold ${getGradeColor(percentage)}`}>
              {getGradeText(percentage)}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-4 mb-4">
            <div
              className={`h-4 rounded-full transition-all duration-1000 ${
                percentage >= 80 ? 'bg-green-500' :
                percentage >= 60 ? 'bg-yellow-500' :
                percentage >= 40 ? 'bg-orange-500' : 'bg-red-500'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          <p className="text-gray-400">
            Questions Answered: {questionsAnswered || 0}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-3xl mb-2">📊</div>
            <div className="text-2xl font-bold">{totalScore}</div>
            <div className="text-sm text-gray-400">Total Score</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-3xl mb-2">❓</div>
            <div className="text-2xl font-bold">{questionsAnswered || 0}</div>
            <div className="text-sm text-gray-400">Questions</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-3xl mb-2">⭐</div>
            <div className="text-2xl font-bold">{percentage}%</div>
            <div className="text-sm text-gray-400">Accuracy</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-2xl font-bold">
              {concentrationScore ? concentrationScore.scorePercentage + '%' : 'N/A'}
            </div>
            <div className="text-sm text-gray-400">Concentration</div>
          </div>
        </div>

        {/* Concentration Analysis */}
        {concentrationScore && (
          <div className="bg-gray-800 rounded-xl p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <span className="mr-2">🎯</span>
              Concentration Analysis
            </h2>
            <div className="mb-4">
              <p className="text-lg text-gray-300 mb-2">
                Overall Concentration: <span className="font-bold text-blue-400">{concentrationScore.scorePercentage}%</span>
              </p>
              <div className="w-full bg-gray-700 rounded-full h-4">
                <div
                  className="h-4 rounded-full bg-blue-500 transition-all duration-1000"
                  style={{ width: `${concentrationScore.scorePercentage}%` }}
                />
              </div>
            </div>
            {concentrationScore.questionScores && Object.keys(concentrationScore.questionScores).length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-3">Concentration by Question:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(concentrationScore.questionScores).map(([qNum, score]) => (
                    <div key={qNum} className="bg-gray-700 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span>Question {qNum}:</span>
                        <span className="font-medium">{score}%</span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
                        <div
                          className="h-2 rounded-full bg-blue-500"
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {/* Feedback Section */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Performance Summary
          </h2>
          <div className="space-y-3">
            {percentage >= 80 && (
              <p className="text-gray-300">
                🌟 Outstanding performance! You demonstrated strong understanding of the concepts.
                Keep up the excellent work!
              </p>
            )}
            {percentage >= 60 && percentage < 80 && (
              <p className="text-gray-300">
                👍 Good job! You have a solid grasp of most concepts. Review the feedback to
                strengthen your weaker areas.
              </p>
            )}
            {percentage >= 40 && percentage < 60 && (
              <p className="text-gray-300">
                📚 Fair attempt. Focus on understanding core concepts more deeply. Practice
                will help improve your performance.
              </p>
            )}
            {percentage < 40 && (
              <p className="text-gray-300">
                💪 Don't be discouraged! Use this as a learning opportunity. Review the topics
                and try again. Consistent practice leads to improvement!
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
          >
            Back to Home
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => alert('PDF download coming soon!')}
            className="px-8 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors"
          >
            Download Report
          </button>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Detailed feedback will be available soon. Check your email for the complete report.</p>
        </div>
      </div>
    </div>
  );
};

export default InterviewResults;
