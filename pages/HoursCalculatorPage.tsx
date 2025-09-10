import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { Translation, LanguageCode } from '../types';
import SeoContent from '../components/SeoContent';
import { usePageMetadata } from '../lib/hooks';

interface PageContext {
  t: Translation;
  currentLang: LanguageCode;
}

interface TimeValue {
  hour: string;
  minute: string;
}

interface DurationResult {
  totalMinutes: number;
  hours: number;
  minutes: number;
}

const HoursCalculatorPage: React.FC = () => {
  const { t, currentLang } = useOutletContext<PageContext>();
  usePageMetadata(t.seoHoursTitle, t.seoHoursDescription);

  const [startTime, setStartTime] = useState<TimeValue>({ hour: '', minute: '' });
  const [endTime, setEndTime] = useState<TimeValue>({ hour: '', minute: '' });
  const [result, setResult] = useState<DurationResult | null>(null);
  const [error, setError] = useState<string>('');

  const resetForm = () => {
    setStartTime({ hour: '', minute: '' });
    setEndTime({ hour: '', minute: '' });
    setResult(null);
    setError('');
  };

  useEffect(resetForm, [t, currentLang]);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);

    if (!startTime.hour || !startTime.minute || !endTime.hour || !endTime.minute) {
      setError(t.errorInvalidDate);
      return;
    }

    setError('');

    const startHour = parseInt(startTime.hour, 10);
    const startMinute = parseInt(startTime.minute, 10);
    const endHour = parseInt(endTime.hour, 10);
    const endMinute = parseInt(endTime.minute, 10);

    let startTotalMinutes = startHour * 60 + startMinute;
    let endTotalMinutes = endHour * 60 + endMinute;

    let diffMinutes;
    if (endTotalMinutes < startTotalMinutes) {
      // End time is on the next day
      diffMinutes = (endTotalMinutes + 24 * 60) - startTotalMinutes;
    } else {
      diffMinutes = endTotalMinutes - startTotalMinutes;
    }

    setResult({
      totalMinutes: diffMinutes,
      hours: Math.floor(diffMinutes / 60),
      minutes: diffMinutes % 60,
    });
  };

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
  const selectClasses = "block w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 dark:text-white";

  const TimeInput: React.FC<{ label: string; value: TimeValue; onChange: (value: TimeValue) => void }> = ({ label, value, onChange }) => (
    <fieldset className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
        <legend className="text-lg font-medium text-gray-700 dark:text-gray-300 px-2">{label}</legend>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="sr-only">{t.hourLabel}</label>
                <select value={value.hour} onChange={e => onChange({ ...value, hour: e.target.value })} className={selectClasses} required>
                    <option value="" disabled>{t.hourLabel}</option>
                    {hours.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
            </div>
             <div>
                <label className="sr-only">{t.minuteLabel}</label>
                <select value={value.minute} onChange={e => onChange({ ...value, minute: e.target.value })} className={selectClasses} required>
                    <option value="" disabled>{t.minuteLabel}</option>
                    {minutes.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
            </div>
        </div>
    </fieldset>
  );

  const StatCard: React.FC<{ value: number; label: string }> = ({ value, label }) => (
    <div className="flex flex-col items-center justify-center bg-blue-50 dark:bg-blue-900/50 p-4 rounded-lg text-center">
        <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">{value}</span>
        <span className="text-lg text-gray-600 dark:text-gray-300">{label}</span>
    </div>
  );

  return (
    <main className="w-full max-w-2xl mx-auto px-4 py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white text-center mb-4">{t.hoursTitle}</h1>
      <p className="text-center text-gray-600 dark:text-gray-400 mb-8">{t.hoursSubheading}</p>

      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8 transition-all duration-300">
        <form onSubmit={handleCalculate} className="space-y-6">
          <TimeInput label={t.startTimeLabel!} value={startTime} onChange={setStartTime} />
          <TimeInput label={t.endTimeLabel!} value={endTime} onChange={setEndTime} />

          {error && <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>}

          <div className="flex flex-col sm:flex-row gap-4">
            <button type="button" onClick={resetForm} className="w-full flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-md text-lg font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition duration-300">
                {t.resetButton}
            </button>
            <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition transform hover:scale-105 duration-300 ease-in-out">
                {t.calculateHoursButton}
            </button>
          </div>
        </form>

        {result && (
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 animate-fade-in">
            <h3 className="text-xl font-semibold text-center text-gray-800 dark:text-gray-200 mb-4">{t.resultDurationLabel}</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <StatCard value={result.hours} label={t.resultHours!} />
              <StatCard value={result.minutes} label={t.resultMinutes!} />
            </div>
            <div className="text-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <span className="font-medium text-gray-700 dark:text-gray-300">{t.resultInMinutes}: </span>
              <span className="font-bold text-lg text-gray-900 dark:text-white">{result.totalMinutes}</span>
            </div>
             <style>{`
                @keyframes fade-in {
                    0% { opacity: 0; transform: translateY(10px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-in-out;
                }
            `}</style>
          </div>
        )}
      </section>

      {t.seoHoursSections && t.seoHoursSections.length > 0 && (
        <SeoContent sections={t.seoHoursSections} lang={currentLang} />
      )}
    </main>
  );
};

export default HoursCalculatorPage;
