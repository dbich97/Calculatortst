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

type CalculationMethod = 'lmp' | 'conception' | 'ivf';
type IvfCycleType = 'day3' | 'day5';

const PregnancyCalculatorPage: React.FC = () => {
  const { t, currentLang } = useOutletContext<PageContext>();
  usePageMetadata(t.seoPregnancyTitle, t.seoPregnancyDescription);

  const [method, setMethod] = useState<CalculationMethod>('lmp');
  const [lmpDate, setLmpDate] = useState('');
  const [conceptionDate, setConceptionDate] = useState('');
  const [transferDate, setTransferDate] = useState('');
  const [ivfCycle, setIvfCycle] = useState<IvfCycleType>('day5');
  
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [gestationalAge, setGestationalAge] = useState<string | null>(null);
  const [trimester, setTrimester] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  const calculateDueDate = () => {
    setError('');
    setDueDate(null);
    setGestationalAge(null);
    setTrimester(null);

    let baseDate: Date;
    let pregnancyDurationDays = 280; // Default for LMP

    switch (method) {
      case 'lmp':
        if (!lmpDate) {
          setError(t.errorInvalidDate);
          return;
        }
        baseDate = new Date(lmpDate);
        break;
      case 'conception':
        if (!conceptionDate) {
          setError(t.errorInvalidDate);
          return;
        }
        baseDate = new Date(conceptionDate);
        pregnancyDurationDays = 266;
        break;
      case 'ivf':
        if (!transferDate) {
          setError(t.errorInvalidDate);
          return;
        }
        baseDate = new Date(transferDate);
        const embryoAge = ivfCycle === 'day3' ? 3 : 5;
        pregnancyDurationDays = 266 - embryoAge;
        break;
      default:
        return;
    }

    if (isNaN(baseDate.getTime())) {
      setError(t.errorInvalidDate);
      return;
    }
    
    if (baseDate > new Date()) {
        setError(t.errorFutureDate);
        return;
    }
    
    const dueDateObj = new Date(baseDate.getTime());
    dueDateObj.setDate(dueDateObj.getDate() + pregnancyDurationDays);
    
    const today = new Date();
    today.setHours(0,0,0,0);
    
    let effectiveStartDate: Date;
     if (method === 'lmp') {
        effectiveStartDate = new Date(lmpDate);
    } else if (method === 'conception') {
        effectiveStartDate = new Date(conceptionDate);
        effectiveStartDate.setDate(effectiveStartDate.getDate() - 14);
    } else { // IVF
        effectiveStartDate = new Date(transferDate);
        const embryoAge = ivfCycle === 'day3' ? 3 : 5;
        effectiveStartDate.setDate(effectiveStartDate.getDate() - embryoAge - 14);
    }

    const diffTime = Math.abs(today.getTime() - effectiveStartDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if(today < effectiveStartDate){
      setError(t.errorFutureDate);
      return;
    }
    
    const weeks = Math.floor(diffDays / 7);
    const days = diffDays % 7;
    
    setDueDate(dueDateObj.toLocaleDateString(currentLang, { year: 'numeric', month: 'long', day: 'numeric' }));
    setGestationalAge(`${weeks} ${t.weeks}, ${days} ${t.days}`);
    
    if (weeks <= 13) {
      setTrimester(t.trimester1);
    } else if (weeks <= 27) {
      setTrimester(t.trimester2);
    } else {
      setTrimester(t.trimester3);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    calculateDueDate();
  };
  
  const inputClasses = "block w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 dark:text-white";
  const labelClasses = "block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2";

  return (
    <>
      <HeaderAdComponent />
      <main className="w-full max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2 text-center">{t.pregnancyTitle}</h1>
          <p className="text-md md:text-lg text-gray-500 dark:text-gray-400 mb-8 text-center">{t.pregnancySubheading}</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="method" className={labelClasses}>{t.calculationMethodLabel}</label>
              <select id="method" value={method} onChange={(e) => setMethod(e.target.value as CalculationMethod)} className={inputClasses}>
                <option value="lmp">{t.lmpMethod}</option>
                <option value="conception">{t.conceptionMethod}</option>
                <option value="ivf">{t.ivfMethod}</option>
              </select>
            </div>
            
            {method === 'lmp' && (
              <div>
                <label htmlFor="lmpDate" className={labelClasses}>{t.lmpDateLabel}</label>
                <input type="date" id="lmpDate" value={lmpDate} onChange={(e) => setLmpDate(e.target.value)} className={inputClasses} required />
              </div>
            )}
            
            {method === 'conception' && (
              <div>
                <label htmlFor="conceptionDate" className={labelClasses}>{t.conceptionDateLabel}</label>
                <input type="date" id="conceptionDate" value={conceptionDate} onChange={(e) => setConceptionDate(e.target.value)} className={inputClasses} required />
              </div>
            )}
            
            {method === 'ivf' && (
              <>
                <div>
                  <label htmlFor="transferDate" className={labelClasses}>{t.transferDateLabel}</label>
                  <input type="date" id="transferDate" value={transferDate} onChange={(e) => setTransferDate(e.target.value)} className={inputClasses} required />
                </div>
                <div>
                  <label htmlFor="ivfCycle" className={labelClasses}>{t.ivfCycleTypeLabel}</label>
                  <select id="ivfCycle" value={ivfCycle} onChange={(e) => setIvfCycle(e.target.value as IvfCycleType)} className={inputClasses}>
                    <option value="day3">{t.day3Transfer}</option>
                    <option value="day5">{t.day5Transfer}</option>
                  </select>
                </div>
              </>
            )}
            
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            
            <div>
              <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition transform hover:scale-105 duration-300 ease-in-out">
                {t.calculateDueDateButton}
              </button>
            </div>
          </form>

          {(dueDate || gestationalAge || trimester) && (
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-center text-gray-800 dark:text-gray-200 mb-4">{t.pregnancyHeading}</h2>
              <div className="space-y-4">
                 {dueDate && <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between items-center"><span className="font-medium">{t.dueDateResultLabel}</span><span className="font-bold text-blue-600 dark:text-blue-400">{dueDate}</span></div>}
                 {gestationalAge && <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between items-center"><span className="font-medium">{t.gestationalAgeResultLabel}</span><span className="font-bold">{gestationalAge}</span></div>}
                 {trimester && <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between items-center"><span className="font-medium">{t.trimesterResultLabel}</span><span className="font-bold">{trimester}</span></div>}
              </div>
            </div>
          )}
        </div>
        
        <AdComponent />
        
        <ShareButtons url={window.location.href} title={t.seoPregnancyTitle} t={t} />
      </main>
      <SeoContent sections={t.seoPregnancySections} lang={currentLang} />
    </>
  );
};

export default PregnancyCalculatorPage;
