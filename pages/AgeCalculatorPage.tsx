import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { Translation, LanguageCode, Age, AdditionalInfo } from '../types';
import { usePageMetadata } from '../lib/hooks';
import { calculateAge, getSeason, calculateNextBirthdayCountdown, hijriToGregorian, solarHijriToGregorian } from '../lib/utils';
import AgeCalculatorForm from '../components/AgeCalculatorForm';
import AgeResult from '../components/AgeResult';
import CalendarSelector from '../components/CalendarSelector';
import SeoContent from '../components/SeoContent';
import ShareButtons from '../components/ShareButtons';
import HeaderAdComponent from '../components/HeaderAdComponent';
import AdComponent from '../components/AdComponent';

interface PageContext {
  t: Translation;
  currentLang: LanguageCode;
}

const AgeCalculatorPage: React.FC = () => {
  const { t, currentLang } = useOutletContext<PageContext>();
  usePageMetadata(t.seoTitle, t.seoDescription, t.seoKeywords);

  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [age, setAge] = useState<Age | null>(null);
  const [additionalInfo, setAdditionalInfo] = useState<AdditionalInfo | null>(null);
  const [error, setError] = useState('');
  const [calendar, setCalendar] = useState<'gregorian' | 'hijri'>('gregorian');
  const [gregorianAgeString, setGregorianAgeString] = useState<string | null>(null);

  const isHijriSupported = ['ar', 'fa'].includes(currentLang);

  useEffect(() => {
    if (!isHijriSupported) {
      setCalendar('gregorian');
    }
  }, [currentLang, isHijriSupported]);
  
  const resetState = () => {
    setDay('');
    setMonth('');
    setYear('');
    setAge(null);
    setAdditionalInfo(null);
    setError('');
    setGregorianAgeString(null);
  };

  useEffect(() => {
    resetState();
  }, [calendar, currentLang]);

  const handleCalculate = () => {
    setError('');
    setAge(null);
    setAdditionalInfo(null);
    setGregorianAgeString(null);

    const dayNum = parseInt(day);
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum)) {
      setError(t.errorInvalidDate);
      return;
    }

    let birthDate: Date;
    let gregorianBirthDate: Date;

    if (calendar === 'hijri' && isHijriSupported) {
        if (currentLang === 'fa') {
            gregorianBirthDate = solarHijriToGregorian(yearNum, monthNum, dayNum);
        } else {
            gregorianBirthDate = hijriToGregorian(yearNum, monthNum, dayNum);
        }
        birthDate = gregorianBirthDate;
    } else {
        gregorianBirthDate = new Date(yearNum, monthNum - 1, dayNum);
        // Check if date is valid (e.g., Feb 30)
        if (gregorianBirthDate.getFullYear() !== yearNum || gregorianBirthDate.getMonth() !== monthNum - 1 || gregorianBirthDate.getDate() !== dayNum) {
            setError(t.errorInvalidDate);
            return;
        }
        birthDate = gregorianBirthDate;
    }
    
    // Additional validation after conversion
     if (isNaN(birthDate.getTime())) {
        setError(t.errorInvalidDate);
        return;
    }

    if (birthDate > new Date()) {
      setError(t.errorFutureDate);
      return;
    }

    const calculatedAge = calculateAge(birthDate);
    setAge(calculatedAge);

    if (calendar === 'hijri' && isHijriSupported) {
        const hijriAge = calculateAge(birthDate);
        setAge(hijriAge);
        
        const gregorianAge = calculateAge(gregorianBirthDate);
        setGregorianAgeString(`${gregorianAge.years} ${t.years}, ${gregorianAge.months} ${t.months}, ${gregorianAge.days} ${t.days}`);
    }

    setAdditionalInfo({
      dayOfWeek: t.daysOfWeekArray[birthDate.getDay()],
      season: t.seasonsArray[getSeason(birthDate)],
      nextBirthday: calculateNextBirthdayCountdown(birthDate),
    });
  };

  return (
    <>
      <HeaderAdComponent />
      <main className="w-full max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2 text-center">{t.h1}</h1>
          <h2 className="text-md md:text-lg text-gray-500 dark:text-gray-400 mb-8 text-center">{t.h2}</h2>
          
          {isHijriSupported && (
            <CalendarSelector
              currentCalendar={calendar}
              onCalendarChange={setCalendar}
              t={t}
            />
          )}

          <AgeCalculatorForm
            day={day}
            setDay={setDay}
            month={month}
            setMonth={setMonth}
            year={year}
            setYear={setYear}
            handleCalculate={handleCalculate}
            error={error}
            t={t}
            calendar={calendar}
            lang={currentLang}
          />
          {age && <AgeResult age={age} additionalInfo={additionalInfo} t={{...t, ageInGregorian: gregorianAgeString }} />}
        </div>
        
        <AdComponent />
        
        <ShareButtons url={window.location.href} title={t.seoTitle} t={t} />

      </main>
      <SeoContent sections={t.seoSections} lang={currentLang} />
    </>
  );
};

export default AgeCalculatorPage;
