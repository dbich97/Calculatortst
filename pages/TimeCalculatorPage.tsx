import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { Translation, LanguageCode, TimeDuration } from '../types';
import SeoContent from '../components/SeoContent';
import { usePageMetadata } from '../lib/hooks';
import { calculateTime } from '../lib/utils';

interface PageContext {
  t: Translation;
  currentLang: LanguageCode;
}

const initialDuration: TimeDuration = { days: 0, hours: 0, minutes: 0, seconds: 0 };

const TimeInputGroup: React.FC<{
  duration: TimeDuration;
  setDuration: React.Dispatch<React.SetStateAction<TimeDuration>>;
  t: Translation;
  title: string;
}> = ({ duration, setDuration, t, title }) => {
  const handleInputChange = (field: keyof TimeDuration, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0) {
      setDuration(prev => ({ ...prev, [field]: numValue }));
    } else if (value === '') {
       setDuration(prev => ({ ...prev, [field]: 0 }));
    }
  };
  
  const inputClasses = "block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 dark:text-white";

  return (
    <fieldset className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
      <legend className="text-lg font-medium text-gray-700 dark:text-gray-300 px-2">{title}</legend>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label htmlFor={`${title}-days`} className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{t.days}</label>
          <input type="number" id={`${title}-days`} min="0" value={duration.days || ''} onChange={(e) => handleInputChange('days', e.target.value)} className={inputClasses} placeholder="0" />
        </div>
        <div>
          <label htmlFor={`${title}-hours`} className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{t.hours}</label>
          <input type="number" id={`${title}-hours`} min="0" max="23" value={duration.hours || ''} onChange={(e) => handleInputChange('hours', e.target.value)} className={inputClasses} placeholder="0" />
        </div>
        <div>
          <label htmlFor={`${title}-minutes`} className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{t.minutes}</label>
          <input type="number" id={`${title}-minutes`} min="0" max="59" value={duration.minutes || ''} onChange={(e) => handleInputChange('minutes', e.target.value)} className={inputClasses} placeholder="0" />
        </div>
        <div>
          <label htmlFor={`${title}-seconds`} className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{t.seconds}</label>
          <input type="number" id={`${title}-seconds`} min="0" max="59" value={duration.seconds || ''} onChange={(e) => handleInputChange('seconds', e.target.value)} className={inputClasses} placeholder="0" />
        </div>
      </div>
    </fieldset>
  );
};

const TimeCalculatorPage: React.FC = () => {
    const { t, currentLang } = useOutletContext<PageContext>();
    usePageMetadata(t.seoTimeTitle, t.seoTimeDescription);

    const [time1, setTime1] = useState<TimeDuration>(initialDuration);
    const [time2, setTime2] = useState<TimeDuration>(initialDuration);
    const [operation, setOperation] = useState<'add' | 'subtract'>('add');
    const [result, setResult] = useState<TimeDuration | null>(null);
    const [error, setError] = useState<string>('');
    
    const resetForm = () => {
        setTime1(initialDuration);
        setTime2(initialDuration);
        setOperation('add');
        setResult(null);
        setError('');
    };

    useEffect(resetForm, [t, currentLang]);

    const handleCalculate = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (time1.hours >= 24 || time1.minutes >= 60 || time1.seconds >= 60 ||
            time2.hours >= 24 || time2.minutes >= 60 || time2.seconds >= 60) {
            setError(t.errorInvalidTime);
            setResult(null);
            return;
        }

        const calculationResult = calculateTime(time1, time2, operation);
        if (calculationResult === null) {
            setError(t.errorInvalidTime); // Re-using for simplicity, indicates negative result
            setResult(null);
        } else {
            setResult(calculationResult);
        }
    };
    
    return (
        <main className="w-full max-w-2xl mx-auto px-4 py-8 md:py-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white text-center mb-4">{t.timeTitle}</h1>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-8">{t.timeSubheading}</p>

            <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8 transition-all duration-300">
                <form onSubmit={handleCalculate} className="space-y-6">
                    <TimeInputGroup duration={time1} setDuration={setTime1} t={t} title={t.time1Label} />
                    
                    <div>
                        <span className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2 text-center">{t.operationLabel}</span>
                        <div className="flex justify-center items-center space-x-2 rtl:space-x-reverse rounded-lg bg-gray-100 dark:bg-gray-900 p-1 max-w-xs mx-auto">
                            <button type="button" onClick={() => setOperation('add')} className={`w-full px-4 py-2 text-lg font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200 ${operation === 'add' ? 'bg-blue-600 text-white shadow' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>+</button>
                            <button type="button" onClick={() => setOperation('subtract')} className={`w-full px-4 py-2 text-lg font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200 ${operation === 'subtract' ? 'bg-blue-600 text-white shadow' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>-</button>
                        </div>
                    </div>

                    <TimeInputGroup duration={time2} setDuration={setTime2} t={t} title={t.time2Label} />

                    {error && <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>}
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button type="button" onClick={resetForm} className="w-full flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-md text-lg font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition duration-300">
                            {t.resetButton}
                        </button>
                        <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition transform hover:scale-105 duration-300 ease-in-out">
                            {t.calculateTimeButton}
                        </button>
                    </div>
                </form>

                {result && (
                     <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-semibold text-center text-gray-800 dark:text-gray-200 mb-4">{t.resultLabel}</h3>
                        <div className="text-center p-6 bg-blue-50 dark:bg-gray-700/50 rounded-2xl shadow-inner">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div><span className="text-4xl font-bold text-blue-600 dark:text-blue-400">{result.days}</span><span className="block text-sm text-gray-600 dark:text-gray-300">{t.days}</span></div>
                                <div><span className="text-4xl font-bold text-blue-600 dark:text-blue-400">{result.hours}</span><span className="block text-sm text-gray-600 dark:text-gray-300">{t.hours}</span></div>
                                <div><span className="text-4xl font-bold text-blue-600 dark:text-blue-400">{result.minutes}</span><span className="block text-sm text-gray-600 dark:text-gray-300">{t.minutes}</span></div>
                                <div><span className="text-4xl font-bold text-blue-600 dark:text-blue-400">{result.seconds}</span><span className="block text-sm text-gray-600 dark:text-gray-300">{t.seconds}</span></div>
                            </div>
                        </div>
                    </div>
                )}
            </section>
            
            {t.seoTimeSections && t.seoTimeSections.length > 0 && (
                <SeoContent sections={t.seoTimeSections} lang={currentLang} />
            )}
        </main>
    );
};

export default TimeCalculatorPage;
