import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { Translation, LanguageCode } from '../types';
import { usePageMetadata } from '../lib/hooks';
import ShareButtons from '../components/ShareButtons';
import SeoContent from '../components/SeoContent';
import HeaderAdComponent from '../components/HeaderAdComponent';
import AdComponent from '../components/AdComponent';

interface PageContext {
  t: Translation;
  currentLang: LanguageCode;
}

const HoursCalculatorPage: React.FC = () => {
    const { t, currentLang } = useOutletContext<PageContext>();
    usePageMetadata(t.seoHoursTitle, t.seoHoursDescription);

    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [result, setResult] = useState<{ hours: number, minutes: number, totalHours: number, totalMinutes: number } | null>(null);
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setResult(null);

        if (!startTime || !endTime) {
            setError(t.errorInvalidTime);
            return;
        }

        const today = new Date().toISOString().slice(0, 10);
        const startDateTime = new Date(`${today}T${startTime}`);
        let endDateTime = new Date(`${today}T${endTime}`);

        if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
             setError(t.errorInvalidTime);
            return;
        }

        // If end time is earlier than start time, assume it's the next day
        if (endDateTime < startDateTime) {
            endDateTime.setDate(endDateTime.getDate() + 1);
        }

        const diffMilliseconds = endDateTime.getTime() - startDateTime.getTime();
        const totalMinutes = Math.floor(diffMilliseconds / (1000 * 60));
        const totalHours = diffMilliseconds / (1000 * 60 * 60);

        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        
        setResult({ hours, minutes, totalHours, totalMinutes });
    };

    const inputClasses = "w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 dark:text-white";
    const labelClasses = "block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2";

    return (
        <>
            <HeaderAdComponent />
            <main className="w-full max-w-2xl mx-auto px-4 py-8">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2 text-center">{t.hoursTitle}</h1>
                    <p className="text-md md:text-lg text-gray-500 dark:text-gray-400 mb-8 text-center">{t.hoursSubheading}</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div>
                                <label htmlFor="startTime" className={labelClasses}>{t.startTimeLabel}</label>
                                <input id="startTime" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className={inputClasses} required />
                            </div>
                            <div>
                                <label htmlFor="endTime" className={labelClasses}>{t.endTimeLabel}</label>
                                <input id="endTime" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className={inputClasses} required />
                            </div>
                        </div>

                        {error && <p className="text-center text-red-500">{error}</p>}
                        
                        <div>
                           <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition transform hover:scale-105 duration-300 ease-in-out">
                                {t.calculateHoursButton}
                            </button>
                        </div>
                    </form>

                    {result && (
                         <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-semibold text-center text-gray-800 dark:text-gray-200 mb-4">{t.resultDurationLabel}</h2>
                            <div className="p-6 bg-blue-50 dark:bg-blue-900/50 rounded-xl text-center space-y-2">
                                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                    {result.hours} {t.resultHours} {result.minutes} {t.resultMinutes}
                                </p>
                                <div className="text-lg text-gray-600 dark:text-gray-300">
                                    <p>({t.resultInHours}: {result.totalHours.toFixed(2)})</p>
                                    <p>({t.resultInMinutes}: {result.totalMinutes})</p>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
                <AdComponent />
                <ShareButtons url={window.location.href} title={t.seoHoursTitle || ''} t={t} />
            </main>
            {t.seoHoursSections && <SeoContent sections={t.seoHoursSections} lang={currentLang} />}
        </>
    );
};

export default HoursCalculatorPage;
