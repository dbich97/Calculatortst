
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

const OvulationCalculatorPage: React.FC = () => {
  const { t, currentLang } = useOutletContext<PageContext>();
  usePageMetadata(t.seoOvulationTitle, t.seoOvulationDescription);
  
  const [lmpDate, setLmpDate] = useState('');
  const [cycleLength, setCycleLength] = useState('28');
  
  const [ovulationDate, setOvulationDate] = useState<string | null>(null);
  const [fertileWindow, setFertileWindow] = useState<string | null>(null);
  const [nextPeriod, setNextPeriod] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  
  const formatDate = (date: Date) => {
      return date.toLocaleDateString(currentLang, { year: 'numeric', month: 'long', day: 'numeric' });
  }

  const calculateOvulation = () => {
    setError('');
    setOvulationDate(null);
    setFertileWindow(null);
    setNextPeriod(null);
    
    if (!lmpDate || !cycleLength) {
      setError(t.errorInvalidDate);
      return;
    }
    
    const cycleLengthNum = parseInt(cycleLength);
    if (isNaN(cycleLengthNum) || cycleLengthNum < 21 || cycleLengthNum > 35) {
      setError('Please enter a typical cycle length (21-35 days).'); // TODO: Add to translations
      return;
    }
    
    const lmp = new Date(lmpDate);
    if (isNaN(lmp.getTime())) {
      setError(t.errorInvalidDate);
      return;
    }

    if (lmp > new Date()) {
      setError(t.errorFutureDate);
      return;
    }

    const nextPeriodDate = new Date(lmp);
    nextPeriodDate.setDate(lmp.getDate() + cycleLengthNum);
    setNextPeriod(formatDate(nextPeriodDate));

    const ovulation = new Date(nextPeriodDate);
    ovulation.setDate(nextPeriodDate.getDate() - 14);
    setOvulationDate(formatDate(ovulation));
    
    const fertileStart = new Date(ovulation);
    fertileStart.setDate(ovulation.getDate() - 5);
    const fertileEnd = new Date(ovulation); // Ovulation day is fertile
    setFertileWindow(`${formatDate(fertileStart)} - ${formatDate(fertileEnd)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    calculateOvulation();
  };

  const inputClasses = "block w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 dark:text-white";
  const labelClasses = "block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2";

  return (
    <>
      <HeaderAdComponent />
      <main className="w-full max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2 text-center">{t.ovulationTitle}</h1>
          <p className="text-md md:text-lg text-gray-500 dark:text-gray-400 mb-8 text-center">{t.ovulationSubheading}</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="lmpDate" className={labelClasses}>{t.lmpDateLabelOvulation}</label>
              <input type="date" id="lmpDate" value={lmpDate} onChange={(e) => setLmpDate(e.target.value)} className={inputClasses} required />
            </div>
            <div>
              <label htmlFor="cycleLength" className={labelClasses}>{t.cycleLengthLabel}</label>
              <input type="number" id="cycleLength" value={cycleLength} onChange={(e) => setCycleLength(e.target.value)} className={inputClasses} min="21" max="35" required />
            </div>
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            <div>
              <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition transform hover:scale-105 duration-300 ease-in-out">
                {t.calculateOvulationButton}
              </button>
            </div>
          </form>

          {(ovulationDate || fertileWindow || nextPeriod) && (
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-center text-gray-800 dark:text-gray-200 mb-4">{t.ovulationHeading}</h2>
              <div className="space-y-4">
                {ovulationDate && <div className="p-4 bg-blue-50 dark:bg-blue-900/50 rounded-lg flex justify-between items-center"><span className="font-medium">{t.resultOvulationDate}</span><span className="font-bold text-blue-600 dark:text-blue-400">{ovulationDate}</span></div>}
                {fertileWindow && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/50 rounded-lg">
                      <div className="flex justify-between items-center">
                          <span className="font-medium">{t.resultFertileWindow}</span>
                          <span className="font-bold text-green-600 dark:text-green-400">{fertileWindow}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{t.fertileWindowDescription}</p>
                  </div>
                )}
                {nextPeriod && <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between items-center"><span className="font-medium">{t.resultNextPeriod}</span><span className="font-bold">{nextPeriod}</span></div>}
              </div>
            </div>
          )}
        </div>
        
        <AdComponent />

        <ShareButtons url={window.location.href} title={t.seoOvulationTitle} t={t} />
      </main>
      <SeoContent sections={t.seoOvulationSections} lang={currentLang} />
    </>
  );
};

export default OvulationCalculatorPage;
    