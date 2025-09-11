import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageCode } from './types';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import AgeCalculatorPage from './pages/AgeCalculatorPage';
import PregnancyCalculatorPage from './pages/PregnancyCalculatorPage';
import OvulationCalculatorPage from './pages/OvulationCalculatorPage';
import MenstrualCycleCalculatorPage from './pages/MenstrualCycleCalculatorPage';
import CalorieCalculatorPage from './pages/CalorieCalculatorPage';
import TimeCalculatorPage from './pages/TimeCalculatorPage';
import HoursCalculatorPage from './pages/HoursCalculatorPage';
import AboutPage from './pages/AboutPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import ContactPage from './pages/ContactPage';

const App: React.FC = () => {
  return (
    <div className="font-sans">
      <BrowserRouter>
        <Routes>
          {/* Layout مع لغة */}
          <Route path="/:lang" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="age-calculator" element={<AgeCalculatorPage />} />
            <Route path="pregnancy-due-date-calculator" element={<PregnancyCalculatorPage />} />
            <Route path="ovulation-calculator" element={<OvulationCalculatorPage />} />
            <Route path="menstrual-cycle-calculator" element={<MenstrualCycleCalculatorPage />} />
            <Route path="calorie-calculator" element={<CalorieCalculatorPage />} />
            <Route path="time-calculator" element={<TimeCalculatorPage />} />
            <Route path="hours-calculator" element={<HoursCalculatorPage />} />
            <Route path="about-us" element={<AboutPage />} />
            <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="contact-us" element={<ContactPage />} />
          </Route>

          {/* أي مسار آخر يعيد توجيه للغة الافتراضية */}
          <Route path="*" element={<Navigate to={`/${LanguageCode.AR}`} replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
