import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { Translation, LanguageCode, SeoSection } from '../types';
import SeoContent from '../components/SeoContent';
import { usePageMetadata } from '../lib/hooks';

interface PageContext {
  t: Translation;
  currentLang: LanguageCode;
}

interface PregnancyResult {
  dueDate: string;
  gestationalAgeWeeks: number;
  gestationalAgeDays: number;
  trimester: number;
}

const PregnancyCalculatorPage: React.FC = () => {
    const { t, currentLang } = useOutletContext<PageContext>();
    
    usePageMetadata(t.seoPregnancyTitle, t.seoPregnancyDescription);

    const [method, setMethod] = useState<'lmp' | 'conception' | 'ivf'>('lmp');
    const [day, setDay] = useState<string>('');
    const [month, setMonth] = useState<string>('');
    const [year, setYear] = useState<string>('');
    const [ivfCycle, setIvfCycle] = useState<'day3' | 'day5'>('day5');
    const [result, setResult] = useState<PregnancyResult | null>(null);
    const [error, setError] = useState<string>('');

    const resetForm = () => {
        setDay('');
        setMonth('');
        setYear('');
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

        const inputDate = new Date(inputYear, inputMonth - 1, inputDay);

        if (isNaN(inputDate.getTime()) || inputDate.getFullYear() !== inputYear || inputDate.getMonth() + 1 !== inputMonth || inputDate.getDate() !== inputDay ) {
            setError(t.errorInvalidDate);
            return;
        }

        if (inputDate > new Date()) {
            setError(t.errorFutureDate);
            return;
        }

        setError('');

        let dueDate: Date;
        let effectiveLmp: Date;

        switch (method) {
            case 'conception':
                dueDate = new Date(inputDate.getTime() + 266 * 24 * 60 * 60 * 1000);
                effectiveLmp = new Date(inputDate.getTime() - 14 * 24 * 60 * 60 * 1000);
                break;
            case 'ivf':
                const transferDay = ivfCycle === 'day3' ? 3 : 5;
                dueDate = new Date(inputDate.getTime() + (266 - transferDay) * 24 * 60 * 60 * 1000);
                effectiveLmp = new Date(inputDate.getTime() - (14 + transferDay) * 24 * 60 * 60 * 1000);
                break;
            case 'lmp':
            default:
                dueDate = new Date(inputDate.getTime() + 280 * 24 * 60 * 60 * 1000);
                effectiveLmp = inputDate;
                break;
        }

        const today = new Date();
        today.setHours(0,0,0,0);

        const gestationalAgeInMillis = today.getTime() - effectiveLmp.getTime();
        const gestationalAgeInDaysTotal = Math.floor(gestationalAgeInMillis / (1000 * 60 * 60 * 24));

        if (gestationalAgeInDaysTotal < 0) {
            setError(t.errorFutureDate);
            return;
        }
        
        const gestationalAgeWeeks = Math.floor(gestationalAgeInDaysTotal / 7);
        const gestationalAgeDays = gestationalAgeInDaysTotal % 7;

        let trimester: number;
        if (gestationalAgeWeeks < 14) {
            trimester = 1;
        } else if (gestationalAgeWeeks < 28) {
            trimester = 2;
        } else {
            trimester = 3;
        }

        const locale = currentLang;
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };

        setResult({
            dueDate: dueDate.toLocaleDateString(locale, options),
            gestationalAgeWeeks,
            gestationalAgeDays,
            trimester
        });
    };
    
    const handleMethodChange = (newMethod: 'lmp' | 'conception' | 'ivf') => {
        setMethod(newMethod);
        resetForm();
    };

    const getDateLabel = () => {
        switch(method) {
            case 'conception': return t.conceptionDateLabel;
            case 'ivf': return t.transferDateLabel;
            default: return t.lmpDateLabel;
        }
    };
    
    const years = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i);
    const months = t.monthsArray;
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const selectClasses = "block w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 dark:text-white";

    const renderTrimesterText = (trimester: number) => {
        if (trimester === 1) return t.trimester1;
        if (trimester === 2) return t.trimester2;
        if (trimester === 3) return t.trimester3;
        return '';
    };

    return (
        <main className="w-full max-w-2xl mx-auto px-4 py-8 md:py-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white text-center mb-4">{t.pregnancyTitle}</h1>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-8">{t.pregnancySubheading}</p>

            <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8 transition-all duration-300">
                <form onSubmit={handleCalculate} className="space-y-6">
                    <div>
                        <span className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">{t.calculationMethodLabel}</span>
                        <div className="grid grid-cols-3 gap-2 rounded-lg bg-gray-100 dark:bg-gray-900 p-1">
                            {(['lmp', 'conception', 'ivf'] as const).map((m) => (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => handleMethodChange(m)}
                                    className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200 ${method === m ? 'bg-blue-600 text-white shadow' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                                >
                                    {t[`${m}Method`]}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <span className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {getDateLabel()}
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
                    
                    {method === 'ivf' && (
                        <div>
                            <span className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">{t.ivfCycleTypeLabel}</span>
                             <div className="flex space-x-2 rtl:space-x-reverse rounded-md bg-gray-100 dark:bg-gray-900 p-1">
                                <button type="button" onClick={() => setIvfCycle('day3')} className={`w-full px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200 ${ivfCycle === 'day3' ? 'bg-blue-600 text-white shadow' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>{t.day3Transfer}</button>
                                <button type="button" onClick={() => setIvfCycle('day5')} className={`w-full px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200 ${ivfCycle === 'day5' ? 'bg-blue-600 text-white shadow' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>{t.day5Transfer}</button>
                            </div>
                        </div>
                    )}

                    {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400 text-center">{error}</p>}
                    
                    <div>
                        <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition transform hover:scale-105 duration-300 ease-in-out">
                            {t.calculateDueDateButton}
                        </button>
                    </div>
                </form>

                {result && (
                     <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-semibold text-center text-gray-800 dark:text-gray-200 mb-4">{t.pregnancyHeading}</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
                                <span className="font-medium text-gray-700 dark:text-gray-300">{t.dueDateResultLabel}</span>
                                <span className="font-bold text-lg text-blue-600 dark:text-blue-400">{result.dueDate}</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <span className="font-medium text-gray-700 dark:text-gray-300">{t.gestationalAgeResultLabel}</span>
                                <span className="font-semibold text-gray-800 dark:text-white">{result.gestationalAgeWeeks} {t.weeks}{result.gestationalAgeDays > 0 ? `, ${result.gestationalAgeDays} ${t.days}` : ''}</span>
                            </div>
                             <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <span className="font-medium text-gray-700 dark:text-gray-300">{t.trimesterResultLabel}</span>
                                <span className="font-semibold text-gray-800 dark:text-white">{renderTrimesterText(result.trimester)}</span>
                            </div>
                        </div>
                    </div>
                )}
            </section>
            
            {t.seoPregnancySections && t.seoPregnancySections.length > 0 && (
                <SeoContent sections={t.seoPregnancySections} lang={currentLang} />
            )}
        </main>
    );
};

export default PregnancyCalculatorPage;