import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageCode } from './types';
import AgeCalculatorPage from './pages/AgeCalculatorPage';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import ContactPage from './pages/ContactPage';
import Layout from './components/Layout';
import PregnancyCalculatorPage from './pages/PregnancyCalculatorPage';
import OvulationCalculatorPage from './pages/OvulationCalculatorPage';
import MenstrualCycleCalculatorPage from './pages/MenstrualCycleCalculatorPage';
import CalorieCalculatorPage from './pages/CalorieCalculatorPage';
import TimeCalculatorPage from './pages/TimeCalculatorPage';
import HoursCalculatorPage from './pages/HoursCalculatorPage';

const App: React.FC = () => {
  return (
    <div className="font-sans">
      <BrowserRouter>
        <Routes>
          <Route path="/:lang" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="age-calculator" element={<AgeCalculatorPage />} />
            <Route path="Pregnancy-Due-Date-Calculator" element={<PregnancyCalculatorPage />} />
            <Route path="ovulation-calculator" element={<OvulationCalculatorPage />} />
            <Route path="Menstrual-Cycle-Calculator" element={<MenstrualCycleCalculatorPage />} />
            <Route path="Calorie-Calculator" element={<CalorieCalculatorPage />} />
            <Route path="time-Calculator" element={<TimeCalculatorPage />} />
            <Route path="hours-calculator" element={<HoursCalculatorPage />} />
            <Route path="About-Us" element={<AboutPage />} />
            <Route path="Privacy-Policy" element={<PrivacyPolicyPage />} />
            <Route path="Contact-Us" element={<ContactPage />} />
          </Route>
          <Route path="*" element={<Navigate to={`/${LanguageCode.AR}`} replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
