import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInterview } from '../context/InterviewContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { setUserInfo, setCurrentStage, resetInterview } = useInterview();
  
  const [formData, setFormData] = useState({
    name: '',
    resumeFile: null
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [parsedData, setParsedData] = useState(null);

  // Clear any previous interview data when landing page loads
  React.useEffect(() => {
    console.log('[LandingPage] Mounted - ready for new interview');
    // Optionally uncomment below to auto-reset on landing page
    // resetInterview();
  }, []);

  const handleNameChange = (e) => {
    setFormData(prev => ({ ...prev, name: e.target.value }));
    setError(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please upload a PDF file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size must be less than 10MB');
        return;
      }
      setFormData(prev => ({ ...prev, resumeFile: file }));
      setError(null);
    }
  };

  const handleResumeUpload = async () => {
    if (!formData.resumeFile) return;

    setUploading(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', formData.resumeFile);

      const response = await fetch('http://localhost:8000/parse-resume', {
        method: 'POST',
        body: formDataToSend
      });

      if (!response.ok) {
        throw new Error('Failed to parse resume');
      }

      const data = await response.json();
      console.log('[LandingPage] Parsed resume data:', data);
      setParsedData(data);
      
      // Auto-fill name if not provided
      if (!formData.name && data.name) {
        setFormData(prev => ({ ...prev, name: data.name }));
      }
    } catch (err) {
      console.error('[LandingPage] Resume parsing error:', err);
      setError(err.message || 'Failed to parse resume');
    } finally {
      setUploading(false);
    }
  };

  const handleStartInterview = () => {
    if (!formData.name) {
      setError('Please enter your name');
      return;
    }

    if (!parsedData) {
      setError('Please upload and parse your resume first');
      return;
    }

    console.log('[LandingPage] Starting interview with data:', {
      name: formData.name,
      email: parsedData.email,
      github_links: parsedData.github_links
    });

    // Store user info in context
    setUserInfo(
      formData.name,
      parsedData.email,
      parsedData.github_links
    );

    // Set initial stage
    setCurrentStage('dsa');

    // Navigate to DSA round
    navigate('/dsa');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            Sarthi Interview Platform
          </h1>
          <p className="text-xl text-gray-400">
            AI-Powered Technical Interview Simulation
          </p>
        </div>

        {/* Main Form Card */}
        <div className="max-w-2xl mx-auto bg-gray-800 rounded-xl p-8 shadow-2xl">
          <h2 className="text-3xl font-bold mb-6 text-center">Get Started</h2>
          
          {/* Name Input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Your Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={handleNameChange}
              placeholder="Enter your full name"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            />
          </div>

          {/* Resume Upload */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Upload Resume (PDF) *</label>
            <div className="relative">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                id="resume-upload"
              />
              <label
                htmlFor="resume-upload"
                className="flex items-center justify-center w-full px-4 py-3 bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
              >
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {formData.resumeFile ? formData.resumeFile.name : 'Choose PDF file'}
              </label>
            </div>
            
            {formData.resumeFile && !parsedData && (
              <button
                onClick={handleResumeUpload}
                disabled={uploading}
                className="mt-3 w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {uploading ? 'Parsing...' : 'Parse Resume'}
              </button>
            )}
          </div>

          {/* Parsed Data Display */}
          {parsedData && (
            <div className="mb-6 p-4 bg-gray-700 rounded-lg border border-green-500">
              <h3 className="text-sm font-semibold mb-2 text-green-400">✓ Resume Parsed Successfully</h3>
              <div className="text-sm space-y-1">
                {parsedData.email && (
                  <p className="text-gray-300"><span className="font-semibold">Email:</span> {parsedData.email}</p>
                )}
                {parsedData.github_links && parsedData.github_links.length > 0 && (
                  <p className="text-gray-300">
                    <span className="font-semibold">GitHub:</span> {parsedData.github_links.length} link(s) found
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
              {error}
            </div>
          )}

          {/* Start Interview Button */}
          <button
            onClick={handleStartInterview}
            disabled={!formData.name || !parsedData || uploading}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
          >
            Start Interview Journey
          </button>

          {/* Info Text */}
          <p className="mt-4 text-center text-sm text-gray-400">
            Your interview will consist of 3 rounds: DSA → Conceptual → Project
          </p>
        </div>

        {/* Info Section */}
        <div className="max-w-4xl mx-auto mt-12 bg-gray-800 rounded-xl p-8">
          <h3 className="text-2xl font-bold mb-6 text-center">Interview Flow</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-700 rounded-lg">
              <div className="text-4xl mb-3">💻</div>
              <h4 className="font-semibold mb-2">Round 1: DSA</h4>
              <p className="text-sm text-gray-400">Solve coding problems with real-time execution</p>
              <p className="text-xs text-gray-500 mt-2">30-45 mins</p>
            </div>
            <div className="text-center p-4 bg-gray-700 rounded-lg">
              <div className="text-4xl mb-3">🎤</div>
              <h4 className="font-semibold mb-2">Round 2: Conceptual</h4>
              <p className="text-sm text-gray-400">Voice-based CS fundamentals Q&A</p>
              <p className="text-xs text-gray-500 mt-2">15-20 mins</p>
            </div>
            <div className="text-center p-4 bg-gray-700 rounded-lg">
              <div className="text-4xl mb-3">🚀</div>
              <h4 className="font-semibold mb-2">Round 3: Project</h4>
              <p className="text-sm text-gray-400">Deep dive into your GitHub projects</p>
              <p className="text-xs text-gray-500 mt-2">20-30 mins</p>
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
