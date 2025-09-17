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

const BmiCalculatorPage: React.FC = () => {
  const { t, currentLang } = useOutletContext<PageContext>();
  usePageMetadata(t.seoBmiTitle, t.seoBmiDescription);

  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');
  const [weightLbs, setWeightLbs] = useState('');
  
  const [bmi, setBmi] = useState<number | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  const getBmiCategory = (bmiValue: number): string => {
    if (bmiValue < 18.5) return t.underweight || 'Underweight';
    if (bmiValue >= 18.5 && bmiValue <= 24.9) return t.normalWeight || 'Normal weight';
    if (bmiValue >= 25 && bmiValue <= 29.9) return t.overweight || 'Overweight';
    return t.obesity || 'Obesity';
  };

  const calculateBmi = () => {
    setError('');
    setBmi(null);
    setCategory(null);

    let height = 0;
    let weight = 0;

    if (unitSystem === 'metric') {
        const h = parseFloat(heightCm);
        const w = parseFloat(weightKg);
        if (isNaN(h) || isNaN(w) || h <= 0 || w <= 0) {
            setError(t.errorNumber || 'Please enter valid numbers.');
            return;
        }
        height = h / 100; // convert cm to meters
        weight = w;
    } else {
        const hFt = parseFloat(heightFt);
        const hIn = parseFloat(heightIn || '0');
        const w = parseFloat(weightLbs);
        if (isNaN(hFt) || isNaN(hIn) || isNaN(w) || (hFt <= 0 && hIn <= 0) || w <= 0) {
            setError(t.errorNumber || 'Please enter valid numbers.');
            return;
        }
        height = (hFt * 12) + hIn; // total height in inches
        weight = w;
    }

    let bmiValue;
    if (unitSystem === 'metric') {
        bmiValue = weight / (height * height);
    } else { // imperial
        bmiValue = (weight / (height * height)) * 703;
    }

    if (isNaN(bmiValue) || !isFinite(bmiValue)) {
        setError(t.errorNumber || 'Calculation error.');
        return;
    }

    setBmi(parseFloat(bmiValue.toFixed(1)));
    setCategory(getBmiCategory(bmiValue));
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    calculateBmi();
  };

  const inputClasses = "block w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 dark:text-white";
  const labelClasses = "block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2";

  return (
    <>
      <HeaderAdComponent />
      <main className="w-full max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2 text-center">{t.bmiTitle}</h1>
          <p className="text-md md:text-lg text-gray-500 dark:text-gray-400 mb-8 text-center">{t.bmiSubheading}</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className={labelClasses}>{t.unitSystemLabel}</label>
              <div className="flex space-x-2 rtl:space-x-reverse rounded-md bg-gray-100 dark:bg-gray-900 p-1">
                  <button type="button" onClick={() => setUnitSystem('metric')} className={`w-full py-2 font-medium rounded-md ${unitSystem === 'metric' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>{t.metric}</button>
                  <button type="button" onClick={() => setUnitSystem('imperial')} className={`w-full py-2 font-medium rounded-md ${unitSystem === 'imperial' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>{t.imperial}</button>
              </div>
            </div>

            <div>
              <label className={labelClasses}>{t.heightLabel}</label>
              {unitSystem === 'metric' ? (
                  <input type="number" value={heightCm} onChange={e => setHeightCm(e.target.value)} className={inputClasses} placeholder={t.cm} required />
              ) : (
                  <div className="flex gap-4">
                      <input type="number" value={heightFt} onChange={e => setHeightFt(e.target.value)} className={inputClasses} placeholder={t.ft} required/>
                      <input type="number" value={heightIn} onChange={e => setHeightIn(e.target.value)} className={inputClasses} placeholder={t.in} />
                  </div>
              )}
            </div>

            <div>
              <label className={labelClasses}>{t.weightLabel}</label>
              <input type="number" value={unitSystem === 'metric' ? weightKg : weightLbs} onChange={e => unitSystem === 'metric' ? setWeightKg(e.target.value) : setWeightLbs(e.target.value)} className={inputClasses} placeholder={unitSystem === 'metric' ? t.kg : t.lbs} required/>
            </div>
            
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            
            <div>
              <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition transform hover:scale-105 duration-300 ease-in-out">
                {t.calculateBmiButton}
              </button>
            </div>
          </form>

          {bmi !== null && category && (
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">{t.bmiResultLabel}</h2>
              <div className="p-6 bg-blue-50 dark:bg-blue-900/50 rounded-xl space-y-2">
                <p className="text-5xl font-extrabold text-blue-600 dark:text-blue-400">{bmi}</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{t.bmiCategoryLabel} <span className="text-blue-600 dark:text-blue-400">{category}</span></p>
              </div>
            </div>
          )}
        </div>
        
        <AdComponent />
        
        <ShareButtons url={window.location.href} title={t.seoBmiTitle || ''} t={t} />
      </main>
      {t.seoBmiSections && <SeoContent sections={t.seoBmiSections} lang={currentLang} />}
    </>
  );
};

export default BmiCalculatorPage;