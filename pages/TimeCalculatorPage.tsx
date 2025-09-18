
import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { Translation, LanguageCode, TimeDuration } from '../types';
import { usePageMetadata } from '../lib/hooks';
import { calculateTime, durationToSeconds } from '../lib/utils';
import ShareButtons from '../components/ShareButtons';
import SeoContent from '../components/SeoContent';
import HeaderAdComponent from '../components/HeaderAdComponent';
import AdComponent from '../components/AdComponent';

interface PageContext {
  t: Translation;
  currentLang: LanguageCode;
}

const TimeCalculatorPage: React.FC = () => {
    const { t, currentLang } = useOutletContext<PageContext>();
    usePageMetadata(t.seoTimeTitle, t.seoTimeDescription);

    const initialTime: TimeDuration = { days: 0, hours: 0, minutes: 0, seconds: 0 };
    const [time1, setTime1] = useState<TimeDuration>(initialTime);
    const [time2, setTime2] = useState<TimeDuration>(initialTime);
    const [operation, setOperation] = useState<'add' | 'subtract'>('add');
    const [result, setResult] = useState<TimeDuration | null>(null);
    const [error, setError] = useState('');

    const handleTimeChange = (
        setter: React.Dispatch<React.SetStateAction<TimeDuration>>,
        field: keyof TimeDuration,
        value: string
    ) => {
        const numValue = parseInt(value) || 0;
        setter(prev => ({ ...prev, [field]: numValue < 0 ? 0 : numValue }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setResult(null);

        if (operation === 'subtract' && durationToSeconds(time1) < durationToSeconds(time2)) {
            setError(t.errorInvalidTime); // "Result would be negative"
            return;
        }

        const calcResult = calculateTime(time1, time2, operation);
        setResult(calcResult);
    };

    const handleReset = () => {
        setTime1(initialTime);
        setTime2(initialTime);
        setResult(null);
        setError('');
    };

    const inputClasses = "w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-center";
    const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

    const TimeInput: React.FC<{time: TimeDuration, setTime: any, idPrefix: string}> = ({time, setTime, idPrefix}) => (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div><label htmlFor={`${idPrefix}-days`} className={labelClasses}>{t.days}</label><input id={`${idPrefix}-days`} type="number" value={time.days} onChange={e => handleTimeChange(setTime, 'days', e.target.value)} className={inputClasses} min="0" /></div>
            <div><label htmlFor={`${idPrefix}-hours`} className={labelClasses}>{t.hours}</label><input id={`${idPrefix}-hours`} type="number" value={time.hours} onChange={e => handleTimeChange(setTime, 'hours', e.target.value)} className={inputClasses} min="0" /></div>
            <div><label htmlFor={`${idPrefix}-minutes`} className={labelClasses}>{t.minutes}</label><input id={`${idPrefix}-minutes`} type="number" value={time.minutes} onChange={e => handleTimeChange(setTime, 'minutes', e.target.value)} className={inputClasses} min="0" /></div>
            <div><label htmlFor={`${idPrefix}-seconds`} className={labelClasses}>{t.seconds}</label><input id={`${idPrefix}-seconds`} type="number" value={time.seconds} onChange={e => handleTimeChange(setTime, 'seconds', e.target.value)} className={inputClasses} min="0" /></div>
        </div>
    );
    
    return (
        <>
            <HeaderAdComponent />
            <main className="w-full max-w-2xl mx-auto px-4 py-8">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2 text-center">{t.timeTitle}</h1>
                    <p className="text-md md:text-lg text-gray-500 dark:text-gray-400 mb-8 text-center">{t.timeSubheading}</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">{t.time1Label}</label>
                            <TimeInput time={time1} setTime={setTime1} idPrefix="t1" />
                        </div>

                        <div className="flex flex-col items-center space-y-2">
                             <label className="block text-lg font-medium text-gray-700 dark:text-gray-300">{t.operationLabel}</label>
                            <div className="flex space-x-2 rtl:space-x-reverse rounded-md bg-gray-100 dark:bg-gray-900 p-1">
                                <button type="button" onClick={() => setOperation('add')} className={`px-6 py-2 font-medium rounded-md ${operation === 'add' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>{t.add}</button>
                                <button type="button" onClick={() => setOperation('subtract')} className={`px-6 py-2 font-medium rounded-md ${operation === 'subtract' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>{t.subtract}</button>
                            </div>
                        </div>

                        <div>
                             <label className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">{t.time2Label}</label>
                            <TimeInput time={time2} setTime={setTime2} idPrefix="t2" />
                        </div>
                        
                        {error && <p className="text-center text-red-500">{error}</p>}
                        
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition transform hover:scale-105 duration-300 ease-in-out">
                                {t.calculateTimeButton}
                            </button>
                             <button type="button" onClick={handleReset} className="w-full sm:w-auto flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg text-lg font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                {t.resetButton}
                            </button>
                        </div>
                    </form>

                    {result && (
                        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-semibold text-center text-gray-800 dark:text-gray-200 mb-4">{t.resultLabel}</h2>
                            <div className="p-6 bg-blue-50 dark:bg-blue-900/50 rounded-xl text-center text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">
                                {result.days > 0 && `${result.days} ${t.days}, `}
                                {result.hours} {t.hours}, {result.minutes} {t.minutes}, {result.seconds} {t.seconds}
                            </div>
                        </div>
                    )}
                </div>
                <AdComponent />
                <ShareButtons url={window.location.href} title={t.seoTimeTitle} t={t} />
            </main>
            <SeoContent sections={t.seoTimeSections} lang={currentLang} />
        </>
    );
};

export default TimeCalculatorPage;
    