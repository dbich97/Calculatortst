import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { Translation, LanguageCode } from '../types';
import SeoContent from '../components/SeoContent';
import { usePageMetadata } from '../lib/hooks';

interface PageContext {
  t: Translation;
  currentLang: LanguageCode;
}

interface MenstrualResult {
  nextPeriod1: string;
  nextPeriod2: string;
}

const MenstrualCycleCalculatorPage: React.FC = () => {
    const { t, currentLang } = useOutletContext<PageContext>();
    
    usePageMetadata(t.seoMenstrualTitle, t.seoMenstrualDescription);

    const [day, setDay] = useState<string>('');
    const [month, setMonth] = useState<string>('');
    const [year, setYear] = useState<string>('');
    const [cycleLength, setCycleLength] = useState<number>(28);
    const [result, setResult] = useState<MenstrualResult | null>(null);
    const [error, setError] = useState<string>('');

    const resetForm = () => {
        setDay('');
        setMonth('');
        setYear('');
        setCycleLength(28);
        setResult(null);
        setError('');
    };

    useEffect(() => {
        resetForm();
    }, [t, currentLang]);

    const handleCalculate = (e: React.FormEvent) => {
        e.preventDefault();
        setResult(null);

        if (!day || !month || !year) {
            setError(t.errorInvalidDate);
            return;
        }

        const inputYear = parseInt(year);
        const inputMonth = parseInt(month);
        const inputDay = parseInt(day);

        const lmpDate = new Date(inputYear, inputMonth - 1, inputDay);

        if (isNaN(lmpDate.getTime()) || lmpDate.getFullYear() !== inputYear || lmpDate.getMonth() + 1 !== inputMonth || lmpDate.getDate() !== inputDay) {
            setError(t.errorInvalidDate);
            return;
        }

        if (lmpDate > new Date()) {
            setError(t.errorFutureDate);
            return;
        }

        setError('');
        
        const nextPeriod1 = new Date(lmpDate);
        nextPeriod1.setDate(lmpDate.getDate() + cycleLength);

        const nextPeriod2 = new Date(nextPeriod1);
        nextPeriod2.setDate(nextPeriod1.getDate() + cycleLength);
        
        const locale = currentLang;
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };

        setResult({
            nextPeriod1: nextPeriod1.toLocaleDateString(locale, options),
            nextPeriod2: nextPeriod2.toLocaleDateString(locale, options),
        });
    };

    const years = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i);
    const months = t.monthsArray;
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const cycleLengths = Array.from({ length: 20 }, (_, i) => 21 + i); // 21 to 40 days

    const selectClasses = "block w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 dark:text-white";

    return (
        <main className="w-full max-w-2xl mx-auto px-4 py-8 md:py-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white text-center mb-4">{t.menstrualCycleTitle}</h1>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-8">{t.menstrualCycleSubheading}</p>

            <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8 transition-all duration-300">
                <form onSubmit={handleCalculate} className="space-y-6">
                    <div>
                        <span className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t.lmpDateLabelOvulation}
                        </span>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="day" className="sr-only">{t.dayLabel}</label>
                                <select id="day" name="day" value={day} onChange={(e) => setDay(e.target.value)} className={selectClasses} required>
                                    <option value="" disabled>{t.dayLabel}</option>
                                    {days.map((d) => (<option key={d} value={d}>{d}</option>))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="month" className="sr-only">{t.monthLabel}</label>
                                <select id="month" name="month" value={month} onChange={(e) => setMonth(e.target.value)} className={selectClasses} required>
                                    <option value="" disabled>{t.monthLabel}</option>
                                    {months.map((m, index) => (<option key={index} value={index + 1}>{m}</option>))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="year" className="sr-only">{t.yearLabel}</label>
                                <select id="year" name="year" value={year} onChange={(e) => setYear(e.target.value)} className={selectClasses} required>
                                    <option value="" disabled>{t.yearLabel}</option>
                                    {years.map((y) => (<option key={y} value={y}>{y}</option>))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="cycleLength" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">{t.cycleLengthLabel}</label>
                        <select id="cycleLength" name="cycleLength" value={cycleLength} onChange={(e) => setCycleLength(parseInt(e.target.value))} className={selectClasses} required>
                            {cycleLengths.map((len) => (<option key={len} value={len}>{len} {t.days}</option>))}
                        </select>
                    </div>

                    {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400 text-center">{error}</p>}
                    
                    <div>
                        <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition transform hover:scale-105 duration-300 ease-in-out">
                            {t.calculateMenstrualButton}
                        </button>
                    </div>
                </form>

                {result && (
                     <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-semibold text-center text-gray-800 dark:text-gray-200 mb-4">{t.menstrualCycleHeading}</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
                                <span className="font-medium text-gray-700 dark:text-gray-300">{t.resultNextPeriod1}</span>
                                <span className="font-bold text-lg text-blue-600 dark:text-blue-400">{result.nextPeriod1}</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <span className="font-medium text-gray-700 dark:text-gray-300">{t.resultNextPeriod2}</span>
                                <span className="font-semibold text-gray-800 dark:text-white">{result.nextPeriod2}</span>
                            </div>
                        </div>
                    </div>
                )}
            </section>
            
            {t.seoMenstrualSections && t.seoMenstrualSections.length > 0 && (
                <SeoContent sections={t.seoMenstrualSections} lang={currentLang} />
            )}
        </main>
    );
};

export default MenstrualCycleCalculatorPage;