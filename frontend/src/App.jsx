import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainDashboard from './pages/MainDashboard';
import MonitorPage from './pages/MonitorPage_Stretch';
import StretchPage from './pages/StretchPage';
import InitialSetupPage from './pages/InitialSetupPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainDashboard />} />
      <Route path="/monitor" element={<MonitorPage />} />
      <Route path="/stretch" element={<StretchPage />} />
      <Route path="/setup" element={<InitialSetupPage />} />
    </Routes>
  );
}

export default App;