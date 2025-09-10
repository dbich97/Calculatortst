import React from 'react';
import type { Translation, LanguageCode } from '../types';
import { getCurrentHijriYear, getCurrentSolarHijriYear } from '../lib/utils';
import { LanguageCode as LangEnum } from '../types';

interface AgeCalculatorFormProps {
  day: string;
  setDay: (day: string) => void;
  month: string;
  setMonth: (month: string) => void;
  year: string;
  setYear: (year: string) => void;
  handleCalculate: () => void;
  error: string;
  t: Translation;
  calendar: 'gregorian' | 'hijri';
  lang: LanguageCode;
}

const AgeCalculatorForm: React.FC<AgeCalculatorFormProps> = ({ day, setDay, month, setMonth, year, setYear, handleCalculate, error, t, calendar, lang }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCalculate();
  };

  const isHijri = ['ar', 'fa'].includes(lang) && calendar === 'hijri';

  const currentGregorianYear = new Date().getFullYear();
  const gregorianYears = Array.from({ length: 121 }, (_, i) => currentGregorianYear - i);
  
  let hijriYears: number[] = [];
  if (isHijri) {
    if (lang === LangEnum.AR) {
      const currentHijriYear = getCurrentHijriYear();
      hijriYears = Array.from({ length: 121 }, (_, i) => currentHijriYear - i);
    } else if (lang === LangEnum.FA) {
      const currentSolarHijriYear = getCurrentSolarHijriYear();
      hijriYears = Array.from({ length: 121 }, (_, i) => currentSolarHijriYear - i);
    }
  }

  const years = isHijri ? hijriYears : gregorianYears;
  const months = isHijri ? t.hijriMonthsArray : t.monthsArray;

  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const selectClasses = "block w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 dark:text-white";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <span className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t.dateOfBirthLabel}
        </span>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="day" className="sr-only">{t.dayLabel}</label>
            <select
              id="day"
              name="day"
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className={selectClasses}
              aria-label={t.dayLabel}
              required
            >
              <option value="" disabled>{t.dayLabel}</option>
              {days.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="month" className="sr-only">{t.monthLabel}</label>
            <select
              id="month"
              name="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className={selectClasses}
              aria-label={t.monthLabel}
              required
            >
              <option value="" disabled>{t.monthLabel}</option>
              {months.map((m, index) => (
                <option key={index} value={index + 1}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="year" className="sr-only">{t.yearLabel}</label>
            <select
              id="year"
              name="year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className={selectClasses}
              aria-label={t.yearLabel}
              required
            >
              <option value="" disabled>{t.yearLabel}</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
        {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
      </div>
      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition transform hover:scale-105 duration-300 ease-in-out"
        >
          {t.calculateButton}
        </button>
      </div>
    </form>
  );
};

export default AgeCalculatorForm;