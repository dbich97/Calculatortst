import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { Translation, LanguageCode } from '../types';
import { usePageMetadata } from '../lib/hooks';
import { calculateDate } from '../lib/utils';
import ShareButtons from '../components/ShareButtons';
import SeoContent from '../components/SeoContent';
import HeaderAdComponent from '../components/HeaderAdComponent';
import AdComponent from '../components/AdComponent';

// Context from Layout
interface PageContext {
  t: Translation;
  currentLang: LanguageCode;
}

const DateCalculatorPage: React.FC = () => {
    const { t, currentLang } = useOutletContext<PageContext>();
    usePageMetadata(t.seoDateTitle, t.seoDateDescription);

    const today = new Date();
    const [startDay, setStartDay] = useState<string>(String(today.getDate()));
    const [startMonth, setStartMonth] = useState<string>(String(today.getMonth() + 1));
    const [startYear, setStartYear] = useState<string>(String(today.getFullYear()));

    const [duration, setDuration] = useState({ years: '0', months: '0', weeks: '0', days: '0' });
    const [operation, setOperation] = useState<'add' | 'subtract'>('add');
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState('');

    const handleDurationChange = (field: keyof typeof duration, value: string) => {
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue) && numValue >= 0) {
            setDuration(prev => ({ ...prev, [field]: value }));
        } else if (value === '') {
            setDuration(prev => ({ ...prev, [field]: '0' }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setResult(null);

        const dayNum = parseInt(startDay, 10);
        const monthNum = parseInt(startMonth, 10);
        const yearNum = parseInt(startYear, 10);

        if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum)) {
            setError(t.errorInvalidDate || 'Please enter a valid start date.');
            return;
        }

        const startDate = new Date(yearNum, monthNum - 1, dayNum);
        if (startDate.getFullYear() !== yearNum || startDate.getMonth() !== monthNum - 1 || startDate.getDate() !== dayNum) {
            setError(t.errorInvalidDate || 'Please enter a valid start date.');
            return;
        }
        
        const durationNums = {
            years: parseInt(duration.years, 10) || 0,
            months: parseInt(duration.months, 10) || 0,
            weeks: parseInt(duration.weeks, 10) || 0,
            days: parseInt(duration.days, 10) || 0,
        };

        const newDate = calculateDate(startDate, durationNums, operation);
        
        setResult(newDate.toLocaleDateString(currentLang, {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        }));
    };
    
    // UI Classes
    const inputClasses = "w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-center";
    const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
    const sectionLabelClasses = "block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2";

    const years = Array.from({ length: 201 }, (_, i) => new Date().getFullYear() - 100 + i);
    const months = t.monthsArray;
    const days = Array.from({ length: 31 }, (_, i) => i + 1);

    return (
        <>
            <HeaderAdComponent />
            <main className="w-full max-w-2xl mx-auto px-4 py-8">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2 text-center">{t.dateTitle}</h1>
                    <p className="text-md md:text-lg text-gray-500 dark:text-gray-400 mb-8 text-center">{t.dateSubheading}</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Start Date */}
                        <div>
                            <label className={sectionLabelClasses}>{t.startDateLabel}</label>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label htmlFor="start-day" className="sr-only">{t.dayLabel}</label>
                                    <select id="start-day" value={startDay} onChange={e => setStartDay(e.target.value)} className={inputClasses}>
                                        {days.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="start-month" className="sr-only">{t.monthLabel}</label>
                                     <select id="start-month" value={startMonth} onChange={(e) => setStartMonth(e.target.value)} className={inputClasses} required>
                                        {months.map((m, index) => (
                                            <option key={index} value={index + 1}>{m}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="start-year" className="sr-only">{t.yearLabel}</label>
                                    <select id="start-year" value={startYear} onChange={e => setStartYear(e.target.value)} className={inputClasses}>
                                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Operation */}
                        <div className="flex flex-col items-center space-y-2">
                             <div className="flex space-x-2 rtl:space-x-reverse rounded-md bg-gray-100 dark:bg-gray-900 p-1">
                                <button type="button" onClick={() => setOperation('add')} className={`px-6 py-2 font-medium rounded-md ${operation === 'add' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>{t.add}</button>
                                <button type="button" onClick={() => setOperation('subtract')} className={`px-6 py-2 font-medium rounded-md ${operation === 'subtract' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>{t.subtract}</button>
                            </div>
                        </div>

                        {/* Duration */}
                        <div>
                            <label className={sectionLabelClasses}>
                                {operation === 'add' ? t.addDurationLabel : t.subtractDurationLabel}
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div><label htmlFor="duration-years" className={labelClasses}>{t.years}</label><input id="duration-years" type="number" value={duration.years} onChange={e => handleDurationChange('years', e.target.value)} className={inputClasses} min="0" /></div>
                                <div><label htmlFor="duration-months" className={labelClasses}>{t.months}</label><input id="duration-months" type="number" value={duration.months} onChange={e => handleDurationChange('months', e.target.value)} className={inputClasses} min="0" /></div>
                                <div><label htmlFor="duration-weeks" className={labelClasses}>{t.weeks}</label><input id="duration-weeks" type="number" value={duration.weeks} onChange={e => handleDurationChange('weeks', e.target.value)} className={inputClasses} min="0" /></div>
                                <div><label htmlFor="duration-days" className={labelClasses}>{t.days}</label><input id="duration-days" type="number" value={duration.days} onChange={e => handleDurationChange('days', e.target.value)} className={inputClasses} min="0" /></div>
                            </div>
                        </div>

                        {error && <p className="text-center text-red-500">{error}</p>}
                        
                        <div>
                           <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition transform hover:scale-105 duration-300 ease-in-out">
                                {t.calculateDateButton}
                            </button>
                        </div>
                    </form>

                    {result && (
                        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-semibold text-center text-gray-800 dark:text-gray-200 mb-4">{t.resultDateLabel}</h2>
                            <div className="p-6 bg-blue-50 dark:bg-blue-900/50 rounded-xl text-center text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">
                                {result}
                            </div>
                        </div>
                    )}
                </div>
                <AdComponent />
                <ShareButtons url={window.location.href} title={t.seoDateTitle || ''} t={t} />
            </main>
            {t.seoDateSections && <SeoContent sections={t.seoDateSections} lang={currentLang} />}
        </>
    );
};

export default DateCalculatorPage;
