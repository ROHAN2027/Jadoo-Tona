import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DSAInterviewPage from './pages/DSAInterviewPage';
import ConceptualInterviewPage from './pages/ConceptualInterviewPage';
import ProjectInterviewPage from './pages/ProjectInterviewPage';
import InterviewResults from './pages/InterviewResults';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dsa" element={<DSAInterviewPage />} />
        <Route path="/conceptual" element={<ConceptualInterviewPage />} />
        <Route path="/project" element={<ProjectInterviewPage />} />
        <Route path="/results" element={<InterviewResults />} />
      </Routes>
    </Router>
  );
}

export default App;
